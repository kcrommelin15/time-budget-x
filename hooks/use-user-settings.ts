"use client"

import { useState, useEffect } from "react"
import { UserSettingsService, type UserSettings } from "@/lib/supabase/user-settings-service"
import type { User } from "@supabase/supabase-js"

export function useUserSettings(user: User | null) {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load settings when user changes
  useEffect(() => {
    if (!user) {
      setSettings(null)
      setLoading(false)
      return
    }

    const loadSettings = async () => {
      try {
        setLoading(true)
        setError(null)
        const userSettings = await UserSettingsService.getUserSettings()
        setSettings(userSettings)
      } catch (err) {
        console.error("Error loading user settings:", err)
        setError(err instanceof Error ? err.message : "Failed to load settings")
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [user])

  const updateSetting = async (key: keyof UserSettings, value: boolean) => {
    if (!user || !settings) return

    try {
      setError(null)

      // Optimistically update local state
      const updatedSettings = { ...settings, [key]: value }
      setSettings(updatedSettings)

      // Update in database
      await UserSettingsService.updateUserSettings({ [key]: value })
    } catch (err) {
      console.error("Error updating setting:", err)
      setError(err instanceof Error ? err.message : "Failed to update setting")

      // Revert optimistic update on error
      setSettings(settings)
    }
  }

  const updateMultipleSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return

    try {
      setError(null)

      // Optimistically update local state
      const updatedSettings = { ...settings, ...updates }
      setSettings(updatedSettings)

      // Update in database
      await UserSettingsService.updateUserSettings(updates)
    } catch (err) {
      console.error("Error updating settings:", err)
      setError(err instanceof Error ? err.message : "Failed to update settings")

      // Revert optimistic update on error
      setSettings(settings)
    }
  }

  return {
    settings,
    loading,
    error,
    updateSetting,
    updateMultipleSettings,
  }
}
