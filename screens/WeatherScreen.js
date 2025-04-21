"use client"
import { useState } from "react"
import { Switch } from "react-native"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"

// Import from index files
import { useTheme, useWeather, useWork } from "../hooks"
import { WeatherWidget, WeatherAlert } from "../components"

const WeatherScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const {
    weatherData,
    weatherForecast,
    weatherAlerts,
    isLoading,
    refreshWeatherData,
    weatherSettings,
    saveWeatherSettings,
  } = useWeather()
  const { currentShift } = useWork()
  const [refreshing, setRefreshing] = useState(false)
  const [dismissedAlerts, setDismissedAlerts] = useState([])

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Xử lý làm mới dữ liệu
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshWeatherData()
    setRefreshing(false)
  }

  // Xử lý bỏ qua cảnh báo
  const handleDismissAlert = (alertIndex) => {
    setDismissedAlerts([...dismissedAlerts, alertIndex])
  }

  // Lọc cảnh báo chưa bỏ qua
  const filteredAlerts = weatherAlerts.filter((_, index) => !dismissedAlerts.includes(index))

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Thời tiết</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("WeatherSettings")}>
          <Ionicons name="settings-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.accent]} />}
      >
        {/* Current Weather */}
        <WeatherWidget onRefresh={handleRefresh} showForecast={true} />

        {/* Weather Alerts */}
        {filteredAlerts.length > 0 && (
          <View style={styles.alertsSection}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cảnh báo thời tiết</Text>
            {filteredAlerts.map((alert, index) => (
              <WeatherAlert key={index} alert={alert} onDismiss={() => handleDismissAlert(index)} />
            ))}
          </View>
        )}

        {/* Weather for Current Shift */}
        {currentShift && (
          <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
              Thời tiết cho ca {currentShift.name}
            </Text>
            <View style={styles.shiftWeatherInfo}>
              <View style={styles.shiftTimeInfo}>
                <Text style={[styles.shiftTimeLabel, { color: theme.textSecondary }]}>Thời gian:</Text>
                <Text style={[styles.shiftTime, { color: theme.textPrimary }]}>
                  {currentShift.startTime} - {currentShift.endTime}
                </Text>
              </View>

              {weatherForecast && weatherForecast.length > 0 ? (
                <View style={styles.shiftForecast}>
                  {weatherForecast.slice(0, 3).map((item, index) => (
                    <View key={index} style={styles.forecastItem}>
                      <Text style={[styles.forecastTime, { color: theme.textSecondary }]}>
                        {new Date(item.dt * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                      <Text style={[styles.forecastTemp, { color: theme.textPrimary }]}>
                        {Math.round(item.main.temp)}°C
                      </Text>
                      <Text style={[styles.forecastDesc, { color: theme.textSecondary }]}>
                        {item.weather[0].description}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <Text style={[styles.noDataText, { color: theme.textSecondary }]}>
                  Không có dữ liệu dự báo cho ca làm việc
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Weather Settings */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Cài đặt thời tiết</Text>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Cảnh báo thời tiết</Text>
            <Switch
              value={weatherSettings.warningEnabled}
              onValueChange={(value) => saveWeatherSettings({ warningEnabled: value })}
              trackColor={{ false: "#767577", true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Sử dụng vị trí hiện tại</Text>
            <Switch
              value={weatherSettings.useCurrentLocation}
              onValueChange={(value) => saveWeatherSettings({ useCurrentLocation: value })}
              trackColor={{ false: "#767577", true: theme.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>Đơn vị nhiệt độ</Text>
            <View style={styles.temperatureUnitContainer}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weatherSettings.temperatureUnit === "C" && [
                    styles.activeUnitButton,
                    { backgroundColor: theme.accent },
                  ],
                ]}
                onPress={() => saveWeatherSettings({ temperatureUnit: "C" })}
              >
                <Text
                  style={[
                    styles.unitText,
                    { color: weatherSettings.temperatureUnit === "C" ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  °C
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  weatherSettings.temperatureUnit === "F" && [
                    styles.activeUnitButton,
                    { backgroundColor: theme.accent },
                  ],
                ]}
                onPress={() => saveWeatherSettings({ temperatureUnit: "F" })}
              >
                <Text
                  style={[
                    styles.unitText,
                    { color: weatherSettings.temperatureUnit === "F" ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  °F
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  settingsButton: {
    padding: 4,
  },
  content: {
    padding: 16,
  },
  alertsSection: {
    marginBottom: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  shiftWeatherInfo: {
    marginTop: 8,
  },
  shiftTimeInfo: {
    flexDirection: "row",
    marginBottom: 12,
  },
  shiftTimeLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  shiftTime: {
    fontSize: 14,
    fontWeight: "500",
  },
  shiftForecast: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastItem: {
    alignItems: "center",
    flex: 1,
  },
  forecastTime: {
    fontSize: 12,
    marginBottom: 4,
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  forecastDesc: {
    fontSize: 12,
    textAlign: "center",
  },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    padding: 12,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  settingLabel: {
    fontSize: 16,
  },
  temperatureUnitContainer: {
    flexDirection: "row",
  },
  unitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginLeft: 8,
  },
  activeUnitButton: {
    backgroundColor: "#4A6FFF",
  },
  unitText: {
    fontSize: 14,
    fontWeight: "500",
  },
})

export default WeatherScreen
