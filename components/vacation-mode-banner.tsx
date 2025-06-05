"use client"

import { Plane, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VacationModeBannerProps {
  isActive: boolean
  onDisable: () => void
}

export default function VacationModeBanner({ isActive, onDisable }: VacationModeBannerProps) {
  if (!isActive) return null

  return (
    <div className="bg-gradient-to-r from-orange-100 to-yellow-100 border border-orange-200 rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-orange-900">Vacation Mode Active</h3>
            <p className="text-sm text-orange-700">Time tracking is paused. Enjoy your break!</p>
          </div>
        </div>
        <Button
          onClick={onDisable}
          variant="ghost"
          size="sm"
          className="text-orange-700 hover:bg-orange-200 rounded-xl"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
