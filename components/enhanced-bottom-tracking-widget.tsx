"use client"

import { useState, useEffect } from "react"
import { PlayIcon, PauseIcon, StopIcon } from "@heroicons/react/24/solid"
import { Chip } from "@nextui-org/react"
import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"

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
  const [description, setDescription] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const { categories } = useCategories(user)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    let intervalId: NodeJS.Timeout

    if (isTracking && !isPaused) {
      if (!startTime) {
        setStartTime(new Date())
      }

      intervalId = setInterval(() => {
        setElapsedTime((prevElapsedTime) => prevElapsedTime + 1000)
      }, 1000)
    }

    return () => clearInterval(intervalId)
  }, [isTracking, isPaused, startTime])

  const startTracking = () => {
    setIsTracking(true)
    setIsPaused(false)
    setValidationError(null)
  }

  const pauseTracking = () => {
    setIsPaused(true)
  }

  const resumeTracking = () => {
    setIsPaused(false)
  }

  const stopTracking = async () => {
    if (startTime) {
      setValidationError(null)

      let category = categories.find((c) => c.id === selectedCategory)

      // If no category selected but description provided, show error
      if (!category && description) {
        setValidationError("Please select a category for this activity")
        return
      }

      if (!category && !description) {
        setValidationError("Please select a category or enter a description")
        return
      }

      // If category not found, show error
      if (selectedCategory && !category) {
        setValidationError("Selected category is not valid")
        return
      }

      // Use first category as fallback only for mock users
      if (!category && !user) {
        category = categories[0]
      }

      if (category) {
        try {
          const endTime = new Date()
          await onAddEntry({
            categoryId: category.id,
            categoryName: category.name,
            categoryColor: category.color,
            startTime: startTime.toTimeString().slice(0, 5),
            endTime: endTime.toTimeString().slice(0, 5),
            description: description || `${category.name} session`,
            date: new Date().toISOString().split("T")[0],
          })

          setIsTracking(false)
          setIsPaused(false)
          setStartTime(null)
          setElapsedTime(0)
          setDescription("")
          setSelectedCategory("")
          setValidationError(null)
        } catch (error) {
          setValidationError(error instanceof Error ? error.message : "Failed to save time entry")
        }
      }
    }
  }

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  const categoryChips = categories.slice(0, 4).map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: cat.color,
  }))

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50">
      <div className="max-w-4xl mx-auto flex flex-col gap-2">
        {validationError && <div className="text-sm text-red-500 mb-2 p-2 bg-red-50 rounded-lg">{validationError}</div>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {isTracking ? (
              isPaused ? (
                <button onClick={resumeTracking} className="p-2 rounded-full bg-green-500 text-white">
                  <PlayIcon className="h-5 w-5" />
                </button>
              ) : (
                <button onClick={pauseTracking} className="p-2 rounded-full bg-yellow-500 text-white">
                  <PauseIcon className="h-5 w-5" />
                </button>
              )
            ) : (
              <button onClick={startTracking} className="p-2 rounded-full bg-blue-500 text-white">
                <PlayIcon className="h-5 w-5" />
              </button>
            )}
            {isTracking && (
              <button onClick={stopTracking} className="p-2 rounded-full bg-red-500 text-white">
                <StopIcon className="h-5 w-5" />
              </button>
            )}
            {isTracking && <div className="text-lg font-medium">{formatTime(elapsedTime)}</div>}
          </div>
        </div>

        {isTracking && (
          <>
            <div className="flex flex-wrap gap-2">
              {categoryChips.map((category) => (
                <Chip
                  key={category.id}
                  color="primary"
                  variant={selectedCategory === category.id ? "shadow" : "flat"}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Chip>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add a description"
              className="w-full p-2 border rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </>
        )}
      </div>
    </div>
  )
}
