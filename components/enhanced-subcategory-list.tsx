"use client"

import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import MobileSubcategoryItem from "@/components/mobile-subcategory-item"

interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  isFixed?: boolean
  goalDirection?: "more_is_better" | "less_is_better" // Simplified
}

interface EnhancedSubcategoryListProps {
  subcategories: Subcategory[]
  categoryId: string
  categoryColor: string
  isEditMode: boolean
  onReorder: (subcategories: Subcategory[]) => void
  onEdit: (subcategoryName: string, newBudget: number) => void
  onDelete: (subcategoryName: string) => void
  onGoalDirectionEdit?: (subcategoryName: string, direction?: "more_is_better" | "less_is_better") => void // Simplified
}

export default function EnhancedSubcategoryList({
  subcategories,
  categoryId,
  categoryColor,
  isEditMode,
  onReorder,
  onEdit,
  onDelete,
  onGoalDirectionEdit,
}: EnhancedSubcategoryListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    // Don't allow moving the "Other" subcategory
    const sourceItem = subcategories[result.source.index]
    const destItem = subcategories[result.destination.index]

    if (sourceItem?.isFixed || destItem?.isFixed) return

    const items = Array.from(subcategories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`subcategories-${categoryId}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="px-4 space-y-1">
            {subcategories.map((sub, index) => (
              <MobileSubcategoryItem
                key={sub.name}
                subcategory={sub}
                index={index}
                categoryId={categoryId}
                categoryColor={categoryColor}
                isEditMode={isEditMode}
                onEdit={onEdit}
                onDelete={onDelete}
                onGoalDirectionEdit={onGoalDirectionEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
