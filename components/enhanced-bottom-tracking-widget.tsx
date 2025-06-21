"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, Briefcase, Edit3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCategoriesQuery } from "@/hooks/use-categories-query"
import type { User } from "@supabase/supabase-js"
import { AICategorization } from "@/lib/supabase/ai-categorization-service"

interface EnhancedBottomTrackingWidgetProps {
  onAddEntry: (entry: any) => Promise<void>
  isDesktop?: boolean
  user?: User | null
}

export default function EnhancedBottomTrackingWidget({
  onAddEntry,
  isDesktop = false,
  user,
}: EnhancedBottomTrackingWidgetProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isCategorizingAI, setIsCategorizingAI] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState<any>(null)

  // Use the React Query hook instead of the old hook
  const { categories, loading: categoriesLoading } = useCategoriesQuery(user)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTracking && !isPaused && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime())
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTracking, isPaused, startTime])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    // Always round up to the nearest minute (minimum 1 minute)
    const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60))
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const startTracking = () => {
    if (!selectedCategory && !description) return
    setStartTime(new Date())
    setIsTracking(true)
    setIsPaused(false)
    setElapsedTime(0)
  }

  const pauseTracking = () => {
    setIsPaused(!isPaused)
  }

  const stopTracking = async () => {
    if (startTime) {
      const endTime = new Date()
      let category = categories.find((c) => c.id === selectedCategory)

      if (!category && description) {
        category = categories[0]
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
          })
        } catch (error) {
          console.error("Failed to save time entry:", error)
        }
      }
    }

    setIsTracking(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setDescription("")
    setSelectedCategory("")
  }

  const handleDescriptionChange = async (value: string) => {
    setDescription(value)

    // Trigger AI categorization if description is long enough and no category is selected
    if (value.length > 10 && !selectedCategory && !isCategorizingAI && categories.length > 0) {
      setIsCategorizingAI(true)
      try {
        const suggestion = await AICategorization.categorizeActivity(value, categories)
        if (suggestion.confidence > 0.6) {
          // Only auto-select if confidence is reasonably high
          setSelectedCategory(suggestion.categoryId)
          setAiSuggestion(suggestion)
          console.log("AI suggestion:", suggestion.reasoning)
        }
      } catch (error) {
        console.error("AI categorization failed:", error)
      } finally {
        setIsCategorizingAI(false)
      }
    }
  }

  // Only show category chips when we have real data (not loading and categories exist)
  const shouldShowCategories = !categoriesLoading && categories.length > 0

  // Map user's categories to the chip format, or use empty array if not ready
  const categoryChips = shouldShowCategories
    ? categories.slice(0, 4).map((cat) => ({
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: Briefcase, // Default icon
      }))
    : []

  if (isTracking) {
    const selectedCat =
      categories.find((c) => c.id === selectedCategory) || categoryChips.find((c) => c.id === selectedCategory)

    return (
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 ${
          isDesktop ? "max-w-4xl w-full" : "max-w-md w-full"
        } bg-white rounded-t-3xl shadow-2xl overflow-hidden`}
      >
        {/* Gradient Header */}
        <div className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-6 relative overflow-hidden">
          {/* Animated shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>

          <div className="relative z-10">
            {/* Status indicator */}
            {/* Time and Activity on same line */}
            <div className="flex items-center justify-center gap-4 mb-3">
              {/* Timer */}
              <div className="text-3xl font-mono font-bold text-white bg-black/30 rounded-2xl px-4 py-2 backdrop-blur-sm border border-white/20">
                {formatTime(elapsedTime)}
              </div>

              {/* Activity with prominent color */}
              {selectedCat && (
                <div className="flex items-center gap-3 bg-black/30 rounded-2xl px-4 py-2 backdrop-blur-sm border border-white/20">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
                    style={{ backgroundColor: selectedCat.color }}
                  ></div>
                  <span className="font-bold text-lg text-white">{selectedCat.name}</span>
                </div>
              )}
            </div>

            {/* Description - now clearly editable */}
            <div className="relative">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                className="w-full text-sm text-white text-center bg-black/30 rounded-full px-4 py-2 backdrop-blur-sm border border-white/20 placeholder:text-white/70 focus:border-white/40 focus:bg-black/40 transition-all duration-200"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Edit3 className="w-4 h-4 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="p-6 space-y-4 bg-white">
          {/* Control Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={pauseTracking}
              variant="outline"
              className="flex-1 rounded-2xl h-14 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold"
            >
              {isPaused ? <Play className="w-5 h-5 mr-2" /> : <Pause className="w-5 h-5 mr-2" />}
              {isPaused ? "Resume" : "Pause"}
            </Button>

            <Button
              onClick={stopTracking}
              className="flex-1 rounded-2xl h-14 bg-gray-900 hover:bg-gray-800 text-white font-semibold shadow-lg"
            >
              <Square className="w-5 h-5 mr-2" />
              Stop
            </Button>
          </div>

          {/* Quick Category Switch - maintain consistent height */}
          <div className="pt-2">
            <p className="text-xs text-gray-500 text-center mb-3">Switch activity:</p>
            <div className="min-h-[40px] flex items-start justify-center">
              {shouldShowCategories && (
                <div className="flex gap-2">
                  {categoryChips.map((category) => {
                    const IconComponent = category.icon
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          if (selectedCategory !== category.id) {
                            // Stop current tracking and create entry
                            if (startTime) {
                              const endTime = new Date()
                              const currentCategory =
                                categories.find((c) => c.id === selectedCategory) ||
                                categoryChips.find((c) => c.id === selectedCategory)

                              if (currentCategory) {
                                onAddEntry({
                                  categoryId: selectedCategory,
                                  categoryName: currentCategory.name,
                                  categoryColor: currentCategory.color,
                                  startTime: startTime.toTimeString().slice(0, 5),
                                  endTime: endTime.toTimeString().slice(0, 5),
                                  description: description || `${currentCategory.name} session`,
                                  date: new Date().toISOString().split("T")[0],
                                }).catch(console.error)
                              }
                            }

                            // Start new tracking session
                            setSelectedCategory(category.id)
                            setStartTime(new Date())
                            setElapsedTime(0)
                            setIsPaused(false)
                          }
                        }}
                        className={`rounded-2xl px-3 py-2 transition-all duration-200 ${
                          selectedCategory === category.id
                            ? "text-white shadow-lg scale-105"
                            : "border-gray-200 bg-gray-50 hover:bg-white hover:scale-102"
                        }`}
                        style={
                          selectedCategory === category.id
                            ? { backgroundColor: category.color }
                            : { borderColor: `${category.color}40`, color: category.color }
                        }
                      >
                        <IconComponent className="w-4 h-4 mr-1" />
                        {category.name}
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 ${
        isDesktop ? "max-w-4xl w-full" : "max-w-md w-full"
      } bg-white/95 backdrop-blur-xl rounded-t-3xl shadow-2xl border-t border-gray-200`}
    >
      <div className="p-6 space-y-4">
        {/* Enhanced Category Chips - maintain consistent height */}
        <div className="min-h-[60px] flex items-start justify-center">
          {shouldShowCategories && (
            <div className="flex flex-wrap gap-3">
              {categoryChips.map((category) => {
                const IconComponent = category.icon
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
                    className={`rounded-2xl px-4 py-3 h-12 transition-all duration-200 ${
                      selectedCategory === category.id
                        ? "text-white shadow-lg scale-105"
                        : "border-gray-200 bg-gray-50 hover:bg-white hover:scale-102"
                    }`}
                    style={
                      selectedCategory === category.id
                        ? { backgroundColor: category.color }
                        : { borderColor: `${category.color}40`, color: category.color }
                    }
                  >
                    <IconComponent className="w-5 h-5 mr-2" />
                    <span className="font-medium">{category.name}</span>
                  </Button>
                )
              })}
            </div>
          )}
        </div>

        {/* Start Button */}
        <Button
          onClick={startTracking}
          disabled={!selectedCategory && !description}
          className="w-full h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className="w-6 h-6 mr-3" />
          Start
        </Button>

        {/* Text Input - moved to bottom */}
        <div className="relative">
          <Input
            value={description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Where is your time going right now?"
            className="w-full h-14 rounded-2xl text-center text-lg border-gray-200 bg-gray-50 focus:border-blue-400 shadow-sm placeholder:text-gray-400"
          />
          {isCategorizingAI && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
