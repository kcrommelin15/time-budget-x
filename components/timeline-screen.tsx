"use client"

import { useState, useRef, useEffect } from "react"
import { Plus } from "lucide-react"
import AddTimeEntryModal from "@/components/add-time-entry-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import SimpleDatePickerModal from "@/components/simple-date-picker-modal"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"
import EnhancedBottomTrackingWidget from "@/components/enhanced-bottom-tracking-widget"

interface TimelineScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function TimelineScreen({ isDesktop = false, user }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [prefilledEntry, setPrefilledEntry] = useState<{ startTime: string; endTime: string } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)
  const dateString = selectedDate.toISOString().split("T")[0]

  const { timeEntries, loading, error, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries(dateString)
  const { categories } = useCategories()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
  }

  const handleAddTimeEntry = async (newEntry: any) => {
    try {
      await addTimeEntry({
        category_id: newEntry.categoryId,
        subcategory_name: newEntry.subcategory,
        start_time: newEntry.startTime,
        end_time: newEntry.endTime,
        date: newEntry.date,
        description: newEntry.description,
        notes: newEntry.notes,
        source: "manual",
      })
      setIsAddModalOpen(false)
      setPrefilledEntry(null)
    } catch (err) {
      console.error("Error adding time entry:", err)
    }
  }

  const handleEditTimeEntry = async (updatedEntry: any) => {
    try {
      await updateTimeEntry(updatedEntry.id, {
        category_id: updatedEntry.categoryId,
        subcategory_name: updatedEntry.subcategory,
        start_time: updatedEntry.startTime,
        end_time: updatedEntry.endTime,
        date: updatedEntry.date,
        description: updatedEntry.description,
        notes: updatedEntry.notes,
      })
    } catch (err) {
      console.error("Error updating time entry:", err)
    }
  }

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId)
    } catch (err) {
      console.error("Error deleting time entry:", err)
    }
  }

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const delta = e.deltaY > 0 ? -0.1 : 0.1
        setZoomLevel((prev) => Math.max(0.3, Math.min(3, prev + delta)))
      }
    }

    const timeline = timelineRef.current
    if (timeline) {
      timeline.addEventListener("wheel", handleWheel, { passive: false })
      return () => timeline.removeEventListener("wheel", handleWheel)
    }
  }, [])

  const generateTimeSlots = () => {
    const slots = []
    let increment = 60
    let startHour = 6
    let endHour = 23

    if (zoomLevel <= 0.5) {
      increment = 120
      startHour = 4
      endHour = 23
    } else if (zoomLevel <= 0.8) {
      increment = 60
    } else if (zoomLevel >= 1.5) {
      increment = 15
    } else {
      increment = 30
    }

    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += increment) {
        if (hour === endHour && minute > 0) break
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const getSlotHeight = () => {
    if (zoomLevel <= 0.5) return 40
    if (zoomLevel <= 0.8) return 60
    if (zoomLevel >= 1.5) return 120
    return 80
  }

  const slotHeight = getSlotHeight()

  const timeToMinutes = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number)
    return hour * 60 + minute
  }

  const getEntrySpan = (entry: any) => {
    const startMinutes = timeToMinutes(entry.start_time)
    const endMinutes = timeToMinutes(entry.end_time)

    let increment = 60
    if (zoomLevel <= 0.5) increment = 120
    else if (zoomLevel <= 0.8) increment = 60
    else if (zoomLevel >= 1.5) increment = 15
    else increment = 30

    const spannedSlots = []
    for (const slot of timeSlots) {
      const slotMinutes = timeToMinutes(slot)
      const nextSlotMinutes = slotMinutes + increment

      if (startMinutes < nextSlotMinutes && endMinutes > slotMinutes) {
        spannedSlots.push(slot)
      }
    }
    return spannedSlots
  }

  const occupiedSlots = new Map<string, any>()
  const entrySpans = new Map<string, string[]>()

  timeEntries.forEach((entry) => {
    const spannedSlots = getEntrySpan(entry)
    entrySpans.set(entry.id, spannedSlots)

    spannedSlots.forEach((slot) => {
      occupiedSlots.set(slot, entry)
    })
  })

  const handleTimeSlotClick = (time: string) => {
    const [hour, minute] = time.split(":").map(Number)
    const startTime = time
    const endHour = hour + 1
    const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    setPrefilledEntry({ startTime, endTime })
    setIsAddModalOpen(true)
  }

  const headerHeight = isDesktop ? 120 : 140
  const trackingWidgetHeight = isDesktop ? 200 : 240
  const navigationHeight = isDesktop ? 0 : 80
  const totalFooterHeight = trackingWidgetHeight + navigationHeight
  const timelineHeight = `calc(100vh - ${headerHeight + totalFooterHeight}px)`

  const convertEntryForUI = (entry: any) => ({
    id: entry.id,
    categoryId: entry.category_id,
    categoryName: categories.find((cat) => cat.id === entry.category_id)?.name || "Unknown",
    categoryColor: categories.find((cat) => cat.id === entry.category_id)?.color || "#gray-500",
    subcategory: entry.subcategory_name,
    startTime: entry.start_time,
    endTime: entry.end_time,
    description: entry.description || "",
    date: entry.date,
    status: entry.status as "confirmed" | "pending",
    notes: entry.notes,
    source: entry.source || "manual",
  })

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view your timeline</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b border-gray-200/60 backdrop-blur-xl">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{formatDate(selectedDate)}</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        <div className="space-y-2">
          {Array.from({ length: 17 }, (_, i) => {
            const hour = i + 6
            const timeString = `${hour.toString().padStart(2, "0")}:00`
            return (
              <div key={timeString} className="flex items-center gap-4 min-h-[60px]">
                <div className="w-16 text-sm font-mono text-gray-500 flex-shrink-0">{timeString}</div>
                <div className="flex-1">
                  <div className="border-l-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-all duration-200 rounded-r-lg hover:bg-gray-50 flex items-center pl-4 h-12">
                    <span className="text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity">
                      + Add entry
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer Widget */}
      <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="What are you working on?"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Start</button>
        </div>
      </div>

      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setPrefilledEntry(null)
        }}
        onAdd={handleAddTimeEntry}
        prefilledEntry={prefilledEntry}
        categories={categories}
      />

      <TrackingPreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />

      <SimpleDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      <div className="sticky bottom-0 z-30">
        <EnhancedBottomTrackingWidget
          onAddEntry={handleAddTimeEntry}
          isDesktop={isDesktop}
          user={user}
          categories={categories}
        />
      </div>
    </div>
  )
}
