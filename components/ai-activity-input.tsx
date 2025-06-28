"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AICategorization } from "@/lib/supabase/ai-categorization-service"
import { TimeEntriesService } from "@/lib/supabase/time-entries-service"
import { DataService } from "@/lib/supabase/data-service"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AIActivityInput() {
  const [activityText, setActivityText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activityText.trim()) {
      toast({
        title: "Error",
        description: "Please enter an activity description",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    
    try {
      // Call AI categorization
      const categorization = await AICategorization.categorizeActivity(activityText)
      
      if (!categorization) {
        toast({
          title: "Error",
          description: "Failed to categorize activity. Please try again.",
          variant: "destructive"
        })
        return
      }

      // Get all user categories to find the matching category ID
      const categories = await DataService.getCategories()
      const matchingCategory = categories.find(
        cat => cat.name.toLowerCase() === categorization.category.toLowerCase()
      )

      if (!matchingCategory) {
        toast({
          title: "Category Not Found",
          description: `No category found matching "${categorization.category}". Please create this category first.`,
          variant: "destructive"
        })
        return
      }

      // Create time entry with AI categorization
      const now = new Date()
      const startTime = new Date(now.getTime() - 30 * 60 * 1000) // Assume 30 min activity
      
      const timeEntry = await TimeEntriesService.createTimeEntry({
        categoryId: matchingCategory.id,
        categoryName: matchingCategory.name,
        categoryColor: matchingCategory.color,
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: now.toTimeString().slice(0, 5),
        description: categorization.category + (categorization.sub_category ? ` - ${categorization.sub_category}` : ''),
        date: now.toISOString().split('T')[0],
        status: "confirmed",
        subcategory: categorization.sub_category || undefined,
        source: "ai_categorized",
        approved: true,
        confidenceScore: categorization.confidence_score,
        aiCategorized: true,
        activityDescription: categorization.activity_description
      })

      setLastResult({
        category: categorization.category,
        subCategory: categorization.sub_category,
        confidence: categorization.confidence_score,
        entryId: timeEntry.id
      })

      // Update category time usage
      await DataService.updateCategoryTimeUsage()

      toast({
        title: "Activity Categorized!",
        description: `Added to ${categorization.category}${categorization.sub_category ? ` > ${categorization.sub_category}` : ''} (${Math.round(categorization.confidence_score * 100)}% confidence)`,
      })

      setActivityText("")
      
    } catch (error) {
      console.error('Error processing activity:', error)
      toast({
        title: "Error",
        description: "Failed to process activity. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AI Activity Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              value={activityText}
              onChange={(e) => setActivityText(e.target.value)}
              placeholder="What are you working on? (e.g., 'Writing code for the new dashboard feature')"
              disabled={isProcessing}
              className="text-base"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isProcessing || !activityText.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Categorizing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Categorize & Track
              </>
            )}
          </Button>
        </form>

        {lastResult && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm">
              <span className="font-medium">Last activity:</span> {lastResult.category}
              {lastResult.subCategory && <span> → {lastResult.subCategory}</span>}
              <span className="text-green-600 ml-2">
                ({Math.round(lastResult.confidence * 100)}% confidence)
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}