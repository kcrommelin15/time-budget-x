"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { X, Clock, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import type { TimeEntry } from "@/lib/types"
import type { User } from "@supabase/supabase-js"

interface EditTimeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: (entry: TimeEntry) => Promise<void>
  onDelete: (entryId: string) => Promise<void>
  entry: TimeEntry | null
  user?: User | null
  onTimeUsageUpdate?: () => void
}

export default function EditTimeEntryModal({
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  entry,
  user,
  onTimeUsageUpdate,
}: EditTimeEntryModalProps) {
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [validationError, setValidationError] = useState<string | null>(null)
  const { categories } = useCategories(user)

  const [selectedCat, setSelectedCat] = useState(null)
  const [subcategories, setSubcategories] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
      description: "",
    },
  })

  // Update form when entry changes
  useEffect(() => {
    if (entry && isOpen) {
      setValue("startTime", entry.startTime)
      setValue("endTime", entry.endTime)
      setValue("description", entry.description || "")

      // Set category - try to find by ID first, then by name as fallback
      const categoryById = categories.find((c) => c.id === entry.categoryId)
      const categoryByName = categories.find((c) => c.name === entry.categoryName)
      const foundCategory = categoryById || categoryByName

      if (foundCategory) {
        setSelectedCategory(foundCategory.id)
      }

      // Set subcategory if it exists
      if (entry.subcategory) {
        setSelectedSubcategory(entry.subcategory)
      }
    }
  }, [entry, isOpen, setValue, categories])

  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory)
      setSelectedCat(cat)
      setSubcategories(cat?.subcategories || [])
    } else {
      setSelectedCat(null)
      setSubcategories([])
    }
  }, [selectedCategory, categories])

  if (!isOpen || !entry) return null

  const onSubmit = async (data: any) => {
    const category = categories.find((c) => c.id === selectedCategory)
    if (!category) {
      setValidationError("Please select a valid category")
      return
    }

    // Validate subcategory if provided
    if (selectedSubcategory && subcategories.length > 0) {
      const validSubcategory = subcategories.find((sub) => sub.name === selectedSubcategory)
      if (!validSubcategory) {
        setValidationError("Please select a valid activity")
        return
      }
    }

    setValidationError(null)

    try {
      await onUpdate({
        ...entry,
        categoryId: selectedCategory,
        categoryName: category.name,
        categoryColor: category.color,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description || "",
        subcategory: selectedSubcategory || undefined,
      })

      // Only reset and close if successful
      reset()
      setSelectedCategory("")
      setSelectedSubcategory("")
      setValidationError(null)
      onClose()
    } catch (error) {
      console.error("Error updating time entry:", error)
      setValidationError(error instanceof Error ? error.message : "Failed to update time entry")
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(entry.id)
      reset()
      setSelectedCategory("")
      setSelectedSubcategory("")
      setValidationError(null)
      onClose()
    } catch (error) {
      console.error("Error deleting time entry:", error)
      setValidationError(error instanceof Error ? error.message : "Failed to delete time entry")
    }
  }

  const handleClose = () => {
    reset()
    setSelectedCategory("")
    setSelectedSubcategory("")
    setValidationError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold">Edit Time Entry</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <Label className="text-base font-medium">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="rounded-xl mt-2 h-12">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }}></div>
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!selectedCategory && <p className="text-sm text-red-500 mt-1">Please select a category</p>}
            {validationError && (
              <div className="text-sm text-red-500 mt-2 p-2 bg-red-50 rounded-lg">{validationError}</div>
            )}
          </div>

          {subcategories.length > 0 && (
            <div>
              <Label className="text-base font-medium">Activity (optional)</Label>
              <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                <SelectTrigger className="rounded-xl mt-2 h-12">
                  <SelectValue placeholder="Select an activity" />
                </SelectTrigger>
                <SelectContent>
                  {subcategories.map((sub) => (
                    <SelectItem key={sub.name} value={sub.name}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedCat?.color }}></div>
                        {sub.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime" className="text-base font-medium">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime", { required: "Start time is required" })}
                className="rounded-xl mt-2 h-12"
              />
              {errors.startTime && <p className="text-sm text-red-500 mt-1">{errors.startTime.message as string}</p>}
            </div>

            <div>
              <Label htmlFor="endTime" className="text-base font-medium">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime", { required: "End time is required" })}
                className="rounded-xl mt-2 h-12"
              />
              {errors.endTime && <p className="text-sm text-red-500 mt-1">{errors.endTime.message as string}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-base font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="What did you work on?"
              rows={3}
              className="rounded-xl mt-2 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              className="rounded-2xl h-12 px-4 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} className="rounded-2xl h-12 px-6">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-2xl h-12 bg-gradient-to-r from-blue-500 to-purple-600"
              disabled={!selectedCategory}
            >
              Update Entry
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
