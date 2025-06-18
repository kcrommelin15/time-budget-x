"use client"

interface EnhancedAllocationBannerProps {
  remainingHours: number
  isEditMode: boolean
  onEnterEditMode: () => void
  totalScheduledHours?: number
}

export default function EnhancedAllocationBanner({
  remainingHours,
  isEditMode,
  onEnterEditMode,
  totalScheduledHours = 168,
}: EnhancedAllocationBannerProps) {
  return (
    <div className="bg-blue-50 rounded-md p-4 flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-blue-800">Allocation Summary</h3>
        <p className="text-gray-600 text-sm">
          {remainingHours > 0
            ? `You have ${remainingHours} hours left to allocate from your ${totalScheduledHours}h weekly schedule.`
            : `You've allocated ${Math.abs(remainingHours)} hours more than your ${totalScheduledHours}h weekly schedule.`}
        </p>
      </div>
      {!isEditMode && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={onEnterEditMode}
        >
          Edit Allocation
        </button>
      )}
    </div>
  )
}
