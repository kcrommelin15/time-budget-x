"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { DataService } from "@/lib/supabase/data-service"
import { mockCategories } from "@/lib/mock-data"
import type { Category } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

export function useCategories(user: User | null) {
  const [categories, setCategories] = useState<Category[]>(mockCategories)
  const [archivedCategories, setArchivedCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load categories when user changes
  useEffect(() => {
    if (user) {
      loadUserCategories()
    } else {
      // Use mock data when not signed in
      setCategories(mockCategories)
      setArchivedCategories([])
    }
  }, [user])

  const loadUserCategories = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const userCategories = await DataService.getCategories()

      if (userCategories.length === 0) {
        // Initialize user with default data
        await DataService.initializeUserData()
        const newCategories = await DataService.getCategories()
        setCategories(newCategories)
      } else {
        setCategories(userCategories)
      }
    } catch (err) {
      console.error("Error loading categories:", err)
      setError(err instanceof Error ? err.message : "Failed to load categories")
      // Fall back to mock data on error
      setCategories(mockCategories)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async (newCategory: Omit<Category, "id" | "timeUsed">) => {
    if (user) {
      try {
        const createdCategory = await DataService.createCategory(newCategory)
        setCategories((prev) => [...prev, createdCategory])
      } catch (err) {
        console.error("Error adding category:", err)
        setError(err instanceof Error ? err.message : "Failed to add category")
      }
    } else {
      // Mock behavior for non-authenticated users
      const category: Category = {
        ...newCategory,
        id: Date.now().toString(),
        timeUsed: 0,
      }
      setCategories((prev) => [...prev, category])
    }
  }

  const updateCategory = async (updatedCategory: Category) => {
    if (user) {
      try {
        await DataService.updateCategory(updatedCategory)
        setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
      } catch (err) {
        console.error("Error updating category:", err)
        setError(err instanceof Error ? err.message : "Failed to update category")
      }
    } else {
      // Mock behavior for non-authenticated users
      setCategories((prev) => prev.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)))
    }
  }

  const deleteCategory = async (categoryId: string) => {
    if (user) {
      try {
        await DataService.deleteCategory(categoryId)
        setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
      } catch (err) {
        console.error("Error deleting category:", err)
        setError(err instanceof Error ? err.message : "Failed to delete category")
      }
    } else {
      // Mock behavior for non-authenticated users
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    }
  }

  const archiveCategory = (categoryId: string) => {
    const categoryToArchive = categories.find((cat) => cat.id === categoryId)
    if (categoryToArchive) {
      setArchivedCategories((prev) => [...prev, categoryToArchive])
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    }
  }

  const restoreCategory = (categoryId: string) => {
    const categoryToRestore = archivedCategories.find((cat) => cat.id === categoryId)
    if (categoryToRestore) {
      setCategories((prev) => [...prev, categoryToRestore])
      setArchivedCategories((prev) => prev.filter((cat) => cat.id !== categoryId))
    }
  }

  const reorderCategories = async (reorderedCategories: Category[]) => {
    setCategories(reorderedCategories)

    if (user) {
      try {
        const categoryIds = reorderedCategories.map((cat) => cat.id)
        await DataService.reorderCategories(categoryIds)
      } catch (err) {
        console.error("Error reordering categories:", err)
        setError(err instanceof Error ? err.message : "Failed to reorder categories")
      }
    }
  }

  const addSubcategory = async (categoryId: string, subcategoryName: string, budget: number) => {
    if (user) {
      try {
        await DataService.createSubcategory(categoryId, {
          name: subcategoryName,
          budget,
          goalDirection: "target_range",
        })
        // Reload categories to get updated data
        await loadUserCategories()
      } catch (err) {
        console.error("Error adding subcategory:", err)
        setError(err instanceof Error ? err.message : "Failed to add subcategory")
      }
    } else {
      // Mock behavior for non-authenticated users
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            const newSubcategory = { name: subcategoryName, budget, timeUsed: 0 }
            return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] }
          }
          return cat
        }),
      )
    }
  }

  const updateSubcategory = async (categoryId: string, subcategoryName: string, newBudget: number) => {
    if (user) {
      try {
        await DataService.updateSubcategory(categoryId, subcategoryName, { budget: newBudget })
        // Update local state
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === categoryId) {
              const updatedSubcategories = (cat.subcategories || []).map((sub) =>
                sub.name === subcategoryName ? { ...sub, budget: newBudget } : sub,
              )
              return { ...cat, subcategories: updatedSubcategories }
            }
            return cat
          }),
        )
      } catch (err) {
        console.error("Error updating subcategory:", err)
        setError(err instanceof Error ? err.message : "Failed to update subcategory")
      }
    } else {
      // Mock behavior for non-authenticated users
      setCategories((prev) =>
        prev.map((cat) => {
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
  }

  const deleteSubcategory = async (categoryId: string, subcategoryName: string) => {
    if (user) {
      try {
        await DataService.deleteSubcategory(categoryId, subcategoryName)
        // Update local state
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id === categoryId) {
              const updatedSubcategories = (cat.subcategories || []).filter((sub) => sub.name !== subcategoryName)
              return { ...cat, subcategories: updatedSubcategories }
            }
            return cat
          }),
        )
      } catch (err) {
        console.error("Error deleting subcategory:", err)
        setError(err instanceof Error ? err.message : "Failed to delete subcategory")
      }
    } else {
      // Mock behavior for non-authenticated users
      setCategories((prev) =>
        prev.map((cat) => {
          if (cat.id === categoryId) {
            const updatedSubcategories = (cat.subcategories || []).filter((sub) => sub.name !== subcategoryName)
            return { ...cat, subcategories: updatedSubcategories }
          }
          return cat
        }),
      )
    }
  }

  return {
    categories,
    archivedCategories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    archiveCategory,
    restoreCategory,
    reorderCategories,
    addSubcategory,
    updateSubcategory,
    deleteSubcategory,
    refreshCategories: loadUserCategories,
  }
}
