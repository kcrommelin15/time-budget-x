"use client"

import { useState, useEffect, useRef } from "react"
import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TimeInputEditorProps {
  value: number // hours as decimal
  onSave: (hours: number) => void
  onCancel: () => void
  isOpen: boolean
}

export default function TimeInputEditor({ value, onSave, onCancel, isOpen }: TimeInputEditorProps) {
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("00")
  const [currentField, setCurrentField] = useState<"hours" | "minutes">("hours")
  const [showMobileKeyboard, setShowMobileKeyboard] = useState(false)

  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)

  // Detect if user is on mobile device
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  useEffect(() => {
    if (isOpen) {
      const h = Math.floor(value)
      const m = Math.round((value - h) * 60)
      setHours(h.toString())
      setMinutes(m.toString().padStart(2, "0"))
      setCurrentField("hours")
      setShowMobileKeyboard(isMobile)

      // Focus hours field
      setTimeout(() => {
        if (hoursRef.current) {
          hoursRef.current.focus()
          hoursRef.current.select()
        }
      }, 100)
    }
  }, [isOpen, value, isMobile])

  const handleNumberInput = (num: string) => {
    if (currentField === "hours") {
      if (hours.length < 3) {
        // Max 999 hours
        const newHours = hours + num
        setHours(newHours)

        // Auto-advance to minutes after 2 digits or if user enters a reasonable hour amount
        if (newHours.length >= 2 || Number.parseInt(newHours) >= 10) {
          setCurrentField("minutes")
          setMinutes("00") // Reset to 00 when moving to minutes
          setTimeout(() => minutesRef.current?.focus(), 50)
        }
      }
    } else {
      if (minutes.length < 2) {
        const newMinutes = (minutes === "00" ? "" : minutes) + num
        setMinutes(newMinutes.padStart(2, "0"))
      }
    }
  }

  const handleBackspace = () => {
    if (currentField === "hours") {
      setHours(hours.slice(0, -1))
    } else {
      const newMinutes = minutes.slice(0, -1)
      setMinutes(newMinutes.padEnd(2, "0"))
      if (newMinutes === "") {
        setCurrentField("hours")
        setTimeout(() => hoursRef.current?.focus(), 50)
      }
    }
  }

  const handleClear = () => {
    setHours("")
    setMinutes("00")
    setCurrentField("hours")
    setTimeout(() => hoursRef.current?.focus(), 50)
  }

  const increment15Min = () => {
    const currentMinutes = Number.parseInt(minutes)
    const newMinutes = Math.min(45, currentMinutes + 15)
    setMinutes(newMinutes.toString().padStart(2, "0"))
  }

  const decrement15Min = () => {
    const currentMinutes = Number.parseInt(minutes)
    if (currentMinutes >= 15) {
      const newMinutes = currentMinutes - 15
      setMinutes(newMinutes.toString().padStart(2, "0"))
    } else if (currentMinutes > 0) {
      setMinutes("00")
    } else if (Number.parseInt(hours) > 0) {
      const newHours = Math.max(0, Number.parseInt(hours) - 1)
      setHours(newHours.toString())
      setMinutes("45")
    }
  }

  const handleSave = () => {
    const totalHours = Number.parseInt(hours || "0") + Number.parseInt(minutes) / 60
    onSave(totalHours)
  }

  const handleFieldFocus = (field: "hours" | "minutes") => {
    setCurrentField(field)
    if (isMobile) {
      setShowMobileKeyboard(true)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 text-center">
          <h3 className="text-lg font-semibold text-gray-900">Edit Time Budget</h3>
        </div>

        {/* Time Display */}
        <div className="p-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1">
              <input
                ref={hoursRef}
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value.replace(/\D/g, ""))}
                onFocus={() => handleFieldFocus("hours")}
                className={`text-3xl font-bold text-center w-16 bg-transparent border-0 outline-none ${
                  currentField === "hours" ? "text-blue-600" : "text-gray-900"
                }`}
                placeholder="0"
                inputMode="none"
                readOnly={isMobile}
              />
              <span className="text-2xl font-medium text-gray-600">h</span>
            </div>

            <div className="flex items-center gap-1">
              <input
                ref={minutesRef}
                type="text"
                value={minutes}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 2)
                  setMinutes(val.padStart(2, "0"))
                }}
                onFocus={() => handleFieldFocus("minutes")}
                className={`text-3xl font-bold text-center w-16 bg-transparent border-0 outline-none ${
                  currentField === "minutes" ? "text-blue-600" : "text-gray-900"
                }`}
                placeholder="00"
                inputMode="none"
                readOnly={isMobile}
              />
              <span className="text-2xl font-medium text-gray-600">min</span>
            </div>
          </div>

          {/* Increment/Decrement Controls */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Button onClick={decrement15Min} variant="outline" size="sm" className="rounded-2xl w-12 h-12 p-0">
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-500 font-medium">15 min</span>
            <Button onClick={increment15Min} variant="outline" size="sm" className="rounded-2xl w-12 h-12 p-0">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button onClick={onCancel} variant="outline" className="flex-1 rounded-2xl">
              Cancel
            </Button>
            <Button onClick={handleSave} className="flex-1 rounded-2xl bg-blue-600 hover:bg-blue-700">
              Save
            </Button>
          </div>
        </div>

        {/* Mobile Keyboard */}
        {showMobileKeyboard && (
          <div className="bg-gray-100 p-4 rounded-b-3xl">
            <div className="grid grid-cols-4 gap-3">
              {/* Numbers */}
              {[7, 8, 9, "", 4, 5, 6, "", 1, 2, 3, ""].map((num, index) => (
                <Button
                  key={index}
                  onClick={() => num !== "" && handleNumberInput(num.toString())}
                  variant="ghost"
                  className={`h-12 rounded-2xl text-xl font-semibold ${
                    num === "" ? "invisible" : "bg-white hover:bg-gray-50"
                  }`}
                  disabled={num === ""}
                >
                  {num}
                </Button>
              ))}

              {/* Bottom row */}
              <Button
                onClick={handleClear}
                variant="ghost"
                className="h-12 rounded-2xl bg-white hover:bg-gray-50 text-red-600"
              >
                ✕
              </Button>
              <Button
                onClick={() => handleNumberInput("0")}
                variant="ghost"
                className="h-12 rounded-2xl text-xl font-semibold bg-white hover:bg-gray-50"
              >
                0
              </Button>
              <Button onClick={handleBackspace} variant="ghost" className="h-12 rounded-2xl bg-white hover:bg-gray-50">
                ⌫
              </Button>
              <Button
                onClick={handleSave}
                className="h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
