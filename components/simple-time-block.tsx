"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import EnhancedActivityDetailsModal from "@/components/enhanced-activity-details-modal"
import type { TimeEntry } from "@/lib/types"

interface SimpleTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
}

export default function SimpleTimeBlock({ entry, onEdit, onDelete }: SimpleTimeBlockProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const getDuration = () => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes

    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  return (
    <>
      <div
        className="border-l-4 bg-white rounded-r-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:bg-gray-50 border border-gray-200/60"
        style={{ borderLeftColor: entry.categoryColor }}
        onClick={() => setIsDetailsOpen(true)}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{entry.description || entry.categoryName}</h4>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-500" />
                <span className="text-xs text-green-600 font-medium">
                  {entry.status === "pending" ? "Pending" : "Tracking"}
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

      <EnhancedActivityDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        entry={entry}
        onSave={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}
