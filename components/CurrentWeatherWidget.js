"use client"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const CurrentWeatherWidget = ({ data, isDarkMode }) => {
  // Theme colors
  const theme = {
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Lấy dữ liệu thời tiết hiện tại
  const currentWeather = data && data.length > 0 ? data[0] : null

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

  // Hàm lấy mô tả thời tiết
  const getWeatherDescription = (condition, temperature) => {
    if (condition) {
      switch (condition.toLowerCase()) {
        case "clear":
        case "sunny":
          return "Trời nắng"
        case "partly cloudy":
        case "partly-cloudy":
          return "Có mây rải rác"
        case "cloudy":
        case "overcast":
          return "Nhiều mây"
        case "rain":
          return "Có mưa"
        case "light rain":
          return "Mưa nhẹ"
        case "drizzle":
          return "Mưa phùn"
        case "thunderstorm":
        case "storm":
          return "Giông bão"
        case "snow":
        case "snowy":
          return "Tuyết rơi"
        default:
          // Fallback dựa vào nhiệt độ
          break
      }
    }

    // Fallback dựa vào nhiệt độ
    if (temperature >= 30) return "Trời nắng nóng"
    if (temperature >= 25) return "Trời nắng"
    if (temperature >= 20) return "Trời mát"
    if (temperature >= 15) return "Trời lạnh"
    if (temperature < 5) return "Trời rất lạnh"
    return "Thời tiết ôn hòa"
  }

  if (!currentWeather) {
    return null
  }

  return (
    <View style={styles.container}>
      <View style={styles.weatherContent}>
        <Ionicons
          name={`${getWeatherIcon(currentWeather.condition, currentWeather.temperature)}-outline`}
          size={64}
          color={theme.textPrimary}
          style={styles.weatherIcon}
        />
        <View style={styles.weatherInfo}>
          <Text style={[styles.temperature, { color: theme.textPrimary }]}>{currentWeather.temperature}°C</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {getWeatherDescription(currentWeather.condition, currentWeather.temperature)}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  weatherContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  weatherIcon: {
    marginRight: 16,
  },
  weatherInfo: {
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "600",
  },
  description: {
    fontSize: 16,
    marginTop: 4,
  },
})

export default CurrentWeatherWidget
