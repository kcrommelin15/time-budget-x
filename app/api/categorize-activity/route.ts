import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"

// Schema for the AI response
const categorizationSchema = z.object({
  categoryId: z.string().describe("The ID of the most relevant category"),
  subcategory: z.string().optional().describe("The name of the most relevant subcategory if applicable"),
  confidence: z.number().min(0).max(1).describe("Confidence score between 0 and 1"),
  reasoning: z.string().describe("Brief explanation of why this category was chosen"),
})

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return Response.json({ error: "Text input is required" }, { status: 400 })
    }

    // Get user's categories from Supabase
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch user's categories and subcategories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select(`
        id,
        name,
        subcategories (
          name
        )
      `)
      .eq("user_id", user.id)
      .eq("archived", false)

    if (categoriesError) {
      return Response.json({ error: "Failed to fetch categories" }, { status: 500 })
    }

    if (!categories || categories.length === 0) {
      return Response.json({ error: "No categories found" }, { status: 404 })
    }

    // Format categories for the AI prompt
    const categoryList = categories
      .map((cat) => {
        const subcats = cat.subcategories?.map((sub) => sub.name).join(", ") || "None"
        return `- ${cat.name} (ID: ${cat.id}) - Subcategories: ${subcats}`
      })
      .join("\n")

    // Generate categorization using AI SDK
    const result = await generateObject({
      model: openai("gpt-4o-mini"), // Using the more cost-effective model
      schema: categorizationSchema,
      prompt: `
        You are a time tracking assistant. Categorize the following activity description into one of the user's predefined categories.

        User's Categories:
        ${categoryList}

        Activity Description: "${text}"

        Instructions:
        1. Choose the most relevant category ID from the list above
        2. If applicable, suggest a subcategory name (must be from the subcategories listed)
        3. Provide a confidence score (0-1) for your categorization
        4. Give a brief reasoning for your choice

        Be practical and consider common work/life activities. If the description is vague, choose the most likely category based on context.
      `,
    })

    return Response.json({
      success: true,
      categorization: result.object,
    })
  } catch (error) {
    console.error("Categorization error:", error)
    return Response.json(
      {
        error: "Failed to categorize activity",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
