"use client"

import { analyzeSubcategory, getStatusColors, calculateWeekProgress, formatTime } from "@/lib/goal-utils"
import type { Subcategory } from "@/lib/types"

interface SmartBudgetIndicatorProps {
  subcategory: Subcategory
  categoryColor: string
  showDetails?: boolean
}

export default function SmartBudgetIndicator({
  subcategory,
  categoryColor,
  showDetails = true,
}: SmartBudgetIndicatorProps) {
  const insight = analyzeSubcategory(subcategory)
  const colors = getStatusColors(insight.status)
  const weekProgress = calculateWeekProgress()

  const usagePercentage = subcategory.budget > 0 ? (subcategory.timeUsed / subcategory.budget) * 100 : 0
  const weekProgressPercentage = weekProgress * 100

  // Goal type indicator
  const getGoalTypeSymbol = () => {
    switch (subcategory.goalDirection) {
      case "more_is_better":
        return "+"
      case "less_is_better":
        return "-"
      case "target_range":
      default:
        return "○"
    }
  }

  // Generate consolidated status message with goal-aware coloring
  const getStatusMessage = () => {
    const projectedTotal = subcategory.timeUsed / weekProgress
    const expectedAtThisPoint = subcategory.budget * weekProgress
    const difference = subcategory.timeUsed - expectedAtThisPoint

    if (Math.abs(difference) < 0.1) {
      return { text: "on target pace", color: "#10b981" } // green
    }

    const isUnder = difference < 0
    const text = `${formatTime(Math.abs(difference))} ${isUnder ? "under" : "over"} target pace`

    // Color logic based on goal direction
    let color = "#10b981" // default green
    if (subcategory.goalDirection === "more_is_better") {
      color = isUnder ? "#ef4444" : "#10b981" // under = red, over = green
    } else if (subcategory.goalDirection === "less_is_better") {
      color = isUnder ? "#10b981" : "#ef4444" // under = green, over = red
    } else {
      // No goal direction - use standard logic
      color =
        Math.abs(difference) > subcategory.budget * 0.3
          ? "#ef4444"
          : Math.abs(difference) > subcategory.budget * 0.1
            ? "#f59e0b"
            : "#10b981"
    }

    return { text, color }
  }

  const statusMessage = getStatusMessage()

  return (
    <div className="space-y-2">
      {/* Progress Bar with Week Progress Indicator */}
      <div className="relative">
        <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
          {/* Week progress indicator line */}
          <div
            className="absolute top-0 w-0.5 h-2 bg-gray-400 opacity-70 z-10"
            style={{ left: `${Math.min(100, weekProgressPercentage)}%` }}
            title={`${weekProgressPercentage.toFixed(0)}% through week`}
          />

          {/* Actual progress */}
          <div
            className="h-2 rounded-full transition-all duration-500 relative overflow-hidden"
            style={{
              backgroundColor: colors.fill,
              width: `${Math.min(100, usagePercentage)}%`,
              opacity: 0.8,
            }}
          >
            {/* Subtle shimmer effect for excellent status */}
            {insight.status === "excellent" && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
            )}
          </div>
        </div>
      </div>

      {/* Consolidated Status Display */}
      {showDetails && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span
              className="w-3 h-3 rounded-sm flex items-center justify-center text-[8px] font-bold text-white"
              style={{ backgroundColor: colors.fill }}
            >
              {getGoalTypeSymbol()}
            </span>
            <span className="text-sm text-gray-600 font-medium">
              {formatTime(subcategory.timeUsed)} of {formatTime(subcategory.budget)}
            </span>
            <span className="text-sm font-medium ml-2" style={{ color: statusMessage.color }}>
              • {statusMessage.text}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
