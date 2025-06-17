"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Plus, ChevronDown } from "lucide-react"
import AddTimeEntryModal from "@/components/add-time-entry-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import SimpleDatePickerModal from "@/components/simple-date-picker-modal"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"
import EnhancedBottomTrackingWidget from "@/components/enhanced-bottom-tracking-widget"
import ZoomableTimeBlock from "@/components/zoomable-time-block"

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

  // Use real Supabase data instead of dummy data
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

  // Handle zoom with scroll wheel
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

  // Generate time slots based on zoom level
  const generateTimeSlots = () => {
    const slots = []
    let increment = 60 // minutes
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

  // Calculate slot height based on zoom
  const getSlotHeight = () => {
    if (zoomLevel <= 0.5) return 40
    if (zoomLevel <= 0.8) return 60
    if (zoomLevel >= 1.5) return 120
    return 80
  }

  const slotHeight = getSlotHeight()

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number)
    return hour * 60 + minute
  }

  // Calculate which time slots an entry spans
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

  // Create a map of which slots are occupied by entries
  const occupiedSlots = new Map<string, any>()
  const entrySpans = new Map<string, string[]>()

  timeEntries.forEach((entry) => {
    const spannedSlots = getEntrySpan(entry)
    entrySpans.set(entry.id, spannedSlots)

    spannedSlots.forEach((slot) => {
      occupiedSlots.set(slot, entry)
    })
  })

  // Handle time slot click
  const handleTimeSlotClick = (time: string) => {
    const [hour, minute] = time.split(":").map(Number)
    const startTime = time
    const endHour = hour + 1
    const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    setPrefilledEntry({ startTime, endTime })
    setIsAddModalOpen(true)
  }

  // Calculate timeline container height
  const headerHeight = isDesktop ? 120 : 140
  const trackingWidgetHeight = isDesktop ? 200 : 240
  const navigationHeight = isDesktop ? 0 : 80
  const totalFooterHeight = trackingWidgetHeight + navigationHeight
  const timelineHeight = `calc(100vh - ${headerHeight + totalFooterHeight}px)`

  // Convert database entries to UI format
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
    <>
      {/* Sticky Header - EXACT SAME AS BEFORE */}
      <div className="sticky top-0 z-30 bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b border-gray-200/60 backdrop-blur-xl">
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">{formatDate(selectedDate)}</h1>
            <button
              onClick={() => setIsDatePickerOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsPreferencesOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50"
            >
              <Calendar className="w-4 h-4" />
            </button>
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

      {/* Scrollable Timeline - EXACT SAME AS BEFORE */}
      <div ref={timelineRef} className="overflow-y-auto overflow-x-hidden" style={{ height: timelineHeight }}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : (
          <div className="p-6 pt-2 space-y-1" style={{ paddingBottom: isDesktop ? "24px" : "32px" }}>
            {timeSlots.map((time, index) => {
              const occupyingEntry = occupiedSlots.get(time)
              const isFirstSlotOfEntry = occupyingEntry && entrySpans.get(occupyingEntry.id)?.[0] === time
              const entrySlotCount = occupyingEntry ? entrySpans.get(occupyingEntry.id)?.length || 1 : 1

              return (
                <div key={time} className="flex items-start" style={{ minHeight: `${slotHeight}px` }}>
                  <div
                    className={`text-gray-500 font-mono font-medium pt-2 flex-shrink-0 ${
                      zoomLevel <= 0.5 ? "w-12 text-xs" : zoomLevel <= 0.8 ? "w-14 text-sm" : "w-16 text-sm"
                    }`}
                  >
                    {zoomLevel <= 0.5 ? time.split(":")[0] : time}
                  </div>
                  <div className="flex-1 ml-4">
                    {occupyingEntry && isFirstSlotOfEntry ? (
                      <ZoomableTimeBlock
                        entry={convertEntryForUI(occupyingEntry)}
                        onEdit={handleEditTimeEntry}
                        onDelete={handleDeleteTimeEntry}
                        zoomLevel={zoomLevel}
                        slotHeight={slotHeight * entrySlotCount + (entrySlotCount - 1) * 4}
                      />
                    ) : occupyingEntry ? (
                      <div style={{ height: `${slotHeight - 8}px` }} />
                    ) : (
                      <div
                        className="border-l-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-all duration-200 rounded-r-lg hover:bg-gray-50 flex items-center pl-4"
                        style={{ height: `${slotHeight - 8}px` }}
                        onClick={() => handleTimeSlotClick(time)}
                      >
                        {zoomLevel >= 0.8 && (
                          <span className="text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity">
                            + Add entry
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* All Modals - EXACT SAME AS BEFORE */}
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

      {/* Sticky Footer - Activity Tracking Widget - EXACT SAME AS BEFORE */}
      <div className="sticky bottom-0 z-30">
        <EnhancedBottomTrackingWidget
          onAddEntry={handleAddTimeEntry}
          isDesktop={isDesktop}
          user={user}
          categories={categories}
        />
      </div>
    </>
  )
}
