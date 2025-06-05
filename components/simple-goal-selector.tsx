"use client"

import { Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SimpleGoalSelectorProps {
  value?: "more_is_better" | "less_is_better"
  onChange: (direction?: "more_is_better" | "less_is_better") => void
  split?: boolean
  side?: "left" | "right"
}

export default function SimpleGoalSelector({ value, onChange, split = false, side }: SimpleGoalSelectorProps) {
  if (split) {
    // Split mode - show only one button based on side
    if (side === "left") {
      // Show only minus button
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(value === "less_is_better" ? undefined : "less_is_better")}
          className={`rounded-lg p-1 h-8 w-8 ${
            value === "less_is_better"
              ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Minus className="w-4 h-4" />
        </Button>
      )
    } else {
      // Show only plus button
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(value === "more_is_better" ? undefined : "more_is_better")}
          className={`rounded-lg p-1 h-8 w-8 ${
            value === "more_is_better"
              ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
              : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      )
    }
  }

  // Original combined mode
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(value === "less_is_better" ? undefined : "less_is_better")}
        className={`rounded-lg p-1 h-8 w-8 ${
          value === "less_is_better"
            ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(value === "more_is_better" ? undefined : "more_is_better")}
        className={`rounded-lg p-1 h-8 w-8 ${
          value === "more_is_better"
            ? "bg-purple-100 text-purple-600 hover:bg-purple-200"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}
