"use client"
import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { getIonIconName, getWeatherDescription } from "../utils/WeatherIconsHelper"

const EnhancedWeatherWidget = ({ data, isDarkMode, useCustomIcons = true }) => {
  const [expanded, setExpanded] = useState(false)

  // Theme colors
  const theme = {
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Lấy dữ liệu hiện tại
  const currentWeather = data && data.length > 0 ? data[0] : null

  return (
    <View style={styles.container}>
      {/* Current Weather Summary */}
      {currentWeather && (
        <TouchableOpacity
          style={[styles.currentWeatherContainer, { borderBottomColor: theme.border }]}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={styles.currentWeatherContent}>
            <View style={styles.currentWeatherLeft}>
              {useCustomIcons ? (
                <Image
                  source={require(
                    `../assets/weather-icons/${
                      currentWeather.condition ? currentWeather.condition.toLowerCase().replace(" ", "-") : "cloudy"
                    }.png`,
                  )}
                  style={styles.currentWeatherIcon}
                />
              ) : (
                <Ionicons
                  name={`${getIonIconName(currentWeather.condition, currentWeather.temperature)}-outline`}
                  size={48}
                  color={theme.textPrimary}
                />
              )}
            </View>
            <View style={styles.currentWeatherInfo}>
              <Text style={[styles.currentTemperature, { color: theme.textPrimary }]}>
                {currentWeather.temperature}°C
              </Text>
              <Text style={[styles.weatherDescription, { color: theme.textSecondary }]}>
                {getWeatherDescription(currentWeather.condition, currentWeather.temperature)}
              </Text>
            </View>
            <View style={styles.expandButton}>
              <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={24} color={theme.textSecondary} />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Expanded Forecast */}
      {expanded && (
        <View style={styles.forecastContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={[styles.forecastTime, { color: theme.textSecondary }]}>{item.time}</Text>
              {useCustomIcons ? (
                <Image
                  source={require(
                    `../assets/weather-icons/${
                      item.condition ? item.condition.toLowerCase().replace(" ", "-") : "cloudy"
                    }.png`,
                  )}
                  style={styles.forecastIcon}
                />
              ) : (
                <Ionicons
                  name={`${getIonIconName(item.condition, item.temperature)}-outline`}
                  size={24}
                  color={theme.textPrimary}
                />
              )}
              <Text style={[styles.forecastTemperature, { color: theme.textPrimary }]}>{item.temperature}°C</Text>
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
  currentWeatherLeft: {
    marginRight: 16,
  },
  currentWeatherIcon: {
    width: 64,
    height: 64,
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
  expandButton: {
    padding: 4,
  },
  forecastContainer: {
    paddingVertical: 16,
  },
  forecastItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  forecastTime: {
    width: 60,
    fontSize: 14,
  },
  forecastIcon: {
    width: 32,
    height: 32,
    marginHorizontal: 16,
  },
  forecastTemperature: {
    fontSize: 16,
    fontWeight: "500",
  },
})

export default EnhancedWeatherWidget
