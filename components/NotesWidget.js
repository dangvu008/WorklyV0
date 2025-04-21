"use client"
import { useState, useEffect, useCallback } from "react"
import { useTheme, useTranslation } from "../hooks"
import AsyncStorage from "@react-native-async-storage/async-storage"

const NotesWidget = ({ navigation, limit = 3 }) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  // Theme colors
  const theme = {
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  // Load notes
  const loadNotes = useCallback(async () => {
    try {
      setLoading(true)
      const notesData = await AsyncStorage.getItem("notes")
      if (notesData) {
        const parsedNotes = JSON.parse(notesData)
        // Sort by updated date
        parsedNotes.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt)
          const dateB = new Date(b.updatedAt || b.createdAt)
          return dateB - dateA
        })
        // Limit the number of notes
        setNotes(parsedNotes.slice(0, limit))
      } else {
        setNotes([])
      }
    } catch (error) {
      console.error("Error loading notes:", error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    loadNotes()
  }, [loadNotes])
}
