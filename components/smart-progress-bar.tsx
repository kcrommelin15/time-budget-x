"use client"

import { analyzeSubcategoryProgress, getStatusColor } from "@/lib/goal-utils"
import type { Subcategory } from "@/lib/types"

interface SmartProgressBarProps {
  subcategory: Subcategory
  categoryColor: string
  showDetails?: boolean
}

export default function SmartProgressBar({ subcategory, categoryColor, showDetails = false }: SmartProgressBarProps) {
  const progress = analyzeSubcategoryProgress(subcategory)
  const statusColor = getStatusColor(progress.status)

  const usagePercentage = subcategory.budget > 0 ? (subcategory.timeUsed / subcategory.budget) * 100 : 0
  const expectedPercentage = subcategory.budget > 0 ? (progress.expectedUsage / subcategory.budget) * 100 : 0

  // Goal direction indicators
  const goalIcon =
    subcategory.goalDirection === "more_is_better" ? "+" : subcategory.goalDirection === "less_is_better" ? "−" : ""

  const goalColor = subcategory.goalDirection ? "#10b981" : "#6b7280"

  return (
    <div className="space-y-2">
      {/* Progress Bar with Enhanced Pace Line */}
      <div className="relative">
        <div className="w-full bg-gray-100 rounded-full h-4 shadow-inner border border-gray-200 relative overflow-hidden">
          {/* Pace line - enhanced visualization */}
          <div
            className="absolute top-0 h-4 flex items-center justify-center transition-all duration-300"
            style={{ left: `${Math.min(95, Math.max(5, expectedPercentage))}%` }}
          >
            {/* Pace line with goal direction indicator */}
            <div className="relative">
              {/* Main pace line */}
              <div
                className="w-0.5 h-4 bg-gray-600 opacity-80 shadow-sm"
                title={`Expected: ${progress.expectedUsage.toFixed(1)}h`}
              />

              {/* Goal direction indicator above the line */}
              {goalIcon && (
                <div
                  className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border border-white"
                  style={{
                    backgroundColor: goalColor,
                    color: "white",
                    fontSize: "8px",
                  }}
                >
                  {goalIcon}
                </div>
              )}

              {/* Pace indicator triangle */}
              <div
                className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-3 border-transparent"
                style={{ borderTopColor: "#4b5563" }}
              />
            </div>
          </div>

          {/* Actual progress bar */}
          <div
            className="h-4 rounded-full transition-all duration-500 shadow-sm relative overflow-hidden"
            style={{
              backgroundColor: statusColor,
              width: `${Math.min(100, usagePercentage)}%`,
            }}
          >
            {/* Animated shine effect for excellent status */}
            {progress.status === "excellent" && (
              <div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"
                style={{ animationDuration: "2s" }}
              />
            )}

            {/* Progress bar end indicator */}
            <div className="absolute right-0 top-0 h-4 w-1 bg-black bg-opacity-20 rounded-r-full" />
          </div>

          {/* Week progress background indicator */}
          <div
            className="absolute top-0 left-0 h-4 bg-blue-50 opacity-30 rounded-full transition-all duration-300"
            style={{ width: `${expectedPercentage}%` }}
          />
        </div>
      </div>

      {/* Status Details */}
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
            <span className="text-gray-700 font-medium">{progress.statusMessage}</span>
            {goalIcon && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${goalColor}20`,
                  color: goalColor,
                }}
              >
                {goalIcon} {subcategory.goalDirection === "more_is_better" ? "more" : "less"}
              </span>
            )}
          </div>
          <div className="text-gray-600 font-medium">
            {subcategory.timeUsed.toFixed(1)}h / {subcategory.budget}h
          </div>
        </div>
      )}

      {/* Projection */}
      {showDetails && progress.weekProgress > 0.1 && (
        <div className="text-sm text-gray-600">Pace: {progress.projectedTotal.toFixed(1)}h by week end</div>
      )}
    </div>
  )
}
