"use client"

import { Draggable } from "@hello-pangea/dnd"
import { GripVertical, Trash2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import UnifiedTimeInput from "@/components/unified-time-input"
import SmartBudgetIndicator from "@/components/smart-budget-indicator"
import GoalDirectionSelector from "@/components/goal-direction-selector"
import { useState } from "react"
import type { GoalDirection } from "@/lib/goal-utils"

interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  isFixed?: boolean
  goalDirection?: GoalDirection
}

interface DraggableSubcategoryItemProps {
  subcategory: Subcategory
  index: number
  categoryId: string
  categoryColor: string
  isEditMode: boolean
  onEdit: (subcategoryName: string, newBudget: number) => void
  onDelete: (subcategoryName: string) => void
  onGoalDirectionEdit?: (subcategoryName: string, direction: GoalDirection) => void
}

export default function DraggableSubcategoryItem({
  subcategory,
  index,
  categoryId,
  categoryColor,
  isEditMode,
  onEdit,
  onDelete,
  onGoalDirectionEdit,
}: DraggableSubcategoryItemProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false)

  const getGoalTypeSymbol = () => {
    switch (subcategory.goalDirection) {
      case "more_is_better":
        return "+"
      case "less_is_better":
        return "-"
      case "target_range":
      default:
        return "○"
    }
  }

  const getGoalTypeColor = () => {
    switch (subcategory.goalDirection) {
      case "more_is_better":
        return "text-green-600 bg-green-100"
      case "less_is_better":
        return "text-orange-600 bg-orange-100"
      case "target_range":
      default:
        return "text-blue-600 bg-blue-100"
    }
  }

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
          {/* Main Content */}
          <div className="flex items-start justify-between py-3 px-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {isEditMode && !subcategory.isFixed && (
                <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-medium text-gray-900 ${subcategory.isFixed ? "italic text-gray-600" : ""}`}>
                    {subcategory.name}
                  </span>

                  {subcategory.isFixed && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">auto</span>
                  )}

                  {!subcategory.isFixed && (
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${getGoalTypeColor()}`}
                      title={`Goal: ${subcategory.goalDirection || "target_range"}`}
                    >
                      {getGoalTypeSymbol()}
                    </span>
                  )}
                </div>

                {/* Smart Budget Indicator */}
                <div className="max-w-sm">
                  <SmartBudgetIndicator
                    subcategory={subcategory}
                    categoryColor={categoryColor}
                    showDetails={!isEditMode}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 ml-4">
              <UnifiedTimeInput
                value={subcategory.budget}
                onChange={(newBudget) => onEdit(subcategory.name, newBudget)}
                size="sm"
                disabled={!isEditMode || subcategory.isFixed}
                showIncrementControls={isEditMode && !subcategory.isFixed}
              />

              {isEditMode && !subcategory.isFixed && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingGoal(!isEditingGoal)}
                    className="p-1 h-7 w-7 rounded hover:bg-blue-50 text-blue-600"
                  >
                    <Settings className="w-3 h-3" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(subcategory.name)}
                    className="p-1 h-7 w-7 rounded hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Goal Direction Editor */}
          {isEditingGoal && isEditMode && !subcategory.isFixed && (
            <div className="px-4 pb-4 border-t border-gray-100 pt-4">
              <GoalDirectionSelector
                value={subcategory.goalDirection || "target_range"}
                onChange={(direction) => {
                  onGoalDirectionEdit?.(subcategory.name, direction)
                  setIsEditingGoal(false)
                }}
              />
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}
