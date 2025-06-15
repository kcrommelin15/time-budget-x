import { createClient } from "./client"
import type { Category, Subcategory } from "../types"

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
      .order("display_order", { ascending: true })

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError)
      throw categoriesError
    }

    // Transform database format to app format
    return categoriesData.map((cat) => ({
      id: cat.id,
      name: cat.name,
      weeklyBudget: cat.weekly_budget,
      timeUsed: cat.time_used || 0,
      color: cat.color,
      goalDirection: cat.goal_direction,
      subcategories:
        cat.subcategories?.map((sub: any) => ({
          name: sub.name,
          budget: sub.budget,
          timeUsed: sub.time_used || 0,
          goalDirection: sub.goal_direction,
          goalConfig: sub.goal_config,
          isFixed: sub.is_fixed || false,
        })) || [],
    }))
  }

  static async createCategory(category: Omit<Category, "id" | "timeUsed">): Promise<Category> {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) throw new Error("User not authenticated")

    // Get the highest display_order
    const { data: maxOrderData } = await supabase
      .from("categories")
      .select("display_order")
      .order("display_order", { ascending: false })
      .limit(1)

    const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1

    const { data, error } = await supabase
      .from("categories")
      .insert({
        user_id: userData.user.id,
        name: category.name,
        weekly_budget: category.weeklyBudget,
        color: category.color,
        goal_direction: category.goalDirection,
        display_order: nextOrder,
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
      const subcategoriesData = category.subcategories.map((sub, index) => ({
        category_id: data.id,
        name: sub.name,
        budget: sub.budget,
        time_used: sub.timeUsed || 0,
        goal_direction: sub.goalDirection,
        goal_config: sub.goalConfig,
        is_fixed: sub.isFixed || false,
        display_order: index,
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
      timeUsed: data.time_used || 0,
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
        time_used: category.timeUsed,
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
        const subcategoriesData = category.subcategories.map((sub, index) => ({
          category_id: category.id,
          name: sub.name,
          budget: sub.budget,
          time_used: sub.timeUsed || 0,
          goal_direction: sub.goalDirection,
          goal_config: sub.goalConfig,
          is_fixed: sub.isFixed || false,
          display_order: index,
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
    const updates = categoryIds.map((id, index) => ({
      id,
      display_order: index,
    }))

    for (const update of updates) {
      await supabase.from("categories").update({ display_order: update.display_order }).eq("id", update.id)
    }
  }

  // Subcategories
  static async createSubcategory(categoryId: string, subcategory: Omit<Subcategory, "timeUsed">): Promise<void> {
    // Get the highest display_order for this category
    const { data: maxOrderData } = await supabase
      .from("subcategories")
      .select("display_order")
      .eq("category_id", categoryId)
      .order("display_order", { ascending: false })
      .limit(1)

    const nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1

    const { error } = await supabase.from("subcategories").insert({
      category_id: categoryId,
      name: subcategory.name,
      budget: subcategory.budget,
      time_used: 0,
      goal_direction: subcategory.goalDirection,
      goal_config: subcategory.goalConfig,
      is_fixed: subcategory.isFixed || false,
      display_order: nextOrder,
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
    const { error } = await supabase
      .from("subcategories")
      .update({
        budget: updates.budget,
        goal_direction: updates.goalDirection,
        goal_config: updates.goalConfig,
      })
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

    // Create default categories
    const defaultCategories = [
      {
        name: "Work",
        weekly_budget: 40,
        color: "#2B93FA",
        display_order: 0,
        subcategories: [
          { name: "Meetings", budget: 10, goal_direction: "less_is_better" },
          { name: "Deep Focus", budget: 15, goal_direction: "more_is_better" },
          { name: "Managing", budget: 5, goal_direction: "target_range" },
        ],
      },
      {
        name: "Personal",
        weekly_budget: 7,
        color: "#13B078",
        display_order: 1,
        subcategories: [
          { name: "Domestic", budget: 3, goal_direction: "target_range" },
          { name: "Family time", budget: 2, goal_direction: "more_is_better" },
          { name: "Hobbies", budget: 2, goal_direction: "more_is_better" },
        ],
      },
      {
        name: "Exercise",
        weekly_budget: 4,
        color: "#EB8C5E",
        display_order: 2,
        subcategories: [
          { name: "Cardio", budget: 2, goal_direction: "more_is_better" },
          { name: "Strength", budget: 2, goal_direction: "more_is_better" },
        ],
      },
      {
        name: "Learning",
        weekly_budget: 4,
        color: "#6C63FF",
        display_order: 3,
        subcategories: [
          { name: "Online courses", budget: 2, goal_direction: "more_is_better" },
          { name: "Reading", budget: 2, goal_direction: "more_is_better" },
        ],
      },
    ]

    for (const category of defaultCategories) {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .insert({
          user_id: userData.user.id,
          name: category.name,
          weekly_budget: category.weekly_budget,
          color: category.color,
          display_order: category.display_order,
          time_used: 0,
        })
        .select()
        .single()

      if (categoryError) {
        console.error("Error creating default category:", categoryError)
        continue
      }

      // Create subcategories
      if (category.subcategories.length > 0) {
        const subcategoriesData = category.subcategories.map((sub, index) => ({
          category_id: categoryData.id,
          name: sub.name,
          budget: sub.budget,
          time_used: 0,
          goal_direction: sub.goal_direction,
          display_order: index,
        }))

        const { error: subError } = await supabase.from("subcategories").insert(subcategoriesData)

        if (subError) {
          console.error("Error creating default subcategories:", subError)
        }
      }
    }
  }
}
