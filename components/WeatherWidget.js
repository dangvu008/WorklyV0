"use client"
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useTheme, useWeather } from "../hooks"

const WeatherWidget = ({ onRefresh, showForecast = true }) => {
  const { isDarkMode } = useTheme()
  const { weatherData, weatherForecast, isLoading, error, refreshWeatherData, convertTemperature } = useWeather()
  const [expanded, setExpanded] = useState(false)

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Lấy icon thời tiết
  const getWeatherIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  // Format thời gian
  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Xử lý làm mới dữ liệu
  const handleRefresh = async () => {
    if (onRefresh) onRefresh()
    await refreshWeatherData()
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải dữ liệu thời tiết...</Text>
        </View>
      </View>
    )
  }

  if (error || !weatherData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textSecondary }]}>
            {error || "Không thể tải dữ liệu thời tiết"}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={[styles.refreshButtonText, { color: theme.accent }]}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      {/* Current Weather */}
      <TouchableOpacity
        style={[styles.currentWeather, { borderBottomColor: theme.border }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.weatherMain}>
          <Image
            source={{ uri: getWeatherIcon(weatherData.weather[0].icon) }}
            style={styles.weatherIcon}
            defaultSource={require("../assets/weather-icons/cloudy.png")}
          />
          <View style={styles.weatherInfo}>
            <Text style={[styles.temperature, { color: theme.textPrimary }]}>
              {Math.round(convertTemperature(weatherData.main.temp))}°
            </Text>
            <Text style={[styles.weatherDescription, { color: theme.textSecondary }]}>
              {weatherData.weather[0].description}
            </Text>
          </View>
        </View>

        <View style={styles.weatherDetails}>
          <View style={styles.weatherDetail}>
            <Ionicons name="water-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>{weatherData.main.humidity}%</Text>
          </View>
          <View style={styles.weatherDetail}>
            <Ionicons name="speedometer-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.detailText, { color: theme.textSecondary }]}>{weatherData.wind.speed} m/s</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.expandButton} onPress={() => setExpanded(!expanded)}>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color={theme.textSecondary}
            style={styles.expandIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Forecast */}
      {expanded && showForecast && weatherForecast && weatherForecast.length > 0 && (
        <View style={styles.forecast}>
          {weatherForecast.slice(0, 5).map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={[styles.forecastTime, { color: theme.textSecondary }]}>{formatTime(item.dt)}</Text>
              <Image
                source={{ uri: getWeatherIcon(item.weather[0].icon) }}
                style={styles.forecastIcon}
                defaultSource={require("../assets/weather-icons/cloudy.png")}
              />
              <Text style={[styles.forecastTemp, { color: theme.textPrimary }]}>
                {Math.round(convertTemperature(item.main.temp))}°
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Location and Refresh */}
      <View style={styles.footer}>
        <Text style={[styles.location, { color: theme.textSecondary }]}>{weatherData.name}</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Ionicons name="refresh" size={16} color={theme.accent} />
          <Text style={[styles.refreshText, { color: theme.accent }]}>Làm mới</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentWeather: {
    padding: 16,
    borderBottomWidth: 1,
  },
  weatherMain: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherIcon: {
    width: 64,
    height: 64,
  },
  weatherInfo: {
    marginLeft: 12,
    flex: 1,
  },
  temperature: {
    fontSize: 32,
    fontWeight: "600",
  },
  weatherDescription: {
    fontSize: 16,
    textTransform: "capitalize",
  },
  weatherDetails: {
    flexDirection: "row",
  },
  weatherDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 4,
  },
  expandButton: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
  },
  expandIcon: {},
  forecast: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: 8,
  },
  forecastItem: {
    alignItems: "center",
  },
  forecastTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  forecastIcon: {
    width: 40,
    height: 40,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  location: {
    fontSize: 14,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 4,
  },
  refreshText: {
    fontSize: 14,
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default WeatherWidget
