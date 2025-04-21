"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"

const ShiftItem = ({ shift, onApply, onEdit, onDelete }) => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    background: isDarkMode ? "#2C3A59" : "#F0F0F5",
  }

  // Format days of week
  const formatDays = (days) => {
    if (!days || days.length === 0) return ""

    const dayNames = {
      1: "T2",
      2: "T3",
      3: "T4",
      4: "T5",
      5: "T6",
      6: "T7",
      7: "CN",
    }

    // If all days are selected
    if (days.length === 7) return "Hàng ngày"

    // If weekdays are selected
    if (
      days.length === 5 &&
      days.includes(1) &&
      days.includes(2) &&
      days.includes(3) &&
      days.includes(4) &&
      days.includes(5) &&
      !days.includes(6) &&
      !days.includes(7)
    ) {
      return "Thứ 2 - Thứ 6"
    }

    // If weekend is selected
    if (days.length === 2 && days.includes(6) && days.includes(7)) {
      return "Cuối tuần"
    }

    // Otherwise, list the days
    return days.map((day) => dayNames[day]).join(", ")
  }

  return (
    <View style={[styles.container, { borderBottomColor: theme.border }]}>
      <View style={styles.shiftInfo}>
        <View style={styles.nameContainer}>
          <Text style={[styles.shiftName, { color: theme.text }]}>{shift.name}</Text>
          {shift.isApplied && (
            <View style={[styles.appliedBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.appliedText}>Đang áp dụng</Text>
            </View>
          )}
        </View>

        <Text style={[styles.shiftTime, { color: theme.textSecondary }]}>
          {shift.startTime} - {shift.endTime}
        </Text>

        <Text style={[styles.shiftDays, { color: theme.textSecondary }]}>{formatDays(shift.appliedDays)}</Text>
      </View>

      <View style={styles.actions}>
        {!shift.isApplied && (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.primary }]} onPress={onApply}>
            <Text style={styles.actionButtonText}>Áp dụng</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.background }]} onPress={onEdit}>
          <Ionicons name="pencil" size={18} color={theme.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.background }]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  shiftInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  shiftName: {
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },
  appliedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  appliedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  shiftTime: {
    fontSize: 14,
    marginBottom: 2,
  },
  shiftDays: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
})

export default ShiftItem
