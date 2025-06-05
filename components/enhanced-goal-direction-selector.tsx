"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import GoalRangeSelector from "@/components/goal-range-selector"
import GoalThresholdSelector from "@/components/goal-threshold-selector"
import type { GoalDirection } from "@/lib/goal-utils"

interface EnhancedGoalDirectionSelectorProps {
  value: GoalDirection
  budget: number
  currentConfig?: {
    targetMin?: number
    targetMax?: number
    threshold?: number
  }
  onChange: (direction: GoalDirection, config?: any) => void
  onCancel: () => void
}

export default function EnhancedGoalDirectionSelector({
  value,
  budget,
  currentConfig,
  onChange,
  onCancel,
}: EnhancedGoalDirectionSelectorProps) {
  const [selectedType, setSelectedType] = useState<GoalDirection | null>(null)
  const [showConfig, setShowConfig] = useState(false)

  const options = [
    {
      value: "target_range" as GoalDirection,
      symbol: "○",
      label: "Target",
      description: "Aim for exact budget with acceptable range",
      color: "bg-blue-500",
    },
    {
      value: "more_is_better" as GoalDirection,
      symbol: "+",
      label: "More+",
      description: "More time is better - set minimum goal",
      color: "bg-green-500",
    },
    {
      value: "less_is_better" as GoalDirection,
      symbol: "-",
      label: "Less-",
      description: "Less time is better - set maximum limit",
      color: "bg-orange-500",
    },
  ]

  const handleTypeSelect = (type: GoalDirection) => {
    setSelectedType(type)
    setShowConfig(true)
  }

  const handleConfigSave = (config: any) => {
    if (selectedType) {
      onChange(selectedType, config)
    }
  }

  const handleConfigCancel = () => {
    setShowConfig(false)
    setSelectedType(null)
  }

  // Show configuration screen
  if (showConfig && selectedType) {
    if (selectedType === "target_range") {
      return (
        <GoalRangeSelector
          budget={budget}
          currentMin={currentConfig?.targetMin}
          currentMax={currentConfig?.targetMax}
          onSave={(min, max) => handleConfigSave({ targetMin: min, targetMax: max })}
          onCancel={handleConfigCancel}
        />
      )
    } else {
      return (
        <GoalThresholdSelector
          goalType={selectedType}
          budget={budget}
          currentThreshold={currentConfig?.threshold}
          onSave={(threshold) => handleConfigSave({ threshold })}
          onCancel={handleConfigCancel}
        />
      )
    }
  }

  // Show type selection
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h4 className="font-semibold text-gray-900 mb-1">Choose Goal Type</h4>
        <p className="text-sm text-gray-600">How should we track progress for this activity?</p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            onClick={() => handleTypeSelect(option.value)}
            className={`w-full h-auto p-4 rounded-xl text-left transition-all hover:scale-102 ${
              value === option.value ? `${option.color} text-white border-transparent` : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  value === option.value ? "bg-white/20" : "bg-gray-100"
                }`}
              >
                <span className={value === option.value ? "text-white" : "text-gray-600"}>{option.symbol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium mb-1">{option.label}</div>
                <div className={`text-sm ${value === option.value ? "text-white/80" : "text-gray-600"}`}>
                  {option.description}
                </div>
              </div>
            </div>
          </Button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button onClick={onCancel} variant="outline" className="flex-1 rounded-xl">
          Cancel
        </Button>
      </div>
    </div>
  )
}
