"use client"

import { Draggable } from "@hello-pangea/dnd"
import { GripVertical, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import UnifiedTimeInput from "@/components/unified-time-input"
import SmartBudgetIndicator from "@/components/smart-budget-indicator"
import SimpleGoalSelector from "@/components/simple-goal-selector"
import { useState } from "react"
import type { GoalDirection } from "@/lib/goal-utils"

interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  isFixed?: boolean
  goalDirection?: GoalDirection
  goalConfig?: {
    targetMin?: number
    targetMax?: number
    threshold?: number
  }
}

interface MobileSubcategoryItemProps {
  subcategory: Subcategory
  index: number
  categoryId: string
  categoryColor: string
  isEditMode: boolean
  onEdit: (subcategoryName: string, newBudget: number) => void
  onDelete: (subcategoryName: string) => void
  onGoalDirectionEdit?: (subcategoryName: string, direction?: GoalDirection) => void
}

export default function MobileSubcategoryItem({
  subcategory,
  index,
  categoryId,
  categoryColor,
  isEditMode,
  onEdit,
  onDelete,
  onGoalDirectionEdit,
}: MobileSubcategoryItemProps) {
  const [showMenu, setShowMenu] = useState(false)

  // Get status for the week progress indicator
  // Remove these lines:
  // const insight = analyzeSubcategory(subcategory)
  // const colors = getStatusColors(insight.status)
  // const weekProgress = calculateWeekProgress()

  return (
    <Draggable
      key={subcategory.name}
      draggableId={`${categoryId}-${subcategory.name}`}
      index={index}
      isDragDisabled={!isEditMode || subcategory.isFixed}
    >
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`transition-all duration-200 ${
            snapshot.isDragging ? "bg-white shadow-2xl z-50 rounded-xl scale-105" : ""
          }`}
        >
          {/* Mobile-optimized layout */}
          <div className="py-3">
            {/* Header row with name and controls */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isEditMode && !subcategory.isFixed && (
                  <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                  </div>
                )}

                <span
                  className={`font-medium text-sm ${subcategory.isFixed ? "italic text-gray-600" : "text-gray-900"}`}
                >
                  {subcategory.name}
                </span>

                {subcategory.isFixed && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">auto</span>
                )}
              </div>

              {/* Time input with goal controls */}
              <div className="flex items-center gap-2">
                {/* Goal direction text - fixed width container */}
                {!subcategory.isFixed && (
                  <div className="w-16 text-right">
                    {subcategory.goalDirection && (
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          subcategory.goalDirection === "more_is_better" ? "text-purple-600" : "text-blue-600"
                        }`}
                      >
                        {subcategory.goalDirection === "more_is_better" ? "More than" : "Less than"}
                      </span>
                    )}
                  </div>
                )}

                {/* Minus button - left of time */}
                {!subcategory.isFixed && (
                  <SimpleGoalSelector
                    value={subcategory.goalDirection}
                    onChange={(direction) => onGoalDirectionEdit?.(subcategory.name, direction)}
                    split={true}
                    side="left"
                  />
                )}

                <UnifiedTimeInput
                  value={subcategory.budget}
                  onChange={(newBudget) => onEdit(subcategory.name, newBudget)}
                  size="sm"
                  disabled={!isEditMode || subcategory.isFixed}
                  showIncrementControls={false} // Hide on mobile for space
                />

                {/* Plus button - right of time */}
                {!subcategory.isFixed && (
                  <SimpleGoalSelector
                    value={subcategory.goalDirection}
                    onChange={(direction) => onGoalDirectionEdit?.(subcategory.name, direction)}
                    split={true}
                    side="right"
                  />
                )}

                {/* Remove this entire block: */}
                {/* Week Progress Status Dot */}
                {/* <div
                  className="w-3 h-3 rounded-full border border-white shadow-sm flex-shrink-0"
                  style={{ backgroundColor: colors.fill }}
                  title={`${insight.statusMessage} - ${(weekProgress * 100).toFixed(0)}% through week`}
                /> */}

                {isEditMode && !subcategory.isFixed && (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 h-6 w-6 rounded hover:bg-gray-50 text-gray-400"
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>

                    {showMenu && (
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 min-w-[100px]">
                        <button
                          onClick={() => {
                            onDelete(subcategory.name)
                            setShowMenu(false)
                          }}
                          className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Full-width progress bar */}
            <div className="w-full">
              <SmartBudgetIndicator subcategory={subcategory} categoryColor={categoryColor} showDetails={!isEditMode} />
            </div>
          </div>

          {/* Click outside to close menu */}
          {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
        </div>
      )}
    </Draggable>
  )
}
