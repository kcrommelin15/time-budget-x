"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UserSettingsService, type UserSettings } from "@/lib/supabase/user-settings-service"
import { queryKeys } from "@/lib/query-keys"
import type { User } from "@supabase/supabase-js"

export function useUserSettingsQuery(user: User | null | undefined) {
  const queryClient = useQueryClient()

  // Query for user settings
  const {
    data: settings,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.userSettingsForUser(user?.id),
    queryFn: async () => {
      if (user === null) {
        // User is definitely not authenticated, return default settings
        return {
          ai_smart_suggestions: true,
          ai_auto_gap_filling: false,
          ai_auto_categorize_text: true,
          ai_auto_categorize_integrations: true,
          ai_advanced_insights: false,
          notifications_push: true,
          integration_slack_connected: false,
          integration_trello_connected: false,
        } as UserSettings
      }

      if (user === undefined) {
        // Still loading auth state, don't return anything yet
        throw new Error("Auth state loading")
      }

      // User is authenticated, fetch real settings
      try {
        const userSettings = await UserSettingsService.getUserSettings()
        return (
          userSettings ||
          ({
            ai_smart_suggestions: true,
            ai_auto_gap_filling: false,
            ai_auto_categorize_text: true,
            ai_auto_categorize_integrations: true,
            ai_advanced_insights: false,
            notifications_push: true,
            integration_slack_connected: false,
            integration_trello_connected: false,
          } as UserSettings)
        )
      } catch (error) {
        console.error("Error loading user settings:", error)
        // Return default settings on error
        return {
          ai_smart_suggestions: true,
          ai_auto_gap_filling: false,
          ai_auto_categorize_text: true,
          ai_auto_categorize_integrations: true,
          ai_advanced_insights: false,
          notifications_push: true,
          integration_slack_connected: false,
          integration_trello_connected: false,
        } as UserSettings
      }
    },
    enabled: user !== undefined, // Only run when auth state is determined
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  })

  // Mutation for updating individual settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: keyof UserSettings; value: boolean }) => {
      if (!user) {
        // For non-authenticated users, just return the update (mock behavior)
        return { [key]: value }
      }

      await UserSettingsService.updateUserSettings({ [key]: value })
      return { [key]: value }
    },
    onMutate: async ({ key, value }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.userSettingsForUser(user?.id) })

      // Snapshot the previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(queryKeys.userSettingsForUser(user?.id))

      // Optimistically update to the new value
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(queryKeys.userSettingsForUser(user?.id), {
          ...previousSettings,
          [key]: value,
        })
      }

      // Return a context object with the snapshotted value
      return { previousSettings }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.userSettingsForUser(user?.id), context.previousSettings)
      }
      console.error("Error updating setting:", err)
    },
    // Remove onSettled to prevent unnecessary refetches that could cause UI flicker
  })

  // Mutation for toggling integrations
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ integration, enabled }: { integration: "slack" | "trello"; enabled: boolean }) => {
      if (!user) {
        return { integration, enabled }
      }

      await UserSettingsService.toggleIntegration(integration, enabled)
      return { integration, enabled }
    },
    onMutate: async ({ integration, enabled }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.userSettingsForUser(user?.id) })

      const previousSettings = queryClient.getQueryData<UserSettings>(queryKeys.userSettingsForUser(user?.id))
      const fieldName = `integration_${integration}_connected` as keyof UserSettings

      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(queryKeys.userSettingsForUser(user?.id), {
          ...previousSettings,
          [fieldName]: enabled,
        })
      }

      return { previousSettings }
    },
    onError: (err, variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(queryKeys.userSettingsForUser(user?.id), context.previousSettings)
      }
      console.error("Error toggling integration:", err)
    },
    // Remove onSettled to prevent unnecessary refetches
  })

  return {
    settings,
    loading: isLoading,
    error: error?.message || null,
    updateSetting: (key: keyof UserSettings, value: boolean) => updateSettingMutation.mutate({ key, value }),
    toggleIntegration: (integration: "slack" | "trello", enabled: boolean) =>
      toggleIntegrationMutation.mutate({ integration, enabled }),
    // Remove isUpdating - we don't want to disable UI elements
  }
}
