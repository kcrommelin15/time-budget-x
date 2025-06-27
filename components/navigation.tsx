"use client"

import { Calendar, PieChart, BarChart3, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NavigationProps {
  activeScreen: "budget" | "timeline" | "insights" | "settings"
  onScreenChange: (screen: "budget" | "timeline" | "insights" | "settings") => void
}

export default function Navigation({ activeScreen, onScreenChange }: NavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-border/20 rounded-t-2xl smooth-shadow-lg">
      <div className="max-w-md mx-auto flex">
        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-none transition-all duration-300 ${
            activeScreen === "budget" 
              ? "text-primary bg-primary/10 scale-105" 
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
          }`}
          onClick={() => onScreenChange("budget")}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-xs font-medium">Budget</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-none transition-all duration-300 ${
            activeScreen === "timeline" 
              ? "text-primary bg-primary/10 scale-105" 
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
          }`}
          onClick={() => onScreenChange("timeline")}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-xs font-medium">Timeline</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-none transition-all duration-300 ${
            activeScreen === "insights" 
              ? "text-primary bg-primary/10 scale-105" 
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
          }`}
          onClick={() => onScreenChange("insights")}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-xs font-medium">Insights</span>
        </Button>

        <Button
          variant="ghost"
          className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-none transition-all duration-300 ${
            activeScreen === "settings" 
              ? "text-primary bg-primary/10 scale-105" 
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground hover:scale-105"
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
