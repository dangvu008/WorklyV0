"use client"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const TimelineWidget = ({ data, isDarkMode }) => {
  // Theme colors
  const theme = {
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    timelineBackground: isDarkMode ? "#2C3A59" : "#E9ECEF",
  }

  // Hàm lấy icon thời tiết dựa vào điều kiện và nhiệt độ
  const getWeatherIcon = (condition, temperature) => {
    let iconName = "cloudy"

    // Xác định icon dựa vào điều kiện thời tiết
    if (condition) {
      switch (condition.toLowerCase()) {
        case "clear":
        case "sunny":
          iconName = "sunny"
          break
        case "partly cloudy":
        case "partly-cloudy":
          iconName = "partly-sunny"
          break
        case "cloudy":
        case "overcast":
          iconName = "cloudy"
          break
        case "rain":
        case "light rain":
        case "drizzle":
          iconName = "rainy"
          break
        case "thunderstorm":
        case "storm":
          iconName = "thunderstorm"
          break
        case "snow":
        case "snowy":
          iconName = "snow"
          break
        default:
          // Fallback dựa vào nhiệt độ
          break
      }
    } else {
      // Fallback dựa vào nhiệt độ nếu không có thông tin điều kiện
      if (temperature >= 30) iconName = "sunny"
      else if (temperature >= 25) iconName = "partly-sunny"
      else if (temperature >= 20) iconName = "cloudy"
      else if (temperature >= 15) iconName = "rainy"
      else if (temperature < 5) iconName = "snow"
    }

    return iconName
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.timelineItem}>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{item.time}</Text>
          <View style={[styles.line, { backgroundColor: theme.timelineBackground }]} />
          <View style={styles.weatherContainer}>
            <Ionicons
              name={`${getWeatherIcon(item.condition, item.temperature)}-outline`}
              size={20}
              color={theme.textPrimary}
              style={styles.icon}
            />
            <Text style={[styles.temperature, { color: theme.textPrimary }]}>{item.temperature}°C</Text>
          </View>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  time: {
    width: 50,
    fontSize: 14,
    textAlign: "center",
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 8,
  },
  weatherContainer: {
    width: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  icon: {
    marginRight: 4,
  },
  temperature: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default TimelineWidget
