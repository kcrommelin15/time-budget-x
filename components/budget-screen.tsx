import { useCategories } from "@/hooks/use-categories"
import type { User } from "@supabase/supabase-js"

interface BudgetScreenProps {
  isDesktop?: boolean
  user?: User | null
}

export default function BudgetScreen({ isDesktop = false, user = null }: BudgetScreenProps) {
  const {
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
  } = useCategories(user)

  return (
    <div>
      {/* Your budget screen content here */}
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {categories && categories.length > 0 ? (
        <ul>
          {categories.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ul>
      ) : (
        <p>No categories found.</p>
      )}
    </div>
  )
}
