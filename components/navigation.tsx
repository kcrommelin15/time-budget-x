"use client"

import { Home, Calendar, BarChart3, Settings, Clock } from "lucide-react"

interface NavigationProps {
  activeScreen: "budget" | "timeline" | "insights" | "settings"
  onScreenChange: (screen: "budget" | "timeline" | "insights" | "settings") => void
}

export default function Navigation({ activeScreen, onScreenChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto flex">
        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            activeScreen === "budget" ? "text-black" : "text-gray-400"
          }`}
          onClick={() => onScreenChange("budget")}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>

        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            activeScreen === "budget" ? "text-black" : "text-gray-400"
          }`}
          onClick={() => onScreenChange("budget")}
        >
          <Calendar className="w-6 h-6" />
          <span className="text-xs">Budget</span>
        </button>

        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative ${
            activeScreen === "timeline" ? "text-black" : "text-gray-400"
          }`}
          onClick={() => onScreenChange("timeline")}
        >
          <Clock className="w-6 h-6" />
          <span className="text-xs">Timeline</span>
          {activeScreen === "timeline" && (
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-black rounded-full"></div>
          )}
        </button>

        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            activeScreen === "insights" ? "text-black" : "text-gray-400"
          }`}
          onClick={() => onScreenChange("insights")}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-xs">Insights</span>
        </button>

        <button
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
            activeScreen === "settings" ? "text-black" : "text-gray-400"
          }`}
          onClick={() => onScreenChange("settings")}
        >
          <Settings className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>
      </div>
    </div>
  )
}
