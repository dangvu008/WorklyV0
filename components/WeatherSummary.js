"use client"
import { View, Text, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const WeatherSummary = ({ data, isDarkMode }) => {
  // Theme colors
  const theme = {
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    highlight: "#4A6FFF",
  }

  // Sử dụng logic hiện tại để xác định icon thời tiết
  const getWeatherIcon = (temp) => {
    if (temp >= 30) return "sunny"
    if (temp >= 25) return "partly-sunny"
    if (temp >= 20) return "cloud"
    if (temp >= 15) return "rainy"
    return "cloud"
  }

  // Tính nhiệt độ cao nhất và thấp nhất
  const getMinMaxTemp = () => {
    if (!data || data.length === 0) return { min: 0, max: 0 }

    let min = data[0].temperature
    let max = data[0].temperature

    data.forEach((item) => {
      if (item.temperature < min) min = item.temperature
      if (item.temperature > max) max = item.temperature
    })

    return { min, max }
  }

  const { min, max } = getMinMaxTemp()

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="thermometer-outline" size={24} color={theme.highlight} style={styles.summaryIcon} />
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Cao/Thấp</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>
              {max}°/{min}°
            </Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="water-outline" size={24} color={theme.highlight} style={styles.summaryIcon} />
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Độ ẩm</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>65%</Text>
          </View>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <Ionicons name="eye-outline" size={24} color={theme.highlight} style={styles.summaryIcon} />
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Tầm nhìn</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>10 km</Text>
          </View>
        </View>

        <View style={styles.summaryItem}>
          <Ionicons name="compass-outline" size={24} color={theme.highlight} style={styles.summaryIcon} />
          <View>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Gió</Text>
            <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>5 km/h</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  summaryIcon: {
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
})

export default WeatherSummary
