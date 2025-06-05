"use client"

import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface GoalRangeSelectorProps {
  budget: number
  currentMin?: number
  currentMax?: number
  onSave: (min: number, max: number) => void
  onCancel: () => void
}

export default function GoalRangeSelector({
  budget,
  currentMin,
  currentMax,
  onSave,
  onCancel,
}: GoalRangeSelectorProps) {
  const [minValue, setMinValue] = useState(currentMin || budget * 0.9)
  const [maxValue, setMaxValue] = useState(currentMax || budget * 1.1)

  // Ensure min/max are reasonable bounds
  const absoluteMin = Math.max(0, budget * 0.5)
  const absoluteMax = budget * 2

  useEffect(() => {
    // Ensure min is always less than max
    if (minValue >= maxValue) {
      setMaxValue(minValue + 0.25)
    }
  }, [minValue, maxValue])

  const handleMinChange = (value: number[]) => {
    const newMin = value[0]
    setMinValue(newMin)
    if (newMin >= maxValue) {
      setMaxValue(newMin + 0.25)
    }
  }

  const handleMaxChange = (value: number[]) => {
    const newMax = value[0]
    setMaxValue(newMax)
    if (newMax <= minValue) {
      setMinValue(newMax - 0.25)
    }
  }

  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m.toString().padStart(2, "0")}min`
  }

  return (
    <div className="space-y-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
      <div className="text-center">
        <h4 className="font-semibold text-blue-900 mb-1">Target Range</h4>
        <p className="text-sm text-blue-700">Set your acceptable range around {formatTime(budget)}</p>
      </div>

      {/* Visual Range Display */}
      <div className="relative">
        <div className="flex items-center justify-between text-sm font-medium text-blue-800 mb-2">
          <span>{formatTime(minValue)}</span>
          <span className="text-blue-600">Target: {formatTime(budget)}</span>
          <span>{formatTime(maxValue)}</span>
        </div>

        {/* Range visualization */}
        <div className="relative h-8 bg-blue-100 rounded-lg overflow-hidden">
          {/* Target line */}
          <div
            className="absolute top-0 w-0.5 h-full bg-blue-600 z-10"
            style={{ left: `${((budget - absoluteMin) / (absoluteMax - absoluteMin)) * 100}%` }}
          />

          {/* Range area */}
          <div
            className="absolute top-0 h-full bg-blue-300 opacity-60"
            style={{
              left: `${((minValue - absoluteMin) / (absoluteMax - absoluteMin)) * 100}%`,
              width: `${((maxValue - minValue) / (absoluteMax - absoluteMin)) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Min Slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-blue-800">Minimum ({formatTime(minValue)})</Label>
        <Slider
          value={[minValue]}
          onValueChange={handleMinChange}
          min={absoluteMin}
          max={absoluteMax}
          step={0.25}
          className="w-full"
        />
      </div>

      {/* Max Slider */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-blue-800">Maximum ({formatTime(maxValue)})</Label>
        <Slider
          value={[maxValue]}
          onValueChange={handleMaxChange}
          min={absoluteMin}
          max={absoluteMax}
          step={0.25}
          className="w-full"
        />
      </div>

      {/* Quick presets */}
      <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMinValue(budget * 0.9)
            setMaxValue(budget * 1.1)
          }}
          className="text-xs"
        >
          ±10%
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMinValue(budget * 0.8)
            setMaxValue(budget * 1.2)
          }}
          className="text-xs"
        >
          ±20%
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setMinValue(budget * 0.75)
            setMaxValue(budget * 1.25)
          }}
          className="text-xs"
        >
          ±25%
        </Button>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button onClick={() => onSave(minValue, maxValue)} className="flex-1 rounded-xl bg-blue-600">
          Save Range
        </Button>
      </div>
    </div>
  )
}
