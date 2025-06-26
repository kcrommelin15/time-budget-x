"use client"

import { Button } from "@/components/ui/button"

interface GoalDirectionSelectorProps {
  value: "more_is_better" | "less_is_better"
  onChange: (direction: "more_is_better" | "less_is_better") => void
  disabled?: boolean
}

export default function GoalDirectionSelector({ value, onChange, disabled = false }: GoalDirectionSelectorProps) {
  const options = [
    {
      value: "more_is_better" as "more_is_better" | "less_is_better",
      symbol: "+",
      label: "More+",
      description: "More time is better",
      color: "bg-green-500",
    },
    {
      value: "less_is_better" as "more_is_better" | "less_is_better",
      symbol: "-",
      label: "Less-",
      description: "Less time is better",
      color: "bg-orange-500",
    },
  ]

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">Goal Type</label>
      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => (
          <Button
            key={option.value}
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            disabled={disabled}
            className={`rounded-xl text-xs h-16 flex flex-col items-center gap-1 transition-all ${
              value === option.value
                ? `${option.color} text-white shadow-lg scale-105`
                : "hover:bg-gray-50 hover:scale-102"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                value === option.value ? "bg-white/20" : "bg-gray-100"
              }`}
            >
              <span className={value === option.value ? "text-white" : "text-gray-600"}>{option.symbol}</span>
            </div>
            <span className="font-medium text-center leading-tight">{option.label}</span>
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">{options.find((opt) => opt.value === value)?.description}</p>
    </div>
  )
}
