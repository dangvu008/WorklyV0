"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTheme, useTranslation, useNotes, useWork } from "../hooks"

const NoteDetailScreen = ({ route, navigation }) => {
  const { noteId } = route.params || {}
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { getNoteById, addNote, updateNote, deleteNote } = useNotes()
  const { shifts } = useWork()

  const [isEditing, setIsEditing] = useState(!!noteId)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [reminderTime, setReminderTime] = useState("09:00")
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]) // Default to weekdays
  const [linkedShiftIds, setLinkedShiftIds] = useState([])
  const [isLinkingShifts, setIsLinkingShifts] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    error: "#FF3B30",
  }

  // Load note data if editing
  useEffect(() => {
    if (noteId) {
      const note = getNoteById(noteId)
      if (note) {
        setTitle(note.title || "")
        setContent(note.content || "")
        setReminderTime(note.reminderTime || "09:00")
        setSelectedDays(note.selectedDays || [1, 2, 3, 4, 5])
        setLinkedShiftIds(note.linkedShiftIds || [])
        setIsLinkingShifts(note.linkedShiftIds && note.linkedShiftIds.length > 0)
      }
    }
  }, [noteId, getNoteById])

  // Handle time picker change
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, "0")
      const minutes = selectedTime.getMinutes().toString().padStart(2, "0")
      setReminderTime(`${hours}:${minutes}`)
    }
  }

  // Toggle day selection
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day))
    } else {
      setSelectedDays([...selectedDays, day].sort())
    }
  }

  // Set preset days
  const setPresetDays = (preset) => {
    switch (preset) {
      case "weekdays":
        setSelectedDays([1, 2, 3, 4, 5])
        break
      case "weekend":
        setSelectedDays([6, 7])
        break
      case "all":
        setSelectedDays([1, 2, 3, 4, 5, 6, 7])
        break
    }
  }

  // Toggle shift linking
  const toggleShiftLinking = (value) => {
    setIsLinkingShifts(value)
    if (!value) {
      setLinkedShiftIds([])
    }
  }

  // Toggle shift selection
  const toggleShift = (shiftId) => {
    if (linkedShiftIds.includes(shiftId)) {
      setLinkedShiftIds(linkedShiftIds.filter((id) => id !== shiftId))
    } else {
      setLinkedShiftIds([...linkedShiftIds, shiftId])
    }
  }

  // Validate form
  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert(t("notes.error"), t("notes.titleRequired"))
      return false
    }

    if (title.length > 100) {
      Alert.alert(t("notes.error"), t("notes.titleTooLong"))
      return false
    }

    if (!content.trim()) {
      Alert.alert(t("notes.error"), t("notes.contentRequired"))
      return false
    }

    if (content.length > 300) {
      Alert.alert(t("notes.error"), t("notes.contentTooLong"))
      return false
    }

    if (!isLinkingShifts && selectedDays.length === 0) {
      Alert.alert(t("notes.error"), t("notes.daysRequired"))
      return false
    }

    if (isLinkingShifts && linkedShiftIds.length === 0) {
      Alert.alert(t("notes.error"), t("notes.shiftsRequired"))
      return false
    }

    return true
  }

  // Save note
  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)

    try {
      const noteData = {
        title: title.trim(),
        content: content.trim(),
        reminderTime,
        selectedDays: isLinkingShifts ? [] : selectedDays,
        linkedShiftIds: isLinkingShifts ? linkedShiftIds : [],
      }

      if (isEditing) {
        await updateNote(noteId, noteData)
        Alert.alert(t("notes.success"), t("notes.updateSuccess"))
      } else {
        await addNote(noteData)
        Alert.alert(t("notes.success"), t("notes.addSuccess"))
      }

      navigation.goBack()
    } catch (error) {
      console.error("Error saving note:", error)
      Alert.alert(t("notes.error"), t("notes.saveError"))
    } finally {
      setIsSaving(false)
    }
  }

  // Delete note
  const handleDelete = () => {
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
            await deleteNote(noteId)
            navigation.goBack()
          } catch (error) {
            console.error("Error deleting note:", error)
            Alert.alert(t("notes.error"), t("notes.deleteError"))
          }
        },
      },
    ])
  }

  // Get day name
  const getDayName = (day) => {
    const days = {
      1: t("weekdays.mon"),
      2: t("weekdays.tue"),
      3: t("weekdays.wed"),
      4: t("weekdays.thu"),
      5: t("weekdays.fri"),
      6: t("weekdays.sat"),
      7: t("weekdays.sun"),
    }
    return days[day]
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEditing ? t("notes.editNote") : t("notes.addNote")}
          </Text>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
            <Text style={[styles.saveButtonText, { opacity: isSaving ? 0.6 : 1 }]}>
              {isSaving ? t("notes.saving") : t("common.save")}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          {/* Title Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                },
              ]}
              placeholder={t("notes.titlePlaceholder")}
              placeholderTextColor={theme.textSecondary}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
            <Text style={[styles.charCounter, { color: theme.textSecondary }]}>{title.length}/100</Text>
          </View>

          {/* Content Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.contentInput,
                {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                },
              ]}
              placeholder={t("notes.contentPlaceholder")}
              placeholderTextColor={theme.textSecondary}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={300}
            />
            <Text style={[styles.charCounter, { color: theme.textSecondary }]}>{content.length}/300</Text>
          </View>

          {/* Reminder Time */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("notes.reminderTime")}</Text>

            <TouchableOpacity
              style={[styles.timeButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={theme.primary} style={styles.timeIcon} />
              <Text style={[styles.timeText, { color: theme.text }]}>{reminderTime}</Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={(() => {
                  const [hours, minutes] = reminderTime.split(":").map(Number)
                  const date = new Date()
                  date.setHours(hours, minutes, 0, 0)
                  return date
                })()}
                mode="time"
                is24Hour={true}
                display="spinner"
                onChange={handleTimeChange}
              />
            )}
          </View>

          {/* Shift Linking */}
          <View style={[styles.section, { backgroundColor: theme.card }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("notes.linkToShifts")}</Text>
              <Switch
                value={isLinkingShifts}
                onValueChange={toggleShiftLinking}
                trackColor={{ false: "#767577", true: theme.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            {isLinkingShifts && (
              <View style={styles.shiftsContainer}>
                {shifts.length > 0 ? (
                  shifts.map((shift) => (
                    <TouchableOpacity
                      key={shift.id}
                      style={[
                        styles.shiftItem,
                        linkedShiftIds.includes(shift.id) && { backgroundColor: `${theme.primary}20` },
                        { borderColor: theme.border },
                      ]}
                      onPress={() => toggleShift(shift.id)}
                    >
                      <Text style={[styles.shiftName, { color: theme.text }]}>{shift.name}</Text>
                      <View style={styles.shiftTime}>
                        <Text style={[styles.shiftTimeText, { color: theme.textSecondary }]}>
                          {shift.startTime} - {shift.endTime}
                        </Text>
                      </View>

                      {linkedShiftIds.includes(shift.id) && (
                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} style={styles.checkIcon} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.noShiftsText, { color: theme.textSecondary }]}>{t("notes.noShifts")}</Text>
                )}
              </View>
            )}
          </View>

          {/* Day Selection (only if not linking shifts) */}
          {!isLinkingShifts && (
            <View style={[styles.section, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("notes.selectDays")}</Text>

              <View style={styles.daysContainer}>
                {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayButton, selectedDays.includes(day) && { backgroundColor: theme.primary }]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[styles.dayText, { color: selectedDays.includes(day) ? "#FFFFFF" : theme.textSecondary }]}
                    >
                      {getDayName(day)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.presetButtons}>
                <TouchableOpacity
                  style={[styles.presetButton, { borderColor: theme.border }]}
                  onPress={() => setPresetDays("weekdays")}
                >
                  <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>{t("notes.weekdays")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetButton, { borderColor: theme.border }]}
                  onPress={() => setPresetDays("weekend")}
                >
                  <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>{t("notes.weekend")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.presetButton, { borderColor: theme.border }]}
                  onPress={() => setPresetDays("all")}
                >
                  <Text style={[styles.presetButtonText, { color: theme.textSecondary }]}>{t("notes.allDays")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Delete Button (only in edit mode) */}
          {isEditing && (
            <TouchableOpacity style={[styles.deleteButton, { backgroundColor: theme.error }]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.deleteIcon} />
              <Text style={styles.deleteButtonText}>{t("common.delete")}</Text>
            </TouchableOpacity>
          )}

          {/* Bottom padding */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
  inputContainer: {
    marginBottom: 16,
    position: "relative",
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "500",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  contentInput: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 120,
    lineHeight: 24,
  },
  charCounter: {
    position: "absolute",
    bottom: 8,
    right: 12,
    fontSize: 12,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  timeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  timeIcon: {
    marginRight: 8,
  },
  timeText: {
    fontSize: 16,
  },
  shiftsContainer: {
    marginTop: 8,
  },
  shiftItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  shiftTime: {
    marginRight: 8,
  },
  shiftTimeText: {
    fontSize: 14,
  },
  checkIcon: {
    marginLeft: 8,
  },
  noShiftsText: {
    textAlign: "center",
    padding: 16,
    fontStyle: "italic",
  },
  daysContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  presetButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    marginHorizontal: 4,
  },
  presetButtonText: {
    fontSize: 12,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  deleteIcon: {
    marginRight: 8,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 40,
  },
})

export default NoteDetailScreen
