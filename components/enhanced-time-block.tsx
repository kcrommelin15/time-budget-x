"use client"

import { useState } from "react"
import { Edit, Check, X, Clock, MoreHorizontal, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { mockCategories } from "@/lib/mock-data"
import type { TimeEntry } from "@/lib/types"

interface EnhancedTimeBlockProps {
  entry: TimeEntry
  onEdit: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
}

export default function EnhancedTimeBlock({ entry, onEdit, onDelete }: EnhancedTimeBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [editData, setEditData] = useState({
    startTime: entry.startTime,
    endTime: entry.endTime,
    categoryId: entry.categoryId,
    description: entry.description,
  })

  const getDuration = () => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes

    const hours = Math.floor(durationMinutes / 60)
    const minutes = durationMinutes % 60

    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
    }
    return `${minutes}m`
  }

  const handleSave = () => {
    const selectedCategory = mockCategories.find((c) => c.id === editData.categoryId)
    if (selectedCategory) {
      onEdit({
        ...entry,
        startTime: editData.startTime,
        endTime: editData.endTime,
        categoryId: editData.categoryId,
        categoryName: selectedCategory.name,
        categoryColor: selectedCategory.color,
        description: editData.description,
      })
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditData({
      startTime: entry.startTime,
      endTime: entry.endTime,
      categoryId: entry.categoryId,
      description: entry.description,
    })
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDelete(entry.id)
    setShowMenu(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white rounded-3xl p-4 shadow-xl border-2 border-blue-200 border border-gray-200/60">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 font-medium">Start</label>
              <Input
                type="time"
                value={editData.startTime}
                onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                className="rounded-xl h-9 mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 font-medium">End</label>
              <Input
                type="time"
                value={editData.endTime}
                onChange={(e) => setEditData({ ...editData, endTime: e.target.value })}
                className="rounded-xl h-9 mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Category</label>
            <Select
              value={editData.categoryId}
              onValueChange={(value) => setEditData({ ...editData, categoryId: value })}
            >
              <SelectTrigger className="rounded-xl h-9 mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mockCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-gray-600 font-medium">Description</label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              placeholder="What did you work on?"
              className="rounded-xl h-20 mt-1 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="flex-1 rounded-xl bg-green-500 hover:bg-green-600">
              <Check className="w-3 h-3 mr-1" />
              Save
            </Button>
            <Button onClick={handleCancel} variant="outline" size="sm" className="flex-1 rounded-xl">
              <X className="w-3 h-3 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="border-l-4 bg-white/95 backdrop-blur-sm rounded-r-3xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 group cursor-pointer border border-gray-200/60 hover:border-gray-300/60"
      style={{ borderLeftColor: entry.categoryColor }}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{entry.categoryName}</h4>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600 font-medium">
                {entry.status === "pending" ? "Pending" : "Confirmed"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {entry.startTime} - {entry.endTime} | {getDuration()}
          </p>
          {entry.description && (
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{entry.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              setIsEditing(true)
            }}
            className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
          >
            <Edit className="w-3 h-3" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
              className="rounded-xl opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-50 min-w-[100px]">
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />}
    </div>
  )
}
