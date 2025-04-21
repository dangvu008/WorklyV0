"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks/useTheme"
import { useTranslation } from "../hooks/useTranslation"
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
  useEffect(() => {
    loadNotes()
  }, [])

  // Load notes from AsyncStorage
  const loadNotes = async () => {
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
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Render note item
  const renderNoteItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.noteItem, { borderBottomColor: theme.border }]}
      onPress={() => navigation.navigate("NoteDetail", { noteId: item.id })}
    >
      <View style={styles.noteContent}>
        <Text style={[styles.noteTitle, { color: theme.text }]} numberOfLines={1}>
          {item.title || t("notes.untitledNote")}
        </Text>
        {item.content && (
          <Text style={[styles.notePreview, { color: theme.textSecondary }]} numberOfLines={1}>
            {item.content}
          </Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
    </TouchableOpacity>
  )

  // Render empty state
  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{t("notes.noNotes")}</Text>
      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate("NoteDetail")}
      >
        <Text style={styles.addButtonText}>{t("notes.addNote")}</Text>
      </TouchableOpacity>
    </View>
  )

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t("common.loading")}</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyComponent}
        scrollEnabled={false}
      />

      {notes.length > 0 && (
        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("Notes")}>
          <Text style={[styles.viewAllText, { color: theme.primary }]}>
            {t("common.viewAll")} ({notes.length})
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  loadingContainer: {
    padding: 16,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
  },
  emptyContainer: {
    padding: 16,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
  },
  addButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  viewAllButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default NotesWidget
