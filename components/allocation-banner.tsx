"use client"

import { AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AllocationBannerProps {
  remainingHours: number
  isEditMode: boolean
  onEnterEditMode: () => void
}

export default function AllocationBanner({ remainingHours, isEditMode, onEnterEditMode }: AllocationBannerProps) {
  const isOverAllocated = remainingHours < 0
  const isUnderAllocated = remainingHours > 0

  if (remainingHours === 0) return null

  return (
    <div
      className={`rounded-3xl p-4 mb-6 border shadow-xl transition-all duration-300 ${
        isOverAllocated
          ? "bg-red-50 border-red-200 shadow-red-100/50"
          : "bg-yellow-50 border-yellow-200 shadow-yellow-100/50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
              isOverAllocated ? "bg-red-500" : "bg-yellow-500"
            }`}
          >
            {isOverAllocated ? (
              <AlertTriangle className="w-5 h-5 text-white" />
            ) : (
              <CheckCircle className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h3 className={`font-semibold ${isOverAllocated ? "text-red-900" : "text-yellow-900"}`}>
              {isOverAllocated ? "Over-allocated" : "Under-allocated"}
            </h3>
            <p className={`text-sm ${isOverAllocated ? "text-red-700" : "text-yellow-700"}`}>
              {isOverAllocated
                ? `You've allocated ${Math.abs(remainingHours).toFixed(1)} hours more than the 168 hours available in a week`
                : `You have ${remainingHours.toFixed(1)} hours left to assign out of 168 hours per week`}
            </p>
          </div>
        </div>
        {!isEditMode && (
          <Button
            onClick={onEnterEditMode}
            size="sm"
            className={`rounded-2xl shadow-lg transition-all duration-200 ${
              isOverAllocated
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-yellow-600 hover:bg-yellow-700 text-white"
            }`}
          >
            Assign
          </Button>
        )}
      </div>
    </div>
  )
}
