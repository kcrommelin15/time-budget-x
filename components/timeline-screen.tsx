"use client"

import { useState, useMemo } from "react"
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ZoomableTimeBlock from "./zoomable-time-block"
import AddTimeEntryModal from "./add-time-entry-modal"
import EditTimeEntryModal from "./edit-time-entry-modal"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { useCategories } from "@/hooks/use-categories"
import type { TimeEntry } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface TimelineScreenProps {
  user?: User | null
}

export default function TimelineScreen({ user }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [clickedTime, setClickedTime] = useState<string>("")

  const { timeEntries, addTimeEntry, updateTimeEntry, deleteTimeEntry } = useTimeEntries(user)
  const { refreshTimeUsage } = useCategories(user)

  // Filter entries for selected date
  const todaysEntries = useMemo(() => {
    const dateStr = selectedDate.toISOString().split("T")[0]
    return timeEntries.filter((entry) => entry.date === dateStr)
  }, [timeEntries, selectedDate])

  // Generate time slots (6 AM to 11 PM)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeStr)
      }
    }
    return slots
  }, [])

  // Calculate positions for entries
  const entryPositions = useMemo(() => {
    return todaysEntries.map((entry) => {
      const [startHour, startMin] = entry.startTime.split(":").map(Number)
      const [endHour, endMin] = entry.endTime.split(":").map(Number)

      const startMinutes = startHour * 60 + startMin
      const endMinutes = endHour * 60 + endMin
      const durationMinutes = endMinutes - startMinutes

      // Calculate position from 6 AM (360 minutes)
      const topOffset = ((startMinutes - 360) / 60) * 80 // 80px per hour
      const height = (durationMinutes / 60) * 80 // 80px per hour

      return {
        ...entry,
        topOffset: Math.max(0, topOffset),
        height: Math.max(16, height), // Minimum 16px height
        durationMinutes,
      }
    })
  }, [todaysEntries])

  const handleTimeSlotClick = (time: string) => {
    console.log("Time slot clicked:", time)
    setClickedTime(time)
    setShowAddModal(true)
  }

  const handleEditEntry = (entry: TimeEntry) => {
    console.log("Edit entry clicked:", entry)
    setEditingEntry(entry)
    setShowEditModal(true)
  }

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await deleteTimeEntry(entryId)
      await refreshTimeUsage()
    } catch (error) {
      console.error("Error deleting entry:", error)
    }
  }

  const handleUpdateEntry = async (updatedEntry: TimeEntry) => {
    try {
      await updateTimeEntry(updatedEntry)
      await refreshTimeUsage()
      setShowEditModal(false)
      setEditingEntry(null)
    } catch (error) {
      console.error("Error updating entry:", error)
      throw error
    }
  }

  const handleAddEntry = async (newEntry: Omit<TimeEntry, "id" | "date">) => {
    try {
      const entryWithDate = {
        ...newEntry,
        date: selectedDate.toISOString().split("T")[0],
      }
      await addTimeEntry(entryWithDate)
      await refreshTimeUsage()
      setShowAddModal(false)
      setClickedTime("")
    } catch (error) {
      console.error("Error adding entry:", error)
      throw error
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(selectedDate)
    newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const currentTime = new Date()
  const currentHour = currentTime.getHours()
  const currentMinute = currentTime.getMinutes()
  const currentTimeOffset = ((currentHour * 60 + currentMinute - 360) / 60) * 80

  const isToday = selectedDate.toDateString() === new Date().toDateString()

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate("prev")} className="rounded-xl">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-semibold">{formatDate(selectedDate)}</h1>
              <Button variant="outline" size="sm" onClick={() => navigateDate("next")} className="rounded-xl">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {!isToday && (
              <Button variant="outline" size="sm" onClick={goToToday} className="rounded-xl">
                Today
              </Button>
            )}
          </div>
          <Button onClick={() => setShowAddModal(true)} className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="relative" style={{ height: "1440px" }}>
          {/* Hour markers and grid lines */}
          {Array.from({ length: 18 }, (_, i) => {
            const hour = i + 6
            const displayHour = hour > 12 ? hour - 12 : hour
            const ampm = hour >= 12 ? "PM" : "AM"
            const adjustedDisplayHour = displayHour === 0 ? 12 : displayHour

            return (
              <div key={hour} className="absolute left-0 right-0" style={{ top: `${i * 80}px` }}>
                {/* Hour line */}
                <div className="flex items-center">
                  <div className="w-16 text-sm text-gray-500 font-medium text-right pr-4">
                    {adjustedDisplayHour} {ampm}
                  </div>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* 15-minute grid lines */}
                {[1, 2, 3].map((quarter) => (
                  <div key={quarter} className="absolute left-16 right-0" style={{ top: `${quarter * 20}px` }}>
                    <div className="h-px bg-gray-100"></div>
                  </div>
                ))}

                {/* Clickable time slots */}
                {[0, 15, 30, 45].map((minute) => {
                  const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
                  return (
                    <div
                      key={`${hour}-${minute}`}
                      className="absolute left-16 right-4 cursor-pointer hover:bg-blue-50 transition-colors"
                      style={{
                        top: `${(minute / 60) * 80}px`,
                        height: "20px",
                      }}
                      onClick={() => handleTimeSlotClick(timeStr)}
                    />
                  )
                })}
              </div>
            )
          })}

          {/* Current time indicator */}
          {isToday && currentTimeOffset >= 0 && currentTimeOffset <= 1360 && (
            <div className="absolute left-16 right-4 z-30" style={{ top: `${currentTimeOffset}px` }}>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="flex-1 h-0.5 bg-red-500"></div>
              </div>
            </div>
          )}

          {/* Time entries */}
          {entryPositions.map((entry) => (
            <div
              key={entry.id}
              className="absolute left-16 right-4 z-20"
              style={{
                top: `${entry.topOffset}px`,
                height: `${entry.height}px`,
              }}
            >
              <ZoomableTimeBlock
                entry={entry}
                onEdit={handleEditEntry}
                onDelete={handleDeleteEntry}
                zoomLevel={1}
                slotHeight={entry.durationMinutes}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Add Time Entry Modal */}
      <AddTimeEntryModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setClickedTime("")
        }}
        onAdd={handleAddEntry}
        defaultStartTime={clickedTime}
        user={user}
        onTimeUsageUpdate={refreshTimeUsage}
      />

      {/* Edit Time Entry Modal */}
      <EditTimeEntryModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingEntry(null)
        }}
        onUpdate={handleUpdateEntry}
        onDelete={handleDeleteEntry}
        entry={editingEntry}
        user={user}
        onTimeUsageUpdate={refreshTimeUsage}
      />
    </div>
  )
}
