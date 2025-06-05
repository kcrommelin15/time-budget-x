"use client"

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical } from "lucide-react"

interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  isFixed?: boolean
}

interface DraggableSubcategoryListProps {
  subcategories: Subcategory[]
  categoryId: string
  categoryColor: string
  isEditMode: boolean
  onReorder: (categoryId: string, subcategories: Subcategory[]) => void
}

export default function DraggableSubcategoryList({
  subcategories,
  categoryId,
  categoryColor,
  isEditMode,
  onReorder,
}: DraggableSubcategoryListProps) {
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    // Don't allow moving the "Other" subcategory
    const sourceItem = subcategories[result.source.index]
    const destItem = subcategories[result.destination.index]

    if (sourceItem?.isFixed || destItem?.isFixed) return

    const items = Array.from(subcategories)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    onReorder(categoryId, items)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`subcategories-${categoryId}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="p-4 space-y-3">
            {subcategories.map((sub, index) => {
              const subUsagePercentage = sub.budget > 0 ? (sub.timeUsed / sub.budget) * 100 : 0
              const subRemainingHours = Math.max(0, sub.budget - sub.timeUsed)

              return (
                <Draggable
                  key={sub.name}
                  draggableId={`${categoryId}-${sub.name}`}
                  index={index}
                  isDragDisabled={!isEditMode || sub.isFixed}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`bg-white rounded-2xl p-4 border border-gray-200 shadow-sm transition-all duration-200 ${
                        snapshot.isDragging ? "scale-105 shadow-lg z-50" : ""
                      } ${sub.isFixed ? "opacity-75" : ""}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                          {isEditMode && !sub.isFixed && (
                            <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-3 h-3 text-gray-400 hover:text-gray-600 transition-colors" />
                            </div>
                          )}
                          <div
                            className="w-3 h-3 rounded-full shadow-sm"
                            style={{ backgroundColor: categoryColor }}
                          ></div>
                          <span className={`font-semibold text-gray-800 ${sub.isFixed ? "italic text-gray-600" : ""}`}>
                            {sub.name}
                          </span>
                          {sub.isFixed && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">auto</span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{sub.budget}h</div>
                          <div className="text-xs text-gray-500">budgeted</div>
                        </div>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1 font-medium">
                          <span className="text-gray-600">{sub.timeUsed}h used</span>
                          <span className="text-gray-600">{subRemainingHours}h remaining</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner border border-gray-200">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{
                              backgroundColor: categoryColor,
                              width: `${Math.min(100, subUsagePercentage)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </Draggable>
              )
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
