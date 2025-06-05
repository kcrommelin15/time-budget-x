"use client"

import type React from "react"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { Edit, Archive, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EditCategoryModal from "@/components/edit-category-modal"
import DraggableSubcategoryList from "@/components/draggable-subcategory-list"
import type { Category } from "@/lib/types"

interface DraggableCategoryCardProps {
  category: Category
  index: number
  isEditMode: boolean
  onEdit: (category: Category) => void
  onArchive: (categoryId: string) => void
  onQuickBudgetEdit: (categoryId: string, newBudget: number) => void
  onSubcategoryReorder: (categoryId: string, subcategories: any[]) => void
}

export default function DraggableCategoryCard({
  category,
  index,
  isEditMode,
  onEdit,
  onArchive,
  onQuickBudgetEdit,
  onSubcategoryReorder,
}: DraggableCategoryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetValue, setBudgetValue] = useState(category.weeklyBudget.toString())

  // Calculate subcategory totals and ensure "Other" subcategory exists
  const subcategoriesWithOther = category.subcategories || []
  const regularSubcategories = subcategoriesWithOther.filter((sub) => sub.name !== "Other")
  const otherSubcategory = subcategoriesWithOther.find((sub) => sub.name === "Other")

  const regularSubcategoryTotal = regularSubcategories.reduce((sum, sub) => sum + sub.budget, 0)
  const regularSubcategoryUsed = regularSubcategories.reduce((sum, sub) => sum + sub.timeUsed, 0)

  // Calculate "Other" values
  const otherBudget = Math.max(0, category.weeklyBudget - regularSubcategoryTotal)
  const otherUsed = Math.max(0, category.timeUsed - regularSubcategoryUsed)

  // Create final subcategories list with "Other" at the end
  const finalSubcategories =
    regularSubcategories.length > 0
      ? [
          ...regularSubcategories,
          {
            name: "Other",
            budget: otherBudget,
            timeUsed: otherUsed,
            isFixed: true,
          },
        ]
      : []

  const usagePercentage = (category.timeUsed / category.weeklyBudget) * 100

  const getStatusColor = () => {
    if (usagePercentage >= 100) return "#F94359" // Red
    if (usagePercentage >= 80) return "#BB9000" // Yellow
    return "#13B078" // Green
  }

  const handleBudgetSave = () => {
    const newBudget = Number.parseFloat(budgetValue)
    if (newBudget >= 0) {
      onQuickBudgetEdit(category.id, newBudget)
    } else {
      setBudgetValue(category.weeklyBudget.toString())
    }
    setIsEditingBudget(false)
  }

  const handleBudgetKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBudgetSave()
    } else if (e.key === "Escape") {
      setBudgetValue(category.weeklyBudget.toString())
      setIsEditingBudget(false)
    }
  }

  const remainingHours = Math.max(0, category.weeklyBudget - category.timeUsed)

  return (
    <>
      <Draggable draggableId={category.id} index={index} isDragDisabled={!isEditMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-gray-300/60 ${
              snapshot.isDragging ? "rotate-2 scale-105 shadow-2xl z-50" : ""
            }`}
          >
            {/* Category Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isEditMode && (
                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </div>
                  )}
                  <div className="w-4 h-4 rounded-full shadow-lg" style={{ backgroundColor: category.color }}></div>
                  <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  {isEditingBudget ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={budgetValue}
                        onChange={(e) => setBudgetValue(e.target.value)}
                        onBlur={handleBudgetSave}
                        onKeyDown={handleBudgetKeyPress}
                        className="w-24 h-8 text-right rounded-xl bg-gray-50 border-gray-200"
                        type="number"
                        min="0"
                        step="0.25"
                        autoFocus
                      />
                      <span className="text-gray-600 text-sm">h/week</span>
                    </div>
                  ) : (
                    <div
                      className="text-right cursor-pointer hover:bg-gray-50 rounded-xl p-2 transition-all duration-200"
                      onClick={() => setIsEditingBudget(true)}
                    >
                      <div className="font-bold text-lg">{category.weeklyBudget}h</div>
                      <div className="text-xs text-gray-500">budgeted</div>
                    </div>
                  )}
                  {isEditMode && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-gray-50"
                        onClick={() => setIsEditModalOpen(true)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl hover:bg-orange-50 text-orange-600"
                        onClick={() => onArchive(category.id)}
                      >
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-gray-700">{category.timeUsed}h used</span>
                  <span className="text-gray-700">{remainingHours}h remaining</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner border border-gray-200">
                  <div
                    className="h-3 rounded-full transition-all duration-300 shadow-sm"
                    style={{
                      backgroundColor: getStatusColor(),
                      width: `${Math.min(100, usagePercentage)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {finalSubcategories.length > 0 && (
              <div
                className="bg-gray-50/50 border-l-4 ml-6 mr-6 mb-6 mt-4 rounded-r-2xl"
                style={{ borderLeftColor: category.color }}
              >
                <DraggableSubcategoryList
                  subcategories={finalSubcategories}
                  categoryId={category.id}
                  categoryColor={category.color}
                  isEditMode={isEditMode}
                  onReorder={onSubcategoryReorder}
                />
              </div>
            )}
          </div>
        )}
      </Draggable>

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={category}
        onSave={onEdit}
      />
    </>
  )
}
