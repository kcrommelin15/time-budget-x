"use client"

import { useState } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface GoalThresholdSelectorProps {
  goalType: "more_is_better" | "less_is_better"
  budget: number
  currentThreshold?: number
  onSave: (threshold: number) => void
  onCancel: () => void
}

export default function GoalThresholdSelector({
  goalType,
  budget,
  currentThreshold,
  onSave,
  onCancel,
}: GoalThresholdSelectorProps) {
  const isMore = goalType === "more_is_better"
  const defaultThreshold = isMore ? budget * 1.1 : budget * 0.9
  const [threshold, setThreshold] = useState(currentThreshold || defaultThreshold)

  const minThreshold = isMore ? budget : 0
  const maxThreshold = isMore ? budget * 2 : budget

  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m.toString().padStart(2, "0")}min`
  }

  const getDescription = () => {
    if (isMore) {
      return `Aim to spend at least ${formatTime(threshold)} per week`
    } else {
      return `Try to keep it under ${formatTime(threshold)} per week`
    }
  }

  const getColorClasses = () => {
    if (isMore) {
      return {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-900",
        subtext: "text-green-700",
        button: "bg-green-600",
        slider: "bg-green-300",
      }
    } else {
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-900",
        subtext: "text-orange-700",
        button: "bg-orange-600",
        slider: "bg-orange-300",
      }
    }
  }

  const colors = getColorClasses()

  return (
    <div className={`space-y-6 p-4 ${colors.bg} rounded-xl border ${colors.border}`}>
      <div className="text-center">
        <h4 className={`font-semibold ${colors.text} mb-1`}>{isMore ? "Minimum Goal" : "Maximum Limit"}</h4>
        <p className={`text-sm ${colors.subtext}`}>{getDescription()}</p>
      </div>

      {/* Visual threshold display */}
      <div className="relative">
        <div className={`flex items-center justify-between text-sm font-medium ${colors.text} mb-2`}>
          <span>Budget: {formatTime(budget)}</span>
          <span>
            {isMore ? "Target: " : "Limit: "}
            {formatTime(threshold)}
          </span>
        </div>

        {/* Threshold visualization */}
        <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
          {/* Budget line */}
          <div
            className="absolute top-0 w-0.5 h-full bg-gray-600 z-10"
            style={{ left: `${((budget - minThreshold) / (maxThreshold - minThreshold)) * 100}%` }}
          />

          {/* Threshold area */}
          {isMore ? (
            <div
              className={`absolute top-0 h-full ${colors.slider} opacity-60`}
              style={{
                left: `${((threshold - minThreshold) / (maxThreshold - minThreshold)) * 100}%`,
                width: `${((maxThreshold - threshold) / (maxThreshold - minThreshold)) * 100}%`,
              }}
            />
          ) : (
            <div
              className={`absolute top-0 h-full ${colors.slider} opacity-60`}
              style={{
                left: "0%",
                width: `${((threshold - minThreshold) / (maxThreshold - minThreshold)) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Threshold Slider */}
      <div className="space-y-2">
        <Label className={`text-sm font-medium ${colors.text}`}>
          {isMore ? "Minimum" : "Maximum"} ({formatTime(threshold)})
        </Label>
        <Slider
          value={[threshold]}
          onValueChange={(value) => setThreshold(value[0])}
          min={minThreshold}
          max={maxThreshold}
          step={0.25}
          className="w-full"
        />
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setThreshold(isMore ? budget * 1.1 : budget * 0.9)}
          className="text-xs"
        >
          {isMore ? "+10%" : "-10%"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setThreshold(isMore ? budget * 1.25 : budget * 0.75)}
          className="text-xs"
        >
          {isMore ? "+25%" : "-25%"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setThreshold(isMore ? budget * 1.5 : budget * 0.5)}
          className="text-xs"
        >
          {isMore ? "+50%" : "-50%"}
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button onClick={() => onSave(threshold)} className={`flex-1 rounded-xl ${colors.button}`}>
          Save {isMore ? "Goal" : "Limit"}
        </Button>
      </div>
    </div>
  )
}
