"use client"

import { TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EnhancedAllocationBannerProps {
  remainingHours: number
  isEditMode: boolean
  onEnterEditMode: () => void
}

export default function EnhancedAllocationBanner({
  remainingHours,
  isEditMode,
  onEnterEditMode,
}: EnhancedAllocationBannerProps) {
  const isOverAllocated = remainingHours < 0
  const isUnderAllocated = remainingHours > 0

  if (remainingHours === 0) return null

  const getMotivationalMessage = () => {
    const hours = Math.abs(remainingHours)

    if (isOverAllocated) {
      if (hours > 20) return "Way over your weekly capacity"
      if (hours > 10) return "Over your weekly capacity"
      return "Slightly over capacity"
    } else {
      if (hours > 40) return "Lots of time to allocate"
      if (hours > 20) return "Plenty of time to assign"
      if (hours > 10) return "Good amount to budget"
      if (hours > 5) return "A few hours left to assign"
      return "Almost fully allocated"
    }
  }

  const getActionText = () => {
    if (isOverAllocated) return "Rebalance Budget"
    return "Assign Time"
  }

  const getProgressPercentage = () => {
    const totalWeekHours = 168
    const allocatedHours = totalWeekHours - Math.abs(remainingHours)
    return Math.min(100, (allocatedHours / totalWeekHours) * 100)
  }

  return (
    <div
      className={`relative rounded-3xl p-6 mb-6 border-2 shadow-xl transition-all duration-300 overflow-hidden ${
        isOverAllocated
          ? "bg-gradient-to-br from-red-50 via-orange-50 to-red-100 border-red-300"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 border-blue-300"
      }`}
    >
      {/* Simple progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-t-3xl overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            isOverAllocated ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-purple-600"
          }`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-4 mb-2">
              <h3
                className={`text-5xl font-black ${
                  isOverAllocated
                    ? "text-red-900"
                    : "text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text"
                }`}
              >
                {Math.abs(remainingHours).toFixed(1)}h
              </h3>

              <div className="flex flex-col">
                <p className={`text-lg font-semibold ${isOverAllocated ? "text-red-800" : "text-gray-800"}`}>
                  {getMotivationalMessage()}
                </p>

                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className={`w-4 h-4 ${isOverAllocated ? "text-red-600" : "text-green-600"}`} />
                  <span className={`font-medium ${isOverAllocated ? "text-red-700" : "text-blue-700"}`}>
                    {getProgressPercentage().toFixed(0)}% of 168h weekly capacity allocated
                  </span>
                </div>
              </div>

              <div
                className={`px-3 py-1 rounded-full text-xs font-bold ml-auto ${
                  isOverAllocated ? "bg-red-200 text-red-800" : "bg-blue-200 text-blue-800"
                }`}
              >
                {isOverAllocated ? "OVER BUDGET" : "TO ASSIGN"}
              </div>
            </div>
          </div>
        </div>

        {!isEditMode && (
          <Button
            onClick={onEnterEditMode}
            className={`w-full h-14 rounded-2xl text-lg font-bold shadow-xl transition-all duration-300 transform hover:scale-105 ${
              isOverAllocated
                ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white"
                : "bg-gradient-to-r from-blue-500 via-purple-600 to-indigo-600 hover:from-blue-600 hover:via-purple-700 hover:to-indigo-700 text-white"
            }`}
          >
            <span>{getActionText()}</span>
          </Button>
        )}
      </div>
    </div>
  )
}
