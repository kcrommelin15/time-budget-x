import { createClient } from "./client"
import type { Category, Subcategory } from "../types"
import { roundTimeUpToMinute } from "../goal-utils"

const supabase = createClient()

export class DataService {
  // Categories
  static async getCategories(): Promise<Category[]> {
    const { data: categoriesData, error: categoriesError } = await supabase
      .from("categories")
      .select(`
        *,
        subcategories (*)
      `)
      .order("created_at", { ascending: true })

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      throw categoriesError
    }

    // Transform database format to app format
    return categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      weeklyBudget: cat.weekly_budget,
      timeUsed: roundTimeUpToMinute((cat.time_used || 0) / 60), // Convert minutes to hours and round up
      color: cat.color,
      goalDirection: cat.goal_direction,
      subcategories:
        cat.subcategories?.map((sub: any) => ({
          name: sub.name,
          budget: sub.budget,
          timeUsed: roundTimeUpToMinute((sub.time_used || 0) / 60), // Convert minutes to hours and round up
          goalDirection: sub.goal_direction,
          isFixed: sub.is_fixed || false,
        })) || [],
    }))
  }

  static async createCategory(category: Omit<Category, "id" | "timeUsed">): Promise<Category> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userData.user.id,
        name: category.name,
        weekly_budget: category.weeklyBudget,
        color: category.color,
        goal_direction: category.goalDirection,
        time_used: 0,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating category:", error)
      throw error
    }

    // Create subcategories if any
    if (category.subcategories && category.subcategories.length > 0) {
      const subcategoriesData = category.subcategories.map((sub) => ({
        category_id: data.id,
        name: sub.name,
        budget: sub.budget,
        time_used: Math.ceil((sub.timeUsed || 0) * 60), // Convert hours to minutes and round up
        goal_direction: sub.goalDirection,
        is_fixed: sub.isFixed || false,
      }))

      const { error: subError } = await supabase.from("subcategories").insert(subcategoriesData)

      if (subError) {
        console.error("Error creating subcategories:", subError)
        // Don't throw here, category was created successfully
      }
    }

    return {
      id: data.id,
      name: data.name,
      weeklyBudget: data.weekly_budget,
      timeUsed: roundTimeUpToMinute((data.time_used || 0) / 60), // Convert minutes to hours and round up
      color: data.color,
      goalDirection: data.goal_direction,
      subcategories: category.subcategories || [],
    }
  }

  static async updateCategory(category: Category): Promise<void> {
    const { error } = await supabase
      .from("categories")
      .update({
        name: category.name,
        weekly_budget: category.weeklyBudget,
        color: category.color,
        goal_direction: category.goalDirection,
        time_used: Math.ceil(category.timeUsed * 60), // Convert hours to minutes and round up
      })
      .eq("id", category.id)

    if (error) {
      console.error("Error updating category:", error)
      throw error
    }

    // Update subcategories
    if (category.subcategories) {
      // Delete existing subcategories
      await supabase.from("subcategories").delete().eq("category_id", category.id)

      // Insert new subcategories
      if (category.subcategories.length > 0) {
        const subcategoriesData = category.subcategories.map((sub) => ({
          category_id: category.id,
          name: sub.name,
          budget: sub.budget,
          time_used: Math.ceil((sub.timeUsed || 0) * 60), // Convert hours to minutes and round up
          goal_direction: sub.goalDirection,
          is_fixed: sub.isFixed || false,
        }))

        const { error: subError } = await supabase.from("subcategories").insert(subcategoriesData)

        if (subError) {
          console.error("Error updating subcategories:", subError)
          throw subError
        }
      }
    }
  }

  static async deleteCategory(categoryId: string): Promise<void> {
    // Subcategories will be deleted automatically due to foreign key cascade
    const { error } = await supabase.from("categories").delete().eq("id", categoryId)

    if (error) {
      console.error("Error deleting category:", error)
      throw error
    }
  }

  static async reorderCategories(categoryIds: string[]): Promise<void> {
    // Since we don't have display_order column, we'll skip reordering for now
    // Categories will be ordered by created_at
    console.log("Reordering not implemented - no display_order column")
  }

  // Subcategories
  static async createSubcategory(categoryId: string, subcategory: Omit<Subcategory, "timeUsed">): Promise<void> {
    const { error } = await supabase.from("subcategories").insert({
      category_id: categoryId,
      name: subcategory.name,
      budget: subcategory.budget,
      time_used: 0,
      goal_direction: subcategory.goalDirection,
      is_fixed: subcategory.isFixed || false,
    })

    if (error) {
      console.error("Error creating subcategory:", error)
      throw error
    }
  }

  static async updateSubcategory(
    categoryId: string,
    subcategoryName: string,
    updates: Partial<Subcategory>,
  ): Promise<void> {
    const updateData: any = {}
    if (updates.budget !== undefined) updateData.budget = updates.budget
    if (updates.goalDirection !== undefined) updateData.goal_direction = updates.goalDirection
    if (updates.isFixed !== undefined) updateData.is_fixed = updates.isFixed
    if (updates.timeUsed !== undefined) updateData.time_used = Math.ceil(updates.timeUsed * 60) // Convert hours to minutes and round up

    const { error } = await supabase
      .from("subcategories")
      .update(updateData)
      .eq("category_id", categoryId)
      .eq("name", subcategoryName)

    if (error) {
      console.error("Error updating subcategory:", error)
      throw error
    }
  }

  static async deleteSubcategory(categoryId: string, subcategoryName: string): Promise<void> {
    const { error } = await supabase
      .from("subcategories")
      .delete()
      .eq("category_id", categoryId)
      .eq("name", subcategoryName)

    if (error) {
      console.error("Error deleting subcategory:", error)
      throw error
    }
  }

  // Initialize user with default categories
  static async initializeUserData(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Check if user already has categories
    const { data: existingCategories } = await supabase.from("categories").select("id").limit(1)

    if (existingCategories && existingCategories.length > 0) {
      return // User already has data
    }

    // Don't create any default categories - let users start fresh
    console.log("User initialized with empty categories")
  }

  // Update category time usage based on time entries
  static async updateCategoryTimeUsage(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Get start of current week (Monday)
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay() + 1)
    startOfWeek.setHours(0, 0, 0, 0)

    // Get end of current week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const startDateString = startOfWeek.toISOString().split("T")[0]
    const endDateString = endOfWeek.toISOString().split("T")[0]

    try {
      // Import TimeEntriesService here to avoid circular dependency
      const { TimeEntriesService } = await import("./time-entries-service")
      const categoryTimes = await TimeEntriesService.calculateCategoryTimeUsage(startDateString, endDateString)

      // Update each category's time_used (categoryTimes is already in minutes and rounded up)
      for (const [categoryId, timeInMinutes] of Object.entries(categoryTimes)) {
        await supabase
          .from("categories")
          .update({ time_used: timeInMinutes }) // Store as minutes in database
          .eq("id", categoryId)
          .eq("user_id", userData.user.id)
      }

      // Reset time_used to 0 for categories with no time entries
      const { data: allCategories } = await supabase.from("categories").select("id").eq("user_id", userData.user.id)

      if (allCategories) {
        const categoriesWithNoTime = allCategories.filter((cat) => !categoryTimes[cat.id]).map((cat) => cat.id)

        if (categoriesWithNoTime.length > 0) {
          await supabase
            .from("categories")
            .update({ time_used: 0 })
            .in("id", categoriesWithNoTime)
            .eq("user_id", userData.user.id)
        }
      }
    } catch (error) {
      console.error("Error updating category time usage:", error)
      throw error
    }
  }
}
