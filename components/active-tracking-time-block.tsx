"use client"

import { useState } from "react"
import { Pause, Square, Clock, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { TimeEntry } from "@/lib/types"
// Import the centralized formatTime function
import { formatTime } from "@/lib/goal-utils"

interface ActiveTrackingTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
  isActive?: boolean
  elapsedTime?: number
}

export default function ActiveTrackingTimeBlock({
  entry,
  onEdit,
  onDelete,
  isActive = false,
  elapsedTime = 0,
}: ActiveTrackingTimeBlockProps) {
  const [showControls, setShowControls] = useState(false)

  // Update the getDuration function to use formatTime for both active and regular entries
  const getDuration = () => {
    if (isActive && elapsedTime > 0) {
      const totalSeconds = Math.floor(elapsedTime / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60

    return formatTime(durationHours, true)
  }

  if (isActive) {
    return (
      <div
        className="border-l-4 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 rounded-r-3xl p-4 shadow-2xl border-2 border-green-300 relative overflow-hidden group"
        style={{ borderLeftColor: entry.categoryColor }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Animated background shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

        {/* Pulsing border effect */}
        <div className="absolute inset-0 border-2 border-green-400 rounded-r-3xl animate-pulse opacity-50"></div>

        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-green-500 animate-pulse" />
                  <h4 className="font-bold text-gray-900">{entry.categoryName}</h4>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-xs text-green-600 font-bold">LIVE</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg font-mono font-bold text-gray-900 bg-white/60 rounded-lg px-2 py-1">
                  {getDuration()}
                </span>
                <span className="text-sm text-gray-600">Started at {entry.startTime}</span>
              </div>

              {entry.description && (
                <p className="text-sm text-gray-600 bg-white/40 rounded-lg p-2">{entry.description}</p>
              )}
            </div>

            {/* Quick Controls */}
            {showControls && (
              <div className="flex items-center gap-2 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="sm" className="rounded-xl bg-white/80 hover:bg-white border-gray-300">
                  <Pause className="w-3 h-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl bg-white/80 hover:bg-white border-red-300 text-red-600 hover:text-red-700"
                >
                  <Square className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Regular time block for non-active entries
  return (
    <div
      className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-gray-50 border border-gray-200/60"
      style={{ borderLeftColor: entry.categoryColor }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900">{entry.description || entry.categoryName}</h4>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">
                {entry.status === "pending" ? "Pending" : "Confirmed"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="px-2 py-1 rounded-xl text-xs font-medium shadow-sm border"
              style={{
                backgroundColor: `${entry.categoryColor}15`,
                color: entry.categoryColor,
                borderColor: `${entry.categoryColor}30`,
              }}
            >
              {entry.categoryName}
            </div>
            <span className="text-sm text-gray-600">
              {entry.startTime} - {entry.endTime} | {getDuration()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
