"use client"
import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import DateTimePicker from "@react-native-community/datetimepicker"
import { useTheme, useAlarm } from "../hooks"

const AddEditAlarmScreen = ({ route, navigation }) => {
  const { alarm } = route.params || {}
  const { isDarkMode } = useTheme()
  const { addAlarm, updateAlarm } = useAlarm()
  const [isEditing, setIsEditing] = useState(!!alarm)
  const [title, setTitle] = useState(alarm?.title || "Báo thức")
  const [description, setDescription] = useState(alarm?.description || "")
  const [time, setTime] = useState(alarm?.time ? new Date(`2023-01-01T${alarm.time}:00`) : new Date())
  const [date, setDate] = useState(alarm?.date ? new Date(alarm.date) : new Date())
  const [type, setType] = useState(alarm?.type || "one_time")
  const [days, setDays] = useState(alarm?.days || [])
  const [isEnabled, setIsEnabled] = useState(alarm?.isEnabled !== false)
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
    accent: "#4A6FFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Xử lý thay đổi thời gian
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false)
    if (selectedTime) {
      setTime(selectedTime)
    }
  }

  // Xử lý thay đổi ngày
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false)
    if (selectedDate) {
      setDate(selectedDate)
    }
  }

  // Xử lý thay đổi loại báo thức
  const handleTypeChange = (newType) => {
    setType(newType)
  }

  // Xử lý thay đổi ngày trong tuần
  const handleDayToggle = (day) => {
    if (days.includes(day)) {
      setDays(days.filter((d) => d !== day))
    } else {
      setDays([...days, day])
    }
  }

  // Xử lý lưu báo thức
  const handleSave = async () => {
    // Kiểm tra dữ liệu
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề báo thức")
      return
    }

    if (type === "recurring" && days.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn ít nhất một ngày trong tuần")
      return
    }

    setIsSaving(true)

    try {
      // Chuẩn bị dữ liệu báo thức
      const timeString = `${time.getHours().toString().padStart(2, "0")}:${time.getMinutes().toString().padStart(2, "0")}`

      const alarmData = {
        title,
        description,
        time: timeString,
        type,
        isEnabled,
      }

      if (type === "one_time") {
        alarmData.date = date.toISOString().split("T")[0]
      } else if (type === "recurring") {
        alarmData.days = days
      }

      // Thêm hoặc cập nhật báo thức
      if (isEditing) {
        await updateAlarm(alarm.id, alarmData)
      } else {
        await addAlarm(alarmData)
      }

      navigation.goBack()
    } catch (error) {
      console.error("Error saving alarm:", error)
      Alert.alert("Lỗi", "Không thể lưu báo thức")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {isEditing ? "Chỉnh sửa báo thức" : "Thêm báo thức"}
        </Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={[styles.saveButtonText, { opacity: isSaving ? 0.6 : 1 }]}>
            {isSaving ? "Đang lưu..." : "Lưu"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Time Picker */}
        <View style={[styles.timePickerContainer, { backgroundColor: theme.cardBackground }]}>
          <TouchableOpacity style={styles.timeDisplay} onPress={() => setShowTimePicker(true)}>
            <Text style={[styles.timeText, { color: theme.textPrimary }]}>
              {time.getHours().toString().padStart(2, "0")}:{time.getMinutes().toString().padStart(2, "0")}
            </Text>
          </TouchableOpacity>

          {showTimePicker && (
            <DateTimePicker value={time} mode="time" is24Hour={true} display="spinner" onChange={handleTimeChange} />
          )}
        </View>

        {/* Alarm Details */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Tiêu đề</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.inputBackground }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề báo thức"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Mô tả (tùy chọn)</Text>
            <TextInput
              style={[styles.input, { color: theme.textPrimary, backgroundColor: theme.inputBackground }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả báo thức"
              placeholderTextColor={theme.textSecondary}
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Bật báo thức</Text>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ false: "#767577", true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Alarm Type */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Loại báo thức</Text>

          <View style={styles.typeContainer}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "one_time" && [styles.activeTypeButton, { borderColor: theme.accent }],
              ]}
              onPress={() => handleTypeChange("one_time")}
            >
              <Ionicons
                name="alarm-outline"
                size={24}
                color={type === "one_time" ? theme.accent : theme.textSecondary}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeText, { color: type === "one_time" ? theme.accent : theme.textSecondary }]}>
                Một lần
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "recurring" && [styles.activeTypeButton, { borderColor: theme.accent }],
              ]}
              onPress={() => handleTypeChange("recurring")}
            >
              <Ionicons
                name="repeat-outline"
                size={24}
                color={type === "recurring" ? theme.accent : theme.textSecondary}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeText, { color: type === "recurring" ? theme.accent : theme.textSecondary }]}>
                Lặp lại
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                type === "shift_linked" && [styles.activeTypeButton, { borderColor: theme.accent }],
              ]}
              onPress={() => handleTypeChange("shift_linked")}
            >
              <Ionicons
                name="briefcase-outline"
                size={24}
                color={type === "shift_linked" ? theme.accent : theme.textSecondary}
                style={styles.typeIcon}
              />
              <Text style={[styles.typeText, { color: type === "shift_linked" ? theme.accent : theme.textSecondary }]}>
                Liên kết ca
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* One Time Date Picker */}
        {type === "one_time" && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ngày báo thức</Text>

            <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={theme.accent} style={styles.dateIcon} />
              <Text style={[styles.dateText, { color: theme.textPrimary }]}>{date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>
        )}

        {/* Recurring Days Picker */}
        {type === "recurring" && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Ngày lặp lại</Text>

            <View style={styles.daysContainer}>
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    days.includes(day) && [styles.activeDayButton, { backgroundColor: theme.accent }],
                  ]}
                  onPress={() => handleDayToggle(day)}
                >
                  <Text style={[styles.dayText, { color: days.includes(day) ? "#FFFFFF" : theme.textSecondary }]}>
                    {day === "Mon"
                      ? "T2"
                      : day === "Tue"
                        ? "T3"
                        : day === "Wed"
                          ? "T4"
                          : day === "Thu"
                            ? "T5"
                            : day === "Fri"
                              ? "T6"
                              : day === "Sat"
                                ? "T7"
                                : "CN"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dayPresets}>
              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setDays(["Mon", "Tue", "Wed", "Thu", "Fri"])}
              >
                <Text style={[styles.presetText, { color: theme.textSecondary }]}>Ngày làm việc</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setDays(["Sat", "Sun"])}
              >
                <Text style={[styles.presetText, { color: theme.textSecondary }]}>Cuối tuần</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.presetButton, { borderColor: theme.border }]}
                onPress={() => setDays(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"])}
              >
                <Text style={[styles.presetText, { color: theme.textSecondary }]}>Hàng ngày</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Shift Linked Options */}
        {type === "shift_linked" && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Liên kết ca làm việc</Text>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Báo thức sẽ tự động được thiết lập dựa trên ca làm việc đang áp dụng.
            </Text>
          </View>
        )}
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
  timePickerContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    borderRadius: 12,
    marginBottom: 16,
  },
  timeDisplay: {
    padding: 8,
  },
  timeText: {
    fontSize: 48,
    fontWeight: "300",
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    marginLeft: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  typeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
    marginHorizontal: 4,
  },
  activeTypeButton: {
    borderWidth: 1,
  },
  typeIcon: {
    marginBottom: 8,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "rgba(74, 111, 255, 0.1)",
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
  },
  daysContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  activeDayButton: {
    backgroundColor: "#4A6FFF",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500",
  },
  dayPresets: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  presetButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  presetText: {
    fontSize: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
})

export default AddEditAlarmScreen
