"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Edit, Clock, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TimeEntry } from "@/lib/types"
// Import the centralized formatTime function
import { formatTime } from "@/lib/goal-utils"

interface ResizableTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
}

export default function ResizableTimeBlock({ entry, onEdit, onDelete }: ResizableTimeBlockProps) {
  const [isResizing, setIsResizing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const blockRef = useRef<HTMLDivElement>(null)

  // Update the getDuration function to use formatTime
  const getDuration = () => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60

    return formatTime(durationHours, true)
  }

  const handleMouseDown = (e: React.MouseEvent, type: "drag" | "resize-top" | "resize-bottom") => {
    e.preventDefault()

    if (type === "drag") {
      setIsDragging(true)
    } else {
      setIsResizing(true)
    }

    // TODO: Implement actual drag and resize logic
    // This would involve mouse move and mouse up event handlers
    // For now, we'll just show the visual feedback
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(false)
  }

  return (
    <div
      ref={blockRef}
      className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 group hover:shadow-xl transition-all duration-200 ${
        isDragging ? "scale-105 shadow-2xl z-50" : ""
      } ${isResizing ? "ring-2 ring-blue-400" : ""}`}
      style={{ borderLeftColor: entry.categoryColor }}
      onMouseUp={handleMouseUp}
    >
      {/* Resize Handle Top */}
      <div
        className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize-top")}
      >
        <div className="h-1 bg-blue-400 rounded-full mx-4 mt-0.5"></div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <GripVertical
                className="w-4 h-4 text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
                onMouseDown={(e) => handleMouseDown(e, "drag")}
              />
              <h4 className="font-semibold text-gray-900">{entry.categoryName}</h4>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  {entry.status === "pending" ? "Pending" : "Confirmed"}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              {entry.startTime} - {entry.endTime} | {getDuration()}
            </p>

            {entry.description && <p className="text-sm text-gray-500 line-clamp-2">{entry.description}</p>}
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => onEdit(entry)} className="rounded-xl">
              <Edit className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resize Handle Bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={(e) => handleMouseDown(e, "resize-bottom")}
      >
        <div className="h-1 bg-blue-400 rounded-full mx-4 mb-0.5"></div>
      </div>
    </div>
  )
}
