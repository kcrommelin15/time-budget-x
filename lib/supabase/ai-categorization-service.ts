interface CategorizationResult {
  category: string
  sub_category: string | null
  confidence_score: number
  activity_description: string
}

export class AICategorization {
  static async categorizeActivity(activityDescription: string): Promise<CategorizationResult | null> {
    try {
      const response = await fetch('/api/activity-categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activity_description: activityDescription
        })
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('AI categorization failed:', error)
        return null
      }

      const result = await response.json()
      
      if (result.success && result.categorization) {
        return {
          category: result.categorization.category,
          sub_category: result.categorization.sub_category || null,
          confidence_score: result.categorization.confidence_score || 0,
          activity_description: result.categorization.activity_description
        }
      }

      return null
    } catch (error) {
      console.error('Error calling AI categorization:', error)
      return null
    }
  }
}