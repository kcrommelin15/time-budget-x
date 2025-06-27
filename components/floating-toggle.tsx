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
      <div className="glass-effect rounded-2xl smooth-shadow-lg p-1.5 flex gap-1">
        <Button
          variant={activeScreen === "budget" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("budget")}
          className={`rounded-xl transition-all duration-300 font-medium ${
            activeScreen === "budget" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Budget
        </Button>

        <Button
          variant={activeScreen === "timeline" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("timeline")}
          className={`rounded-xl transition-all duration-300 font-medium ${
            activeScreen === "timeline" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Timeline
        </Button>

        <Button
          variant={activeScreen === "insights" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("insights")}
          className={`rounded-xl transition-all duration-300 font-medium ${
            activeScreen === "insights" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Insights
        </Button>

        <Button
          variant={activeScreen === "settings" ? "default" : "ghost"}
          size="sm"
          onClick={() => onScreenChange("settings")}
          className={`rounded-xl transition-all duration-300 font-medium ${
            activeScreen === "settings" 
              ? "bg-primary text-primary-foreground shadow-lg scale-105" 
              : "hover:bg-accent/60 text-muted-foreground hover:text-foreground hover:scale-105"
          }`}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  )
}
