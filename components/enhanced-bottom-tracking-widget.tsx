"use client"

import { useState } from "react"
import { Play, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TimeEntriesService } from "@/lib/supabase/time-entries-service"
import type { Category } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface EnhancedBottomTrackingWidgetProps {
  onAddEntry: (entry: any) => void
  isDesktop?: boolean
  user?: User | null
  categories: Category[]
}

export default function EnhancedBottomTrackingWidget({
  onAddEntry,
  isDesktop = false,
  user = null,
  categories,
}: EnhancedBottomTrackingWidgetProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [description, setDescription] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const validateAndStartTracking = async () => {
    if (!description.trim()) {
      setValidationError("Please enter an activity description")
      return
    }

    if (user && categories.length > 0) {
      setIsValidating(true)
      setValidationError(null)

      try {
        const validation = await TimeEntriesService.validateActivity(description.trim())

        if (!validation.isValid) {
          setValidationError(validation.error || "Invalid activity")
          setIsValidating(false)
          return
        }

        // Set the validated category
        setSelectedCategory(validation.categoryId || "")

        // Start tracking
        setStartTime(new Date())
        setIsTracking(true)
        setIsPaused(false)
        setElapsedTime(0)
        setValidationError(null)
      } catch (err) {
        setValidationError("Error validating activity. Please try again.")
        console.error("Validation error:", err)
      } finally {
        setIsValidating(false)
      }
    } else {
      // For non-authenticated users or no categories, just start tracking
      setStartTime(new Date())
      setIsTracking(true)
      setIsPaused(false)
      setElapsedTime(0)
      setValidationError(null)
    }
  }

  const stopTracking = async () => {
    if (startTime) {
      const endTime = new Date()

      // Find the category (either selected or validated)
      let category = categories.find((c) => c.id === selectedCategory)

      if (!category && categories.length > 0) {
        category = categories[0] // Fallback to first category
      }

      if (category) {
        try {
          await onAddEntry({
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            startTime: startTime.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            description: description || `${category.name} session`,
            date: new Date().toISOString().split("T")[0],
            source: "tracking_widget",
            status: "confirmed",
          })
        } catch (err) {
          console.error("Error saving time entry:", err)
          // Still reset the widget even if save fails
        }
      }
    }

    // Reset widget state
    setIsTracking(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setDescription("")
    setSelectedCategory("")
    setValidationError(null)
  }

  const categoryChips = categories.slice(0, 4).map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
  }))

  return (
    <>
      <Button
        onClick={validateAndStartTracking}
        disabled={!description.trim() || isValidating}
        className="w-full h-14 rounded-2xl bg-black/90 hover:bg-black text-white text-lg font-medium backdrop-blur-sm shadow-xl transition-all duration-200 disabled:opacity-50"
      >
        {isValidating ? (
          <>
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Validating...
          </>
        ) : (
          <>
            <Play className="w-5 h-5 mr-2" />
            Start tracking
          </>
        )}
      </Button>

      {validationError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {categories.length === 0 && user && (
        <div className="text-center p-3 bg-yellow-50 border border-yellow-200 rounded-2xl text-yellow-700 text-sm">
          Create some categories first in the Budget screen to start tracking time.
        </div>
      )}
    </>
  )
}
