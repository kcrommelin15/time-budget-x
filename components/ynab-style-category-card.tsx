"use client"

import type React from "react"

import { useState } from "react"
import { Edit, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EditCategoryModal from "@/components/edit-category-modal"
import type { Category } from "@/lib/types"

interface YNABStyleCategoryCardProps {
  category: Category
  isEditMode: boolean
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
  onQuickBudgetEdit: (categoryId: string, newBudget: number) => void
}

export default function YNABStyleCategoryCard({
  category,
  isEditMode,
  onEdit,
  onDelete,
  onQuickBudgetEdit,
}: YNABStyleCategoryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetValue, setBudgetValue] = useState(category.weeklyBudget.toString())

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
      <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:border-gray-300/60">
        {/* Category Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditMode && <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />}
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
                    className="rounded-xl hover:bg-red-50 text-red-600"
                    onClick={() => onDelete(category.id)}
                  >
                    <Trash2 className="w-4 h-4" />
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
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="p-6 space-y-4 bg-gray-50/50">
            {category.subcategories.map((sub) => {
              const subUsagePercentage = sub.budget > 0 ? (sub.timeUsed / sub.budget) * 100 : 0
              const subRemainingHours = Math.max(0, sub.budget - sub.timeUsed)

              return (
                <div key={sub.name} className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></div>
                      <span className="font-semibold text-gray-800">{sub.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{sub.budget}h</div>
                      <div className="text-xs text-gray-500">budgeted</div>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1 font-medium">
                      <span className="text-gray-600">{sub.timeUsed}h used</span>
                      <span className="text-gray-600">{subRemainingHours}h remaining</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner border border-gray-200">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: category.color,
                          width: `${Math.min(100, subUsagePercentage)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={category}
        onSave={onEdit}
      />
    </>
  )
}
