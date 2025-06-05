"use client"

import { useState, useRef, useEffect } from "react"
import ResizableTimeBlock from "@/components/resizable-time-block"
import type { TimeEntry } from "@/lib/types"

interface PrecisionTimelineProps {
  timeEntries: TimeEntry[]
  onEditEntry: (entry: TimeEntry) => void
  onDeleteEntry: (entryId: string) => void
  selectedDate: Date
}

export default function PrecisionTimeline({
  timeEntries,
  onEditEntry,
  onDeleteEntry,
  selectedDate,
}: PrecisionTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Generate 1-minute precision time slots (6 AM to 11 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 1) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push({
          time: timeString,
          hour,
          minute,
          isHourMark: minute === 0,
          isQuarterMark: minute % 15 === 0,
        })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const getCurrentTimePosition = () => {
    const now = currentTime
    const hour = now.getHours()
    const minute = now.getMinutes()

    if (hour < 6 || hour > 23) return null

    const totalMinutes = (hour - 6) * 60 + minute
    return (totalMinutes / (18 * 60)) * 100 // 18 hours total (6 AM to 11 PM)
  }

  const getEntryPosition = (entry: TimeEntry) => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)

    const startMinutes = (startHour - 6) * 60 + startMin
    const endMinutes = (endHour - 6) * 60 + endMin

    const top = (startMinutes / (18 * 60)) * 100
    const height = ((endMinutes - startMinutes) / (18 * 60)) * 100

    return { top: `${top}%`, height: `${height}%` }
  }

  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const currentTimePosition = getCurrentTimePosition()

  return (
    <div className="relative bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Time Labels */}
      <div className="flex">
        <div className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200">
          {timeSlots
            .filter((slot) => slot.isHourMark)
            .map((slot) => (
              <div
                key={slot.time}
                className="h-16 flex items-center justify-center text-sm font-medium text-gray-600 border-b border-gray-100"
              >
                {slot.hour === 0 ? "12 AM" : slot.hour <= 12 ? `${slot.hour} AM` : `${slot.hour - 12} PM`}
              </div>
            ))}
        </div>

        {/* Timeline Area */}
        <div className="flex-1 relative" style={{ height: `${18 * 64}px` }} ref={timelineRef}>
          {/* Hour Grid Lines */}
          {timeSlots
            .filter((slot) => slot.isHourMark)
            .map((slot, index) => (
              <div
                key={slot.time}
                className="absolute w-full border-b border-gray-200"
                style={{ top: `${index * 64}px` }}
              />
            ))}

          {/* Quarter Hour Grid Lines */}
          {timeSlots
            .filter((slot) => slot.isQuarterMark && !slot.isHourMark)
            .map((slot) => {
              const position = (((slot.hour - 6) * 60 + slot.minute) / (18 * 60)) * 100
              return (
                <div
                  key={slot.time}
                  className="absolute w-full border-b border-gray-100"
                  style={{ top: `${position}%` }}
                />
              )
            })}

          {/* Current Time Indicator */}
          {isToday && currentTimePosition !== null && (
            <div className="absolute w-full z-20 flex items-center" style={{ top: `${currentTimePosition}%` }}>
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg -ml-2"></div>
              <div className="flex-1 h-0.5 bg-red-500"></div>
              <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          )}

          {/* Time Entries */}
          {timeEntries.map((entry) => {
            const position = getEntryPosition(entry)
            return (
              <div key={entry.id} className="absolute left-2 right-2 z-10" style={position}>
                <ResizableTimeBlock entry={entry} onEdit={onEditEntry} onDelete={onDeleteEntry} />
              </div>
            )
          })}

          {/* Click to Add Time Slots */}
          {timeSlots
            .filter((slot) => slot.minute % 15 === 0)
            .map((slot) => {
              const hasEntry = timeEntries.some((entry) => entry.startTime === slot.time)
              if (hasEntry) return null

              const position = (((slot.hour - 6) * 60 + slot.minute) / (18 * 60)) * 100
              return (
                <div
                  key={slot.time}
                  className="absolute left-2 right-2 h-4 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors group"
                  style={{ top: `${position}%` }}
                  onClick={() => {
                    // TODO: Open add time entry modal with pre-filled time
                  }}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-600 font-medium">
                    + Add entry at {slot.time}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
