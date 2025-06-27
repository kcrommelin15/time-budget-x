"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockCategories } from "@/lib/mock-data"
import { createClient } from "@/lib/supabase/client"

interface EnhancedBottomTrackingWidgetProps {
  onAddEntry: (entry: any) => void
  isDesktop?: boolean
}

interface CategorizationResult {
  categoryId: string
  categoryName: string
  subcategory?: string
  confidence: number
}

export default function EnhancedBottomTrackingWidget({ 
  onAddEntry, 
  isDesktop = false 
}: EnhancedBottomTrackingWidgetProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [description, setDescription] = useState("")
  const [isAutoCategorizationEnabled, setIsAutoCategorizationEnabled] = useState(true)
  const [isCategorizingLoading, setIsCategorizingLoading] = useState(false)
  const [autoCategorization, setAutoCategorization] = useState<CategorizationResult | null>(null)
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null)
  const [canSave, setCanSave] = useState(false)
  
  const supabase = createClient()

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

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && description.trim() && isAutoCategorizationEnabled) {
      await performAutoCategorization(description)
    }
  }

  const performAutoCategorization = async (desc: string) => {
    setIsCategorizingLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.warn('No session found for auto-categorization')
        return
      }

      const response = await fetch('/api/supabase/functions/categorize-activity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          description: desc,
          userId: session.user.id,
        }),
      })

      if (response.ok) {
        const result: CategorizationResult = await response.json()
        setAutoCategorization(result)
        
        // Always auto-select the highest confidence category
        setSelectedCategory(result.categoryId)
      } else {
        console.error('Auto-categorization failed:', response.statusText)
      }
    } catch (error) {
      console.error('Auto-categorization failed:', error)
    } finally {
      setIsCategorizingLoading(false)
    }
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const startTracking = async () => {
    if (!selectedCategory && !description) return
    
    const now = new Date()
    setStartTime(now)
    setIsTracking(true)
    setIsPaused(false)
    setElapsedTime(0)
    setCanSave(false)

    // Start 10-second validation timer
    const timeout = setTimeout(() => {
      setCanSave(true)
    }, 10000)
    setValidationTimeout(timeout)

    // If no category is selected but we have auto-categorization, use it
    if (!selectedCategory && autoCategorization) {
      setSelectedCategory(autoCategorization.categoryId)
    }
  }

  const pauseTracking = () => {
    setIsPaused(!isPaused)
  }

  const stopTracking = () => {
    // Don't save if less than 10 seconds have passed
    if (!canSave) {
      setIsTracking(false)
      setIsPaused(false)
      setStartTime(null)
      setElapsedTime(0)
      setDescription("")
      setSelectedCategory("")
      setAutoCategorization(null)
      
      if (validationTimeout) {
        clearTimeout(validationTimeout)
        setValidationTimeout(null)
      }
      return
    }

    if (startTime) {
      const endTime = new Date()
      let category = mockCategories.find((c) => c.id === selectedCategory)

      // Use auto-categorization if no manual category selected
      if (!category && autoCategorization) {
        category = mockCategories.find((c) => c.id === autoCategorization.categoryId)
      }

      if (!category && description) {
        category = mockCategories[0]
      }

      if (category) {
        onAddEntry({
          categoryId: category.id,
          categoryName: category.name,
          categoryColor: category.color,
          startTime: startTime.toTimeString().slice(0, 5),
          endTime: endTime.toTimeString().slice(0, 5),
          description: description || `${category.name} session`,
          subcategory: autoCategorization?.subcategory,
          date: new Date().toISOString().split("T")[0],
        })
      }
    }

    // Clear validation timeout
    if (validationTimeout) {
      clearTimeout(validationTimeout)
      setValidationTimeout(null)
    }

    setIsTracking(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setDescription("")
    setSelectedCategory("")
    setAutoCategorization(null)
    setCanSave(false)
  }

  const categoryChips = [
    { id: "1", name: "Work", color: "#2B93FA" },
    { id: "2", name: "Meeting", color: "#13B078" },
    { id: "4", name: "Study", color: "#6C63FF" },
    { id: "3", name: "Workout", color: "#EB8C5E" },
  ]

  if (isTracking) {
    const selectedCat = mockCategories.find((c) => c.id === selectedCategory)

    return (
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 ${
          isDesktop ? "max-w-4xl w-full" : "max-w-md w-full"
        } ${canSave ? 'bg-green-100/80' : 'bg-yellow-100/80'} backdrop-blur-xl border ${canSave ? 'border-green-200/50' : 'border-yellow-200/50'} rounded-t-3xl p-6 shadow-2xl`}
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${canSave ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className={`text-sm font-medium ${canSave ? 'text-green-700' : 'text-yellow-700'}`}>
              {isPaused ? "Paused" : canSave ? "Tracking" : "Starting..."}
            </span>
            {!canSave && (
              <span className="text-xs text-yellow-600">
                (10s minimum)
              </span>
            )}
          </div>

          {selectedCat && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: selectedCat.color }}></div>
              <span className="font-semibold text-gray-900">{selectedCat.name}</span>
              {autoCategorization?.subcategory && (
                <span className="text-sm text-gray-600">• {autoCategorization.subcategory}</span>
              )}
            </div>
          )}

          {description && <p className="text-sm text-gray-600 mb-2">"{description}"</p>}

          <div className="text-3xl font-bold text-gray-900 font-mono">{formatTime(elapsedTime)}</div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={pauseTracking}
            variant="outline"
            className="flex-1 rounded-2xl h-12 bg-white/60 backdrop-blur-sm border-white/30 hover:bg-white/80"
          >
            {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
            {isPaused ? "Resume" : "Pause"}
          </Button>

          <Button
            onClick={stopTracking}
            className={`flex-1 rounded-2xl h-12 ${canSave ? 'bg-red-500/90 hover:bg-red-600/90' : 'bg-gray-400/90 cursor-not-allowed'} backdrop-blur-sm shadow-lg`}
            disabled={!canSave}
          >
            <Square className="w-4 h-4 mr-2" />
            Stop
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-40 ${
        isDesktop ? "max-w-4xl w-full" : "max-w-md w-full"
      } bg-white/80 backdrop-blur-xl border-t border-white/30 rounded-t-3xl p-6 shadow-2xl`}
    >
      <div className="space-y-4">
        <div className="relative">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What are you working on? (Press Enter to categorize)"
            className="w-full h-12 rounded-2xl text-center text-lg border-white/30 bg-white/60 backdrop-blur-sm focus:border-blue-400/50 shadow-lg pr-12"
          />
          
          {/* Auto-categorization indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            {isCategorizingLoading && (
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAutoCategorizationEnabled(!isAutoCategorizationEnabled)}
              className={`p-1 h-auto rounded-full ${isAutoCategorizationEnabled ? 'text-blue-500' : 'text-gray-400'}`}
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Auto-categorization result */}
        {autoCategorization && isAutoCategorizationEnabled && (
          <div className="bg-green-50/80 border border-green-200 rounded-xl p-3">
            <div className="flex items-center gap-2 text-sm">
              <Sparkles className="w-4 h-4 text-green-500" />
              <span className="font-medium text-green-700">
                Auto-categorized as: {autoCategorization.categoryName}
                {autoCategorization.subcategory && ` • ${autoCategorization.subcategory}`}
              </span>
              <span className="text-green-500 text-xs">
                ({Math.round(autoCategorization.confidence * 100)}% confident)
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 justify-center">
          {categoryChips.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(selectedCategory === category.id ? "" : category.id)}
              className={`rounded-2xl px-4 py-2 backdrop-blur-sm transition-all duration-200 ${
                selectedCategory === category.id
                  ? "text-white shadow-lg"
                  : "border-white/30 bg-white/40 hover:bg-white/60"
              }`}
              style={
                selectedCategory === category.id
                  ? { backgroundColor: category.color }
                  : { borderColor: `${category.color}40`, color: category.color }
              }
            >
              {category.name}
            </Button>
          ))}
        </div>

        <Button
          onClick={startTracking}
          disabled={!selectedCategory && !description}
          className="w-full h-14 rounded-2xl bg-black/90 hover:bg-black text-white text-lg font-medium backdrop-blur-sm shadow-xl transition-all duration-200"
        >
          <Play className="w-5 h-5 mr-2" />
          Start tracking
        </Button>
      </div>
    </div>
  )
}