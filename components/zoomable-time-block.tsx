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
        className="bg-white rounded-lg p-2 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm h-full flex flex-col justify-center"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "20px",
        }}
        onClick={handleCardClick}
        title={`${entry.categoryName}${entry.subcategory ? ` - ${entry.subcategory}` : ""} (${entry.startTime} - ${entry.endTime}, ${getDuration()})`}
      >
        <div className="text-xs font-medium text-gray-900 truncate">{entry.categoryName}</div>
      </div>
    )
  }

  // Short events (15-30 minutes) - compact display
  if (durationMinutes < 30) {
    return (
      <div
        className="bg-white rounded-lg p-3 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm h-full relative group"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "36px",
        }}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start h-full">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate leading-tight">{entry.categoryName}</h4>
            <p className="text-xs text-gray-500 mt-0.5">{getDuration()}</p>
          </div>
        </div>
      </div>
    )
  }

  // Medium events (30-60 minutes) - standard display
  if (durationMinutes < 60) {
    return (
      <div
        className="bg-white rounded-lg p-2 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm h-full relative group"
        style={{
          borderLeftColor: entry.categoryColor,
          minHeight: "40px",
        }}
        onClick={handleCardClick}
      >
        <div className="flex justify-between items-start h-full">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-gray-900 truncate leading-tight">{entry.categoryName}</h4>
            {entry.subcategory && <p className="text-xs text-gray-500 truncate mt-0.5">{entry.subcategory}</p>}
            <p className="text-xs text-gray-500 mt-1">
              {entry.startTime} - {entry.endTime} • {getDuration()}
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Long events (60+ minutes) - full display
  return (
    <div
      className="bg-white rounded-lg p-3 border-l-4 cursor-pointer transition-all duration-200 hover:shadow-sm h-full relative group"
      style={{
        borderLeftColor: entry.categoryColor,
        minHeight: "60px",
      }}
      onClick={handleCardClick}
    >
      <div className="flex justify-between items-start h-full">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-gray-900 truncate leading-tight mb-1">{entry.categoryName}</h4>
          {entry.subcategory && <p className="text-xs text-gray-500 truncate mb-1">{entry.subcategory}</p>}
          <p className="text-xs text-gray-500 mb-1">
            {entry.startTime} - {entry.endTime} • {getDuration()}
          </p>
          {entry.description && (
            <p className="text-xs text-gray-600 leading-relaxed line-clamp-1 truncate">{entry.description}</p>
          )}
        </div>
      </div>
    </div>
  )
}
