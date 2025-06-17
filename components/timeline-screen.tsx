"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import type { User } from "@supabase/supabase-js"

interface TimelineScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function TimelineScreen({ isDesktop = false, user }: TimelineScreenProps) {
  const [selectedDate] = useState(new Date())

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please sign in to view your timeline</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{formatDate(selectedDate)}</h1>
            <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Add</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-2">
          {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22].map((hour) => (
            <div key={hour} className="flex items-center gap-4 min-h-[60px]">
              <div className="w-16 text-sm font-mono text-gray-500">{hour.toString().padStart(2, "0")}:00</div>
              <div className="flex-1">
                <div className="border-l-2 border-gray-200 hover:border-gray-400 cursor-pointer transition-all duration-200 rounded-r-lg hover:bg-gray-50 flex items-center pl-4 h-12">
                  <span className="text-gray-400 text-sm opacity-0 hover:opacity-100 transition-opacity">
                    + Add entry
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="sticky bottom-0 z-30 bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="What are you working on?"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Start</button>
        </div>
      </div>
    </div>
  )
}
