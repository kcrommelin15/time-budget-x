"use client"

import { getGoalTypeIcon, getGoalTypeLabel } from "@/lib/goal-utils"
import { Button } from "@/components/ui/button"

interface GoalTypeSelectorProps {
  value: "more" | "less" | "target"
  onChange: (goalType: "more" | "less" | "target") => void
  disabled?: boolean
}

export default function GoalTypeSelector({ value, onChange, disabled = false }: GoalTypeSelectorProps) {
  const options: Array<"more" | "less" | "target"> = ["target", "more", "less"]

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Goal Type</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Button
            key={option}
            variant={value === option ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option)}
            disabled={disabled}
            className={`rounded-xl text-xs h-12 flex flex-col items-center gap-1 ${
              value === option ? "bg-blue-600 text-white" : "hover:bg-gray-50"
            }`}
          >
            <span className="text-base">{getGoalTypeIcon(option)}</span>
            <span className="font-medium">
              {option === "target" ? "Target" : option === "more" ? "More+" : "Less-"}
            </span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">{getGoalTypeLabel(value)}</p>
    </div>
  )
}
