"use client"

import type React from "react"
import { formatTime } from "@/lib/goal-utils"
import type { TimeEntry } from "@/lib/types"

interface FigmaTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
  slotHeight: number
}

export default function FigmaTimeBlock({ entry, onEdit, slotHeight }: FigmaTimeBlockProps) {
  // Calculate duration in minutes
  const getDurationMinutes = () => {
    if (slotHeight > 0) return slotHeight
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return endMinutes - startMinutes
  }

  const getDuration = () => {
    const durationMinutes = getDurationMinutes()
    const durationHours = durationMinutes / 60
    return formatTime(durationHours, true)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(entry)
  }

  // Status indicator component
  const StatusIndicator = () => {
    // Default to tracking status for now - this could be dynamic based on entry properties
    const isTracking = true // This should be based on actual tracking state
    const isPlanned = false
    const isCancelled = false

    if (isCancelled) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Cancelled</span>
        </div>
      )
    }

    if (isPlanned) {
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs text-gray-500">Planned</span>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-xs text-gray-500">Tracking</span>
      </div>
    )
  }

  // Subcategory badge component
  const SubcategoryBadge = ({ subcategory, color }: { subcategory: string; color: string }) => (
    <div
      className="inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white"
      style={{ backgroundColor: color }}
    >
      {subcategory}
    </div>
  )

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base mb-1">{entry.categoryName}</h3>
          {entry.subcategory && (
            <div className="mb-2">
              <SubcategoryBadge 
                subcategory={entry.subcategory} 
                color={entry.categoryColor || "#6B7280"} 
              />
            </div>
          )}
        </div>
        <StatusIndicator />
      </div>
      
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{entry.startTime} - {entry.endTime}</span>
        <span>{getDuration()}</span>
      </div>
      
      {entry.description && (
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{entry.description}</p>
      )}
    </div>
  )
}