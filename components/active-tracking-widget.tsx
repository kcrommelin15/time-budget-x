"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mockCategories } from "@/lib/mock-data"

interface ActiveTrackingWidgetProps {
  onAddEntry: (entry: any) => void
}

export default function ActiveTrackingWidget({ onAddEntry }: ActiveTrackingWidgetProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [description, setDescription] = useState("")

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
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}:${(minutes % 60).toString().padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`
    }
    return `${minutes}:${(seconds % 60).toString().padStart(2, "0")}`
  }

  const startTracking = () => {
    if (!selectedCategory) return
    setStartTime(new Date())
    setIsTracking(true)
    setIsPaused(false)
    setElapsedTime(0)
  }

  const pauseTracking = () => {
    setIsPaused(!isPaused)
  }

  const stopTracking = () => {
    if (startTime && selectedCategory) {
      const endTime = new Date()
      const category = mockCategories.find((c) => c.id === selectedCategory)

      if (category) {
        onAddEntry({
          categoryId: selectedCategory,
          categoryName: category.name,
          categoryColor: category.color,
          startTime: startTime.toTimeString().slice(0, 5),
          endTime: endTime.toTimeString().slice(0, 5),
          description: description || `${category.name} session`,
          date: new Date().toISOString().split("T")[0],
        })
      }
    }

    setIsTracking(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setDescription("")
  }

  if (!isTracking) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-6 border border-blue-100 mb-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Start Tracking</h3>
          <p className="text-sm text-gray-600">What are you working on?</p>
        </div>

        <div className="space-y-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="rounded-2xl">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {mockCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                    {category.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={startTracking}
            disabled={!selectedCategory}
            className="w-full h-12 rounded-2xl bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Tracking
          </Button>
        </div>
      </div>
    )
  }

  const selectedCat = mockCategories.find((c) => c.id === selectedCategory)

  return (
    <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-3xl p-6 border border-green-200 mb-6">
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full animate-pulse bg-green-500"></div>
          <span className="text-sm font-medium text-green-700">{isPaused ? "Paused" : "Tracking"}</span>
        </div>

        {selectedCat && (
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedCat.color }}></div>
            <span className="font-semibold text-gray-900">{selectedCat.name}</span>
          </div>
        )}

        <div className="text-3xl font-bold text-gray-900 font-mono">{formatTime(elapsedTime)}</div>
      </div>

      <div className="flex gap-2">
        <Button onClick={pauseTracking} variant="outline" className="flex-1 rounded-2xl">
          {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
          {isPaused ? "Resume" : "Pause"}
        </Button>

        <Button
          onClick={stopTracking}
          className="flex-1 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Square className="w-4 h-4 mr-2" />
          Stop
        </Button>
      </div>
    </div>
  )
}
