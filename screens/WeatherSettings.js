"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation, useWeather } from "../hooks"
import { WeatherService } from "../services"

const WeatherSettings = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const { weatherSettings, saveWeatherSettings } = useWeather()

  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [temperatureUnit, setTemperatureUnit] = useState("C")
  const [temperatureThreshold, setTemperatureThreshold] = useState("30")
  const [rainThreshold, setRainThreshold] = useState("70")
  const [isPaidApiActive, setIsPaidApiActive] = useState(false)
  const [apiKey, setApiKey] = useState("")

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
    error: "#FF3B30",
  }

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      if (weatherSettings) {
        setUseCurrentLocation(weatherSettings.useCurrentLocation !== false)
        setTemperatureUnit(weatherSettings.temperatureUnit || "C")
        setTemperatureThreshold(weatherSettings.temperatureThreshold?.toString() || "30")
        setRainThreshold(weatherSettings.rainThreshold?.toString() || "70")
      }

      // Check if paid API is enabled
      try {
        const paidApiEnabled = await WeatherService.isPaidApiEnabled()
        setIsPaidApiActive(paidApiEnabled)
      } catch (error) {
        console.error("Error checking paid API status:", error)
      }
    }

    loadSettings()
  }, [weatherSettings])

  // Save settings
  const saveSettings = async () => {
    try {
      const tempThreshold = Number.parseInt(temperatureThreshold, 10)
      const rainProb = Number.parseInt(rainThreshold, 10)

      await saveWeatherSettings({
        useCurrentLocation,
        temperatureUnit,
        temperatureThreshold: isNaN(tempThreshold) ? 30 : tempThreshold,
        rainThreshold: isNaN(rainProb) ? 70 : rainProb,
      })

      Alert.alert(t("settings.success"), t("settings.weatherSettingsSaved"))
    } catch (error) {
      console.error("Error saving weather settings:", error)
      Alert.alert(t("settings.error"), t("settings.weatherSettingsError"))
    }
  }

  // Handle setting paid API key
  const handleSetApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert(t("settings.error"), t("settings.weatherApiKeyEmpty"))
      return
    }

    try {
      await WeatherService.setPaidApiKey(apiKey)
      setIsPaidApiActive(true)
      setApiKey("")
      Alert.alert(t("settings.success"), t("settings.weatherApiKeySet"))
    } catch (error) {
      console.error("Error setting weather API key:", error)
      Alert.alert(t("settings.error"), t("settings.weatherApiKeyError"))
    }
  }

  // Handle removing paid API key
  const handleRemoveApiKey = async () => {
    Alert.alert(t("settings.removeWeatherApiKeyTitle"), t("settings.removeWeatherApiKeyMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        style: "destructive",
        onPress: async () => {
          try {
            await WeatherService.removePaidApiKey()
            setIsPaidApiActive(false)
            Alert.alert(t("settings.success"), t("settings.weatherApiKeyRemoved"))
          } catch (error) {
            console.error("Error removing weather API key:", error)
            Alert.alert(t("settings.error"), t("settings.weatherApiKeyRemoveError"))
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t("settings.weatherSettings")}</Text>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>{t("common.save")}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Location Settings */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.locationSettings")}</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t("settings.useCurrentLocation")}</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {t("settings.useCurrentLocationDesc")}
              </Text>
            </View>
            <Switch
              value={useCurrentLocation}
              onValueChange={setUseCurrentLocation}
              trackColor={{ false: "#767577", true: theme.primary }}
              thumbColor="#FFFFFF"
            />
          </View>

          {!useCurrentLocation && (
            <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.locationButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  // In a real app, this would open a location picker
                  Alert.alert(t("settings.locationPicker"), t("settings.locationPickerDesc"))
                }}
              >
                <Ionicons name="location" size={20} color="#FFFFFF" style={styles.locationButtonIcon} />
                <Text style={styles.locationButtonText}>{t("settings.selectLocation")}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Display Settings */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.displaySettings")}</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <Text style={[styles.settingLabel, { color: theme.text }]}>{t("settings.temperatureUnit")}</Text>
            <View style={styles.unitButtons}>
              <TouchableOpacity
                style={[styles.unitButton, temperatureUnit === "C" && { backgroundColor: theme.primary }]}
                onPress={() => setTemperatureUnit("C")}
              >
                <Text style={[styles.unitButtonText, temperatureUnit === "C" && { color: "#FFFFFF" }]}>°C</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.unitButton, temperatureUnit === "F" && { backgroundColor: theme.primary }]}
                onPress={() => setTemperatureUnit("F")}
              >
                <Text style={[styles.unitButtonText, temperatureUnit === "F" && { color: "#FFFFFF" }]}>°F</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Alert Thresholds */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.alertThresholds")}</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t("settings.highTemperature")}</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {t("settings.highTemperatureDesc")}
              </Text>
            </View>
            <View style={styles.thresholdInputContainer}>
              <TextInput
                style={[
                  styles.thresholdInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={temperatureThreshold}
                onChangeText={setTemperatureThreshold}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.unitText, { color: theme.text }]}>°{temperatureUnit}</Text>
            </View>
          </View>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t("settings.rainProbability")}</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {t("settings.rainProbabilityDesc")}
              </Text>
            </View>
            <View style={styles.thresholdInputContainer}>
              <TextInput
                style={[
                  styles.thresholdInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                value={rainThreshold}
                onChangeText={setRainThreshold}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.unitText, { color: theme.text }]}>%</Text>
            </View>
          </View>
        </View>

        {/* API Key Settings */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t("settings.apiKeySettings")}</Text>

          <View style={[styles.settingRow, { borderBottomColor: theme.border }]}>
            <View style={styles.settingLabelContainer}>
              <Text style={[styles.settingLabel, { color: theme.text }]}>{t("settings.weatherApiKey")}</Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {isPaidApiActive ? t("settings.weatherApiKeyActive") : t("settings.weatherApiKeyDesc")}
              </Text>
            </View>
          </View>

          {isPaidApiActive ? (
            <View style={styles.apiKeyActions}>
              <TouchableOpacity
                style={[styles.apiKeyButton, { backgroundColor: theme.error }]}
                onPress={handleRemoveApiKey}
              >
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.apiKeyButtonIcon} />
                <Text style={styles.apiKeyButtonText}>{t("settings.removeApiKey")}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.apiKeyForm}>
              <TextInput
                style={[
                  styles.apiKeyInput,
                  {
                    color: theme.text,
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                  },
                ]}
                placeholder={t("settings.weatherApiKeyPlaceholder")}
                placeholderTextColor={theme.textSecondary}
                value={apiKey}
                onChangeText={setApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={[styles.apiKeyButton, { backgroundColor: theme.primary }]}
                onPress={handleSetApiKey}
              >
                <Text style={styles.apiKeyButtonText}>{t("settings.setApiKey")}</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.apiKeyNote, { color: theme.textSecondary }]}>{t("settings.weatherApiKeyNote")}</Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  saveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 16,
    paddingBottom: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingLabelContainer: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  locationButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: "100%",
  },
  locationButtonIcon: {
    marginRight: 8,
  },
  locationButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  unitButtons: {
    flexDirection: "row",
  },
  unitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginLeft: 8,
  },
  unitButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  thresholdInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  thresholdInput: {
    width: 60,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    textAlign: "center",
    fontSize: 16,
  },
  unitText: {
    fontSize: 16,
    marginLeft: 8,
  },
  apiKeyForm: {
    padding: 16,
    paddingTop: 0,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  apiKeyButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  apiKeyButtonIcon: {
    marginRight: 8,
  },
  apiKeyButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  apiKeyActions: {
    padding: 16,
    paddingTop: 0,
  },
  apiKeyNote: {
    fontSize: 12,
    fontStyle: "italic",
    padding: 16,
    paddingTop: 8,
  },
})

export default WeatherSettings
