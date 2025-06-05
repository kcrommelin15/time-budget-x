"use client"

import { useState } from "react"
import { Archive, RotateCcw, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Category } from "@/lib/types"

interface ArchivedCategoriesSectionProps {
  archivedCategories: Category[]
  onRestore: (categoryId: string) => void
  onPermanentDelete: (categoryId: string) => void
}

export default function ArchivedCategoriesSection({
  archivedCategories,
  onRestore,
  onPermanentDelete,
}: ArchivedCategoriesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (archivedCategories.length === 0) return null

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full justify-between rounded-2xl text-gray-600 hover:bg-gray-50 p-4"
      >
        <div className="flex items-center gap-2">
          <Archive className="w-4 h-4" />
          <span>Archived Categories ({archivedCategories.length})</span>
        </div>
        <span className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}>▼</span>
      </Button>

      {isExpanded && (
        <div className="mt-4 space-y-3">
          {archivedCategories.map((category) => (
            <div key={category.id} className="bg-gray-50 rounded-2xl p-4 border border-gray-200 opacity-75">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                  <span className="font-medium text-gray-700">{category.name}</span>
                  <span className="text-sm text-gray-500">({category.weeklyBudget}h/week)</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRestore(category.id)}
                    className="rounded-xl hover:bg-blue-50 text-blue-600"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Permanently delete this category? This cannot be undone.")) {
                        onPermanentDelete(category.id)
                      }
                    }}
                    className="rounded-xl hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
