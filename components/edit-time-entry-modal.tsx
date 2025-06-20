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

  // Debug: Log when modal opens and what data we have
  useEffect(() => {
    if (isOpen) {
      console.log("=== EDIT MODAL OPENED ===")
      console.log("Entry data:", entry)
      console.log("Categories available:", categories)
      console.log("Categories length:", categories.length)
    }
  }, [isOpen, entry, categories])

  // Reset everything when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Modal closed, resetting state")
      reset()
      setSelectedCategory("")
      setSelectedSubcategory("")
      setValidationError(null)
      setSelectedCat(null)
      setSubcategories([])
    }
  }, [isOpen, reset])

  // Main effect: Set up form when modal opens with entry data
  useEffect(() => {
    if (isOpen && entry && categories.length > 0) {
      console.log("=== SETTING UP FORM ===")
      console.log("Entry to edit:", {
        id: entry.id,
        categoryId: entry.categoryId,
        categoryName: entry.categoryName,
        subcategory: entry.subcategory,
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description,
      })

      // Set basic form fields
      setValue("startTime", entry.startTime)
      setValue("endTime", entry.endTime)
      setValue("description", entry.description || "")
      console.log("Set form values:", {
        startTime: entry.startTime,
        endTime: entry.endTime,
        description: entry.description || "",
      })

      // Find and set category
      let foundCategory = null

      // Method 1: Find by categoryId
      if (entry.categoryId) {
        foundCategory = categories.find((c) => c.id === entry.categoryId)
        console.log("Search by categoryId:", entry.categoryId, "Found:", foundCategory)
      }

      // Method 2: Find by categoryName if ID search failed
      if (!foundCategory && entry.categoryName) {
        foundCategory = categories.find((c) => c.name === entry.categoryName)
        console.log("Search by categoryName:", entry.categoryName, "Found:", foundCategory)
      }

      // Method 3: Find by exact match of both
      if (!foundCategory) {
        foundCategory = categories.find((c) => c.id === entry.categoryId || c.name === entry.categoryName)
        console.log("Search by either ID or name, Found:", foundCategory)
      }

      if (foundCategory) {
        console.log("✅ Setting category:", foundCategory.id, foundCategory.name)
        setSelectedCategory(foundCategory.id)

        // Handle subcategory
        if (entry.subcategory && foundCategory.subcategories?.length > 0) {
          const foundSubcategory = foundCategory.subcategories.find((sub) => sub.name === entry.subcategory)
          console.log("Looking for subcategory:", entry.subcategory, "in:", foundCategory.subcategories)
          console.log("Found subcategory:", foundSubcategory)

          if (foundSubcategory) {
            console.log("✅ Setting subcategory:", entry.subcategory)
            setSelectedSubcategory(entry.subcategory)
          } else {
            console.log("❌ Subcategory not found")
          }
        } else {
          console.log("No subcategory to set or category has no subcategories")
        }
      } else {
        console.log("❌ CATEGORY NOT FOUND!")
        console.log(
          "Available categories:",
          categories.map((c) => ({ id: c.id, name: c.name })),
        )
        console.log("Looking for:", { categoryId: entry.categoryId, categoryName: entry.categoryName })
      }
    }
  }, [isOpen, entry, categories, setValue])

  // Update subcategories when selected category changes
  useEffect(() => {
    if (selectedCategory && categories.length > 0) {
      const cat = categories.find((c) => c.id === selectedCategory)
      console.log("Category selection changed to:", cat)
      setSelectedCat(cat)
      setSubcategories(cat?.subcategories || [])

      // Clear subcategory if it doesn't exist in new category
      if (selectedSubcategory && cat?.subcategories) {
        const hasSubcategory = cat.subcategories.some((sub) => sub.name === selectedSubcategory)
        if (!hasSubcategory) {
          console.log("Clearing subcategory - not found in new category")
          setSelectedSubcategory("")
        }
      }
    } else {
      setSelectedCat(null)
      setSubcategories([])
    }
  }, [selectedCategory, categories, selectedSubcategory])

  if (!isOpen || !entry) return null

  const onSubmit = async (data: any) => {
    console.log("Form submitted with:", data)
    console.log("Selected category:", selectedCategory)
    console.log("Selected subcategory:", selectedSubcategory)

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
      const updatedEntry = {
        ...entry,
        categoryId: selectedCategory,
        categoryName: category.name,
        categoryColor: category.color,
        startTime: data.startTime,
        endTime: data.endTime,
        description: data.description || "",
        subcategory: selectedSubcategory || undefined,
      }

      console.log("Updating entry with:", updatedEntry)
      await onUpdate(updatedEntry)
      onClose()
    } catch (error) {
      console.error("Error updating time entry:", error)
      setValidationError(error instanceof Error ? error.message : "Failed to update time entry")
    }
  }

  const handleDelete = async () => {
    try {
      await onDelete(entry.id)
      onClose()
    } catch (error) {
      console.error("Error deleting time entry:", error)
      setValidationError(error instanceof Error ? error.message : "Failed to delete time entry")
    }
  }

  const handleClose = () => {
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
          {/* Debug info - remove this later */}
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
            <div>Entry ID: {entry.id}</div>
            <div>Category ID: {entry.categoryId}</div>
            <div>Category Name: {entry.categoryName}</div>
            <div>Subcategory: {entry.subcategory || "None"}</div>
            <div>Selected Category: {selectedCategory || "None"}</div>
            <div>Selected Subcategory: {selectedSubcategory || "None"}</div>
            <div>Available Categories: {categories.length}</div>
          </div>

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
