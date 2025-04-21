"use client"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"

const EnhancedWeatherDisplay = ({ data, isDarkMode }) => {
  const [expanded, setExpanded] = useState(false)

  // Theme colors
  const theme = {
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    highlight: "#4A6FFF",
    temperatureHigh: "#FF9500",
    temperatureLow: "#4CD964",
  }

  // Sử dụng logic hiện tại để xác định icon thời tiết
  const getWeatherIcon = (temp) => {
    if (temp >= 30) return "sunny"
    if (temp >= 25) return "partly-sunny"
    if (temp >= 20) return "cloud"
    if (temp >= 15) return "rainy"
    return "cloud"
  }

  // Lấy mô tả thời tiết dựa vào nhiệt độ
  const getWeatherDescription = (temp) => {
    if (temp >= 30) return "Nắng nóng"
    if (temp >= 25) return "Trời nắng"
    if (temp >= 20) return "Mát mẻ"
    if (temp >= 15) return "Mát lạnh"
    return "Trời mây"
  }

  // Lấy dữ liệu thời tiết hiện tại
  const currentWeather = data && data.length > 0 ? data[0] : null

  if (!currentWeather) {
    return null
  }

  return (
    <View style={styles.container}>
      {/* Hiển thị thời tiết hiện tại */}
      <TouchableOpacity
        style={[styles.currentWeatherContainer, { borderBottomColor: theme.border }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.currentWeatherContent}>
          <Ionicons
            name={`${getWeatherIcon(currentWeather.temperature)}-outline`}
            size={48}
            color={
              currentWeather.temperature >= 25
                ? theme.temperatureHigh
                : currentWeather.temperature <= 15
                  ? theme.temperatureLow
                  : theme.textPrimary
            }
            style={styles.currentWeatherIcon}
          />
          <View style={styles.currentWeatherInfo}>
            <Text style={[styles.currentTemperature, { color: theme.textPrimary }]}>
              {currentWeather.temperature}°C
            </Text>
            <Text style={[styles.weatherDescription, { color: theme.textSecondary }]}>
              {getWeatherDescription(currentWeather.temperature)}
            </Text>
          </View>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={24}
            color={theme.textSecondary}
            style={styles.expandIcon}
          />
        </View>
      </TouchableOpacity>

      {/* Hiển thị dự báo chi tiết khi mở rộng */}
      {expanded && (
        <View style={styles.forecastContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={[styles.forecastTime, { color: theme.textSecondary, width: 60 }]}>{item.time}</Text>
              <Ionicons
                name={`${getWeatherIcon(item.temperature)}-outline`}
                size={24}
                color={
                  item.temperature >= 25
                    ? theme.temperatureHigh
                    : item.temperature <= 15
                      ? theme.temperatureLow
                      : theme.textPrimary
                }
                style={styles.forecastIcon}
              />
              <View style={styles.temperatureContainer}>
                <View
                  style={[
                    styles.temperatureBar,
                    {
                      backgroundColor:
                        item.temperature >= 25
                          ? theme.temperatureHigh
                          : item.temperature <= 15
                            ? theme.temperatureLow
                            : theme.highlight,
                      width: `${Math.min(100, (item.temperature / 40) * 100)}%`,
                    },
                  ]}
                />
                <Text style={[styles.forecastTemperature, { color: theme.textPrimary }]}>{item.temperature}°C</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  currentWeatherContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  currentWeatherContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentWeatherIcon: {
    marginRight: 16,
  },
  currentWeatherInfo: {
    flex: 1,
  },
  currentTemperature: {
    fontSize: 28,
    fontWeight: "600",
  },
  weatherDescription: {
    fontSize: 16,
  },
  expandIcon: {
    padding: 4,
  },
  forecastContainer: {
    paddingVertical: 16,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  forecastTime: {
    fontSize: 14,
  },
  forecastIcon: {
    marginHorizontal: 16,
  },
  temperatureContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  temperatureBar: {
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  forecastTemperature: {
    fontSize: 16,
    fontWeight: "500",
    width: 45,
    textAlign: "right",
  },
})

export default EnhancedWeatherDisplay
