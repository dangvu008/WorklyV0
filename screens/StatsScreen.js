"use client"
import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView } from "react-native"
import { useTheme, useTranslation, useWork } from "../hooks"

const StatsScreen = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { getMonthStats, exportMonthlyReport, dailyWorkStatus } = useWork()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [monthStats, setMonthStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [activeTab, setActiveTab] = useState("summary") // 'summary' or 'daily'

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    success: "#4CD964",
    warning: "#FF9500",
    error: "#FF3B30",
    info: "#5AC8FA",
    purple: "#AF52DE",
    gray: "#8E8E93",
    yellow: "#FFCC00",
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{t("stats.title")}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{t("stats.noData")}</Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default StatsScreen
