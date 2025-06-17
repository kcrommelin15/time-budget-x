"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Clock, Calendar } from "lucide-react"
import AddTimeEntryModal from "./add-time-entry-modal"
import EnhancedBottomTrackingWidget from "./enhanced-bottom-tracking-widget"
import { useTimeEntries } from "@/hooks/use-time-entries"
import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"

interface TimelineScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function TimelineScreen({ isDesktop = false, user }: TimelineScreenProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showAddModal, setShowAddModal] = useState(false)

  const { timeEntries, loading, error, addTimeEntry } = useTimeEntries(selectedDate)
  const { categories, loading: categoriesLoading } = useCategories()

  // Format time entries for display
  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || "Unknown Category"
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view your timeline</p>
      </div>
    )
  }

  return (
    <div className={`${isDesktop ? "p-8" : "p-4"} min-h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Timeline</h1>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </div>

      {/* Date Selector */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <p className="text-sm text-gray-600">{formatDate(selectedDate)}</p>
      </div>

      {/* Timeline Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-600">Error loading timeline: {error}</p>
          </div>
        ) : timeEntries.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No time entries for this date</p>
            <p className="text-sm text-gray-400">Add your first time entry to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{getCategoryName(entry.category_id)}</span>
                      {entry.subcategory_name && (
                        <span className="text-sm text-gray-500">• {entry.subcategory_name}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{formatTime(entry.start_time)}</span>
                      <span>-</span>
                      <span>{formatTime(entry.end_time)}</span>
                    </div>
                    {entry.description && <p className="text-sm text-gray-600 mt-1">{entry.description}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Tracking Widget */}
      {!isDesktop && (
        <div className="fixed bottom-20 left-0 right-0 px-4">
          <EnhancedBottomTrackingWidget
            categories={categories}
            onTimeEntryAdded={() => {
              // Refresh time entries when a new one is added
              window.location.reload()
            }}
          />
        </div>
      )}

      {/* Add Time Entry Modal */}
      <AddTimeEntryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTimeEntry}
        categories={categories}
        selectedDate={selectedDate}
      />
    </div>
  )
}
