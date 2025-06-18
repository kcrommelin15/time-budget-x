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
        setError(null)
        const createdEntry = await TimeEntriesService.createTimeEntry(newEntry)
        setTimeEntries((prev) => [...prev, createdEntry])
        return createdEntry
      } catch (err) {
        console.error("Error adding time entry:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to add time entry"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } else {
      // Mock behavior for non-authenticated users
      const entry: TimeEntry = {
        ...newEntry,
        id: Date.now().toString(),
      }
      setTimeEntries((prev) => [...prev, entry])
      return entry
    }
  }

  const updateTimeEntry = async (updatedEntry: TimeEntry) => {
    if (user) {
      try {
        setError(null)
        await TimeEntriesService.updateTimeEntry(updatedEntry)
        setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
      } catch (err) {
        console.error("Error updating time entry:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to update time entry"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } else {
      // Mock behavior for non-authenticated users
      setTimeEntries((prev) => prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    }
  }

  const deleteTimeEntry = async (entryId: string) => {
    if (user) {
      try {
        setError(null)
        await TimeEntriesService.deleteTimeEntry(entryId)
        setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))
      } catch (err) {
        console.error("Error deleting time entry:", err)
        const errorMessage = err instanceof Error ? err.message : "Failed to delete time entry"
        setError(errorMessage)
        throw new Error(errorMessage)
      }
    } else {
      // Mock behavior for non-authenticated users
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    }
  }

  const validateCategorySubcategory = async (categoryId: string, subcategory?: string): Promise<boolean> => {
    if (!user) {
      // For mock data, always return true
      return true
    }

    try {
      return await TimeEntriesService.validateCategorySubcategory(categoryId, subcategory)
    } catch (err) {
      console.error("Error validating category/subcategory:", err)
      return false
    }
  }

  return {
    timeEntries,
    loading,
    error,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    validateCategorySubcategory,
    refreshTimeEntries: loadTimeEntries,
  }
}
