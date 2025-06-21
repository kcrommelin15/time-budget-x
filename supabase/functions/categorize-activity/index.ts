import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface Category {
  id: string
  name: string
  color: string
  subcategories?: Array<{
    id: string
    name: string
  }>
}

interface CategorizationRequest {
  description: string
  categories: Category[]
}

interface CategorizationResult {
  categoryId: string
  subcategoryId?: string
  confidence: number
  reasoning: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      throw new Error("No authorization header")
    }

    // Create Supabase client to verify the user
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: { Authorization: authHeader },
      },
    })

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    // Parse the request body
    const { description, categories }: CategorizationRequest = await req.json()

    if (!description || !categories || categories.length === 0) {
      throw new Error("Missing description or categories")
    }

    // Prepare the prompt for OpenAI
    const categoriesText = categories
      .map((cat) => {
        const subcatsText =
          cat.subcategories && cat.subcategories.length > 0
            ? ` (subcategories: ${cat.subcategories.map((sub) => sub.name).join(", ")})`
            : ""
        return `- ${cat.name}${subcatsText}`
      })
      .join("\n")

    const prompt = `You are a time tracking categorization assistant. Given a user's activity description, categorize it into one of their existing categories.

User's Categories:
${categoriesText}

Activity Description: "${description}"

Analyze this activity and respond with a JSON object containing:
- categoryId: the ID of the best matching category
- subcategoryId: the ID of the best matching subcategory (if applicable, otherwise null)
- confidence: a number between 0 and 1 indicating how confident you are in this categorization
- reasoning: a brief explanation of why you chose this category

Consider:
- The semantic meaning of the activity
- Common time tracking patterns
- Context clues in the description
- Be conservative with confidence scores - only use high confidence (>0.8) for very clear matches

Respond only with valid JSON.`

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Using the more cost-effective model
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant that categorizes activities for time tracking. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more consistent results
        max_tokens: 300,
      }),
    })

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text()
      console.error("OpenAI API error:", errorText)
      throw new Error(`OpenAI API error: ${openaiResponse.status}`)
    }

    const openaiData = await openaiResponse.json()
    const aiResponse = openaiData.choices[0]?.message?.content

    if (!aiResponse) {
      throw new Error("No response from OpenAI")
    }

    // Parse the AI response
    let result: CategorizationResult
    try {
      result = JSON.parse(aiResponse)
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiResponse)
      // Fallback to first category with low confidence
      result = {
        categoryId: categories[0].id,
        confidence: 0.1,
        reasoning: "AI response parsing failed, defaulted to first category",
      }
    }

    // Validate that the suggested category exists
    const suggestedCategory = categories.find((cat) => cat.id === result.categoryId)
    if (!suggestedCategory) {
      result = {
        categoryId: categories[0].id,
        confidence: 0.1,
        reasoning: "Suggested category not found, defaulted to first category",
      }
    }

    // Validate subcategory if provided
    if (result.subcategoryId && suggestedCategory) {
      const subcategoryExists = suggestedCategory.subcategories?.some((sub) => sub.id === result.subcategoryId)
      if (!subcategoryExists) {
        result.subcategoryId = undefined
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Edge function error:", error)

    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
        categoryId: "",
        confidence: 0,
        reasoning: "Categorization service error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    )
  }
})
