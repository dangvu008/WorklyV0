"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useTheme } from "../hooks"

const WeatherAlert = ({ alert, onDismiss }) => {
  const { isDarkMode } = useTheme()
  const [expanded, setExpanded] = useState(false)

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    warningBackground: isDarkMode ? "#4D3500" : "#FFF9E6",
    warningText: isDarkMode ? "#FFD60A" : "#B25000",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Format thời gian
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Lấy icon dựa vào loại cảnh báo
  const getAlertIcon = (event) => {
    const eventLower = event.toLowerCase()
    if (eventLower.includes("rain") || eventLower.includes("mưa")) return "rainy"
    if (eventLower.includes("storm") || eventLower.includes("bão")) return "thunderstorm"
    if (eventLower.includes("flood") || eventLower.includes("lũ")) return "water"
    if (eventLower.includes("wind") || eventLower.includes("gió")) return "speedometer"
    if (eventLower.includes("heat") || eventLower.includes("nóng")) return "thermometer"
    if (eventLower.includes("cold") || eventLower.includes("lạnh")) return "snow"
    return "warning"
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.warningBackground }]}>
      <TouchableOpacity style={styles.header} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <Ionicons name={getAlertIcon(alert.event)} size={24} color={theme.warningText} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.warningText }]}>{alert.event}</Text>
          <Text style={[styles.time, { color: theme.warningText }]}>
            {formatTime(alert.start)} - {formatTime(alert.end)}
          </Text>
        </View>

        <TouchableOpacity style={styles.expandButton} onPress={() => setExpanded(!expanded)}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.warningText}
            style={styles.expandIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <Text style={[styles.description, { color: theme.warningText }]}>{alert.description}</Text>
          <Text style={[styles.source, { color: theme.warningText }]}>Nguồn: {alert.sender_name}</Text>

          {alert.tags && alert.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {alert.tags.map((tag, index) => (
                <View key={index} style={[styles.tag, { borderColor: theme.warningText }]}>
                  <Text style={[styles.tagText, { color: theme.warningText }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity style={[styles.dismissButton, { borderColor: theme.warningText }]} onPress={onDismiss}>
            <Text style={[styles.dismissText, { color: theme.warningText }]}>Đã hiểu</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  time: {
    fontSize: 12,
    marginTop: 2,
  },
  expandButton: {
    padding: 4,
  },
  expandIcon: {
    marginLeft: 8,
  },
  content: {
    padding: 12,
    paddingTop: 0,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  source: {
    fontSize: 12,
    fontStyle: "italic",
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  tag: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  dismissButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: "center",
  },
  dismissText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default WeatherAlert
