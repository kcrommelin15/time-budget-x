"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import UnifiedTimeInput from "@/components/unified-time-input"
import EnhancedSubcategoryList from "@/components/enhanced-subcategory-list"
import type { Category, Subcategory } from "@/lib/types"
import type { GoalDirection } from "@/lib/goal-utils"

interface EditCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: Category // Optional for add mode
  onSave: (category: Category) => void
  onAdd?: (category: Omit<Category, "id" | "timeUsed">) => void
  mode?: "add" | "edit"
}

const colorPalette = [
  { name: "Blue", value: "#2B93FA" },
  { name: "Green", value: "#13B078" },
  { name: "Orange", value: "#EB8C5E" },
  { name: "Red", value: "#F94359" },
  { name: "Violet", value: "#6C63FF" },
  { name: "Yellow", value: "#BB9000" },
  { name: "Mint", value: "#1EBB84" },
  { name: "Grey", value: "#6A7A7E" },
]

export default function EditCategoryModal({
  isOpen,
  onClose,
  category,
  onSave,
  onAdd,
  mode = category ? "edit" : "add",
}: EditCategoryModalProps) {
  const [categoryName, setCategoryName] = useState(category?.name || "")
  const [selectedColor, setSelectedColor] = useState(category?.color || colorPalette[0].value)
  const [subcategories, setSubcategories] = useState<Subcategory[]>(category?.subcategories || [])
  const [weeklyBudget, setWeeklyBudget] = useState(category?.weeklyBudget || 8)
  const [newSubcategoryName, setNewSubcategoryName] = useState("")

  // Reset state when modal opens/closes or category changes
  useEffect(() => {
    if (isOpen) {
      setCategoryName(category?.name || "")
      setSelectedColor(category?.color || colorPalette[0].value)
      setSubcategories(category?.subcategories || [])
      setWeeklyBudget(category?.weeklyBudget || 8)
      setNewSubcategoryName("")
    }
  }, [isOpen, category])

  // Auto-save for edit mode
  useEffect(() => {
    if (isOpen && mode === "edit" && category && categoryName.trim()) {
      const updatedCategory = {
        ...category,
        name: categoryName,
        weeklyBudget: weeklyBudget,
        color: selectedColor,
        subcategories: subcategories,
      }

      // Only save if there are actual changes
      const hasChanges =
        category.name !== categoryName ||
        category.weeklyBudget !== weeklyBudget ||
        category.color !== selectedColor ||
        JSON.stringify(category.subcategories) !== JSON.stringify(subcategories)

      if (hasChanges) {
        console.log("Auto-saving category changes:", updatedCategory)
        onSave(updatedCategory)
      }
    }
  }, [isOpen, mode, category, categoryName, weeklyBudget, selectedColor, subcategories, onSave])

  // Auto-save for add mode (create category when name is provided)
  useEffect(() => {
    if (isOpen && mode === "add" && categoryName.trim() && onAdd) {
      const newCategory = {
        name: categoryName,
        weeklyBudget: weeklyBudget,
        color: selectedColor,
        subcategories: subcategories,
      }

      console.log("Auto-creating category:", newCategory)
      onAdd(newCategory)
    }
  }, [isOpen, mode, categoryName, weeklyBudget, selectedColor, subcategories, onAdd])

  if (!isOpen) return null

  // Calculate subcategory totals and "Other" values
  const regularSubcategories = subcategories.filter((sub) => sub.name !== "Other")
  const regularSubcategoryTotal = regularSubcategories.reduce((sum, sub) => sum + sub.budget, 0)
  const regularSubcategoryUsed = regularSubcategories.reduce((sum, sub) => sum + sub.timeUsed, 0)

  const otherBudget = Math.max(0, weeklyBudget - regularSubcategoryTotal)
  const otherUsed = Math.max(0, (category?.timeUsed || 0) - regularSubcategoryUsed)

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

  const handleBudgetChange = (newBudget: number) => {
    // Ensure budget doesn't go below the sum of regular subcategories
    const minBudget = regularSubcategoryTotal
    setWeeklyBudget(Math.max(minBudget, newBudget))
  }

  const handleSubcategoryEdit = (subcategoryName: string, newBudget: number) => {
    setSubcategories(subcategories.map((sub) => (sub.name === subcategoryName ? { ...sub, budget: newBudget } : sub)))
  }

  const handleSubcategoryDelete = (subcategoryName: string) => {
    setSubcategories(subcategories.filter((sub) => sub.name !== subcategoryName))
  }

  const handleSubcategoryReorder = (reorderedSubcategories: Subcategory[]) => {
    // Filter out "Other" since it's auto-generated
    const withoutOther = reorderedSubcategories.filter((sub) => sub.name !== "Other")
    setSubcategories(withoutOther)
  }

  const handleGoalDirectionEdit = (subcategoryName: string, direction: GoalDirection) => {
    setSubcategories(
      subcategories.map((sub) => (sub.name === subcategoryName ? { ...sub, goalDirection: direction } : sub)),
    )
  }

  const addSubcategory = () => {
    if (newSubcategoryName.trim()) {
      setSubcategories([
        ...subcategories,
        {
          name: newSubcategoryName.trim(),
          budget: 0,
          timeUsed: 0,
          goalDirection: "target_range",
        },
      ])
      setNewSubcategoryName("")
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">{mode === "add" ? "Add Category" : "Edit Category"}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="rounded-xl mt-2"
              placeholder="e.g., Work, Personal, Exercise"
            />
          </div>

          <div>
            <Label>Weekly Budget</Label>
            <div className="mt-2">
              <UnifiedTimeInput value={weeklyBudget} onChange={handleBudgetChange} size="md" />
            </div>
          </div>

          <div>
            <Label>Choose Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-2xl border-2 transition-all ${
                    selectedColor === color.value ? "border-gray-800 scale-110" : "border-gray-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Subcategories */}
          <div>
            <Label>Activities (optional)</Label>

            {/* Add Subcategory */}
            <div className="flex items-center gap-2 mt-2 mb-4">
              <Plus className="w-4 h-4 text-gray-400" />
              <Input
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSubcategory()}
                placeholder="Add activity (e.g., Meetings, Deep Work)"
                className="flex-1 h-8 rounded-lg border-gray-300"
              />
              {newSubcategoryName && (
                <Button type="button" onClick={addSubcategory} size="sm" className="rounded-lg">
                  Add
                </Button>
              )}
            </div>

            {/* Subcategory List */}
            {finalSubcategories.length > 0 && (
              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <EnhancedSubcategoryList
                  subcategories={finalSubcategories}
                  categoryId={category?.id || "new"}
                  categoryColor={selectedColor}
                  isEditMode={true}
                  onReorder={handleSubcategoryReorder}
                  onEdit={handleSubcategoryEdit}
                  onDelete={handleSubcategoryDelete}
                  onGoalDirectionEdit={handleGoalDirectionEdit}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
