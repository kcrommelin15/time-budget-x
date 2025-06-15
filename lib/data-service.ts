import { createClient } from "@/lib/supabase/client"
import { mockCategories } from "@/lib/mock-data"
import type { Category, TimeEntry } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

class DataService {
  private supabase = createClient()
  private user: User | null = null

  setUser(user: User | null) {
    this.user = user
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    if (!this.user) {
      return mockCategories
    }

    try {
      const { data, error } = await this.supabase.rpc("get_user_categories", { user_uuid: this.user.id })

      if (error) throw error

      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        weeklyBudget: Number.parseFloat(row.weekly_budget),
        timeUsed: Number.parseFloat(row.time_used),
        color: row.color,
        goalDirection: row.goal_direction,
        subcategories: row.subcategories || [],
      }))
    } catch (error) {
      console.error("Error fetching categories:", error)
      return mockCategories // Fallback to mock data
    }
  }

  async createCategory(category: Omit<Category, "id" | "timeUsed">): Promise<Category> {
    if (!this.user) {
      // For mock data, just return with a generated ID
      const newCategory: Category = {
        ...category,
        id: `mock-${Date.now()}`,
        timeUsed: 0,
      }
      return newCategory
    }

    try {
      const { data, error } = await this.supabase
        .from("categories")
        .insert({
          user_id: this.user.id,
          name: category.name,
          weekly_budget: category.weeklyBudget,
          color: category.color,
          goal_direction: category.goalDirection,
          sort_order: 0,
        })
        .select()
        .single()

      if (error) throw error

      // Create subcategories if any
      if (category.subcategories && category.subcategories.length > 0) {
        const subcategoriesData = category.subcategories.map((sub, index) => ({
          category_id: data.id,
          name: sub.name,
          budget: sub.budget,
          goal_direction: sub.goalDirection,
          goal_config: sub.goalConfig || {},
          is_fixed: sub.isFixed || false,
          sort_order: index,
        }))

        await this.supabase.from("subcategories").insert(subcategoriesData)
      }

      return {
        id: data.id,
        name: data.name,
        weeklyBudget: Number.parseFloat(data.weekly_budget),
        timeUsed: 0,
        color: data.color,
        goalDirection: data.goal_direction,
        subcategories: category.subcategories || [],
      }
    } catch (error) {
      console.error("Error creating category:", error)
      throw error
    }
  }

  async updateCategory(category: Category): Promise<void> {
    if (!this.user) {
      return // Mock data updates are handled in component state
    }

    try {
      // Update category
      const { error: categoryError } = await this.supabase
        .from("categories")
        .update({
          name: category.name,
          weekly_budget: category.weeklyBudget,
          color: category.color,
          goal_direction: category.goalDirection,
        })
        .eq("id", category.id)

      if (categoryError) throw categoryError

      // Handle subcategories
      if (category.subcategories) {
        // Delete existing subcategories
        await this.supabase.from("subcategories").delete().eq("category_id", category.id)

        // Insert new subcategories
        if (category.subcategories.length > 0) {
          const subcategoriesData = category.subcategories
            .filter((sub) => sub.name !== "Other") // Don't save "Other" subcategory
            .map((sub, index) => ({
              category_id: category.id,
              name: sub.name,
              budget: sub.budget,
              goal_direction: sub.goalDirection,
              goal_config: sub.goalConfig || {},
              is_fixed: sub.isFixed || false,
              sort_order: index,
            }))

          if (subcategoriesData.length > 0) {
            await this.supabase.from("subcategories").insert(subcategoriesData)
          }
        }
      }
    } catch (error) {
      console.error("Error updating category:", error)
      throw error
    }
  }

  async deleteCategory(categoryId: string): Promise<void> {
    if (!this.user) {
      return // Mock data deletes are handled in component state
    }

    try {
      const { error } = await this.supabase.from("categories").delete().eq("id", categoryId)

      if (error) throw error
    } catch (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  async archiveCategory(categoryId: string): Promise<void> {
    if (!this.user) {
      return // Mock data archives are handled in component state
    }

    try {
      const { error } = await this.supabase.from("categories").update({ is_archived: true }).eq("id", categoryId)

      if (error) throw error
    } catch (error) {
      console.error("Error archiving category:", error)
      throw error
    }
  }

  async restoreCategory(categoryId: string): Promise<void> {
    if (!this.user) {
      return // Mock data restores are handled in component state
    }

    try {
      const { error } = await this.supabase.from("categories").update({ is_archived: false }).eq("id", categoryId)

      if (error) throw error
    } catch (error) {
      console.error("Error restoring category:", error)
      throw error
    }
  }

  // Time Entries
  async getTimeEntries(startDate?: string, endDate?: string): Promise<TimeEntry[]> {
    if (!this.user) {
      return [] // Mock time entries would go here if needed
    }

    try {
      let query = this.supabase
        .from("time_entries")
        .select("*")
        .eq("user_id", this.user.id)
        .order("start_time", { ascending: false })

      if (startDate) {
        query = query.gte("entry_date", startDate)
      }
      if (endDate) {
        query = query.lte("entry_date", endDate)
      }

      const { data, error } = await query

      if (error) throw error

      return data.map((entry) => ({
        id: entry.id,
        categoryId: entry.category_id,
        categoryName: entry.category_name,
        categoryColor: entry.category_color,
        subcategory: entry.subcategory_name,
        startTime: entry.start_time,
        endTime: entry.end_time,
        description: entry.description || "",
        notes: entry.notes,
        date: entry.entry_date,
        status: entry.status,
        source: entry.source,
        approved: entry.approved,
      }))
    } catch (error) {
      console.error("Error fetching time entries:", error)
      return []
    }
  }

  async createTimeEntry(entry: Omit<TimeEntry, "id">): Promise<TimeEntry> {
    if (!this.user) {
      // For mock data, just return with a generated ID
      return {
        ...entry,
        id: `mock-${Date.now()}`,
      }
    }

    try {
      // Get subcategory ID if subcategory name is provided
      let subcategoryId = null
      if (entry.subcategory) {
        const { data: subcategory } = await this.supabase
          .from("subcategories")
          .select("id")
          .eq("category_id", entry.categoryId)
          .eq("name", entry.subcategory)
          .single()

        subcategoryId = subcategory?.id
      }

      const { data, error } = await this.supabase
        .from("time_entries")
        .insert({
          user_id: this.user.id,
          category_id: entry.categoryId,
          subcategory_id: subcategoryId,
          category_name: entry.categoryName,
          category_color: entry.categoryColor,
          subcategory_name: entry.subcategory,
          start_time: entry.startTime,
          end_time: entry.endTime,
          description: entry.description,
          notes: entry.notes,
          entry_date: entry.date,
          status: entry.status || "confirmed",
          source: entry.source || "manual",
          approved: entry.approved !== false,
        })
        .select()
        .single()

      if (error) throw error

      return {
        id: data.id,
        categoryId: data.category_id,
        categoryName: data.category_name,
        categoryColor: data.category_color,
        subcategory: data.subcategory_name,
        startTime: data.start_time,
        endTime: data.end_time,
        description: data.description || "",
        notes: data.notes,
        date: data.entry_date,
        status: data.status,
        source: data.source,
        approved: data.approved,
      }
    } catch (error) {
      console.error("Error creating time entry:", error)
      throw error
    }
  }

  // Migration function to sync mock data to Supabase when user first signs in
  async migrateMockDataToSupabase(mockCategories: Category[]): Promise<void> {
    if (!this.user) return

    try {
      // Check if user already has categories
      const { data: existingCategories } = await this.supabase
        .from("categories")
        .select("id")
        .eq("user_id", this.user.id)
        .limit(1)

      if (existingCategories && existingCategories.length > 0) {
        return // User already has data, don't migrate
      }

      // Migrate categories
      for (const category of mockCategories) {
        await this.createCategory({
          name: category.name,
          weeklyBudget: category.weeklyBudget,
          color: category.color,
          goalDirection: category.goalDirection,
          subcategories: category.subcategories,
        })
      }

      console.log("Successfully migrated mock data to Supabase")
    } catch (error) {
      console.error("Error migrating mock data:", error)
    }
  }
}

export const dataService = new DataService()
