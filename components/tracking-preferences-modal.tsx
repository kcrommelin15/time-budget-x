"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface TrackingPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
}

interface DaySchedule {
  enabled: boolean
  startTime: string
  endTime: string
  hours: number
}

export default function TrackingPreferencesModal({ isOpen, onClose }: TrackingPreferencesModalProps) {
  const [vacationMode, setVacationMode] = useState(false)
  const [weeklySchedule, setWeeklySchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    saturday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
    sunday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
  })

  // Detect if user is on mobile device
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Calculate total hours from enabled days
  const calculateTotalHours = () => {
    return Object.values(weeklySchedule).reduce((total, day) => {
      return total + (day.enabled ? day.hours : 0)
    }, 0)
  }

  // Auto-save whenever preferences change
  useEffect(() => {
    if (isOpen) {
      console.log("Auto-saving tracking preferences:", {
        weeklySchedule,
        vacationMode,
        totalHours: calculateTotalHours(),
      })
    }
  }, [weeklySchedule, vacationMode, isOpen])

  if (!isOpen) return null

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: any) => {
    setWeeklySchedule((prev) => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], [field]: value },
      }

      // If we're updating time, recalculate hours
      if (field === "startTime" || field === "endTime") {
        const daySchedule = updated[day]
        const hours = calculateHoursFromTime(
          field === "startTime" ? value : daySchedule.startTime,
          field === "endTime" ? value : daySchedule.endTime,
        )
        updated[day] = { ...updated[day], hours: Math.max(0, hours) }
      }

      return updated
    })
  }

  const calculateHoursFromTime = (startTime: string, endTime: string) => {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return (endMinutes - startMinutes) / 60
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const workDays = [
    { id: "monday", label: "Mon", fullLabel: "Monday" },
    { id: "tuesday", label: "Tue", fullLabel: "Tuesday" },
    { id: "wednesday", label: "Wed", fullLabel: "Wednesday" },
    { id: "thursday", label: "Thu", fullLabel: "Thursday" },
    { id: "friday", label: "Fri", fullLabel: "Friday" },
    { id: "saturday", label: "Sat", fullLabel: "Saturday" },
    { id: "sunday", label: "Sun", fullLabel: "Sunday" },
  ]

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 z-[60]"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl w-full max-w-sm max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold">Tracking Preferences</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="rounded-lg h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Vacation Mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-medium">Vacation mode:</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{vacationMode ? "ON" : "OFF"}</span>
                <Switch checked={vacationMode} onCheckedChange={setVacationMode} />
              </div>
            </div>
            <p className="text-sm text-gray-600">When enabled, activities will not be tracked or analyzed</p>
          </div>

          {/* Tracking Schedule */}
          <div>
            <Label className="text-base font-medium mb-4 block">Tracking Schedule</Label>

            {/* Total Hours Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100 text-center mb-4">
              <div className="text-xl font-bold text-blue-900">{calculateTotalHours()}h</div>
              <div className="text-xs text-blue-700">Total scheduled hours per week</div>
            </div>

            {/* Daily Schedule */}
            <div className="space-y-3">
              {workDays.map((day) => {
                const schedule = weeklySchedule[day.id]
                return (
                  <div key={day.id} className="flex items-center gap-3">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => updateDaySchedule(day.id, "enabled", checked)}
                    />
                    <span className="text-sm font-medium w-8">{day.label}</span>

                    {schedule.enabled ? (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-600">from</span>
                        <Input
                          type="time"
                          value={schedule.startTime}
                          onChange={(e) => updateDaySchedule(day.id, "startTime", e.target.value)}
                          className="w-20 h-8 text-center border border-gray-300 rounded text-xs"
                          style={{
                            WebkitAppearance: isMobile ? "none" : "auto",
                          }}
                        />
                        <span className="text-gray-600">to</span>
                        <Input
                          type="time"
                          value={schedule.endTime}
                          onChange={(e) => updateDaySchedule(day.id, "endTime", e.target.value)}
                          className="w-20 h-8 text-center border border-gray-300 rounded text-xs"
                          style={{
                            WebkitAppearance: isMobile ? "none" : "auto",
                          }}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">from 06:00 to 06:00</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
