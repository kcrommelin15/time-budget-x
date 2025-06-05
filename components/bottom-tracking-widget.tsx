"use client"

import { useState, useEffect } from "react"
import { Play, Pause, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { mockCategories } from "@/lib/mock-data"

interface BottomTrackingWidgetProps {
  onAddEntry: (entry: any) => void
  isDesktop?: boolean
}

export default function BottomTrackingWidget({ onAddEntry, isDesktop = false }: BottomTrackingWidgetProps) {
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
    if (!selectedCategory && !description) return
    setStartTime(new Date())
    setIsTracking(true)
    setIsPaused(false)
    setElapsedTime(0)
  }

  const pauseTracking = () => {
    setIsPaused(!isPaused)
  }

  const stopTracking = () => {
    if (startTime) {
      const endTime = new Date()
      let category = mockCategories.find((c) => c.id === selectedCategory)

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
          date: new Date().toISOString().split("T")[0],
        })
      }
    }

    setIsTracking(false)
    setIsPaused(false)
    setStartTime(null)
    setElapsedTime(0)
    setDescription("")
    setSelectedCategory("")
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
        } bg-green-100/80 backdrop-blur-xl border border-green-200/50 rounded-t-3xl p-6 shadow-2xl`}
      >
        <div className="text-center mb-4">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full animate-pulse bg-green-500 shadow-lg"></div>
            <span className="text-sm font-medium text-green-700">{isPaused ? "Paused" : "Tracking"}</span>
          </div>

          {selectedCat && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: selectedCat.color }}></div>
              <span className="font-semibold text-gray-900">{selectedCat.name}</span>
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
            className="flex-1 rounded-2xl h-12 bg-red-500/90 hover:bg-red-600/90 backdrop-blur-sm shadow-lg"
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
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full h-12 rounded-2xl text-center text-lg border-white/30 bg-white/60 backdrop-blur-sm focus:border-blue-400/50 shadow-lg"
        />

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
