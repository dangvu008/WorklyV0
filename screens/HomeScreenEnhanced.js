"use client"
import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"
import { EnhancedWeatherWidget, TimelineWidget } from "../components"

const HomeScreenEnhanced = () => {
  const { isDarkMode } = useTheme()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [events, setEvents] = useState([])
  const [weatherData, setWeatherData] = useState([
    { time: "Hiện tại", temperature: 28, condition: "clear" },
    { time: "15:00", temperature: 27, condition: "partly cloudy" },
    { time: "16:00", temperature: 26, condition: "cloudy" },
    { time: "17:00", temperature: 25, condition: "light rain" },
    { time: "18:00", temperature: 24, condition: "rain" },
  ])

  // Cập nhật thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Format thời gian
  const formatTime = (date) => {
    const hours = date.getHours().toString().padStart(2, "0")
    const minutes = date.getMinutes().toString().padStart(2, "0")
    return `${hours}:${minutes}`
  }

  // Format ngày tháng
  const formatDate = (date) => {
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"]
    const day = days[date.getDay()]
    const dateNum = date.getDate().toString().padStart(2, "0")
    const month = (date.getMonth() + 1).toString().padStart(2, "0")
    return `${day}, ${dateNum}/${month}`
  }

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    accent: "#4A6FFF",
    timelineBackground: isDarkMode ? "#2C3A59" : "#E9ECEF",
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Text style={[styles.currentTime, { color: theme.textPrimary }]}>{formatTime(currentTime)}</Text>
          <Text style={[styles.currentDate, { color: theme.textSecondary }]}>{formatDate(currentTime)}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* All Day Events Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cả Ngày</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {events.length > 0 ? (
            <View style={styles.eventsList}>
              {events.map((event, index) => (
                <View key={index} style={styles.eventItem}>
                  <Text style={[styles.eventTitle, { color: theme.textPrimary }]}>{event.title}</Text>
                  <Text style={[styles.eventTime, { color: theme.textSecondary }]}>{event.time}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={[styles.noEventsText, { color: theme.textSecondary }]}>Không có sự kiện</Text>
            </View>
          )}
        </View>

        {/* Weather Section with Enhanced Widget */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Thời tiết</Text>
          </View>

          <EnhancedWeatherWidget data={weatherData} isDarkMode={isDarkMode} />
        </View>

        {/* Timeline Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Lịch trình</Text>
          </View>

          <TimelineWidget data={weatherData.slice(1, 4)} isDarkMode={isDarkMode} />
        </View>

        {/* Tasks Section */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Công việc hôm nay</Text>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.tasksList}>
            <View style={styles.taskItem}>
              <View style={[styles.taskStatus, { backgroundColor: "#4CD964" }]} />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Họp nhóm dự án</Text>
                <Text style={[styles.taskTime, { color: theme.textSecondary }]}>09:00 - 10:30</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="checkmark-circle" size={24} color="#4CD964" />
              </TouchableOpacity>
            </View>

            <View style={styles.taskItem}>
              <View style={[styles.taskStatus, { backgroundColor: "#FF9500" }]} />
              <View style={styles.taskContent}>
                <Text style={[styles.taskTitle, { color: theme.textPrimary }]}>Phân tích yêu cầu</Text>
                <Text style={[styles.taskTime, { color: theme.textSecondary }]}>13:00 - 15:00</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipse-outline" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateTimeContainer: {
    flexDirection: "column",
  },
  currentTime: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 4,
  },
  currentDate: {
    fontSize: 16,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  noEventsContainer: {
    padding: 16,
    alignItems: "center",
  },
  noEventsText: {
    fontSize: 14,
  },
  tasksList: {
    padding: 16,
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  taskStatus: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  taskTime: {
    fontSize: 14,
  },
  bottomPadding: {
    height: 80,
  },
})

export default HomeScreenEnhanced
