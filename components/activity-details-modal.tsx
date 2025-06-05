"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories } from "@/lib/mock-data"
import type { TimeEntry } from "@/lib/types"

// Import the centralized formatTime function
import { formatTime } from "@/lib/goal-utils"

interface ActivityDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  entry: TimeEntry
  onSave: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
}

export default function ActivityDetailsModal({ isOpen, onClose, entry, onSave, onDelete }: ActivityDetailsModalProps) {
  const [selectedCategory, setSelectedCategory] = useState(entry.categoryId)
  const [selectedSubcategory, setSelectedSubcategory] = useState("")
  const [approved, setApproved] = useState(entry.status !== "pending")

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      description: entry.description,
      startTime: entry.startTime,
      endTime: entry.endTime,
      date: entry.date,
    },
  })

  if (!isOpen) return null

  const selectedCat = mockCategories.find((c) => c.id === selectedCategory)
  const subcategories = selectedCat?.subcategories || []

  // Update the getDuration function to use formatTime
  const getDuration = () => {
    const [startHour, startMin] = entry.startTime.split(":").map(Number)
    const [endHour, endMin] = entry.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60

    return formatTime(durationHours, true)
  }

  const onSubmit = (data: any) => {
    const category = mockCategories.find((c) => c.id === selectedCategory)
    if (category) {
      const updatedEntry = {
        ...entry,
        categoryId: selectedCategory,
        categoryName: category.name,
        categoryColor: category.color,
        description: data.description,
        startTime: data.startTime,
        endTime: data.endTime,
        date: data.date,
        status: approved ? "confirmed" : "pending",
      }
      onSave(updatedEntry)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold">Activity Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">{getDuration()}</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Type */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Type</Label>
                  <p className="text-gray-600">Focus Time</p>
                </div>
                <div className="text-gray-400">›</div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <Label className="text-base font-medium mb-3 block">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="rounded-xl">
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

            {/* Subcategory */}
            {subcategories.length > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4">
                <Label className="text-base font-medium mb-3 block">Subcategory</Label>
                <Select value={selectedSubcategory} onValueChange={setSelectedSubcategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select subcategory" />
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

            {/* Details */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <Label htmlFor="description" className="text-base font-medium">
                Details
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="What did you work on?"
                className="rounded-xl mt-2 border-0 bg-white"
                rows={3}
              />
            </div>

            {/* Time */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
              <div>
                <Label htmlFor="startTime" className="text-base font-medium">
                  Starts
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register("startTime")}
                  className="rounded-xl mt-2 border-0 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="endTime" className="text-base font-medium">
                  Ends
                </Label>
                <Input
                  id="endTime"
                  type="time"
                  {...register("endTime")}
                  className="rounded-xl mt-2 border-0 bg-white"
                />
              </div>

              <div>
                <Label htmlFor="date" className="text-base font-medium">
                  Date
                </Label>
                <Input id="date" type="date" {...register("date")} className="rounded-xl mt-2 border-0 bg-white" />
              </div>
            </div>

            {/* Approved */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Approved</Label>
                <Switch checked={approved} onCheckedChange={setApproved} />
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-2xl bg-black hover:bg-gray-800 text-white">
              <Check className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
