"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { X, Calendar } from "lucide-react"
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
  const { preferences, loading, error, updateWeeklySchedule, isUsingLocalStorage } = useTrackingPreferences(user)

  const [localWeeklySchedule, setLocalWeeklySchedule] = useState<Record<string, DaySchedule>>({
    monday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    saturday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
    sunday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
  })

  // Track saving state and prevent sync conflicts
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initializedRef = useRef(false)

  // Detect if user is on mobile device
  const isMobile =
    typeof window !== "undefined" &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

  // Initialize local state from preferences (only once when modal opens)
  useEffect(() => {
    if (isOpen && preferences && !initializedRef.current) {
      setLocalWeeklySchedule(preferences.weekly_schedule)
      setHasUnsavedChanges(false)
      initializedRef.current = true
    }
  }, [isOpen, preferences])

  // Reset initialization flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      initializedRef.current = false
      setHasUnsavedChanges(false)
      // Clear any pending saves
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
        saveTimeoutRef.current = null
      }
    }
  }, [isOpen])

  // Check if current state differs from saved preferences
  const hasChanges = useCallback(() => {
    if (!preferences) return false

    const scheduleChanged = JSON.stringify(localWeeklySchedule) !== JSON.stringify(preferences.weekly_schedule)

    return scheduleChanged
  }, [preferences, localWeeklySchedule])

  // Auto-save with proper change detection
  useEffect(() => {
    // Only auto-save if modal is open, initialized, and there are actual changes
    if (!isOpen || !initializedRef.current || !preferences || isSaving) {
      return
    }

    const changesExist = hasChanges()
    setHasUnsavedChanges(changesExist)

    if (!changesExist) {
      return
    }

    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Debounce the save operation
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true)

        await updateWeeklySchedule(localWeeklySchedule)

        setHasUnsavedChanges(false)

        // Trigger callback to notify parent components
        if (onPreferencesChange) {
          onPreferencesChange()
        }
      } catch (err) {
        console.error("Error saving preferences:", err)
      } finally {
        setIsSaving(false)
      }
    }, 1000) // Increased debounce time to 1 second

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [localWeeklySchedule, isOpen, preferences, isSaving, hasChanges, updateWeeklySchedule, onPreferencesChange])

  // Calculate total hours from enabled days
  const calculateTotalHours = () => {
    return Object.values(localWeeklySchedule).reduce((total, day) => {
      return total + (day.enabled ? day.hours : 0)
    }, 0)
  }

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

  if (!isOpen) return null

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

          {/* Tracking Schedule */}
          <div>
            <Label className="text-base font-medium mb-4 block">Tracking Schedule</Label>

            {/* Total Hours Display */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-3 border border-blue-100 text-center mb-4">
              <div className="text-xl font-bold text-blue-900">{calculateTotalHours()}h</div>
              <div className="text-xs text-blue-700">Total scheduled hours per week</div>
              {/* Only show saving status, no unsaved changes */}
              {isSaving && <div className="text-xs text-blue-600 mt-1">Saving...</div>}
            </div>

            {/* Daily Schedule */}
            <div className="space-y-3">
              {workDays.map((day) => {
                const schedule = localWeeklySchedule[day.id]
                return (
                  <div key={day.id} className="flex items-center gap-3 h-10">
                    <Switch
                      checked={schedule.enabled}
                      onCheckedChange={(checked) => updateDaySchedule(day.id, "enabled", checked)}
                      disabled={loading}
                    />
                    <span className="text-sm font-medium w-8">{day.label}</span>

                    <div className="flex items-center gap-2 text-sm min-h-[32px]">
                      {schedule.enabled ? (
                        <>
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
                        </>
                      ) : (
                        <span className="text-sm text-gray-400">from 06:00 to 06:00</span>
                      )}
                    </div>
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
