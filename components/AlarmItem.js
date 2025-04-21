"use client"
import { View, Text, StyleSheet, TouchableOpacity, Switch } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"

const AlarmItem = ({ alarm, onToggle, onEdit, onDelete }) => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Format days
  const formatDays = (days) => {
    if (!days || days.length === 0) return ""

    const dayMap = {
      Mon: "T2",
      Tue: "T3",
      Wed: "T4",
      Thu: "T5",
      Fri: "T6",
      Sat: "T7",
      Sun: "CN",
    }

    // Nếu có tất cả các ngày trong tuần
    if (days.length === 7) return "Hàng ngày"

    // Nếu chỉ có các ngày trong tuần (T2-T6)
    if (days.length === 5 && !days.includes("Sat") && !days.includes("Sun")) return "Các ngày trong tuần"

    // Nếu chỉ có cuối tuần
    if (days.length === 2 && days.includes("Sat") && days.includes("Sun")) return "Cuối tuần"

    // Trường hợp khác
    return days.map((day) => dayMap[day]).join(", ")
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.content}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: theme.textPrimary }]}>{alarm.time}</Text>
          {alarm.type === "recurring" && (
            <Text style={[styles.days, { color: theme.textSecondary }]}>{formatDays(alarm.days)}</Text>
          )}
          {alarm.type === "one_time" && (
            <Text style={[styles.days, { color: theme.textSecondary }]}>
              {new Date(alarm.date).toLocaleDateString()}
            </Text>
          )}
          {alarm.type === "shift_linked" && (
            <Text style={[styles.days, { color: theme.accent }]}>Liên kết ca làm việc</Text>
          )}
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{alarm.title}</Text>
          {alarm.description && (
            <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={1}>
              {alarm.description}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <Switch
          value={alarm.isEnabled}
          onValueChange={() => onToggle(alarm.id, !alarm.isEnabled)}
          trackColor={{ false: "#767577", true: theme.accent }}
          thumbColor="#FFFFFF"
        />

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.button} onPress={() => onEdit(alarm)}>
            <Ionicons name="pencil" size={20} color={theme.accent} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => onDelete(alarm.id)}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    flexDirection: "row",
    marginBottom: 12,
  },
  timeContainer: {
    marginRight: 16,
  },
  time: {
    fontSize: 24,
    fontWeight: "600",
  },
  days: {
    fontSize: 12,
    marginTop: 4,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    paddingTop: 12,
  },
  buttons: {
    flexDirection: "row",
  },
  button: {
    padding: 8,
    marginLeft: 8,
  },
})

export default AlarmItem
