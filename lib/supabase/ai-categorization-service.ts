interface TimeEntry {
  id: string
  activity_description: string
  category: string | null
  confidence_score: number | null
  ai_categorized: boolean
}

interface CategorizationParams {
  activity_description: string
  category_id?: string | null
  start_time?: string
  end_time?: string | null
}

export class AICategorization {
  static async categorizeAndCreateEntry(params: CategorizationParams): Promise<TimeEntry | null> {
    console.log('🚀 Frontend: Calling AI categorization and entry creation for:', params.activity_description)
    
    try {
      const response = await fetch('/api/activity-categorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      console.log('📥 Frontend: API response status:', response.status)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ Frontend: AI categorization failed:', error)
        return null
      }

      const result = await response.json()
      console.log('✅ Frontend: AI categorization result:', result)
      
      if (result.success && result.entry) {
        return {
          id: result.entry.id,
          activity_description: result.entry.activity_description,
          category: result.entry.category,
          confidence_score: result.entry.confidence_score,
          ai_categorized: result.entry.ai_categorized
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