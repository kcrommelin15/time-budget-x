"use client"

import { useState } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Plus, Calendar, Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddCategoryModal from "@/components/add-category-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import ListStyleCategoryCard from "@/components/list-style-category-card"
import ArchivedCategoriesSection from "@/components/archived-categories-section"
import EnhancedAllocationBanner from "@/components/enhanced-allocation-banner"
import { useCategoriesQuery } from "@/hooks/use-categories-query"
import { useTrackingPreferences } from "@/hooks/use-tracking-preferences"
import type { Category } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface BudgetScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function BudgetScreen({ isDesktop = false, user = null }: BudgetScreenProps) {
  // Use the new React Query hook but keep the same interface
  const {
    categories,
    archivedCategories: queryArchivedCategories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useCategoriesQuery(user)

  // For now, use empty array for archived categories since the query doesn't implement it yet
  const archivedCategories = queryArchivedCategories || []

  const { getTotalScheduledHours, refreshPreferences } = useTrackingPreferences(user)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.weeklyBudget, 0)
  const totalScheduledHours = getTotalScheduledHours()
  const remainingHours = totalScheduledHours - totalBudgeted

  // Handle preferences change to refresh the data
  const handlePreferencesChange = () => {
    refreshPreferences()
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    reorderCategories(items)
  }

  const handleAddCategory = (newCategory: Omit<Category, "id" | "timeUsed">) => {
    addCategory(newCategory)
    setIsAddModalOpen(false)
  }

  const handleEditCategory = (updatedCategory: Category) => {
    updateCategory(updatedCategory)
  }

  const handleArchiveCategory = (categoryId: string) => {
    // For now, just delete since archive isn't implemented in the query
    if (confirm("Archive functionality is not yet implemented. Delete this category instead?")) {
      deleteCategory(categoryId)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    if (confirm("Are you sure you want to permanently delete this category? This action cannot be undone.")) {
      deleteCategory(categoryId)
    }
  }

  const handleRestoreCategory = (categoryId: string) => {
    // Not implemented yet
    console.log("Restore not implemented yet")
  }

  const handlePermanentDelete = (categoryId: string) => {
    deleteCategory(categoryId)
  }

  const handleQuickBudgetEdit = (categoryId: string, newBudget: number) => {
    const categoryToUpdate = categories.find((cat) => cat.id === categoryId)
    if (categoryToUpdate) {
      updateCategory({ ...categoryToUpdate, weeklyBudget: newBudget })
    }
  }

  const handleSubcategoryReorder = (categoryId: string, subcategories: any[]) => {
    const categoryToUpdate = categories.find((cat) => cat.id === categoryId)
    if (categoryToUpdate) {
      updateCategory({ ...categoryToUpdate, subcategories })
    }
  }

  const handleSubcategoryEdit = (categoryId: string, subcategoryName: string, newBudget: number) => {
    updateSubcategory(categoryId, subcategoryName, newBudget)
  }

  const handleSubcategoryDelete = (categoryId: string, subcategoryName: string) => {
    deleteSubcategory(categoryId, subcategoryName)
  }

  const handleSubcategoryAdd = (categoryId: string, subcategoryName: string, budget: number) => {
    addSubcategory(categoryId, subcategoryName, budget)
  }

  // Show loading state only if we have no data and are loading
  if (loading && categories.length === 0) {
    return (
      <div className={`${isDesktop ? "min-h-screen" : "pb-20"} p-6`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your budget...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${isDesktop ? "min-h-screen" : "pb-20"} p-6`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">Time Budget</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsPreferencesOpen(true)}
              className="rounded-2xl hover:bg-white/80 backdrop-blur-sm border border-gray-200 bg-white/60 shadow-lg"
            >
              <Calendar className="w-5 h-5" />
            </Button>
            <Button
              variant={isEditMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsEditMode(!isEditMode)}
              className={`rounded-2xl backdrop-blur-sm border border-gray-200 shadow-lg ${
                isEditMode ? "bg-gray-900 text-white" : "bg-white/80 hover:bg-white"
              }`}
            >
              {isEditMode ? <Check className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
              {isEditMode ? "Done" : "Edit"}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Enhanced Allocation Banner */}
      {remainingHours !== 0 && (
        <EnhancedAllocationBanner
          remainingHours={remainingHours}
          isEditMode={isEditMode}
          onEnterEditMode={() => setIsEditMode(true)}
          totalScheduledHours={totalScheduledHours}
        />
      )}

      {/* Categories */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="categories" isDropDisabled={!isEditMode}>
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {categories.map((category, index) => (
                <ListStyleCategoryCard
                  key={category.id}
                  category={category}
                  index={index}
                  isEditMode={isEditMode}
                  onEdit={handleEditCategory}
                  onArchive={handleArchiveCategory}
                  onDelete={handleDeleteCategory}
                  onQuickBudgetEdit={handleQuickBudgetEdit}
                  onSubcategoryReorder={handleSubcategoryReorder}
                  onSubcategoryEdit={handleSubcategoryEdit}
                  onSubcategoryDelete={handleSubcategoryDelete}
                  onSubcategoryAdd={handleSubcategoryAdd}
                />
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Category Button - Back at bottom */}
      <div className="mt-8">
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-300/60">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="ghost"
            className="w-full h-20 rounded-3xl text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
          >
            <Plus className="w-6 h-6 mr-3" />
            <span className="text-lg font-medium">Add Category</span>
          </Button>
        </div>
      </div>

      {/* Archived Categories */}
      {isEditMode && archivedCategories.length > 0 && (
        <ArchivedCategoriesSection
          archivedCategories={archivedCategories}
          onRestore={handleRestoreCategory}
          onPermanentDelete={handlePermanentDelete}
        />
      )}

      <AddCategoryModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleAddCategory} />
      <TrackingPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
        user={user}
        onPreferencesChange={handlePreferencesChange}
      />
    </div>
  )
}
