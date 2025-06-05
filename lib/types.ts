export interface Category {
  id: string
  name: string
  weeklyBudget: number
  timeUsed: number
  color: string
  goalDirection?: "more_is_better" | "less_is_better" // Added goal direction for categories
  subcategories?: Subcategory[]
}

export interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  goalDirection?: "more_is_better" | "less_is_better" // Simplified - removed target_range
  goalConfig?: {
    targetMin?: number
    targetMax?: number
    threshold?: number
  }
  isFixed?: boolean
}

export interface TimeEntry {
  id: string
  categoryId: string
  categoryName: string
  categoryColor: string
  startTime: string
  endTime: string
  description: string
  date: string
  status?: "confirmed" | "pending"
  subcategory?: string
  notes?: string
  source?: string // Where this was recorded (Slack, Trello, Manual, etc.)
  approved?: boolean
}
