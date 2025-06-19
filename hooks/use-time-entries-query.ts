"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { TimeEntriesService } from "@/lib/supabase/time-entries-service"
import { mockTimeEntries } from "@/lib/mock-data"
import { queryKeys } from "@/lib/query-keys"
import type { TimeEntry } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

export function useTimeEntriesQuery(user: User | null | undefined, selectedDate: Date) {
  const queryClient = useQueryClient()
  const userId = user?.id
  const dateString = selectedDate.toISOString().split("T")[0]

  // Main time entries query
  const timeEntriesQuery = useQuery({
    queryKey: queryKeys.timeEntriesForDate(userId, dateString),
    queryFn: async (): Promise<TimeEntry[]> => {
      if (user === null) {
        // Return filtered mock data for non-authenticated users
        return mockTimeEntries.filter((entry) => entry.date === dateString)
      }

      if (user === undefined) {
        // Still loading auth state, return empty array
        return []
      }

      try {
        return await TimeEntriesService.getTimeEntriesForDate(dateString)
      } catch (error) {
        console.error("Error loading time entries:", error)
        throw error
      }
    },
    enabled: user !== undefined, // Only run when auth state is determined
    staleTime: 1 * 60 * 1000, // Consider data stale after 1 minute (time entries change frequently)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  // Add time entry mutation
  const addTimeEntryMutation = useMutation({
    mutationFn: async (newEntry: Omit<TimeEntry, "id">) => {
      if (!user) {
        // Mock behavior
        return {
          ...newEntry,
          id: Date.now().toString(),
        }
      }
      return await TimeEntriesService.createTimeEntry(newEntry)
    },
    onSuccess: (newEntry) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.timeEntriesForDate(userId, dateString),
        (oldEntries: TimeEntry[] | undefined) => {
          return oldEntries ? [...oldEntries, newEntry] : [newEntry]
        },
      )

      // Invalidate categories to update time usage
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
    onError: (error) => {
      console.error("Error adding time entry:", error)
      // Invalidate and refetch on error
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntriesForDate(userId, dateString) })
    },
  })

  // Update time entry mutation
  const updateTimeEntryMutation = useMutation({
    mutationFn: async (updatedEntry: TimeEntry) => {
      if (!user) {
        return updatedEntry // Mock behavior
      }
      await TimeEntriesService.updateTimeEntry(updatedEntry)
      return updatedEntry
    },
    onSuccess: (updatedEntry) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.timeEntriesForDate(userId, dateString),
        (oldEntries: TimeEntry[] | undefined) => {
          return oldEntries?.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)) || []
        },
      )

      // Invalidate categories to update time usage
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
    onError: (error) => {
      console.error("Error updating time entry:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntriesForDate(userId, dateString) })
    },
  })

  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      if (!user) {
        return entryId // Mock behavior
      }
      await TimeEntriesService.deleteTimeEntry(entryId)
      return entryId
    },
    onSuccess: (deletedEntryId) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.timeEntriesForDate(userId, dateString),
        (oldEntries: TimeEntry[] | undefined) => {
          return oldEntries?.filter((entry) => entry.id !== deletedEntryId) || []
        },
      )

      // Invalidate categories to update time usage
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
    onError: (error) => {
      console.error("Error deleting time entry:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntriesForDate(userId, dateString) })
    },
  })

  // Validate category/subcategory
  const validateCategorySubcategory = async (categoryId: string, subcategory?: string): Promise<boolean> => {
    if (!user) {
      return true // Mock behavior
    }

    try {
      return await TimeEntriesService.validateCategorySubcategory(categoryId, subcategory)
    } catch (error) {
      console.error("Error validating category/subcategory:", error)
      return false
    }
  }

  return {
    // Data
    timeEntries: timeEntriesQuery.data || [],

    // Loading states
    loading: timeEntriesQuery.isLoading,
    isRefetching: timeEntriesQuery.isRefetching,

    // Error states
    error: timeEntriesQuery.error?.message || null,

    // Mutation states
    isAddingEntry: addTimeEntryMutation.isPending,
    isUpdatingEntry: updateTimeEntryMutation.isPending,
    isDeletingEntry: deleteTimeEntryMutation.isPending,

    // Actions
    addTimeEntry: addTimeEntryMutation.mutateAsync, // Use mutateAsync to return promise
    updateTimeEntry: updateTimeEntryMutation.mutateAsync,
    deleteTimeEntry: deleteTimeEntryMutation.mutate,
    validateCategorySubcategory,

    // Manual refetch
    refetch: timeEntriesQuery.refetch,
  }
}
