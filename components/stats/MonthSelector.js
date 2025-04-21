"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import { useTheme } from "../../hooks"

const MonthSelector = ({ selectedDate, onPreviousMonth, onNextMonth }) => {
  const { isDarkMode } = useTheme()

  // Theme colors
  const theme = {
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  // Check if next month is in the future
  const isNextMonthDisabled = () => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const selectedMonth = selectedDate.getMonth()
    const selectedYear = selectedDate.getFullYear()

    return selectedYear > currentYear || (selectedYear === currentYear && selectedMonth >= currentMonth)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.card }]}>
      <TouchableOpacity style={styles.arrowButton} onPress={onPreviousMonth}>
        <Ionicons name="chevron-back" size={24} color={theme.primary} />
      </TouchableOpacity>

      <View style={styles.monthContainer}>
        <Text style={[styles.monthText, { color: theme.text }]}>{format(selectedDate, "MMMM yyyy")}</Text>
      </View>

      <TouchableOpacity
        style={[styles.arrowButton, { opacity: isNextMonthDisabled() ? 0.5 : 1 }]}
        onPress={onNextMonth}
        disabled={isNextMonthDisabled()}
      >
        <Ionicons name="chevron-forward" size={24} color={theme.primary} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  arrowButton: {
    padding: 8,
  },
  monthContainer: {
    flex: 1,
    alignItems: "center",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
  },
})

export default MonthSelector
