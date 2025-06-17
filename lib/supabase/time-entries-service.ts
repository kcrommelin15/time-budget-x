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
        categories!inner(name, color)
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
      categoryName: entry.categories.name,
      categoryColor: entry.categories.color,
      startTime: entry.start_time,
      endTime: entry.end_time,
      description: entry.description || "",
      date: entry.date,
      status: entry.status || "confirmed",
      subcategory: entry.subcategory || undefined,
      notes: entry.notes || undefined,
      source: entry.source || "manual",
      approved: entry.approved || true,
    }))
  }

  // Create a new time entry
  static async createTimeEntry(entry: Omit<TimeEntry, "id">): Promise<TimeEntry> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Get category info for the response
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("name, color")
      .eq("id", entry.categoryId)
      .single()

    if (categoryError) {
      console.error("Error fetching category:", categoryError)
      throw new Error("Invalid category selected")
    }

    const { data, error } = await supabase
      .from("time_entries")
      .insert({
        user_id: userData.user.id,
        category_id: entry.categoryId,
        start_time: entry.startTime,
        end_time: entry.endTime,
        description: entry.description,
        date: entry.date,
        status: entry.status || "confirmed",
        subcategory: entry.subcategory,
        notes: entry.notes,
        source: entry.source || "manual",
        approved: entry.approved !== false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating time entry:", error)
      throw error
    }

    return {
      id: data.id,
      categoryId: data.category_id,
      categoryName: categoryData.name,
      categoryColor: categoryData.color,
      startTime: data.start_time,
      endTime: data.end_time,
      description: data.description || "",
      date: data.date,
      status: data.status || "confirmed",
      subcategory: data.subcategory || undefined,
      notes: data.notes || undefined,
      source: data.source || "manual",
      approved: data.approved || true,
    }
  }

  // Update a time entry
  static async updateTimeEntry(entry: TimeEntry): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { error } = await supabase
      .from("time_entries")
      .update({
        category_id: entry.categoryId,
        start_time: entry.startTime,
        end_time: entry.endTime,
        description: entry.description,
        status: entry.status,
        subcategory: entry.subcategory,
        notes: entry.notes,
        approved: entry.approved,
      })
      .eq("id", entry.id)
      .eq("user_id", userData.user.id)

    if (error) {
      console.error("Error updating time entry:", error)
      throw error
    }
  }

  // Delete a time entry
  static async deleteTimeEntry(entryId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { error } = await supabase.from("time_entries").delete().eq("id", entryId).eq("user_id", userData.user.id)

    if (error) {
      console.error("Error deleting time entry:", error)
      throw error
    }
  }

  // Calculate total time spent for categories (for budget tracking)
  static async calculateCategoryTimeUsage(startDate: string, endDate: string): Promise<Record<string, number>> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("time_entries")
      .select("category_id, start_time, end_time")
      .eq("user_id", userData.user.id)
      .gte("date", startDate)
      .lte("date", endDate)
      .eq("status", "confirmed")

    if (error) {
      console.error("Error calculating time usage:", error)
      throw error
    }

    const categoryTimes: Record<string, number> = {}

    data.forEach((entry) => {
      const startTime = new Date(`1970-01-01T${entry.start_time}:00`)
      const endTime = new Date(`1970-01-01T${entry.end_time}:00`)
      const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)

      if (categoryTimes[entry.category_id]) {
        categoryTimes[entry.category_id] += durationMinutes
      } else {
        categoryTimes[entry.category_id] = durationMinutes
      }
    })

    return categoryTimes
  }

  // Validate if a category/subcategory combination exists
  static async validateCategorySubcategory(categoryId: string, subcategory?: string): Promise<boolean> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Check if category exists and belongs to user
    const { data: categoryData, error: categoryError } = await supabase
      .from("categories")
      .select("id, subcategories(name)")
      .eq("id", categoryId)
      .eq("user_id", userData.user.id)
      .single()

    if (categoryError || !categoryData) {
      return false
    }

    // If subcategory is specified, check if it exists
    if (subcategory) {
      const subcategoryExists = categoryData.subcategories?.some((sub: any) => sub.name === subcategory)
      return subcategoryExists || false
    }

    return true
  }
}
