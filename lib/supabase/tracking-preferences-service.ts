import { createClient } from "./client"

export interface DaySchedule {
  enabled: boolean
  startTime: string
  endTime: string
  hours: number
}

export interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

export interface TrackingPreferences {
  id?: string
  user_id?: string
  vacation_mode: boolean
  weekly_schedule: WeeklySchedule
  created_at?: string
  updated_at?: string
}

const supabase = createClient()

export class TrackingPreferencesService {
  static async getTrackingPreferences(): Promise<TrackingPreferences | null> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("tracking_preferences")
      .select("*")
      .eq("user_id", userData.user.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No preferences found, use upsert to create default ones safely
        return await this.upsertTrackingPreferences({})
      }
      console.error("Error fetching tracking preferences:", error)
      throw error
    }

    return data
  }

  static async updateTrackingPreferences(
    preferences: Partial<Pick<TrackingPreferences, "vacation_mode" | "weekly_schedule">>,
  ): Promise<TrackingPreferences> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("tracking_preferences")
      .update(preferences)
      .eq("user_id", userData.user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating tracking preferences:", error)
      throw error
    }

    return data
  }

  static async upsertTrackingPreferences(
    preferences: Partial<Pick<TrackingPreferences, "vacation_mode" | "weekly_schedule">>,
  ): Promise<TrackingPreferences> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const defaultPreferences = {
      user_id: userData.user.id,
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
      ...preferences,
    }

    const { data, error } = await supabase
      .from("tracking_preferences")
      .upsert(defaultPreferences, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error upserting tracking preferences:", error)
      throw error
    }

    return data
  }

  static calculateTotalScheduledHours(weeklySchedule: WeeklySchedule): number {
    return Object.values(weeklySchedule).reduce((total, day) => {
      return total + (day.enabled ? day.hours : 0)
    }, 0)
  }

  static calculateHoursFromTime(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(":").map(Number)
    const [endHour, endMin] = endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    return Math.max(0, (endMinutes - startMinutes) / 60)
  }
}
