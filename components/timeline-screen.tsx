"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Calendar, Plus, ChevronDown } from "lucide-react"
import AddTimeEntryModal from "@/components/add-time-entry-modal"
import EditTimeEntryModal from "@/components/edit-time-entry-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import SimpleDatePickerModal from "@/components/simple-date-picker-modal"
import type { TimeEntry } from "@/lib/types"
import EnhancedBottomTrackingWidget from "@/components/enhanced-bottom-tracking-widget"
import ZoomableTimeBlock from "@/components/zoomable-time-block"
import { useTimeEntriesQuery } from "@/hooks/use-time-entries-query"
import { useCategoriesQuery } from "@/hooks/use-categories-query"
import type { User } from "@supabase/supabase-js"

// Update the interface
interface TimelineScreenProps {
  isDesktop?: boolean
  user?: User | null
}

// Update the component signature
export default function TimelineScreen({ isDesktop = false, user }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  // Use the new React Query hooks
  const {
    timeEntries,
    loading: timeEntriesLoading,
    error: timeEntriesError,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
  } = useTimeEntriesQuery(user, selectedDate)

  const { refreshTimeUsage } = useCategoriesQuery(user)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
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

  const handleAddTimeEntry = async (newEntry: Omit<TimeEntry, "id">) => {
    try {
      await addTimeEntry(newEntry)
      setIsAddModalOpen(false)
      setPrefilledEntry(null)
      // Refresh time usage in categories after adding entry
      if (refreshTimeUsage) {
        refreshTimeUsage()
      }
    } catch (error) {
      console.error("Failed to add time entry:", error)
      // Don't close the modal on error - let the modal handle the error display
    }
  }

  const handleEditTimeEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
    setIsEditModalOpen(true)
  }

  const handleUpdateTimeEntry = async (updatedEntry: TimeEntry) => {
    try {
      await updateTimeEntry(updatedEntry)
      if (refreshTimeUsage) {
        refreshTimeUsage()
      }
    } catch (error) {
      console.error("Failed to update time entry:", error)
      throw error // Re-throw to let modal handle the error
    }
  }

  const handleDeleteTimeEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId)
      if (refreshTimeUsage) {
        refreshTimeUsage()
      }
    } catch (error) {
      console.error("Failed to delete time entry:", error)
      throw error // Re-throw to let modal handle the error
    }
  }

  // Timeline configuration
  const TIMELINE_START_HOUR = 6 // 6 AM
  const TIMELINE_END_HOUR = 23 // 11 PM
  const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR + 1 // 18 hours
  const HOUR_HEIGHT = 80 // pixels per hour
  const TIMELINE_HEIGHT = TIMELINE_HOURS * HOUR_HEIGHT

  // Convert time string to minutes since timeline start
  const timeToMinutes = (timeString: string) => {
    const [hour, minute] = timeString.split(":").map(Number)
    return (hour - TIMELINE_START_HOUR) * 60 + minute
  }

  // Convert minutes to pixels from timeline top
  const minutesToPixels = (minutes: number) => {
    return (minutes / 60) * HOUR_HEIGHT
  }

  // Get entry position and height
  const getEntryStyle = (entry: TimeEntry) => {
    const startMinutes = timeToMinutes(entry.startTime)
    const endMinutes = timeToMinutes(entry.endTime)
    const durationMinutes = endMinutes - startMinutes

    const top = minutesToPixels(startMinutes)
    const height = minutesToPixels(durationMinutes)

    // Ensure minimum height for visibility but keep it proportional
    const minHeight = Math.max(height, 16) // Very small minimum for short events

    return {
      position: "absolute" as const,
      top: `${top}px`,
      height: `${minHeight}px`,
      left: "0px",
      right: "0px",
      zIndex: 10,
    }
  }

  // Generate hour markers
  const generateHourMarkers = () => {
    const markers = []
    for (let hour = TIMELINE_START_HOUR; hour <= TIMELINE_END_HOUR; hour++) {
      const displayHour = hour === 0 ? "12 AM" : hour <= 12 ? `${hour} AM` : `${hour - 12} PM`
      markers.push({
        hour,
        displayHour,
        position: (hour - TIMELINE_START_HOUR) * HOUR_HEIGHT,
      })
    }
    return markers
  }

  const hourMarkers = generateHourMarkers()

  // Handle timeline click to add entry
  const handleTimelineClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const clickMinutes = (clickY / HOUR_HEIGHT) * 60
    const clickHour = Math.floor(clickMinutes / 60) + TIMELINE_START_HOUR
    const clickMinute = Math.round((clickMinutes % 60) / 15) * 15 // Round to nearest 15 minutes

    const startTime = `${clickHour.toString().padStart(2, "0")}:${clickMinute.toString().padStart(2, "0")}`
    const endHour = clickMinute >= 45 ? clickHour + 1 : clickHour
    const endMinute = clickMinute >= 45 ? (clickMinute + 15) % 60 : clickMinute + 15
    const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`

    setPrefilledEntry({ startTime, endTime })
    setIsAddModalOpen(true)
  }

  // Get today's entries
  const todaysEntries = timeEntries.filter((entry) => entry.date === selectedDate.toISOString().split("T")[0])

  // Calculate timeline container height
  const headerHeight = isDesktop ? 120 : 140
  const trackingWidgetHeight = isDesktop ? 200 : 240
  const navigationHeight = isDesktop ? 0 : 80
  const totalFooterHeight = trackingWidgetHeight + navigationHeight
  const timelineContainerHeight = `calc(100vh - ${headerHeight + totalFooterHeight}px)`

  // Show loading state only if we have no data and are loading
  if (timeEntriesLoading && timeEntries.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    )
  }

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
      <div ref={timelineRef} className="overflow-y-auto overflow-x-hidden" style={{ height: timelineContainerHeight }}>
        <div className="p-6 pt-2">
          {timeEntriesError && (
            <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded z-50">
              {timeEntriesError}
            </div>
          )}

          {/* Timeline Container */}
          <div className="flex">
            {/* Time Labels */}
            <div className="w-16 flex-shrink-0">
              {hourMarkers.map((marker) => (
                <div
                  key={marker.hour}
                  className="relative text-sm font-medium text-gray-500"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                >
                  <div className="absolute -top-2">{marker.displayHour}</div>
                </div>
              ))}
            </div>

            {/* Timeline Grid and Events */}
            <div className="flex-1 ml-4 relative">
              {/* Background Grid */}
              <div
                className="relative cursor-pointer"
                style={{ height: `${TIMELINE_HEIGHT}px` }}
                onClick={handleTimelineClick}
              >
                {/* Hour Grid Lines */}
                {hourMarkers.map((marker) => (
                  <div
                    key={marker.hour}
                    className="absolute w-full border-t border-gray-200"
                    style={{ top: `${marker.position}px` }}
                  />
                ))}

                {/* 15-minute Grid Lines for better precision */}
                {hourMarkers.slice(0, -1).map((marker) => (
                  <div key={`${marker.hour}-quarters`}>
                    <div
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: `${marker.position + HOUR_HEIGHT / 4}px` }}
                    />
                    <div
                      className="absolute w-full border-t border-gray-150"
                      style={{ top: `${marker.position + HOUR_HEIGHT / 2}px` }}
                    />
                    <div
                      className="absolute w-full border-t border-gray-100"
                      style={{ top: `${marker.position + (3 * HOUR_HEIGHT) / 4}px` }}
                    />
                  </div>
                ))}

                {/* Current Time Indicator */}
                {selectedDate.toDateString() === new Date().toDateString() &&
                  (() => {
                    const now = new Date()
                    const currentHour = now.getHours()
                    const currentMinute = now.getMinutes()

                    if (currentHour >= TIMELINE_START_HOUR && currentHour <= TIMELINE_END_HOUR) {
                      const currentMinutes = (currentHour - TIMELINE_START_HOUR) * 60 + currentMinute
                      const currentPosition = minutesToPixels(currentMinutes)

                      return (
                        <div className="absolute w-full z-20 flex items-center" style={{ top: `${currentPosition}px` }}>
                          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg -ml-1.5"></div>
                          <div className="flex-1 h-0.5 bg-red-500"></div>
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium ml-2">
                            {now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      )
                    }
                    return null
                  })()}

                {/* Time Entries */}
                {todaysEntries.map((entry) => {
                  const startMinutes = timeToMinutes(entry.startTime)
                  const endMinutes = timeToMinutes(entry.endTime)
                  const durationMinutes = endMinutes - startMinutes

                  return (
                    <div key={entry.id} style={getEntryStyle(entry)} className="px-2">
                      <ZoomableTimeBlock
                        entry={entry}
                        onEdit={handleEditTimeEntry}
                        onDelete={handleDeleteTimeEntry}
                        zoomLevel={1}
                        slotHeight={durationMinutes} // Pass actual duration in minutes
                      />
                    </div>
                  )
                })}

                {/* Click Areas for Adding Events */}
                <div className="absolute inset-0 pointer-events-none">
                  {hourMarkers.slice(0, -1).map((marker) => (
                    <div key={`click-${marker.hour}`}>
                      {/* Four 15-minute segments per hour */}
                      {[0, 1, 2, 3].map((quarter) => (
                        <div
                          key={`${marker.hour}-${quarter}`}
                          className="absolute w-full pointer-events-auto hover:bg-blue-50/30 transition-colors"
                          style={{
                            top: `${marker.position + (quarter * HOUR_HEIGHT) / 4}px`,
                            height: `${HOUR_HEIGHT / 4}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            const startMinute = quarter * 15
                            const startTime = `${marker.hour.toString().padStart(2, "0")}:${startMinute.toString().padStart(2, "0")}`
                            const endMinute = (quarter + 1) * 15
                            const endHour = endMinute >= 60 ? marker.hour + 1 : marker.hour
                            const endTime = `${endHour.toString().padStart(2, "0")}:${(endMinute % 60).toString().padStart(2, "0")}`
                            setPrefilledEntry({ startTime, endTime })
                            setIsAddModalOpen(true)
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
        user={user}
        onTimeUsageUpdate={refreshTimeUsage}
      />

      <EditTimeEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingEntry(null)
        }}
        onUpdate={handleUpdateTimeEntry}
        onDelete={handleDeleteTimeEntry}
        entry={editingEntry}
        user={user}
        onTimeUsageUpdate={refreshTimeUsage}
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
        <EnhancedBottomTrackingWidget onAddEntry={handleAddTimeEntry} isDesktop={isDesktop} user={user} />
      </div>
    </>
  )
}
