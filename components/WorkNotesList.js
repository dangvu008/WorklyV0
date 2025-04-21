"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation, useWork } from "../hooks"
import AsyncStorage from "@react-native-async-storage/async-storage"

const WorkNotesList = ({ limit = 3, navigation }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { currentShift } = useWork()

  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  // Tải danh sách ghi chú
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setLoading(true)
        const notesData = await AsyncStorage.getItem("notes")

        if (notesData) {
          let parsedNotes = JSON.parse(notesData)

          // Lọc ghi chú theo ca làm việc nếu có
          if (currentShift) {
            parsedNotes = parsedNotes.filter(
              (note) =>
                !note.associatedShiftIds ||
                note.associatedShiftIds.length === 0 ||
                note.associatedShiftIds.includes(currentShift.id),
            )
          }

          // Sắp xếp theo thời gian nhắc nhở hoặc thời gian cập nhật
          parsedNotes.sort((a, b) => {
            if (a.reminderTime && b.reminderTime) {
              return a.reminderTime.localeCompare(b.reminderTime)
            }
            return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
          })

          // Giới hạn số lượng ghi chú hiển thị
          setNotes(parsedNotes.slice(0, limit))
        } else {
          setNotes([])
        }
      } catch (error) {
        console.error("Error loading notes:", error)
        setNotes([])
      } finally {
        setLoading(false)
      }
    }

    loadNotes()
  }, [currentShift, limit])

  // Xử lý chỉnh sửa ghi chú
  const handleEditNote = (note) => {
    navigation.navigate("AddEditNote", { note })
  }

  // Xử lý xóa ghi chú
  const handleDeleteNote = async (noteId) => {
    Alert.alert(t("notes.deleteNoteTitle"), t("notes.deleteNoteMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            // Lấy tất cả ghi chú
            const notesData = await AsyncStorage.getItem("notes")
            if (notesData) {
              const parsedNotes = JSON.parse(notesData)
              // Lọc bỏ ghi chú cần xóa
              const updatedNotes = parsedNotes.filter((note) => note.id !== noteId)
              // Lưu lại danh sách ghi chú
              await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes))
              // Cập nhật state
              setNotes(notes.filter((note) => note.id !== noteId))
            }
          } catch (error) {
            console.error("Error deleting note:", error)
          }
        },
      },
    ])
  }

  // Render item ghi chú
  const renderNoteItem = ({ item }) => (
    <View style={[styles.noteItem, { borderBottomColor: theme.colors.border }]}>
      <View style={styles.noteContent}>
        <Text style={[styles.noteTitle, { color: theme.colors.text }]} numberOfLines={1}>
          {item.title || t("notes.untitledNote")}
        </Text>

        {item.content && (
          <Text style={[styles.noteContent, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.content}
          </Text>
        )}

        {item.reminderTime && (
          <View style={styles.reminderContainer}>
            <Ionicons name="alarm-outline" size={14} color={theme.colors.primary} />
            <Text style={[styles.reminderText, { color: theme.colors.primary }]}>{item.reminderTime}</Text>
          </View>
        )}
      </View>

      <View style={styles.noteActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditNote(item)}>
          <Ionicons name="pencil" size={18} color={theme.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteNote(item.id)}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  )

  // Render khi không có ghi chú
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>{t("notes.noNotes")}</Text>
      <TouchableOpacity
        style={[styles.addNoteButton, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate("AddEditNote")}
      >
        <Text style={styles.addNoteButtonText}>{t("notes.addNote")}</Text>
      </TouchableOpacity>
    </View>
  )

  // Render khi đang tải
  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>{t("common.loading")}</Text>
    </View>
  )

  if (loading) {
    return renderLoading()
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyList}
        scrollEnabled={false}
      />

      {notes.length > 0 && (
        <TouchableOpacity style={styles.viewAllButton} onPress={() => navigation.navigate("Notes")}>
          <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>{t("notes.viewAll")}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  noteItem: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  noteContent: {
    flex: 1,
    paddingRight: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  reminderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  reminderText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noteActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  emptyText: {
    fontSize: 14,
    marginBottom: 12,
  },
  addNoteButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addNoteButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
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

export default WorkNotesList
