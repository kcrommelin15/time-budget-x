"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { GripVertical, Plus, Archive, MoreHorizontal, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import EditCategoryModal from "@/components/edit-category-modal"
import UnifiedTimeInput from "@/components/unified-time-input"
import EnhancedSubcategoryList from "@/components/enhanced-subcategory-list"
import SimpleGoalSelector from "@/components/simple-goal-selector"
import SmartBudgetIndicator from "@/components/smart-budget-indicator"
import type { Category } from "@/lib/types"

interface ListStyleCategoryCardProps {
  category: Category
  index: number
  isEditMode: boolean
  onEdit: (category: Category) => void
  onArchive: (categoryId: string) => void
  onQuickBudgetEdit: (categoryId: string, newBudget: number) => void
  onSubcategoryReorder: (categoryId: string, subcategories: any[]) => void
  onSubcategoryEdit: (categoryId: string, subcategoryName: string, newBudget: number) => void
  onSubcategoryDelete: (categoryId: string, subcategoryName: string) => void
  onSubcategoryAdd: (categoryId: string, subcategoryName: string, budget: number) => void
}

export default function ListStyleCategoryCard({
  category,
  index,
  isEditMode,
  onEdit,
  onArchive,
  onQuickBudgetEdit,
  onSubcategoryReorder,
  onSubcategoryEdit,
  onSubcategoryDelete,
  onSubcategoryAdd,
}: ListStyleCategoryCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [newSubcategoryName, setNewSubcategoryName] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

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

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim()) {
      onSubcategoryAdd(category.id, newSubcategoryName.trim(), 0)
      setNewSubcategoryName("")
    }
  }

  const handleBudgetChange = (newBudget: number) => {
    // Ensure budget doesn't go below the sum of regular subcategories
    const minBudget = regularSubcategoryTotal
    const finalBudget = Math.max(minBudget, newBudget)
    onQuickBudgetEdit(category.id, finalBudget)
  }

  const handleSubcategoryEdit = (subcategoryName: string, newBudget: number) => {
    onSubcategoryEdit(category.id, subcategoryName, newBudget)
  }

  const handleSubcategoryDelete = (subcategoryName: string) => {
    onSubcategoryDelete(category.id, subcategoryName)
  }

  const handleSubcategoryReorder = (reorderedSubcategories: any[]) => {
    onSubcategoryReorder(category.id, reorderedSubcategories)
  }

  const handleArchiveClick = () => {
    setShowDropdown(false)
    setShowArchiveConfirm(true)
  }

  const handleArchiveConfirm = () => {
    onArchive(category.id)
    setShowArchiveConfirm(false)
  }

  const handleEditClick = () => {
    setShowDropdown(false)
    setIsEditModalOpen(true)
  }

  const handleCategoryGoalChange = (direction?: "more_is_better" | "less_is_better") => {
    onEdit({ ...category, goalDirection: direction })
  }

  // Create a category-level subcategory object for the progress bar
  const categoryAsSubcategory = {
    name: category.name,
    budget: category.weeklyBudget,
    timeUsed: category.timeUsed,
    goalDirection: category.goalDirection,
  }

  return (
    <>
      <Draggable draggableId={category.id} index={index} isDragDisabled={!isEditMode}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden transition-all duration-300 mb-4 ${
              snapshot.isDragging ? "rotate-1 scale-105 shadow-2xl z-50" : ""
            }`}
          >
            {/* Mobile-optimized Category Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isEditMode && (
                    <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                      <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors" />
                    </div>
                  )}
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: category.color }}></div>
                  <h3 className="font-semibold text-base text-gray-900 truncate">{category.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  {/* Goal direction text - fixed width container for consistent alignment */}
                  <div className="w-16 text-right">
                    {category.goalDirection && (
                      <span
                        className={`text-xs font-medium whitespace-nowrap ${
                          category.goalDirection === "more_is_better" ? "text-purple-600" : "text-blue-600"
                        }`}
                      >
                        {category.goalDirection === "more_is_better" ? "More than" : "Less than"}
                      </span>
                    )}
                  </div>

                  {/* Minus button - left of time */}
                  <SimpleGoalSelector
                    value={category.goalDirection}
                    onChange={handleCategoryGoalChange}
                    split={true}
                    side="left"
                  />

                  <UnifiedTimeInput
                    value={category.weeklyBudget}
                    onChange={handleBudgetChange}
                    size="sm"
                    disabled={!isEditMode}
                    showIncrementControls={false} // Hide on mobile
                  />

                  {/* Plus button - right of time */}
                  <SimpleGoalSelector
                    value={category.goalDirection}
                    onChange={handleCategoryGoalChange}
                    split={true}
                    side="right"
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (isEditMode) {
                        setShowDropdown(!showDropdown)
                      } else {
                        setIsEditModalOpen(true)
                      }
                    }}
                    className="rounded-lg hover:bg-gray-50 p-1 h-8 w-8"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>

                  {/* Dropdown Menu */}
                  {showDropdown && isEditMode && (
                    <div className="absolute right-4 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 min-w-[120px]">
                      <button
                        onClick={handleEditClick}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={handleArchiveClick}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-orange-50 text-orange-600 flex items-center gap-2"
                      >
                        <Archive className="w-4 h-4" />
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Progress Bar */}
              <div className="w-full">
                <SmartBudgetIndicator
                  subcategory={categoryAsSubcategory}
                  categoryColor={category.color}
                  showDetails={!isEditMode}
                />
              </div>
            </div>

            {/* Full-width Subcategories */}
            {finalSubcategories.length > 0 && (
              <div className="border-l-4 ml-0" style={{ borderLeftColor: category.color }}>
                <EnhancedSubcategoryList
                  subcategories={finalSubcategories}
                  categoryId={category.id}
                  categoryColor={category.color}
                  isEditMode={isEditMode}
                  onReorder={handleSubcategoryReorder}
                  onEdit={handleSubcategoryEdit}
                  onDelete={handleSubcategoryDelete}
                  onGoalDirectionEdit={(subcategoryName, direction) => {
                    const updatedSubcategories = (category.subcategories || []).map((sub) =>
                      sub.name === subcategoryName ? { ...sub, goalDirection: direction } : sub,
                    )
                    onEdit({ ...category, subcategories: updatedSubcategories })
                  }}
                />
              </div>
            )}

            {/* Add Subcategory - Mobile optimized */}
            {isEditMode && (
              <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <Input
                    value={newSubcategoryName}
                    onChange={(e) => setNewSubcategoryName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddSubcategory()}
                    placeholder="Add activity"
                    className="flex-1 h-8 rounded-lg border-gray-300 text-sm"
                  />
                  {newSubcategoryName && (
                    <Button onClick={handleAddSubcategory} size="sm" className="rounded-lg px-3 h-8">
                      Add
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Draggable>

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-sm">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Archive className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Archive Category?</h3>
                <p className="text-gray-600">
                  Are you sure you want to archive "{category.name}"? You can restore it later from the archived
                  section.
                </p>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setShowArchiveConfirm(false)} variant="outline" className="flex-1 rounded-2xl">
                  Cancel
                </Button>
                <Button
                  onClick={handleArchiveConfirm}
                  className="flex-1 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Archive
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />}

      <EditCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        category={category}
        onSave={onEdit}
      />
    </>
  )
}
