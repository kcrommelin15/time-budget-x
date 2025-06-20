"use client"

import type React from "react"

import { useState } from "react"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TimeEntry } from "@/lib/types"
// Import the centralized formatTime function
import { formatTime } from "@/lib/goal-utils"

interface ZoomableTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
  zoomLevel: number
  slotHeight: number
}

export default function ZoomableTimeBlock({ entry, onEdit, onDelete, zoomLevel, slotHeight }: ZoomableTimeBlockProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Calculate duration in minutes - use slotHeight if provided, otherwise calculate
  const getDurationMinutes = () => {
    if (slotHeight > 0) return slotHeight // Use passed duration

    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes - startMinutes
  }

  // Update the getDuration function to use formatTime
  const getDuration = () => {
    const durationMinutes = getDurationMinutes()
    const durationHours = durationMinutes / 60
    return formatTime(durationHours, true)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent timeline click
    onEdit(entry) // Pass the entry to parent for editing
  }

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent timeline and card click
    setShowMenu(!showMenu)
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent timeline and card click
    onEdit(entry)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent timeline and card click
    onDelete(entry.id)
  }

  const durationMinutes = getDurationMinutes()

  // Very short events (< 15 minutes) - minimal display
  if (durationMinutes < 15) {
    return (
      <div
        className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-lg px-2 py-1 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-200/60 h-full flex items-center overflow-hidden"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "16px",
          maxHeight: "24px",
        }}
        onClick={handleCardClick}
        title={`${entry.categoryName} (${entry.startTime} - ${entry.endTime}, ${getDuration()})`}
      >
        <div className="flex items-center justify-between w-full">
          <span className="font-medium text-xs text-gray-900 truncate flex-1">{entry.categoryName}</span>
          <span className="text-xs text-gray-500 ml-1 flex-shrink-0">{getDuration()}</span>
        </div>
      </div>
    )
  }

  // Short events (15-30 minutes) - compact display
  if (durationMinutes < 30) {
    return (
      <div
        className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-2xl p-2 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-200/60 h-full"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "32px",
        }}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-center h-full">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{entry.categoryName}</h4>
            <p className="text-xs text-gray-600">{getDuration()}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMenuClick}
            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-1"
          >
            <MoreHorizontal className="w-3 h-3" />
          </Button>
        </div>

        {showMenu && (
          <>
            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 min-w-[100px]">
              <button
                onClick={handleEditClick}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </div>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          </>
        )}
      </div>
    )
  }

  // Medium events (30-60 minutes) - standard display
  if (durationMinutes < 60) {
    return (
      <div
        className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-2xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-200/60 h-full"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "48px",
        }}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start h-full">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate">{entry.categoryName}</h4>
            <p className="text-xs text-gray-600 mb-1">
              {entry.startTime} - {entry.endTime} | {getDuration()}
            </p>
            {entry.description && <p className="text-xs text-gray-500 truncate">{entry.description}</p>}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
            >
              <Edit className="w-3 h-3" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMenuClick}
                className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>

              {showMenu && (
                <>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 min-w-[100px]">
                    <button
                      onClick={handleEditClick}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Long events (60+ minutes) - full display
  return (
    <div
      className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-200/60 hover:border-gray-300/60 h-full"
      style={{
        borderLeftColor: entry.categoryColor,
        minHeight: "80px",
      }}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start h-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{entry.categoryName}</h4>
            <div className="flex items-center gap-1">
              <span className="text-xs text-green-600 font-medium">
                {entry.status === "pending" ? "Pending" : "Confirmed"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {entry.startTime} - {entry.endTime} | {getDuration()}
          </p>
          {entry.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{entry.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuClick}
              className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>

            {showMenu && (
              <>
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 min-w-[100px]">
                  <button
                    onClick={handleEditClick}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
