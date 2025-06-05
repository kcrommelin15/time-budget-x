"use client"

import { Calendar, PieChart, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  activeScreen: "budget" | "timeline" | "insights" | "settings"
  onScreenChange: (screen: "budget" | "timeline" | "insights" | "settings") => void
}

export default function Navigation({ activeScreen, onScreenChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-200/60 rounded-t-3xl shadow-2xl">
      <div className="max-w-md mx-auto flex">
        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-none transition-all duration-200 ${
            activeScreen === "budget" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onScreenChange("budget")}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-xs font-medium">Budget</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-none transition-all duration-200 ${
            activeScreen === "timeline" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onScreenChange("timeline")}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">Timeline</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-none transition-all duration-200 ${
            activeScreen === "insights" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onScreenChange("insights")}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Insights</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1 py-4 rounded-none transition-all duration-200 ${
            activeScreen === "settings" ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"
          }`}
          onClick={() => onScreenChange("settings")}
        >
          <Settings className="w-5 h-5" />
          <span className="text-xs font-medium">Settings</span>
        </Button>
      </div>
    </div>
  )
}
