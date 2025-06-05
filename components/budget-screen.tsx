"use client"

import { useState } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Plus, Calendar, Edit3, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import EditCategoryModal from "@/components/edit-category-modal"
import TrackingPreferencesModal from "@/components/tracking-preferences-modal"
import ListStyleCategoryCard from "@/components/list-style-category-card"
import ArchivedCategoriesSection from "@/components/archived-categories-section"
import EnhancedAllocationBanner from "@/components/enhanced-allocation-banner"
import { mockCategories } from "@/lib/mock-data"
import type { Category } from "@/lib/types"

interface BudgetScreenProps {
  isDesktop?: boolean
}

export default function BudgetScreen({ isDesktop = false }: BudgetScreenProps) {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [archivedCategories, setArchivedCategories] = useState<Category[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.weeklyBudget, 0)
  const remainingHours = 168 - totalBudgeted // 168 hours in a week

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCategories(items)
  }

  const handleAddCategory = (newCategory: Omit<Category, "id" | "timeUsed">) => {
    const category: Category = {
      ...newCategory,
      id: Date.now().toString(),
      timeUsed: 0,
    }
    setCategories([...categories, category])
    setIsAddModalOpen(false)
  }

  const handleEditCategory = (updatedCategory: Category) => {
    setCategories(categories.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
  }

  const handleArchiveCategory = (categoryId: string) => {
    const categoryToArchive = categories.find((cat) => cat.id === categoryId)
    if (categoryToArchive) {
      setArchivedCategories([...archivedCategories, categoryToArchive])
      setCategories(categories.filter((cat) => cat.id !== categoryId))
    }
  }

  const handleRestoreCategory = (categoryId: string) => {
    const categoryToRestore = archivedCategories.find((cat) => cat.id === categoryId)
    if (categoryToRestore) {
      setCategories([...categories, categoryToRestore])
      setArchivedCategories(archivedCategories.filter((cat) => cat.id !== categoryId))
    }
  }

  const handlePermanentDelete = (categoryId: string) => {
    setArchivedCategories(archivedCategories.filter((cat) => cat.id !== categoryId))
  }

  const handleQuickBudgetEdit = (categoryId: string, newBudget: number) => {
    setCategories(categories.map((cat) => (cat.id === categoryId ? { ...cat, weeklyBudget: newBudget } : cat)))
  }

  const handleSubcategoryReorder = (categoryId: string, subcategories: any[]) => {
    setCategories(categories.map((cat) => (cat.id === categoryId ? { ...cat, subcategories } : cat)))
  }

  const handleSubcategoryEdit = (categoryId: string, subcategoryName: string, newBudget: number) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          const updatedSubcategories = (cat.subcategories || []).map((sub) =>
            sub.name === subcategoryName ? { ...sub, budget: newBudget } : sub,
          )
          return { ...cat, subcategories: updatedSubcategories }
        }
        return cat
      }),
    )
  }

  const handleSubcategoryDelete = (categoryId: string, subcategoryName: string) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          const updatedSubcategories = (cat.subcategories || []).filter((sub) => sub.name !== subcategoryName)
          return { ...cat, subcategories: updatedSubcategories }
        }
        return cat
      }),
    )
  }

  const handleSubcategoryAdd = (categoryId: string, subcategoryName: string, budget: number) => {
    setCategories(
      categories.map((cat) => {
        if (cat.id === categoryId) {
          const newSubcategory = { name: subcategoryName, budget, timeUsed: 0 }
          return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] }
        }
        return cat
      }),
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

      {/* Enhanced Allocation Banner */}
      {remainingHours !== 0 && (
        <EnhancedAllocationBanner
          remainingHours={remainingHours}
          isEditMode={isEditMode}
          onEnterEditMode={() => setIsEditMode(true)}
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
      {isEditMode && (
        <ArchivedCategoriesSection
          archivedCategories={archivedCategories}
          onRestore={handleRestoreCategory}
          onPermanentDelete={handlePermanentDelete}
        />
      )}

      <EditCategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddCategory}
        mode="add"
      />
      <TrackingPreferencesModal isOpen={isPreferencesOpen} onClose={() => setIsPreferencesOpen(false)} />
    </div>
  )
}
