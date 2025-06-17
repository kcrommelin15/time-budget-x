import { createClient } from "./client"

export interface UserSettings {
  id?: string
  user_id?: string
  notifications_push: boolean
  ai_smart_suggestions: boolean
  ai_auto_gap_filling: boolean
  ai_auto_categorize_text: boolean
  ai_auto_categorize_integrations: boolean
  ai_advanced_insights: boolean
  integration_slack_connected: boolean
  integration_trello_connected: boolean
  created_at?: string
}

const supabase = createClient()

export class UserSettingsService {
  static async getUserSettings(): Promise<UserSettings | null> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // First try to get existing settings
    const { data, error } = await supabase.from("user_settings").select("*").eq("user_id", userData.user.id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No settings found, try to create them using upsert to handle race conditions
        return await this.upsertUserSettings({})
      }
      console.error("Error fetching user settings:", error)
      throw error
    }

    return data
  }

  static async createDefaultSettings(): Promise<UserSettings> {
    // This method is now deprecated in favor of upsertUserSettings
    // but keeping it for backward compatibility
    return await this.upsertUserSettings({})
  }

  static async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Remove fields that shouldn't be updated
    const { id, user_id, created_at, ...updateData } = settings

    const { data, error } = await supabase
      .from("user_settings")
      .update(updateData)
      .eq("user_id", userData.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating user settings:", error)
      throw error
    }

    return data
  }

  static async upsertUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const settingsData = {
      user_id: userData.user.id,
      notifications_push: settings.notifications_push ?? true,
      ai_smart_suggestions: settings.ai_smart_suggestions ?? true,
      ai_auto_gap_filling: settings.ai_auto_gap_filling ?? false,
      ai_auto_categorize_text: settings.ai_auto_categorize_text ?? true,
      ai_auto_categorize_integrations: settings.ai_auto_categorize_integrations ?? true,
      ai_advanced_insights: settings.ai_advanced_insights ?? false,
      integration_slack_connected: settings.integration_slack_connected ?? false,
      integration_trello_connected: settings.integration_trello_connected ?? false,
    }

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(settingsData, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting user settings:", error)
      throw error
    }

    return data
  }

  static async toggleIntegration(integration: "slack" | "trello", connected: boolean): Promise<UserSettings> {
    const fieldName = `integration_${integration}_connected` as keyof UserSettings
    return await this.updateUserSettings({ [fieldName]: connected })
  }
}
