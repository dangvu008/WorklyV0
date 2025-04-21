import AsyncStorage from "@react-native-async-storage/async-storage"
import { isSameDay } from "date-fns"
import * as Notifications from "expo-notifications"
import { getWeather } from "./WeatherService"
import { getActiveShift, parseTimeString } from "./ShiftService"

// Storage keys
const STORAGE_KEYS = {
  WEATHER_ALERTS_ENABLED: "weather_alerts_enabled",
  WEATHER_ALERTS_DISMISSED: "weather_alerts_dismissed",
  WEATHER_TEMPERATURE_THRESHOLD: "weather_temperature_threshold",
  WEATHER_RAIN_THRESHOLD: "weather_rain_threshold",
}

// Notification IDs
const NOTIFICATION_ID = "weather_alert"

/**
 * Check if weather alerts are enabled
 */
export const isWeatherAlertsEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_ALERTS_ENABLED)
    return enabled === "true"
  } catch (error) {
    console.error("Error checking if weather alerts are enabled:", error)
    return false
  }
}

/**
 * Enable or disable weather alerts
 */
export const setWeatherAlertsEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_ALERTS_ENABLED, enabled ? "true" : "false")
    return true
  } catch (error) {
    console.error("Error setting weather alerts enabled:", error)
    return false
  }
}

/**
 * Get temperature threshold for alerts
 */
export const getTemperatureThreshold = async () => {
  try {
    const threshold = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_TEMPERATURE_THRESHOLD)
    return threshold ? Number.parseInt(threshold, 10) : 30 // Default to 30°C
  } catch (error) {
    console.error("Error getting temperature threshold:", error)
    return 30
  }
}

/**
 * Set temperature threshold for alerts
 */
export const setTemperatureThreshold = async (threshold) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_TEMPERATURE_THRESHOLD, threshold.toString())
    return true
  } catch (error) {
    console.error("Error setting temperature threshold:", error)
    return false
  }
}

/**
 * Get rain probability threshold for alerts
 */
export const getRainThreshold = async () => {
  try {
    const threshold = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_RAIN_THRESHOLD)
    return threshold ? Number.parseInt(threshold, 10) : 70 // Default to 70%
  } catch (error) {
    console.error("Error getting rain threshold:", error)
    return 70
  }
}

/**
 * Set rain probability threshold for alerts
 */
export const setRainThreshold = async (threshold) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_RAIN_THRESHOLD, threshold.toString())
    return true
  } catch (error) {
    console.error("Error setting rain threshold:", error)
    return false
  }
}

/**
 * Check if alert for today's shift has been dismissed
 */
export const isAlertDismissed = async () => {
  try {
    const dismissedData = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_ALERTS_DISMISSED)
    if (!dismissedData) return false

    const dismissed = JSON.parse(dismissedData)
    return isSameDay(new Date(), new Date(dismissed.date))
  } catch (error) {
    console.error("Error checking if alert is dismissed:", error)
    return false
  }
}

/**
 * Dismiss weather alert for today's shift
 */
export const dismissAlert = async () => {
  try {
    const dismissData = {
      date: new Date().toISOString(),
    }

    await AsyncStorage.setItem(STORAGE_KEYS.WEATHER_ALERTS_DISMISSED, JSON.stringify(dismissData))
    return true
  } catch (error) {
    console.error("Error dismissing alert:", error)
    return false
  }
}

/**
 * Check weather conditions for shift and send alerts if needed
 */
export const checkWeatherForShift = async () => {
  try {
    // Check if weather alerts are enabled
    const alertsEnabled = await isWeatherAlertsEnabled()
    if (!alertsEnabled) return null

    // Check if alert for today has already been dismissed
    const alreadyDismissed = await isAlertDismissed()
    if (alreadyDismissed) return null

    // Get active shift
    const activeShift = await getActiveShift()
    if (!activeShift) return null

    // Get thresholds
    const temperatureThreshold = await getTemperatureThreshold()
    const rainThreshold = await getRainThreshold()

    // Parse shift times
    const departureTime = parseTimeString(activeShift.departureTime)
    const endTime = parseTimeString(activeShift.officeEndTime)

    // Create Date objects for departure and end times
    const now = new Date()
    const departureDate = new Date(now)
    departureDate.setHours(departureTime.hours, departureTime.minutes, 0, 0)

    const endDate = new Date(now)
    endDate.setHours(endTime.hours, endTime.minutes, 0, 0)

    // If end time is earlier than departure time, it's a night shift, so end time is on the next day
    if (endTime.hours < departureTime.hours) {
      endDate.setDate(endDate.getDate() + 1)
    }

    // Get weather data for departure time
    const departureWeather = await getWeather(departureDate)

    // Get weather data for end time
    const endTimeWeather = await getWeather(endDate)

    // Check for extreme conditions
    const alerts = []

    // Check departure time weather
    if (departureWeather) {
      // Check for rain
      if (
        departureWeather.weather[0].main === "Rain" ||
        departureWeather.weather[0].main === "Drizzle" ||
        departureWeather.weather[0].main === "Thunderstorm"
      ) {
        alerts.push({
          type: "rain",
          time: "departure",
          description: `Dự báo có mưa lúc đi làm (khoảng ${activeShift.departureTime}), hãy mang theo áo mưa/ô.`,
        })
      }

      // Check for high temperature
      if (departureWeather.main.temp >= temperatureThreshold) {
        alerts.push({
          type: "high_temp",
          time: "departure",
          description: `Dự báo nắng nóng (${Math.round(departureWeather.main.temp)}°C) khi đi làm (khoảng ${activeShift.departureTime}), nên che chắn cẩn thận.`,
        })
      }

      // Check for low temperature
      if (departureWeather.main.temp <= 15) {
        alerts.push({
          type: "low_temp",
          time: "departure",
          description: `Nhiệt độ thấp (${Math.round(departureWeather.main.temp)}°C) lúc đi làm (khoảng ${activeShift.departureTime}), nên mặc ấm.`,
        })
      }

      // Check for strong wind
      if (departureWeather.wind.speed >= 10) {
        alerts.push({
          type: "wind",
          time: "departure",
          description: `Dự báo gió mạnh lúc đi làm (khoảng ${activeShift.departureTime}), chú ý di chuyển.`,
        })
      }

      // Check for snow (rare in Vietnam but included for completeness)
      if (departureWeather.weather[0].main === "Snow") {
        alerts.push({
          type: "snow",
          time: "departure",
          description: `Dự báo có tuyết lúc đi làm (khoảng ${activeShift.departureTime}), hãy cẩn thận khi di chuyển.`,
        })
      }
    }

    // Check end time weather
    if (endTimeWeather) {
      // Check for rain
      if (
        endTimeWeather.weather[0].main === "Rain" ||
        endTimeWeather.weather[0].main === "Drizzle" ||
        endTimeWeather.weather[0].main === "Thunderstorm"
      ) {
        const timeDescription =
          endDate.getDate() > now.getDate()
            ? `${activeShift.officeEndTime} sáng mai`
            : `tan làm (khoảng ${activeShift.officeEndTime})`

        alerts.push({
          type: "rain",
          time: "end",
          description: `Dự báo có mưa khi ${timeDescription}, nhớ mang theo áo mưa/ô.`,
        })
      }

      // Check for high temperature
      if (endTimeWeather.main.temp >= temperatureThreshold) {
        const timeDescription =
          endDate.getDate() > now.getDate()
            ? `${activeShift.officeEndTime} sáng mai`
            : `tan làm (khoảng ${activeShift.officeEndTime})`

        alerts.push({
          type: "high_temp",
          time: "end",
          description: `Dự báo nắng nóng (${Math.round(endTimeWeather.main.temp)}°C) khi ${timeDescription}, nên che chắn cẩn thận.`,
        })
      }

      // Check for low temperature
      if (endTimeWeather.main.temp <= 15) {
        const timeDescription =
          endDate.getDate() > now.getDate()
            ? `${activeShift.officeEndTime} sáng mai`
            : `tan làm (khoảng ${activeShift.officeEndTime})`

        alerts.push({
          type: "low_temp",
          time: "end",
          description: `Nhiệt độ thấp (${Math.round(endTimeWeather.main.temp)}°C) khi ${timeDescription}, nên mặc ấm.`,
        })
      }

      // Check for strong wind
      if (endTimeWeather.wind.speed >= 10) {
        const timeDescription =
          endDate.getDate() > now.getDate()
            ? `${activeShift.officeEndTime} sáng mai`
            : `tan làm (khoảng ${activeShift.officeEndTime})`

        alerts.push({
          type: "wind",
          time: "end",
          description: `Dự báo gió mạnh khi ${timeDescription}, chú ý di chuyển.`,
        })
      }

      // Check for snow
      if (endTimeWeather.weather[0].main === "Snow") {
        const timeDescription =
          endDate.getDate() > now.getDate()
            ? `${activeShift.officeEndTime} sáng mai`
            : `tan làm (khoảng ${activeShift.officeEndTime})`

        alerts.push({
          type: "snow",
          time: "end",
          description: `Dự báo có tuyết khi ${timeDescription}, hãy cẩn thận khi di chuyển.`,
        })
      }
    }

    // If no alerts, return null
    if (alerts.length === 0) {
      return null
    }

    // Create combined alert message
    let alertMessage = "Cảnh báo: "

    if (alerts.length === 1) {
      alertMessage = alerts[0].description
    } else {
      // Group alerts by time
      const departureAlerts = alerts.filter((alert) => alert.time === "departure")
      const endAlerts = alerts.filter((alert) => alert.time === "end")

      if (departureAlerts.length > 0) {
        alertMessage = departureAlerts.map((alert) => alert.description).join(" ")
      }

      if (endAlerts.length > 0) {
        if (departureAlerts.length > 0) {
          alertMessage += " Ngoài ra, "
        }

        alertMessage += endAlerts.map((alert) => alert.description).join(" ")
      }
    }

    // Send notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Cảnh báo thời tiết",
        body: alertMessage,
        data: { type: "weather_alert", alerts },
      },
      trigger: null, // Send immediately
      identifier: NOTIFICATION_ID,
    })

    return {
      message: alertMessage,
      alerts,
    }
  } catch (error) {
    console.error("Error checking weather for shift:", error)
    return null
  }
}

/**
 * Schedule weather check for active shift
 */
export const scheduleWeatherCheck = async () => {
  try {
    // Check if weather alerts are enabled
    const alertsEnabled = await isWeatherAlertsEnabled()
    if (!alertsEnabled) return false

    // Get active shift
    const activeShift = await getActiveShift()
    if (!activeShift) return false

    // Parse departure time
    const departureTime = parseTimeString(activeShift.departureTime)

    // Create Date object for 1 hour before departure
    const now = new Date()
    const checkTime = new Date(now)
    checkTime.setHours(departureTime.hours - 1, departureTime.minutes, 0, 0)

    // If check time is in the past, don't schedule
    if (checkTime < now) return false

    // Schedule weather check
    setTimeout(async () => {
      await checkWeatherForShift()
    }, checkTime.getTime() - now.getTime())

    return true
  } catch (error) {
    console.error("Error scheduling weather check:", error)
    return false
  }
}
