"use client"

import { useState, useEffect } from "react"
import { TimeEntriesService } from "@/lib/supabase/time-entries-service"
import { mockTimeEntries } from "@/lib/mock-data"
import type { TimeEntry } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

export function useTimeEntries(user: User | null, selectedDate: Date) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(mockTimeEntries)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const dateString = selectedDate.toISOString().split("T")[0]

  // Load time entries when user or date changes
  useEffect(() => {
    if (user) {
      loadTimeEntries()
    } else {
      // Use mock data when not signed in, filtered by date
      const filteredMockEntries = mockTimeEntries.filter((entry) => entry.date === dateString)
      setTimeEntries(filteredMockEntries)
    }
  }, [user, dateString])

  const loadTimeEntries = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const entries = await TimeEntriesService.getTimeEntriesForDate(dateString)
      setTimeEntries(entries)
    } catch (err) {
      console.error("Error loading time entries:", err)
      setError(err instanceof Error ? err.message : "Failed to load time entries")
      setTimeEntries([])
    } finally {
      setLoading(false)
    }
  }

  const addTimeEntry = async (newEntry: Omit<TimeEntry, "id">) => {
    if (user) {
      try {
        const createdEntry = await TimeEntriesService.createTimeEntry(newEntry)
        setTimeEntries((prev) => [...prev, createdEntry].sort((a, b) => a.startTime.localeCompare(b.startTime)))
      } catch (err) {
        console.error("Error adding time entry:", err)
        setError(err instanceof Error ? err.message : "Failed to add time entry")
        throw err
      }
    } else {
      // Mock behavior for non-authenticated users
      const entry: TimeEntry = {
        ...newEntry,
        id: Date.now().toString(),
      }
      setTimeEntries((prev) => [...prev, entry].sort((a, b) => a.startTime.localeCompare(b.startTime)))
    }
  }

  const updateTimeEntry = async (updatedEntry: TimeEntry) => {
    if (user) {
      try {
        await TimeEntriesService.updateTimeEntry(updatedEntry)
        setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
      } catch (err) {
        console.error("Error updating time entry:", err)
        setError(err instanceof Error ? err.message : "Failed to update time entry")
        throw err
      }
    } else {
      // Mock behavior for non-authenticated users
      setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    }
  }

  const deleteTimeEntry = async (entryId: string) => {
    if (user) {
      try {
        await TimeEntriesService.deleteTimeEntry(entryId)
        setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      } catch (err) {
        console.error("Error deleting time entry:", err)
        setError(err instanceof Error ? err.message : "Failed to delete time entry")
        throw err
      }
    } else {
      // Mock behavior for non-authenticated users
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    }
  }

  const validateActivity = async (activityName: string) => {
    if (user) {
      try {
        return await TimeEntriesService.validateActivity(activityName)
      } catch (err) {
        console.error("Error validating activity:", err)
        throw err
      }
    } else {
      // Mock validation for non-authenticated users
      return { isValid: true, categoryId: "1" }
    }
  }

  return {
    timeEntries,
    loading,
    error,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    validateActivity,
    refreshTimeEntries: loadTimeEntries,
  }
}
