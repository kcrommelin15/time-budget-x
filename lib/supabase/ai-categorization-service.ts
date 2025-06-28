interface CategorizationResult {
  category: string
  sub_category: string | null
  confidence_score: number
  activity_description: string
}

export class AICategorization {
  static async categorizeActivity(activityDescription: string): Promise<CategorizationResult | null> {
    console.log('🚀 Frontend: Calling AI categorization for:', activityDescription)
    
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

      console.log('📥 Frontend: API response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Frontend: AI categorization failed:', error)
        return null
      }

      const result = await response.json()
      console.log('✅ Frontend: AI categorization result:', result)
      
      if (result.success && result.categorization) {
        return {
          category: result.categorization.category,
          sub_category: result.categorization.sub_category || null,
          confidence_score: result.categorization.confidence_score || 0,
          activity_description: result.categorization.activity_description
        }
      }

      console.warn('⚠️ Frontend: Unexpected result format:', result)
      return null
    } catch (error) {
      console.error('❌ Frontend: Error calling AI categorization:', error)
      return null
    }
  }
}