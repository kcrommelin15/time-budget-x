import { createClient } from "./client"
import type { TimeEntry } from "../types"

const supabase = createClient()

export class TimeEntriesService {
  // Get time entries for a specific date
  static async getTimeEntriesForDate(date: string): Promise<TimeEntry[]> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq("user_id", userData.user.id)
      .eq("date", date)
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time entries:", error)
      throw error
    }

    // Transform database format to app format
    return data.map((entry) => ({
      id: entry.id,
      categoryId: entry.category_id,
      categoryName: entry.categories?.name || "Unknown",
      categoryColor: entry.categories?.color || "#gray-500",
      subcategory: entry.subcategory_name || undefined,
      startTime: entry.start_time,
      endTime: entry.end_time,
      description: entry.description || "",
      date: entry.date,
      status: entry.status as "confirmed" | "pending",
      notes: entry.notes || undefined,
      source: entry.source || "manual",
    }))
  }

  // Get time entries for a date range
  static async getTimeEntriesForRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("time_entries")
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .eq("user_id", userData.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time entries:", error)
      throw error
    }

    return data.map((entry) => ({
      id: entry.id,
      categoryId: entry.category_id,
      categoryName: entry.categories?.name || "Unknown",
      categoryColor: entry.categories?.color || "#gray-500",
      subcategory: entry.subcategory_name || undefined,
      startTime: entry.start_time,
      endTime: entry.end_time,
      description: entry.description || "",
      date: entry.date,
      status: entry.status as "confirmed" | "pending",
      notes: entry.notes || undefined,
      source: entry.source || "manual",
    }))
  }

  // Create a new time entry
  static async createTimeEntry(entry: Omit<TimeEntry, "id">): Promise<TimeEntry> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: userData.user.id,
        category_id: entry.categoryId,
        subcategory_name: entry.subcategory || null,
        start_time: entry.startTime,
        end_time: entry.endTime,
        date: entry.date,
        description: entry.description || null,
        notes: entry.notes || null,
        source: entry.source || "manual",
        status: entry.status || "confirmed",
      })
      .select(`
        *,
        categories (
          name,
          color
        )
      `)
      .single()

    if (error) {
      console.error("Error creating time entry:", error)
      throw error
    }

    return {
      id: data.id,
      categoryId: data.category_id,
      categoryName: data.categories?.name || "Unknown",
      categoryColor: data.categories?.color || "#gray-500",
      subcategory: data.subcategory_name || undefined,
      startTime: data.start_time,
      endTime: data.end_time,
      description: data.description || "",
      date: data.date,
      status: data.status as "confirmed" | "pending",
      notes: data.notes || undefined,
      source: data.source || "manual",
    }
  }

  // Update a time entry
  static async updateTimeEntry(entry: TimeEntry): Promise<void> {
    const { error } = await supabase
      .from("time_entries")
      .update({
        category_id: entry.categoryId,
        subcategory_name: entry.subcategory || null,
        start_time: entry.startTime,
        end_time: entry.endTime,
        date: entry.date,
        description: entry.description || null,
        notes: entry.notes || null,
        status: entry.status || "confirmed",
      })
      .eq("id", entry.id)

    if (error) {
      console.error("Error updating time entry:", error)
      throw error
    }
  }

  // Delete a time entry
  static async deleteTimeEntry(entryId: string): Promise<void> {
    const { error } = await supabase.from("time_entries").delete().eq("id", entryId)

    if (error) {
      console.error("Error deleting time entry:", error)
      throw error
    }
  }

  // Calculate total time spent by category for a date range
  static async getTimeSpentByCategory(startDate: string, endDate: string): Promise<Record<string, number>> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("time_entries")
      .select("category_id, start_time, end_time")
      .eq("user_id", userData.user.id)
      .gte("date", startDate)
      .lte("date", endDate)

    if (error) {
      console.error("Error calculating time spent:", error)
      throw error
    }

    const timeSpent: Record<string, number> = {}

    data.forEach((entry) => {
      const startMinutes = this.timeToMinutes(entry.start_time)
      const endMinutes = this.timeToMinutes(entry.end_time)
      const duration = endMinutes - startMinutes

      if (!timeSpent[entry.category_id]) {
        timeSpent[entry.category_id] = 0
      }
      timeSpent[entry.category_id] += duration
    })

    return timeSpent
  }

  // Helper function to convert time string to minutes
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(":").map(Number)
    return hours * 60 + minutes
  }

  // Validate if activity matches existing categories/subcategories
  static async validateActivity(activityName: string): Promise<{
    isValid: boolean
    categoryId?: string
    subcategoryName?: string
    error?: string
  }> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // First check if it matches a category name
    const { data: categories, error: catError } = await supabase
      .from("categories")
      .select("id, name")
      .eq("user_id", userData.user.id)
      .ilike("name", activityName)

    if (catError) {
      console.error("Error validating category:", catError)
      throw catError
    }

    if (categories && categories.length > 0) {
      return {
        isValid: true,
        categoryId: categories[0].id,
      }
    }

    // Then check if it matches a subcategory name
    const { data: subcategories, error: subError } = await supabase
      .from("subcategories")
      .select(`
        name,
        category_id,
        categories!inner (
          user_id
        )
      `)
      .eq("categories.user_id", userData.user.id)
      .ilike("name", activityName)

    if (subError) {
      console.error("Error validating subcategory:", subError)
      throw subError
    }

    if (subcategories && subcategories.length > 0) {
      return {
        isValid: true,
        categoryId: subcategories[0].category_id,
        subcategoryName: subcategories[0].name,
      }
    }

    return {
      isValid: false,
      error: `"${activityName}" doesn't match any of your categories or activities. Please select from your existing categories or create a new one first.`,
    }
  }
}
