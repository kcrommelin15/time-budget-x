"use client"

import { useState, useEffect } from "react"
import { timeEntriesService, type TimeEntry, type CreateTimeEntryData } from "@/lib/supabase/time-entries-service"

export function useTimeEntries(date?: string) {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeEntries = async () => {
    try {
      setLoading(true)
      setError(null)
      const entries = await timeEntriesService.getTimeEntries(date)
      setTimeEntries(entries)
    } catch (err) {
      console.error("Error fetching time entries:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch time entries")
    } finally {
      setLoading(false)
    }
  }

  const addTimeEntry = async (data: CreateTimeEntryData) => {
    try {
      const newEntry = await timeEntriesService.createTimeEntry(data)
      setTimeEntries((prev) => [...prev, newEntry].sort((a, b) => a.start_time.localeCompare(b.start_time)))
      return newEntry
    } catch (err) {
      console.error("Error adding time entry:", err)
      throw err
    }
  }

  const updateTimeEntry = async (id: string, data: Partial<CreateTimeEntryData>) => {
    try {
      const updatedEntry = await timeEntriesService.updateTimeEntry(id, data)
      setTimeEntries((prev) => prev.map((entry) => (entry.id === id ? updatedEntry : entry)))
      return updatedEntry
    } catch (err) {
      console.error("Error updating time entry:", err)
      throw err
    }
  }

  const deleteTimeEntry = async (id: string) => {
    try {
      await timeEntriesService.deleteTimeEntry(id)
      setTimeEntries((prev) => prev.filter((entry) => entry.id !== id))
    } catch (err) {
      console.error("Error deleting time entry:", err)
      throw err
    }
  }

  const validateActivity = async (activityName: string) => {
    try {
      return await timeEntriesService.validateActivity(activityName)
    } catch (err) {
      console.error("Error validating activity:", err)
      return { isValid: false }
    }
  }

  useEffect(() => {
    fetchTimeEntries()
  }, [date])

  return {
    timeEntries,
    loading,
    error,
    addTimeEntry,
    updateTimeEntry,
    deleteTimeEntry,
    validateActivity,
    refetch: fetchTimeEntries,
  }
}
