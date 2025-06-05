"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatTime } from "@/lib/goal-utils"

interface UnifiedTimeInputProps {
  value: number // hours as decimal
  onChange: (hours: number) => void
  showIncrementControls?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
  disabled?: boolean
  goalDirection?: "more_is_better" | "less_is_better" // Add this
}

export default function UnifiedTimeInput({
  value,
  onChange,
  showIncrementControls = true,
  size = "md",
  className = "",
  disabled = false,
  goalDirection, // Add this
}: UnifiedTimeInputProps) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const h = Math.floor(value)
    const m = Math.round((value - h) * 60)
    setHours(h.toString())
    setMinutes(m.toString().padStart(2, "0"))
  }, [value])

  const handleHoursChange = (newHours: string) => {
    const h = Number.parseInt(newHours) || 0
    const m = Number.parseInt(minutes) || 0
    setHours(newHours)
    onChange(h + m / 60)
  }

  const handleMinutesChange = (newMinutes: string) => {
    const h = Number.parseInt(hours) || 0
    const m = Math.min(59, Number.parseInt(newMinutes) || 0)
    setMinutes(m.toString().padStart(2, "0"))
    onChange(h + m / 60)
  }

  const handleHoursKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault()
      minutesRef.current?.focus()
      minutesRef.current?.select()
    }
  }

  const handleMinutesKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      minutesRef.current?.blur()
      setIsEditing(false)
    }
  }

  const increment15Min = () => {
    if (disabled) return
    const newValue = value + 0.25
    onChange(newValue)
  }

  const decrement15Min = () => {
    if (disabled) return
    const newValue = Math.max(0, value - 0.25)
    onChange(newValue)
  }

  const sizeClasses = {
    sm: "text-sm h-8",
    md: "text-base h-9",
    lg: "text-lg h-10",
  }

  const buttonSizeClasses = {
    sm: "w-6 h-6 p-0",
    md: "w-7 h-7 p-0",
    lg: "w-8 h-8 p-0",
  }

  if (isEditing && !disabled) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showIncrementControls && (
          <Button
            onClick={decrement15Min}
            variant="ghost"
            size="sm"
            className={`${buttonSizeClasses[size]} rounded-lg hover:bg-gray-100`}
          >
            <Minus className="w-3 h-3" />
          </Button>
        )}

        <div className="flex items-center gap-1">
          <Input
            ref={hoursRef}
            type="number"
            value={hours}
            onChange={(e) => handleHoursChange(e.target.value)}
            onKeyDown={handleHoursKeyDown}
            onFocus={() => hoursRef.current?.select()}
            className={`${sizeClasses[size]} w-16 text-center rounded-lg border-gray-300`}
            min="0"
            // No max attribute - allow unlimited hours
          />
          <span className="text-gray-500 text-sm">h</span>

          <Input
            ref={minutesRef}
            type="number"
            value={minutes}
            onChange={(e) => handleMinutesChange(e.target.value)}
            onKeyDown={handleMinutesKeyDown}
            onFocus={() => minutesRef.current?.select()}
            onBlur={() => setIsEditing(false)}
            className={`${sizeClasses[size]} w-14 text-center rounded-lg border-gray-300`}
            min="0"
            max="59"
          />
          <span className="text-gray-500 text-sm">m</span>
        </div>

        {showIncrementControls && (
          <Button
            onClick={increment15Min}
            variant="ghost"
            size="sm"
            className={`${buttonSizeClasses[size]} rounded-lg hover:bg-gray-100`}
          >
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showIncrementControls && !disabled && (
        <Button
          onClick={decrement15Min}
          variant="ghost"
          size="sm"
          className={`${buttonSizeClasses[size]} rounded-lg hover:bg-gray-100`}
        >
          <Minus className="w-3 h-3" />
        </Button>
      )}

      <span
        className={`rounded-lg px-3 py-2 transition-colors font-medium min-w-[80px] text-center ${
          disabled ? "text-gray-700 cursor-default" : "cursor-pointer hover:bg-blue-50 text-blue-600"
        }`}
        onClick={() => {
          if (!disabled) {
            setIsEditing(true)
            setTimeout(() => {
              hoursRef.current?.focus()
              hoursRef.current?.select()
            }, 50)
          }
        }}
      >
        {formatTime(value, true)}
      </span>

      {showIncrementControls && !disabled && (
        <Button
          onClick={increment15Min}
          variant="ghost"
          size="sm"
          className={`${buttonSizeClasses[size]} rounded-lg hover:bg-gray-100`}
        >
          <Plus className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
