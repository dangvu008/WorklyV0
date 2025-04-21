"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"
import { format, parseISO } from "date-fns"

const NoteCard = ({ note, onPress, onDelete }) => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return ""

    try {
      const date = parseISO(dateString)
      return format(date, "dd/MM/yyyy HH:mm")
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardBackground }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {note.title || "Untitled Note"}
          </Text>

          {note.reminderTime && (
            <View style={styles.reminderContainer}>
              <Ionicons name="alarm-outline" size={14} color={theme.primary} />
              <Text style={[styles.reminderText, { color: theme.primary }]}>{note.reminderTime}</Text>
            </View>
          )}
        </View>

        <Text style={[styles.contentText, { color: theme.textSecondary }]} numberOfLines={2}>
          {note.content}
        </Text>

        <View style={styles.footer}>
          <Text style={[styles.date, { color: theme.textSecondary }]}>
            {formatDate(note.updatedAt || note.createdAt)}
          </Text>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 8,
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(74, 111, 255, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderText: {
    fontSize: 12,
    marginLeft: 4,
  },
  contentText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 4,
  },
})

export default NoteCard
