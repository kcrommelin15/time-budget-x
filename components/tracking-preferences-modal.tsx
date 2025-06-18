"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { X, Calendar, Cloud, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTrackingPreferences } from "@/hooks/use-tracking-preferences"
import { TrackingPreferencesService, type DaySchedule } from "@/lib/supabase/tracking-preferences-service"
import type { User } from "@supabase/supabase-js"

interface TrackingPreferencesModalProps {
  isOpen: boolean
  onClose: () => void
  user?: User | null
  onPreferencesChange?: () => void
}

export default function TrackingPreferencesModal({
  isOpen,
  onClose,
  user = null,
  onPreferencesChange,
}: TrackingPreferencesModalProps) {
  const { preferences, loading, error, updateVacationMode, updateWeeklySchedule, isUsingLocalStorage } =
    useTrackingPreferences(user)

  const [localVacationMode, setLocalVacationMode] = useState(false)
  const [localWeeklySchedule, setLocalWeeklySchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    saturday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
    sunday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
  })

  // Track if we're currently saving to prevent sync conflicts
  const [isSaving, setIsSaving] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Sync local state with preferences when they load (but not while saving)
  useEffect(() => {
    if (preferences && !isSaving) {
      setLocalVacationMode(preferences.vacation_mode)
      setLocalWeeklySchedule(preferences.weekly_schedule)
    }
  }, [preferences, isSaving])

  // Detect if user is on mobile device
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Calculate total hours from enabled days
  const calculateTotalHours = () => {
    return Object.values(localWeeklySchedule).reduce((total, day) => {
      return total + (day.enabled ? day.hours : 0)
    }, 0)
  }

  // Auto-save with better state management (works for both authenticated and non-authenticated)
  useEffect(() => {
    if (isOpen && preferences) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }

      const savePreferences = async () => {
        try {
          setIsSaving(true)

          await updateVacationMode(localVacationMode)
          await updateWeeklySchedule(localWeeklySchedule)

          // Trigger callback to notify parent components
          if (onPreferencesChange) {
            onPreferencesChange()
          }
        } catch (err) {
          console.error("Error saving preferences:", err)
        } finally {
          // Add a small delay before allowing sync again
          setTimeout(() => setIsSaving(false), 100)
        }
      }

      // Debounce the save operation
      saveTimeoutRef.current = setTimeout(savePreferences, 300)
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [
    localWeeklySchedule,
    localVacationMode,
    isOpen,
    preferences,
    updateVacationMode,
    updateWeeklySchedule,
    onPreferencesChange,
  ])

  if (!isOpen) return null

  const updateDaySchedule = (day: string, field: keyof DaySchedule, value: any) => {
    setLocalWeeklySchedule((prev) => {
      const updated = {
        ...prev,
        [day]: { ...prev[day], [field]: value },
      }

      // If we're updating time, recalculate hours
      if (field === "startTime" || field === "endTime") {
        const daySchedule = updated[day]
        const hours = TrackingPreferencesService.calculateHoursFromTime(
          field === "startTime" ? value : daySchedule.startTime,
          field === "endTime" ? value : daySchedule.endTime,
        )
        updated[day] = { ...updated[day], hours: Math.max(0, hours) }
      }

      return updated
    })
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
          {/* Loading State */}
          {loading && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-blue-700 text-sm">Loading your preferences...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Storage Status */}
          {!loading && (
            <div
              className={`rounded-xl p-3 text-center ${
                isUsingLocalStorage ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                {isUsingLocalStorage ? (
                  <HardDrive className="w-4 h-4 text-amber-600" />
                ) : (
                  <Cloud className="w-4 h-4 text-green-600" />
                )}
                <p className={`text-sm font-medium ${isUsingLocalStorage ? "text-amber-700" : "text-green-700"}`}>
                  {isUsingLocalStorage ? "Stored locally" : "Synced to cloud"}
                </p>
              </div>
              <p className={`text-xs ${isUsingLocalStorage ? "text-amber-600" : "text-green-600"}`}>
                {isUsingLocalStorage
                  ? "Sign in to sync your preferences across devices"
                  : "Your preferences are saved to your account"}
              </p>
            </div>
          )}

          {/* Vacation Mode */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base font-medium">Vacation mode:</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{localVacationMode ? "ON" : "OFF"}</span>
                <Switch checked={localVacationMode} onCheckedChange={setLocalVacationMode} disabled={loading} />
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
              {isSaving && <div className="text-xs text-blue-600 mt-1">Saving...</div>}
            </div>

            {/* Daily Schedule */}
            <div className="space-y-3">
              {workDays.map((day) => {
                const schedule = localWeeklySchedule[day.id]
                return (
                  <div key={day.id} className="flex items-center gap-3">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => updateDaySchedule(day.id, "enabled", checked)}
                      disabled={loading}
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
                          disabled={loading}
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
                          disabled={loading}
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
