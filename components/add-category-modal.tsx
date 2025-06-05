"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Category } from "@/lib/types"

interface AddCategoryModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (category: Omit<Category, "id" | "timeUsed">) => void
}

const colorPalette = [
  { name: "Blue", value: "#2B93FA" },
  { name: "Green", value: "#13B078" },
  { name: "Orange", value: "#EB8C5E" },
  { name: "Red", value: "#F94359" },
  { name: "Violet", value: "#6C63FF" },
  { name: "Yellow", value: "#BB9000" },
  { name: "Mint", value: "#1EBB84" },
  { name: "Grey", value: "#6A7A7E" },
]

export default function AddCategoryModal({ isOpen, onClose, onAdd }: AddCategoryModalProps) {
  const [selectedColor, setSelectedColor] = useState(colorPalette[0].value)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  if (!isOpen) return null

  const onSubmit = (data: any) => {
    onAdd({
      name: data.name,
      weeklyBudget: Number.parseInt(data.weeklyBudget),
      color: selectedColor,
      subcategories: [],
    })
    reset()
    setSelectedColor(colorPalette[0].value)
  }

  const handleClose = () => {
    reset()
    setSelectedColor(colorPalette[0].value)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Add Category</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div>
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Category name is required" })}
              placeholder="e.g., Work, Personal, Exercise"
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <Label htmlFor="weeklyBudget">Weekly Budget (hours)</Label>
            <Input
              id="weeklyBudget"
              type="number"
              min="1"
              max="168"
              {...register("weeklyBudget", {
                required: "Weekly budget is required",
                min: { value: 1, message: "Must be at least 1 hour" },
                max: { value: 168, message: "Cannot exceed 168 hours per week" },
              })}
              placeholder="40"
            />
            {errors.weeklyBudget && (
              <p className="text-sm text-red-500 mt-1">{errors.weeklyBudget.message as string}</p>
            )}
          </div>

          <div>
            <Label>Choose Color</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {colorPalette.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={`w-12 h-12 rounded-lg border-2 ${
                    selectedColor === color.value ? "border-gray-800" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Category
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
