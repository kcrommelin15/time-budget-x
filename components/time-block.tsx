import { formatTime } from "@/lib/goal-utils"
import type { TimeEntry } from "@/lib/types"

interface TimeBlockProps {
  entry: TimeEntry
}

export default function TimeBlock({ entry }: TimeBlockProps) {
  const getDuration = () => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60

    return formatTime(durationHours, true)
  }

  return (
    <div className="border-l-4 bg-white rounded-r-lg p-3 shadow-sm" style={{ borderLeftColor: entry.categoryColor }}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-medium">{entry.categoryName}</h4>
          <p className="text-sm text-gray-600">
            {entry.startTime} - {entry.endTime} | {getDuration()}
          </p>
          {entry.description && <p className="text-sm text-gray-500 mt-1">{entry.description}</p>}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-gray-500">Tracking</span>
        </div>
      </div>
    </div>
  )
}
