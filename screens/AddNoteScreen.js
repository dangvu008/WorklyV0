"use client"
import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"
import AsyncStorage from "@react-native-async-storage/async-storage"

const AddNoteScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    accent: "#4A6FFF",
  }

  // Lưu ghi chú
  const saveNote = async () => {
    if (!title.trim() && !content.trim()) {
      return // Không lưu nếu cả tiêu đề và nội dung đều trống
    }

    setIsSaving(true)

    try {
      // Tạo ghi chú mới
      const newNote = {
        id: Date.now().toString(),
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Lấy danh sách ghi chú hiện tại
      const savedNotesJson = await AsyncStorage.getItem("@notes")
      const savedNotes = savedNotesJson ? JSON.parse(savedNotesJson) : []

      // Thêm ghi chú mới vào danh sách
      const updatedNotes = [newNote, ...savedNotes]

      // Lưu danh sách ghi chú đã cập nhật
      await AsyncStorage.setItem("@notes", JSON.stringify(updatedNotes))

      // Quay lại màn hình trước
      navigation.goBack()
    } catch (error) {
      console.error("Lỗi khi lưu ghi chú:", error)
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Thêm ghi chú</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveNote} disabled={isSaving}>
          <Text style={[styles.saveButtonText, { opacity: isSaving ? 0.6 : 1 }]}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        <TextInput
          style={[styles.titleInput, { color: theme.textPrimary, backgroundColor: theme.inputBackground }]}
          placeholder="Tiêu đề"
          placeholderTextColor={theme.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        <TextInput
          style={[
            styles.contentInput,
            { color: theme.textPrimary, backgroundColor: theme.inputBackground, height: 300 },
          ]}
          placeholder="Nội dung ghi chú..."
          placeholderTextColor={theme.textSecondary}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  saveButtonText: {
    color: "#4A6FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "500",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    lineHeight: 24,
  },
})

export default AddNoteScreen
