"use client"

import { useState, useEffect, useCallback } from "react"
import { View, StyleSheet, Dimensions } from "react-native"
import { useFocusEffect } from "@react-navigation/native"
import { useRoute } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { useAuth } from "../contexts/AuthContext"
import { useAPI } from "../contexts/ApiContext"
import type { TimeEntry } from "../types"
import Timeline from "../components/Timeline"
import AddTimeEntryModal from "../components/AddTimeEntryModal"
import EditTimeEntryModal from "../components/EditTimeEntryModal"
import DeleteConfirmationModal from "../components/DeleteConfirmationModal"
import ErrorModal from "../components/ErrorModal"
import LoadingIndicator from "../components/LoadingIndicator"
import EnhancedBottomTrackingWidget from "../components/EnhancedBottomTrackingWidget"
import type { Category } from "../types"

const TimelineScreen = () => {
  const { user } = useAuth()
  const { api } = useAPI()
  const route = useRoute()
  const insets = useSafeAreaInsets()

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const [prefilledEntry, setPrefilledEntry] = useState<Partial<TimeEntry> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    const checkScreenSize = () => {
      const windowWidth = Dimensions.get("window").width
      setIsDesktop(windowWidth >= 768)
    }

    checkScreenSize()
    Dimensions.addEventListener("change", checkScreenSize)

    return () => {
      Dimensions.removeEventListener("change", checkScreenSize)
    }
  }, [])

  const fetchTimeEntries = useCallback(async () => {
    setIsLoading(true)
    try {
      if (!user) {
        setError("User not available. Please log in.")
        return
      }
      const fetchedEntries = await api.getTimeEntries(user.uid)
      setTimeEntries(fetchedEntries)
    } catch (e: any) {
      setError(e.message || "Failed to fetch time entries.")
    } finally {
      setIsLoading(false)
    }
  }, [api, user])

  const fetchCategories = useCallback(async () => {
    try {
      if (!user) {
        setError("User not available. Please log in.")
        return
      }
      const fetchedCategories = await api.getCategories(user.uid)
      setCategories(fetchedCategories)
    } catch (e: any) {
      setError(e.message || "Failed to fetch categories.")
    }
  }, [api, user])

  useFocusEffect(
    useCallback(() => {
      fetchTimeEntries()
      fetchCategories()
    }, [fetchTimeEntries, fetchCategories]),
  )

  useEffect(() => {
    if (route.params && route.params.startTime) {
      setPrefilledEntry({ startTime: route.params.startTime as Date })
      setIsAddModalOpen(true)
    }
  }, [route.params])

  const handleAddTimeEntry = async (newEntry: TimeEntry) => {
    setIsLoading(true)
    try {
      if (!user) {
        setError("User not available. Please log in.")
        return
      }
      await api.addTimeEntry(user.uid, newEntry)
      await fetchTimeEntries()
      setIsAddModalOpen(false)
      setPrefilledEntry(null)
    } catch (e: any) {
      setError(e.message || "Failed to add time entry.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTimeEntry = async (updatedEntry: TimeEntry) => {
    setIsLoading(true)
    try {
      if (!user) {
        setError("User not available. Please log in.")
        return
      }
      if (!selectedEntry) {
        setError("No entry selected to update.")
        return
      }
      await api.updateTimeEntry(user.uid, selectedEntry.id, updatedEntry)
      await fetchTimeEntries()
      setIsEditModalOpen(false)
      setSelectedEntry(null)
    } catch (e: any) {
      setError(e.message || "Failed to update time entry.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTimeEntry = async () => {
    setIsLoading(true)
    try {
      if (!user) {
        setError("User not available. Please log in.")
        return
      }
      if (!selectedEntry) {
        setError("No entry selected to delete.")
        return
      }
      await api.deleteTimeEntry(user.uid, selectedEntry.id)
      await fetchTimeEntries()
      setIsDeleteModalOpen(false)
      setSelectedEntry(null)
    } catch (e: any) {
      setError(e.message || "Failed to delete time entry.")
    } finally {
      setIsLoading(false)
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#fff",
      paddingBottom: insets.bottom,
    },
  })

  return (
    <View style={styles.container}>
      {isLoading && <LoadingIndicator />}
      {error && <ErrorModal message={error} onClose={() => setError(null)} />}

      <Timeline
        timeEntries={timeEntries}
        onEdit={(entry) => {
          setSelectedEntry(entry)
          setIsEditModalOpen(true)
        }}
        onDelete={(entry) => {
          setSelectedEntry(entry)
          setIsDeleteModalOpen(true)
        }}
        isDesktop={isDesktop}
      />

      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setPrefilledEntry(null)
        }}
        onAdd={handleAddTimeEntry}
        prefilledEntry={prefilledEntry}
        categories={categories}
      />

      <EditTimeEntryModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEntry(null)
        }}
        onUpdate={handleUpdateTimeEntry}
        entry={selectedEntry}
        categories={categories}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedEntry(null)
        }}
        onDelete={handleDeleteTimeEntry}
      />

      <EnhancedBottomTrackingWidget
        onAddEntry={handleAddTimeEntry}
        isDesktop={isDesktop}
        user={user}
        categories={categories}
      />
    </View>
  )
}

export default TimelineScreen
