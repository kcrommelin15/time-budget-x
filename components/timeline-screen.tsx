"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Plus, ChevronDown } from "lucide-react"
import AddTimeEntryModal from "@/components/add-time-entry-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import SimpleDatePickerModal from "@/components/simple-date-picker-modal"
import { mockTimeEntries } from "@/lib/mock-data"
import type { TimeEntry } from "@/lib/types"
import EnhancedBottomTrackingWidget from "@/components/enhanced-bottom-tracking-widget"
import ZoomableTimeBlock from "@/components/zoomable-time-block"

interface TimelineScreenProps {
  isDesktop?: boolean
}

export default function TimelineScreen({ isDesktop = false }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1) // Keep zoom functionality but hide controls
  const [prefilledEntry, setPrefilledEntry] = useState<{ startTime: string; endTime: string } | null>(null)

  const timelineRef = useRef<HTMLDivElement>(null)

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

  const handleAddTimeEntry = (newEntry: Omit<TimeEntry, "id">) => {
    const entry: TimeEntry = {
      ...newEntry,
      id: Date.now().toString(),
    }
    setTimeEntries([...timeEntries, entry])
    setIsAddModalOpen(false)
    setPrefilledEntry(null)
  }

  const handleEditTimeEntry = (updatedEntry: TimeEntry) => {
    setTimeEntries(timeEntries.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
  }

  const handleDeleteTimeEntry = (entryId: string) => {
    setTimeEntries(timeEntries.filter((entry) => entry.id !== entryId))
  }

  // Handle zoom with scroll wheel (keep functionality but hide controls)
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
      // Zoomed out - 2 hour increments, 4 AM to 11 PM
      increment = 120
      startHour = 4
      endHour = 23
    } else if (zoomLevel <= 0.8) {
      // Medium zoom out - 1 hour increments
      increment = 60
    } else if (zoomLevel >= 1.5) {
      // Zoomed in - 15 minute increments
      increment = 15
    } else {
      // Normal - 30 minute increments
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
    if (zoomLevel <= 0.5) return 40 // Very compact
    if (zoomLevel <= 0.8) return 60 // Compact
    if (zoomLevel >= 1.5) return 120 // Expanded
    return 80 // Normal
  }

  const slotHeight = getSlotHeight()

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number)
    return hour * 60 + minute
  }

  // Convert minutes since midnight to time string
  const minutesToTime = (minutes: number) => {
    const hour = Math.floor(minutes / 60)
    const minute = minutes % 60
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
  }

  // Calculate which time slots an entry spans
  const getEntrySpan = (entry: TimeEntry) => {
    const startMinutes = timeToMinutes(entry.startTime)
    const endMinutes = timeToMinutes(entry.endTime)

    // Get the increment for current zoom level
    let increment = 60
    if (zoomLevel <= 0.5) increment = 120
    else if (zoomLevel <= 0.8) increment = 60
    else if (zoomLevel >= 1.5) increment = 15
    else increment = 30

    const spannedSlots = []
    for (const slot of timeSlots) {
      const slotMinutes = timeToMinutes(slot)
      const nextSlotMinutes = slotMinutes + increment

      // Include slot if entry overlaps with this time slot
      if (startMinutes < nextSlotMinutes && endMinutes > slotMinutes) {
        spannedSlots.push(slot)
      }
    }
    return spannedSlots
  }

  // Create a map of which slots are occupied by entries
  const todaysEntries = timeEntries.filter((entry) => entry.date === selectedDate.toISOString().split("T")[0])
  const occupiedSlots = new Map<string, TimeEntry>()
  const entrySpans = new Map<string, string[]>()

  todaysEntries.forEach((entry) => {
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

    // Add 1 hour for end time
    const endHour = hour + 1
    const endTime = `${endHour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`

    setPrefilledEntry({ startTime, endTime })
    setIsAddModalOpen(true)
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  // Calculate timeline container height
  const headerHeight = isDesktop ? 120 : 140
  const trackingWidgetHeight = isDesktop ? 200 : 240 // Height of the tracking widget
  const navigationHeight = isDesktop ? 0 : 80 // Mobile navigation bar height
  const totalFooterHeight = trackingWidgetHeight + navigationHeight
  const timelineHeight = `calc(100vh - ${headerHeight + totalFooterHeight}px)`

  return (
    <>
      {/* Sticky Header */}
      <div
        className={`sticky top-0 z-30 bg-gradient-to-br from-gray-50 via-white to-gray-100 border-b border-gray-200/60 backdrop-blur-xl`}
      >
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

      {/* Scrollable Timeline */}
      <div ref={timelineRef} className="overflow-y-auto overflow-x-hidden" style={{ height: timelineHeight }}>
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
                    // Render the entry block spanning multiple slots
                    <ZoomableTimeBlock
                      entry={occupyingEntry}
                      onEdit={handleEditTimeEntry}
                      onDelete={handleDeleteTimeEntry}
                      zoomLevel={zoomLevel}
                      slotHeight={slotHeight * entrySlotCount + (entrySlotCount - 1) * 4} // Account for spacing
                    />
                  ) : occupyingEntry ? (
                    // This slot is occupied but not the first slot - render nothing (covered by the spanning block above)
                    <div style={{ height: `${slotHeight - 8}px` }} />
                  ) : (
                    // Empty slot - allow clicking to add entry
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
      </div>

      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setPrefilledEntry(null)
        }}
        onAdd={handleAddTimeEntry}
        prefilledEntry={prefilledEntry}
      />

      <TrackingPreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />

      <SimpleDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
      />

      {/* Sticky Footer - Activity Tracking Widget */}
      <div className="sticky bottom-0 z-30">
        <EnhancedBottomTrackingWidget onAddEntry={handleAddTimeEntry} isDesktop={isDesktop} />
      </div>
    </>
  )
}
