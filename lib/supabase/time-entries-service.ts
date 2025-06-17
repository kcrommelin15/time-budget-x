import { createClient } from "./client"

export type TimeEntry = {
  id: string
  user_id: string
  category_id: string
  subcategory_name?: string
  start_time: string
  end_time: string
  date: string
  description?: string
  notes?: string
  source: string
  status: string
  created_at: string
  updated_at: string
}

export type CreateTimeEntryData = {
  category_id: string
  subcategory_name?: string
  start_time: string
  end_time: string
  date: string
  description?: string
  notes?: string
  source?: string
}

export type UpdateTimeEntryData = Partial<CreateTimeEntryData>

class TimeEntriesService {
  private supabase = createClient()

  async getTimeEntries(date?: string): Promise<TimeEntry[]> {
    let query = this.supabase.from("time_entries").select("*").order("start_time", { ascending: true })

    if (date) {
      query = query.eq("date", date)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching time entries:", error)
      throw error
    }

    return data || []
  }

  async getTimeEntriesForDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    const { data, error } = await this.supabase
      .from("time_entries")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })

    if (error) {
      console.error("Error fetching time entries for date range:", error)
      throw error
    }

    return data || []
  }

  async createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
    const { data: result, error } = await this.supabase
      .from("time_entries")
      .insert({
        ...data,
        source: data.source || "manual",
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating time entry:", error)
      throw error
    }

    return result
  }

  async updateTimeEntry(id: string, data: UpdateTimeEntryData): Promise<TimeEntry> {
    const { data: result, error } = await this.supabase.from("time_entries").update(data).eq("id", id).select().single()

    if (error) {
      console.error("Error updating time entry:", error)
      throw error
    }

    return result
  }

  async deleteTimeEntry(id: string): Promise<void> {
    const { error } = await this.supabase.from("time_entries").delete().eq("id", id)

    if (error) {
      console.error("Error deleting time entry:", error)
      throw error
    }
  }

  async getTimeSpentByCategory(categoryId: string, startDate?: string, endDate?: string): Promise<number> {
    let query = this.supabase.from("time_entries").select("start_time, end_time").eq("category_id", categoryId)

    if (startDate) {
      query = query.gte("date", startDate)
    }
    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching time spent:", error)
      throw error
    }

    // Calculate total minutes
    let totalMinutes = 0
    data?.forEach((entry) => {
      const start = new Date(`1970-01-01T${entry.start_time}`)
      const end = new Date(`1970-01-01T${entry.end_time}`)
      const diffMs = end.getTime() - start.getTime()
      totalMinutes += diffMs / (1000 * 60)
    })

    return totalMinutes
  }

  // Helper method to validate activity against categories
  async validateActivity(
    activityName: string,
  ): Promise<{ isValid: boolean; categoryId?: string; subcategoryName?: string }> {
    // First check if it matches a category name
    const { data: categories, error: catError } = await this.supabase
      .from("categories")
      .select("id, name, subcategories")
      .ilike("name", activityName)

    if (catError) {
      console.error("Error validating activity:", catError)
      return { isValid: false }
    }

    if (categories && categories.length > 0) {
      return {
        isValid: true,
        categoryId: categories[0].id,
      }
    }

    // Check if it matches a subcategory
    const { data: allCategories, error: allCatError } = await this.supabase
      .from("categories")
      .select("id, name, subcategories")

    if (allCatError) {
      console.error("Error fetching categories for validation:", allCatError)
      return { isValid: false }
    }

    for (const category of allCategories || []) {
      if (category.subcategories) {
        const subcategories = Array.isArray(category.subcategories) ? category.subcategories : []

        const matchingSubcat = subcategories.find((sub: any) =>
          typeof sub === "string"
            ? sub.toLowerCase() === activityName.toLowerCase()
            : sub.name?.toLowerCase() === activityName.toLowerCase(),
        )

        if (matchingSubcat) {
          return {
            isValid: true,
            categoryId: category.id,
            subcategoryName: typeof matchingSubcat === "string" ? matchingSubcat : matchingSubcat.name,
          }
        }
      }
    }

    return { isValid: false }
  }
}

export const timeEntriesService = new TimeEntriesService()
export { TimeEntriesService }
