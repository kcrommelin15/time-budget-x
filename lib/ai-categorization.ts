// Client-side service for AI categorization
export class AICategorization {
  static async categorizeActivity(text: string) {
    try {
      const response = await fetch("/api/categorize-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Categorization failed")
      }

      return data.categorization
    } catch (error) {
      console.error("AI categorization error:", error)
      throw error
    }
  }
}
