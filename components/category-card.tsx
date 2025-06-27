"use client"

import React from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Category } from "@/types"
import { MoreVertical, Edit, Trash2 } from "lucide-react"

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete?: (categoryId: string) => void
}

interface CategoryCardState {
  isEditModalOpen: boolean
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category, onEdit, onDelete }) => {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState<boolean>(false)

  return (
    <div className="border border-border rounded-xl p-5 smooth-shadow hover:smooth-shadow-lg transition-all duration-200 bg-card">
      <h3 className="text-lg font-semibold text-card-foreground">{category.name}</h3>
      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
      <div className="flex justify-end mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition-colors">
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)} className="rounded-lg">
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(category.id)} className="text-destructive focus:text-destructive rounded-lg">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Category
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default CategoryCard
