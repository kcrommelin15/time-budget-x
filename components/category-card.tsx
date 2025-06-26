"use client"

import React from "react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Category } from "@/lib/types"
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
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold">{category.name}</h3>
      <div className="flex justify-end mt-4">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <MoreVertical className="h-4 w-4 cursor-pointer" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Category
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(category.id)} className="text-red-600 focus:text-red-600">
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
