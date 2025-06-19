"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { DataService } from "@/lib/supabase/data-service"
import { mockCategories } from "@/lib/mock-data"
import { queryKeys } from "@/lib/query-keys"
import type { Category } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

export function useCategoriesQuery(user: User | null | undefined) {
  const queryClient = useQueryClient()
  const userId = user?.id

  // Main categories query
  const categoriesQuery = useQuery({
    queryKey: queryKeys.categoriesForUser(userId),
    queryFn: async (): Promise<Category[]> => {
      if (user === null) {
        // Return mock data for non-authenticated users
        return mockCategories
      }

      if (user === undefined) {
        // Still loading auth state, return empty array
        return []
      }

      try {
        const categories = await DataService.getCategories()

        // Initialize user data if no categories exist
        if (categories.length === 0) {
          await DataService.initializeUserData()
          return await DataService.getCategories()
        }

        return categories
      } catch (error) {
        console.error("Error loading categories:", error)
        throw error
      }
    },
    enabled: user !== undefined, // Only run when auth state is determined
    staleTime: 2 * 60 * 1000, // Consider data stale after 2 minutes
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  })

  // Add category mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (newCategory: Omit<Category, "id" | "timeUsed">) => {
      if (!user) {
        // Mock behavior - return a fake category
        return {
          ...newCategory,
          id: Date.now().toString(),
          timeUsed: 0,
        }
      }
      return await DataService.createCategory(newCategory)
    },
    onSuccess: (newCategory) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
        return oldCategories ? [...oldCategories, newCategory] : [newCategory]
      })
    },
    onError: (error) => {
      console.error("Error adding category:", error)
      // Invalidate and refetch on error
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Update category mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async (updatedCategory: Category) => {
      if (!user) {
        // Mock behavior - just return the category
        return updatedCategory
      }
      await DataService.updateCategory(updatedCategory)
      return updatedCategory
    },
    onSuccess: (updatedCategory) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
        return oldCategories?.map((cat) => (cat.id === updatedCategory.id ? updatedCategory : cat)) || []
      })
    },
    onError: (error) => {
      console.error("Error updating category:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Delete category mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      if (!user) {
        return categoryId // Mock behavior
      }
      await DataService.deleteCategory(categoryId)
      return categoryId
    },
    onSuccess: (deletedCategoryId) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
        return oldCategories?.filter((cat) => cat.id !== deletedCategoryId) || []
      })
    },
    onError: (error) => {
      console.error("Error deleting category:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Reorder categories mutation
  const reorderCategoriesMutation = useMutation({
    mutationFn: async (reorderedCategories: Category[]) => {
      if (user) {
        const categoryIds = reorderedCategories.map((cat) => cat.id)
        await DataService.reorderCategories(categoryIds)
      }
      return reorderedCategories
    },
    onSuccess: (reorderedCategories) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), reorderedCategories)
    },
    onError: (error) => {
      console.error("Error reordering categories:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Add subcategory mutation
  const addSubcategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      subcategoryName,
      budget,
    }: {
      categoryId: string
      subcategoryName: string
      budget: number
    }) => {
      if (!user) {
        // Mock behavior
        return { categoryId, subcategoryName, budget }
      }
      await DataService.createSubcategory(categoryId, {
        name: subcategoryName,
        budget,
        goalDirection: "target_range",
      })
      return { categoryId, subcategoryName, budget }
    },
    onSuccess: ({ categoryId, subcategoryName, budget }) => {
      if (user) {
        // For authenticated users, refetch to get updated data from server
        queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
      } else {
        // For mock users, optimistically update
        queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
          return (
            oldCategories?.map((cat) => {
              if (cat.id === categoryId) {
                const newSubcategory = { name: subcategoryName, budget, timeUsed: 0 }
                return { ...cat, subcategories: [...(cat.subcategories || []), newSubcategory] }
              }
              return cat
            }) || []
          )
        })
      }
    },
    onError: (error) => {
      console.error("Error adding subcategory:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Update subcategory mutation
  const updateSubcategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      subcategoryName,
      newBudget,
    }: {
      categoryId: string
      subcategoryName: string
      newBudget: number
    }) => {
      if (!user) {
        return { categoryId, subcategoryName, newBudget }
      }
      await DataService.updateSubcategory(categoryId, subcategoryName, { budget: newBudget })
      return { categoryId, subcategoryName, newBudget }
    },
    onSuccess: ({ categoryId, subcategoryName, newBudget }) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
        return (
          oldCategories?.map((cat) => {
            if (cat.id === categoryId) {
              const updatedSubcategories = (cat.subcategories || []).map((sub) =>
                sub.name === subcategoryName ? { ...sub, budget: newBudget } : sub,
              )
              return { ...cat, subcategories: updatedSubcategories }
            }
            return cat
          }) || []
        )
      })
    },
    onError: (error) => {
      console.error("Error updating subcategory:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Delete subcategory mutation
  const deleteSubcategoryMutation = useMutation({
    mutationFn: async ({
      categoryId,
      subcategoryName,
    }: {
      categoryId: string
      subcategoryName: string
    }) => {
      if (!user) {
        return { categoryId, subcategoryName }
      }
      await DataService.deleteSubcategory(categoryId, subcategoryName)
      return { categoryId, subcategoryName }
    },
    onSuccess: ({ categoryId, subcategoryName }) => {
      // Optimistically update the cache
      queryClient.setQueryData(queryKeys.categoriesForUser(userId), (oldCategories: Category[] | undefined) => {
        return (
          oldCategories?.map((cat) => {
            if (cat.id === categoryId) {
              const updatedSubcategories = (cat.subcategories || []).filter((sub) => sub.name !== subcategoryName)
              return { ...cat, subcategories: updatedSubcategories }
            }
            return cat
          }) || []
        )
      })
    },
    onError: (error) => {
      console.error("Error deleting subcategory:", error)
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
    },
  })

  // Refresh time usage mutation
  const refreshTimeUsageMutation = useMutation({
    mutationFn: async () => {
      if (!user) return
      await DataService.updateCategoryTimeUsage()
    },
    onSuccess: () => {
      // Invalidate categories to refetch with updated time usage
      queryClient.invalidateQueries({ queryKey: queryKeys.categoriesForUser(userId) })
      // Also invalidate time entries as they might be related
      queryClient.invalidateQueries({ queryKey: queryKeys.timeEntries })
    },
    onError: (error) => {
      console.error("Error refreshing time usage:", error)
    },
  })

  return {
    // Data
    categories: categoriesQuery.data || [],
    archivedCategories: [], // TODO: Implement archived categories if needed

    // Loading states
    loading: categoriesQuery.isLoading,
    isRefetching: categoriesQuery.isRefetching,

    // Error states
    error: categoriesQuery.error?.message || null,

    // Mutation states
    isAddingCategory: addCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
    isReordering: reorderCategoriesMutation.isPending,
    isAddingSubcategory: addSubcategoryMutation.isPending,
    isUpdatingSubcategory: updateSubcategoryMutation.isPending,
    isDeletingSubcategory: deleteSubcategoryMutation.isPending,
    isRefreshingTimeUsage: refreshTimeUsageMutation.isPending,

    // Actions
    addCategory: addCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    reorderCategories: reorderCategoriesMutation.mutate,
    addSubcategory: (categoryId: string, subcategoryName: string, budget: number) =>
      addSubcategoryMutation.mutate({ categoryId, subcategoryName, budget }),
    updateSubcategory: (categoryId: string, subcategoryName: string, newBudget: number) =>
      updateSubcategoryMutation.mutate({ categoryId, subcategoryName, newBudget }),
    deleteSubcategory: (categoryId: string, subcategoryName: string) =>
      deleteSubcategoryMutation.mutate({ categoryId, subcategoryName }),
    refreshTimeUsage: refreshTimeUsageMutation.mutate,

    // Manual refetch
    refetch: categoriesQuery.refetch,
  }
}
