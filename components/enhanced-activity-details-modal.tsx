"use client"

import { useState, useEffect } from "react"
import { X, Check, ChevronRight, FileText, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { mockCategories } from "@/lib/mock-data"
import type { TimeEntry } from "@/lib/types"
// Import the centralized formatTime function
import { formatTime } from "@/lib/goal-utils"

interface EnhancedActivityDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  entry: TimeEntry
  onSave: (entry: TimeEntry) => void
  onDelete: (entryId: string) => void
}

const sourceOptions = [
  { value: "manual", label: "Manual Entry", icon: "✏️" },
  { value: "slack", label: "Slack", icon: "💬" },
  { value: "trello", label: "Trello", icon: "📋" },
  { value: "calendar", label: "Calendar", icon: "📅" },
  { value: "timer", label: "Timer", icon: "⏱️" },
]

export default function EnhancedActivityDetailsModal({
  isOpen,
  onClose,
  entry,
  onSave,
  onDelete,
}: EnhancedActivityDetailsModalProps) {
  const [formData, setFormData] = useState({
    categoryId: entry.categoryId,
    subcategory: entry.subcategory || "",
    description: entry.description || "",
    notes: entry.notes || "",
    source: entry.source || "manual",
    startTime: entry.startTime,
    endTime: entry.endTime,
    date: entry.date,
    approved: entry.approved || false,
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        categoryId: entry.categoryId,
        subcategory: entry.subcategory || "",
        description: entry.description || "",
        notes: entry.notes || "",
        source: entry.source || "manual",
        startTime: entry.startTime,
        endTime: entry.endTime,
        date: entry.date,
        approved: entry.approved || false,
      })
    }
  }, [isOpen, entry])

  if (!isOpen) return null

  const selectedCategory = mockCategories.find((c) => c.id === formData.categoryId)
  const subcategories = selectedCategory?.subcategories || []

  // Update the getDuration function to use formatTime
  const getDuration = () => {
    const [startHour, startMin] = formData.startTime.split(":").map(Number)
    const [endHour, endMin] = formData.endTime.split(":").map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60

    return formatTime(durationHours, true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (timeString: string) => {
    const [hour, minute] = timeString.split(":")
    const hourNum = Number.parseInt(hour)
    const ampm = hourNum >= 12 ? "PM" : "AM"
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum
    return `${displayHour}:${minute} ${ampm}`
  }

  const handleSave = () => {
    const updatedEntry: TimeEntry = {
      ...entry,
      categoryId: formData.categoryId,
      categoryName: selectedCategory?.name || entry.categoryName,
      categoryColor: selectedCategory?.color || entry.categoryColor,
      subcategory: formData.subcategory,
      description: formData.description,
      notes: formData.notes,
      source: formData.source,
      startTime: formData.startTime,
      endTime: formData.endTime,
      date: formData.date,
      approved: formData.approved,
    }
    onSave(updatedEntry)
    onClose()
  }

  const handleApprove = () => {
    setFormData({ ...formData, approved: true })
  }

  const selectedSource = sourceOptions.find((s) => s.value === formData.source)

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-10 w-10 p-0">
          <X className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-semibold">Activity Details</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Duration Display */}
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{getDuration()}</div>
          </div>

          {/* Type Section */}
          <div className="bg-gray-50 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Label className="text-lg font-semibold text-gray-900">Type</Label>
                <p className="text-gray-600 mt-1">Focus Time</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <hr className="border-gray-200 mb-4" />

            {/* Category */}
            <div className="mb-4">
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
              >
                <SelectTrigger className="rounded-2xl h-14 border-0 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategory */}
            {subcategories.length > 0 && (
              <div className="mb-4">
                <Label className="text-lg font-semibold text-gray-900 mb-3 block">Activity</Label>
                <Select
                  value={formData.subcategory}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                >
                  <SelectTrigger className="rounded-2xl h-14 border-0 bg-white shadow-sm">
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((sub) => (
                      <SelectItem key={sub.name} value={sub.name}>
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: selectedCategory?.color }}
                          ></div>
                          <span className="font-medium">{sub.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <hr className="border-gray-200 mb-4" />

            {/* Details */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">Details</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What did you work on?"
                className="rounded-2xl border-0 bg-white shadow-sm min-h-[100px] resize-none"
              />
            </div>
          </div>

          {/* Time & Date Section */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
            {/* Start Time */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">Starts</Label>
              <div className="text-2xl font-medium text-gray-900">{formatTime(formData.startTime)}</div>
              <hr className="border-gray-200 mt-4" />
            </div>

            {/* End Time */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">Ends</Label>
              <div className="text-2xl font-medium text-gray-900">{formatTime(formData.endTime)}</div>
              <hr className="border-gray-200 mt-4" />
            </div>

            {/* Date */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">Date</Label>
              <div className="text-2xl font-medium text-gray-900">{formatDate(formData.date)}</div>
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="bg-gray-50 rounded-3xl p-6 space-y-6">
            {/* Notes */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                <FileText className="w-5 h-5 inline mr-2" />
                Additional Notes
              </Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional context or notes..."
                className="rounded-2xl border-0 bg-white shadow-sm min-h-[80px] resize-none"
              />
            </div>

            <hr className="border-gray-200" />

            {/* Source */}
            <div>
              <Label className="text-lg font-semibold text-gray-900 mb-3 block">
                <MapPin className="w-5 h-5 inline mr-2" />
                Recorded From
              </Label>
              <Select value={formData.source} onValueChange={(value) => setFormData({ ...formData, source: value })}>
                <SelectTrigger className="rounded-2xl h-14 border-0 bg-white shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sourceOptions.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{source.icon}</span>
                        <span className="font-medium">{source.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Approval Section */}
          <div className="space-y-4">
            {!formData.approved ? (
              <Button
                onClick={handleApprove}
                className="w-full h-16 rounded-3xl bg-black hover:bg-gray-800 text-white text-lg font-semibold"
              >
                <Check className="w-6 h-6 mr-3" />
                Approve
              </Button>
            ) : (
              <div className="bg-gray-50 rounded-3xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-semibold text-gray-900">Approved</Label>
                    <p className="text-sm text-gray-600 mt-1">This entry is locked and counts toward your budget</p>
                  </div>
                  <Switch
                    checked={formData.approved}
                    onCheckedChange={(checked) => setFormData({ ...formData, approved: checked })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="pb-8">
            <Button
              onClick={handleSave}
              className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
