"use client"

import { useState, useEffect } from "react"
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
  useEffect(() => {
    if (!user) {
      setPreferences(null)
      setLoading(false)
      return
    }

    const loadPreferences = async () => {
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
    }

    loadPreferences()
  }, [user])

  const updatePreferences = async (
    updates: Partial<Pick<TrackingPreferences, "vacation_mode" | "weekly_schedule">>,
  ) => {
    if (!user || !preferences) return

    try {
      setError(null)

      // Optimistically update local state
      const updatedPreferences = { ...preferences, ...updates }
      setPreferences(updatedPreferences)

      // Update in database
      await TrackingPreferencesService.updateTrackingPreferences(updates)
    } catch (err) {
      console.error("Error updating tracking preferences:", err)
      setError(err instanceof Error ? err.message : "Failed to update tracking preferences")

      // Revert optimistic update on error
      setPreferences(preferences)
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

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    updateVacationMode,
    updateWeeklySchedule,
    getTotalScheduledHours,
  }
}
