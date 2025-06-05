"use client"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import CategoryCard from "@/components/category-card"
import type { Category } from "@/lib/types"

interface DraggableCategoryListProps {
  categories: Category[]
  onReorder: (categories: Category[]) => void
  onEdit: (category: Category) => void
  onDelete: (categoryId: string) => void
}

export default function DraggableCategoryList({ categories, onReorder, onEdit, onDelete }: DraggableCategoryListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(categories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="categories">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-6">
            {categories.map((category, index) => (
              <Draggable key={category.id} draggableId={category.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`transition-all duration-200 ${
                      snapshot.isDragging ? "scale-105 rotate-2 shadow-2xl z-50" : ""
                    }`}
                  >
                    <CategoryCard category={category} onEdit={onEdit} onDelete={onDelete} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
