"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TrackingPreferencesService,
  type TrackingPreferences,
  type WeeklySchedule,
} from "@/lib/supabase/tracking-preferences-service"
import type { User } from "@supabase/supabase-js"

export function useTrackingPreferences(user: User | null) {
  const [preferences, setPreferences] = useState<TrackingPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load preferences when user changes
  const loadPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const trackingPrefs = await TrackingPreferencesService.getTrackingPreferences()
      setPreferences(trackingPrefs)
    } catch (err) {
      console.error("Error loading tracking preferences:", err)
      setError(err instanceof Error ? err.message : "Failed to load tracking preferences")
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const updatePreferences = async (
    updates: Partial<Pick<TrackingPreferences, "vacation_mode" | "weekly_schedule">>,
  ) => {
    if (!user || !preferences) return

    try {
      setError(null)

      // Update in database first
      await TrackingPreferencesService.updateTrackingPreferences(updates)

      // Then update local state
      const updatedPreferences = { ...preferences, ...updates }
      setPreferences(updatedPreferences)
    } catch (err) {
      console.error("Error updating tracking preferences:", err)
      setError(err instanceof Error ? err.message : "Failed to update tracking preferences")
    }
  }

  const updateVacationMode = async (vacationMode: boolean) => {
    await updatePreferences({ vacation_mode: vacationMode })
  }

  const updateWeeklySchedule = async (weeklySchedule: WeeklySchedule) => {
    await updatePreferences({ weekly_schedule: weeklySchedule })
  }

  const getTotalScheduledHours = (): number => {
    if (!preferences) return 40 // Default fallback
    return TrackingPreferencesService.calculateTotalScheduledHours(preferences.weekly_schedule)
  }

  // Expose refresh function for manual refresh
  const refreshPreferences = useCallback(() => {
    loadPreferences()
  }, [loadPreferences])

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateVacationMode,
    updateWeeklySchedule,
    getTotalScheduledHours,
    refreshPreferences,
  }
}
