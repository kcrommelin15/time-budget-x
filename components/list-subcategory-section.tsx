"use client"

import type React from "react"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, Trash2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Subcategory {
  name: string
  budget: number
  timeUsed: number
  isFixed?: boolean
}

interface ListSubcategorySectionProps {
  subcategories: Subcategory[]
  categoryId: string
  categoryColor: string
  isEditMode: boolean
  onReorder: (categoryId: string, subcategories: Subcategory[]) => void
  onEdit: (categoryId: string, subcategoryName: string, newBudget: number) => void
  onDelete: (categoryId: string, subcategoryName: string) => void
}

export default function ListSubcategorySection({
  subcategories,
  categoryId,
  categoryColor,
  isEditMode,
  onReorder,
  onEdit,
  onDelete,
}: ListSubcategorySectionProps) {
  const [editingBudgets, setEditingBudgets] = useState<Record<string, string>>({})

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

  const handleBudgetEdit = (subcategoryName: string, value: string) => {
    setEditingBudgets({ ...editingBudgets, [subcategoryName]: value })
  }

  const handleBudgetSave = (subcategoryName: string) => {
    const value = editingBudgets[subcategoryName]
    if (value !== undefined) {
      const newBudget = Number.parseFloat(value)
      if (newBudget >= 0) {
        onEdit(categoryId, subcategoryName, newBudget)
      }
      const newEditing = { ...editingBudgets }
      delete newEditing[subcategoryName]
      setEditingBudgets(newEditing)
    }
  }

  const handleBudgetKeyPress = (e: React.KeyboardEvent, subcategoryName: string) => {
    if (e.key === "Enter") {
      handleBudgetSave(subcategoryName)
    } else if (e.key === "Escape") {
      const newEditing = { ...editingBudgets }
      delete newEditing[subcategoryName]
      setEditingBudgets(newEditing)
    }
  }

  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h}h ${m.toString().padStart(2, "0")}min`
  }

  const isEditing = (subcategoryName: string) => subcategoryName in editingBudgets

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId={`subcategories-${categoryId}`}>
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className="py-2">
            {subcategories.map((sub, index) => (
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
                    className={`flex items-center justify-between py-3 px-4 transition-all duration-200 ${
                      snapshot.isDragging ? "bg-gray-50 shadow-lg z-50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isEditMode && !sub.isFixed && (
                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-3 h-3 text-gray-400 hover:text-gray-600 transition-colors" />
                        </div>
                      )}
                      <span className="text-gray-700 font-medium">{sub.name}</span>
                      {isEditMode && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingBudgets({ ...editingBudgets, [sub.name]: sub.budget.toString() })}
                          className="p-1 h-6 w-6 rounded hover:bg-gray-100"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditMode && isEditing(sub.name) ? (
                        <Input
                          value={editingBudgets[sub.name]}
                          onChange={(e) => handleBudgetEdit(sub.name, e.target.value)}
                          onBlur={() => handleBudgetSave(sub.name)}
                          onKeyDown={(e) => handleBudgetKeyPress(e, sub.name)}
                          className="w-20 h-7 text-right rounded text-sm"
                          type="number"
                          min="0"
                          step="0.25"
                          autoFocus
                        />
                      ) : (
                        <span
                          className={`text-gray-600 font-medium ${
                            isEditMode && !sub.isFixed ? "cursor-pointer hover:bg-gray-50 rounded px-2 py-1" : ""
                          }`}
                          onClick={() =>
                            isEditMode &&
                            !sub.isFixed &&
                            setEditingBudgets({ ...editingBudgets, [sub.name]: sub.budget.toString() })
                          }
                        >
                          {formatTime(sub.budget)}
                        </span>
                      )}

                      {isEditMode && !sub.isFixed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(categoryId, sub.name)}
                          className="p-1 h-6 w-6 rounded hover:bg-red-50 text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}

                      <Button variant="ghost" size="sm" className="p-1 h-6 w-6 rounded hover:bg-gray-100">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                      </Button>
                    </div>
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
