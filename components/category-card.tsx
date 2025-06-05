"use client"

import type React from "react"

import { useState } from "react"
import { Edit, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EditCategoryModal from "@/components/edit-category-modal"
import type { Category } from "@/lib/types"

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isEditingBudget, setIsEditingBudget] = useState(false)
  const [budgetValue, setBudgetValue] = useState(category.weeklyBudget.toString())

  const usagePercentage = (category.timeUsed / category.weeklyBudget) * 100

  const getStatusColor = () => {
    if (usagePercentage >= 100) return "from-red-500 to-red-600"
    if (usagePercentage >= 80) return "from-yellow-500 to-orange-500"
    return "from-green-500 to-green-600"
  }

  const getBackgroundColor = () => {
    if (usagePercentage >= 100) return "from-red-50 to-red-100 border-red-200"
    if (usagePercentage >= 80) return "from-yellow-50 to-orange-100 border-yellow-200"
    return "from-green-50 to-green-100 border-green-200"
  }

  const handleBudgetSave = () => {
    const newBudget = Number.parseInt(budgetValue)
    if (newBudget > 0) {
      onEdit({ ...category, weeklyBudget: newBudget })
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

  return (
    <>
      <div
        className={`bg-gradient-to-br ${getBackgroundColor()} backdrop-blur-sm rounded-3xl p-6 border shadow-lg group hover:shadow-xl transition-all duration-200`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
            <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: category.color }}></div>
            <h3 className="font-bold text-lg text-gray-900">{category.name}</h3>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl hover:bg-white/50"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl hover:bg-white/50 text-red-600"
              onClick={() => onDelete(category.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-gray-700">Tracked {category.timeUsed}h</span>
            <span className="text-gray-700">Remaining {Math.max(0, category.weeklyBudget - category.timeUsed)}h</span>
          </div>
          <div className="w-full bg-white/60 rounded-full h-3 shadow-inner">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${getStatusColor()} shadow-sm transition-all duration-300`}
              style={{ width: `${Math.min(100, usagePercentage)}%` }}
            ></div>
          </div>
        </div>

        <div className="text-right">
          {isEditingBudget ? (
            <div className="flex items-center justify-end gap-2">
              <Input
                value={budgetValue}
                onChange={(e) => setBudgetValue(e.target.value)}
                onBlur={handleBudgetSave}
                onKeyDown={handleBudgetKeyPress}
                className="w-20 h-8 text-right rounded-xl"
                type="number"
                min="1"
                autoFocus
              />
              <span className="text-gray-600">h/{category.weeklyBudget}h</span>
            </div>
          ) : (
            <span
              className="font-bold text-xl text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditingBudget(true)}
            >
              {category.timeUsed}h/{category.weeklyBudget}h
            </span>
          )}
        </div>

        {/* Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div className="mt-4 space-y-3 pt-4 border-t border-white/50">
            {category.subcategories.map((sub) => (
              <div
                key={sub.name}
                className="flex justify-between items-center text-sm bg-white/40 rounded-2xl p-3 hover:bg-white/60 transition-colors"
              >
                <span className="font-medium text-gray-800">{sub.name}</span>
                <span className="font-semibold text-gray-900">
                  {sub.timeUsed}h/{sub.budget}h
                </span>
              </div>
            ))}
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
