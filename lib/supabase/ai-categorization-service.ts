import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/lib/types"

export interface CategorizationResult {
  categoryId: string
  subcategoryId?: string
  confidence: number
  reasoning: string
}

export class AICategorization {
  static async categorizeActivity(description: string, categories: Category[]): Promise<CategorizationResult> {
    const supabase = createClient()

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      throw new Error("User not authenticated")
    }

    try {
      const { data, error } = await supabase.functions.invoke("categorize-activity", {
        body: {
          description,
          categories: categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            color: cat.color,
            subcategories: cat.subcategories?.map((sub) => ({
              id: sub.id,
              name: sub.name,
            })),
          })),
        },
      })

      if (error) {
        console.error("Edge function error:", error)
        throw new Error(`Categorization failed: ${error.message}`)
      }

      return data as CategorizationResult
    } catch (error) {
      console.error("AI categorization error:", error)
      // Return a fallback result
      return {
        categoryId: categories[0]?.id || "",
        confidence: 0,
        reasoning: "Categorization service unavailable",
      }
    }
  }
}
