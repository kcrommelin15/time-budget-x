"use client"

import { Calendar, BarChart3, Settings, PieChart } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FloatingToggleProps {
  activeScreen: "budget" | "timeline" | "insights" | "settings"
  onScreenChange: (screen: "budget" | "timeline" | "insights" | "settings") => void
}

export default function FloatingToggle({ activeScreen, onScreenChange }: FloatingToggleProps) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-2 flex gap-2">
        <Button
          variant={activeScreen === "budget" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("budget")}
          className={`rounded-2xl transition-all duration-200 ${
            activeScreen === "budget" ? "bg-gray-900 text-white shadow-lg" : "hover:bg-white/60 text-gray-600"
          }`}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Budget
        </Button>

        <Button
          variant={activeScreen === "timeline" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("timeline")}
          className={`rounded-2xl transition-all duration-200 ${
            activeScreen === "timeline" ? "bg-gray-900 text-white shadow-lg" : "hover:bg-white/60 text-gray-600"
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Timeline
        </Button>

        <Button
          variant={activeScreen === "insights" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("insights")}
          className={`rounded-2xl transition-all duration-200 ${
            activeScreen === "insights" ? "bg-gray-900 text-white shadow-lg" : "hover:bg-white/60 text-gray-600"
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Insights
        </Button>

        <Button
          variant={activeScreen === "settings" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("settings")}
          className={`rounded-2xl transition-all duration-200 ${
            activeScreen === "settings" ? "bg-gray-900 text-white shadow-lg" : "hover:bg-white/60 text-gray-600"
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
