"use client"

import { useState, useRef } from "react"
import { Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"

interface TimelineScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function TimelineScreen({ isDesktop = false, user }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)

  const timelineRef = useRef<HTMLDivElement>(null)
  const dateString = selectedDate.toISOString().split("T")[0]

  const { timeEntries, loading, error } = useTimeEntries(dateString)
  const { categories } = useCategories()

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Generate time slots
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(timeString)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "Unknown Category"
  }

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.color || "bg-gray-500"
  }

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
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{formatDate(selectedDate)}</h1>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateString}
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div ref={timelineRef} className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map((time) => {
              // Find if there's an entry at this time
              const entryAtTime = timeEntries.find((entry) => {
                const entryStart = entry.start_time
                const entryEnd = entry.end_time
                return time >= entryStart && time < entryEnd
              })

              return (
                <div key={time} className="flex items-center gap-4 min-h-[60px]">
                  <div className="w-16 text-sm font-mono text-gray-500 flex-shrink-0">{formatTime(time)}</div>
                  <div className="flex-1">
                    {entryAtTime ? (
                      <div
                        className={`p-3 rounded-lg border-l-4 ${getCategoryColor(entryAtTime.category_id)} bg-white shadow-sm`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{getCategoryName(entryAtTime.category_id)}</h3>
                            {entryAtTime.subcategory_name && (
                              <p className="text-sm text-gray-600">{entryAtTime.subcategory_name}</p>
                            )}
                            {entryAtTime.description && (
                              <p className="text-sm text-gray-500 mt-1">{entryAtTime.description}</p>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTime(entryAtTime.start_time)} - {formatTime(entryAtTime.end_time)}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="border-l-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-all duration-200 rounded-r-lg hover:bg-gray-50 flex items-center pl-4 h-12">
                        <span className="text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity">
                          + Add entry
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Simple Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h2 className="text-xl font-bold mb-4">Add Time Entry</h2>
            <p className="text-gray-600 mb-4">
              Time entry functionality will be available once the modal components are properly integrated.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
