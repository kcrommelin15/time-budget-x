"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TrackingPreferencesService,
  type TrackingPreferences,
  type WeeklySchedule,
} from "@/lib/supabase/tracking-preferences-service"
import type { User } from "@supabase/supabase-js"

const LOCAL_STORAGE_KEY = "time-budget-tracking-preferences"

// Default preferences
const DEFAULT_PREFERENCES = {
  vacation_mode: false,
  weekly_schedule: {
    monday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    tuesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    wednesday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    thursday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    friday: { enabled: true, startTime: "09:00", endTime: "17:00", hours: 8 },
    saturday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
    sunday: { enabled: false, startTime: "10:00", endTime: "14:00", hours: 4 },
  },
}

export function useTrackingPreferences(user: User | null) {
  const [preferences, setPreferences] = useState<TrackingPreferences | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load preferences from localStorage
  const loadLocalPreferences = useCallback((): TrackingPreferences => {
    if (typeof window === "undefined") return DEFAULT_PREFERENCES

    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...DEFAULT_PREFERENCES, ...parsed }
      }
    } catch (err) {
      console.error("Error loading local preferences:", err)
    }
    return DEFAULT_PREFERENCES
  }, [])

  // Save preferences to localStorage
  const saveLocalPreferences = useCallback(
    (prefs: Partial<TrackingPreferences>) => {
      if (typeof window === "undefined") return

      try {
        const current = loadLocalPreferences()
        const updated = { ...current, ...prefs }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated))
        setPreferences(updated)
      } catch (err) {
        console.error("Error saving local preferences:", err)
      }
    },
    [loadLocalPreferences],
  )

  // Migrate local preferences to database when user signs in
  const migrateLocalToDatabase = useCallback(async () => {
    if (!user) return

    try {
      const localPrefs = loadLocalPreferences()
      await TrackingPreferencesService.upsertTrackingPreferences({
        vacation_mode: localPrefs.vacation_mode,
        weekly_schedule: localPrefs.weekly_schedule,
      })

      // Clear local storage after successful migration
      localStorage.removeItem(LOCAL_STORAGE_KEY)
    } catch (err) {
      console.error("Error migrating local preferences to database:", err)
    }
  }, [user, loadLocalPreferences])

  // Load preferences when user changes
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        // Load from localStorage for non-authenticated users
        const localPrefs = loadLocalPreferences()
        setPreferences(localPrefs)
      } else {
        // First migrate any local preferences
        await migrateLocalToDatabase()

        // Then load from database
        const trackingPrefs = await TrackingPreferencesService.getTrackingPreferences()
        setPreferences(trackingPrefs)
      }
    } catch (err) {
      console.error("Error loading tracking preferences:", err)
      setError(err instanceof Error ? err.message : "Failed to load tracking preferences")

      // Fallback to local preferences on error
      if (!user) {
        const localPrefs = loadLocalPreferences()
        setPreferences(localPrefs)
      }
    } finally {
      setLoading(false)
    }
  }, [user, loadLocalPreferences, migrateLocalToDatabase])

  useEffect(() => {
    loadPreferences()
  }, [loadPreferences])

  const updatePreferences = async (
    updates: Partial<Pick<TrackingPreferences, "vacation_mode" | "weekly_schedule">>,
  ) => {
    if (!preferences) return

    try {
      setError(null)

      if (!user) {
        // Save to localStorage for non-authenticated users
        saveLocalPreferences(updates)
      } else {
        // Update in database for authenticated users
        await TrackingPreferencesService.updateTrackingPreferences(updates)

        // Update local state
        const updatedPreferences = { ...preferences, ...updates }
        setPreferences(updatedPreferences)
      }
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
    isUsingLocalStorage: !user,
  }
}
