"use client"

import { createContext, useState, useEffect, useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Location from "expo-location"

// Tạo context
export const WeatherContext = createContext()

export const WeatherProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null)
  const [weatherForecast, setWeatherForecast] = useState([])
  const [weatherAlerts, setWeatherAlerts] = useState([])
  const [location, setLocation] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [weatherSettings, setWeatherSettings] = useState({
    enabled: true,
    useCurrentLocation: true,
    manualLocation: null,
    updateFrequency: 60, // phút
    warningEnabled: true,
    temperatureUnit: "C", // C hoặc F
  })

  // Tải cài đặt thời tiết
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsData = await AsyncStorage.getItem("weather_settings")
        if (settingsData) {
          setWeatherSettings(JSON.parse(settingsData))
        }
      } catch (error) {
        console.error("Error loading weather settings:", error)
      }
    }

    loadSettings()
  }, [])

  // Tải dữ liệu thời tiết khi có vị trí
  useEffect(() => {
    if (weatherSettings.enabled) {
      if (weatherSettings.useCurrentLocation) {
        getCurrentLocation()
      } else if (weatherSettings.manualLocation) {
        setLocation(weatherSettings.manualLocation)
      }
    } else {
      setIsLoading(false)
    }
  }, [weatherSettings])

  // Tải dữ liệu thời tiết khi có vị trí
  useEffect(() => {
    if (location && weatherSettings.enabled) {
      fetchWeatherData()
    }
  }, [location, weatherSettings.enabled, fetchWeatherData])

  // Lưu cài đặt thời tiết
  const saveWeatherSettings = async (settings) => {
    try {
      const updatedSettings = {
        ...weatherSettings,
        ...settings,
      }
      setWeatherSettings(updatedSettings)
      await AsyncStorage.setItem("weather_settings", JSON.stringify(updatedSettings))
      return true
    } catch (error) {
      console.error("Error saving weather settings:", error)
      return false
    }
  }

  // Lấy vị trí hiện tại
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Quyền truy cập vị trí bị từ chối")
        setIsLoading(false)
        return
      }

      const location = await Location.getCurrentPositionAsync({})
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      })
    } catch (error) {
      console.error("Error getting location:", error)
      setError("Không thể lấy vị trí hiện tại")
      setIsLoading(false)
    }
  }

  // Lấy dữ liệu thời tiết từ API
  const fetchWeatherData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Sử dụng API OpenWeatherMap (cần API key)
      const apiKey = "YOUR_OPENWEATHERMAP_API_KEY" // Thay bằng API key thực tế
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&units=metric&appid=${apiKey}`
      const alertsUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${location.latitude}&lon=${location.longitude}&exclude=current,minutely,hourly,daily&appid=${apiKey}`

      // Trong môi trường thực tế, bạn sẽ gọi API thực sự
      // Ở đây, chúng ta sẽ sử dụng dữ liệu mẫu
      const mockWeatherData = getMockWeatherData()
      const mockForecastData = getMockForecastData()
      const mockAlertsData = getMockAlertsData()

      setWeatherData(mockWeatherData)
      setWeatherForecast(mockForecastData)
      setWeatherAlerts(mockAlertsData)

      // Lưu dữ liệu thời tiết vào AsyncStorage
      await AsyncStorage.setItem("weather_data", JSON.stringify(mockWeatherData))
      await AsyncStorage.setItem("weather_forecast", JSON.stringify(mockForecastData))
      await AsyncStorage.setItem("weather_alerts", JSON.stringify(mockAlertsData))
      await AsyncStorage.setItem("weather_last_updated", new Date().toISOString())
    } catch (error) {
      console.error("Error fetching weather data:", error)
      setError("Không thể lấy dữ liệu thời tiết")

      // Thử tải dữ liệu đã lưu
      try {
        const savedWeatherData = await AsyncStorage.getItem("weather_data")
        const savedForecastData = await AsyncStorage.getItem("weather_forecast")
        const savedAlertsData = await AsyncStorage.getItem("weather_alerts")

        if (savedWeatherData) setWeatherData(JSON.parse(savedWeatherData))
        if (savedForecastData) setWeatherForecast(JSON.parse(savedForecastData))
        if (savedAlertsData) setWeatherAlerts(JSON.parse(savedAlertsData))
      } catch (e) {
        console.error("Error loading saved weather data:", e)
      }
    } finally {
      setIsLoading(false)
    }
  }, [location])

  // Kiểm tra cảnh báo thời tiết cho ca làm việc
  const checkWeatherAlertsForShift = (shift) => {
    if (!weatherAlerts || weatherAlerts.length === 0 || !shift) {
      return []
    }

    // Lấy thời gian bắt đầu và kết thúc ca làm việc
    const [startHour, startMinute] = shift.startTime.split(":").map(Number)
    const [endHour, endMinute] = shift.endTime.split(":").map(Number)

    // Tạo đối tượng Date cho thời gian bắt đầu và kết thúc ca làm việc
    const now = new Date()
    const shiftStart = new Date(now)
    shiftStart.setHours(startHour, startMinute, 0, 0)

    const shiftEnd = new Date(now)
    shiftEnd.setHours(endHour, endMinute, 0, 0)
    if (endHour < startHour) {
      // Ca qua đêm
      shiftEnd.setDate(shiftEnd.getDate() + 1)
    }

    // Lọc các cảnh báo thời tiết trong khoảng thời gian ca làm việc
    return weatherAlerts.filter((alert) => {
      const alertStart = new Date(alert.start * 1000)
      const alertEnd = new Date(alert.end * 1000)

      // Kiểm tra xem cảnh báo có giao với ca làm việc không
      return (
        (alertStart <= shiftEnd && alertEnd >= shiftStart) ||
        (alertStart >= shiftStart && alertStart <= shiftEnd) ||
        (alertEnd >= shiftStart && alertEnd <= shiftEnd)
      )
    })
  }

  // Lấy dự báo thời tiết cho ca làm việc
  const getWeatherForecastForShift = (shift, date) => {
    if (!weatherForecast || weatherForecast.length === 0 || !shift) {
      return []
    }

    // Lấy thời gian bắt đầu và kết thúc ca làm việc
    const [startHour, startMinute] = shift.startTime.split(":").map(Number)
    const [endHour, endMinute] = shift.endTime.split(":").map(Number)

    // Tạo đối tượng Date cho thời gian bắt đầu và kết thúc ca làm việc
    const shiftDate = date || new Date()
    const shiftStart = new Date(shiftDate)
    shiftStart.setHours(startHour, startMinute, 0, 0)

    const shiftEnd = new Date(shiftDate)
    shiftEnd.setHours(endHour, endMinute, 0, 0)
    if (endHour < startHour) {
      // Ca qua đêm
      shiftEnd.setDate(shiftEnd.getDate() + 1)
    }

    // Lọc dự báo thời tiết trong khoảng thời gian ca làm việc
    return weatherForecast.filter((forecast) => {
      const forecastTime = new Date(forecast.dt * 1000)
      return forecastTime >= shiftStart && forecastTime <= shiftEnd
    })
  }

  // Chuyển đổi nhiệt độ
  const convertTemperature = (temp, unit = weatherSettings.temperatureUnit) => {
    if (unit === "F") {
      return (temp * 9) / 5 + 32
    }
    return temp
  }

  // Làm mới dữ liệu thời tiết
  const refreshWeatherData = async () => {
    if (weatherSettings.useCurrentLocation) {
      await getCurrentLocation()
    } else {
      await fetchWeatherData()
    }
  }

  // Dữ liệu thời tiết mẫu
  const getMockWeatherData = () => {
    return {
      coord: { lon: 105.8412, lat: 21.0245 },
      weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
      main: {
        temp: 30.2,
        feels_like: 32.5,
        temp_min: 28.9,
        temp_max: 31.5,
        pressure: 1010,
        humidity: 65,
      },
      wind: { speed: 2.5, deg: 120 },
      clouds: { all: 5 },
      dt: Math.floor(Date.now() / 1000),
      sys: { country: "VN", sunrise: 1618956067, sunset: 1619001632 },
      name: "Hanoi",
    }
  }

  // Dữ liệu dự báo thời tiết mẫu
  const getMockForecastData = () => {
    const now = Math.floor(Date.now() / 1000)
    return [
      {
        dt: now,
        main: { temp: 30.2, feels_like: 32.5, humidity: 65 },
        weather: [{ id: 800, main: "Clear", description: "clear sky", icon: "01d" }],
        wind: { speed: 2.5, deg: 120 },
      },
      {
        dt: now + 3600,
        main: { temp: 29.8, feels_like: 32.0, humidity: 68 },
        weather: [{ id: 801, main: "Clouds", description: "few clouds", icon: "02d" }],
        wind: { speed: 2.8, deg: 130 },
      },
      {
        dt: now + 7200,
        main: { temp: 28.5, feels_like: 30.8, humidity: 72 },
        weather: [{ id: 802, main: "Clouds", description: "scattered clouds", icon: "03d" }],
        wind: { speed: 3.0, deg: 140 },
      },
      {
        dt: now + 10800,
        main: { temp: 27.2, feels_like: 29.5, humidity: 75 },
        weather: [{ id: 500, main: "Rain", description: "light rain", icon: "10d" }],
        wind: { speed: 3.2, deg: 150 },
      },
      {
        dt: now + 14400,
        main: { temp: 26.0, feels_like: 28.2, humidity: 80 },
        weather: [{ id: 501, main: "Rain", description: "moderate rain", icon: "10n" }],
        wind: { speed: 3.5, deg: 160 },
      },
    ]
  }

  // Dữ liệu cảnh báo thời tiết mẫu
  const getMockAlertsData = () => {
    const now = Math.floor(Date.now() / 1000)
    return [
      {
        sender_name: "Trung tâm Dự báo KTTV Quốc gia",
        event: "Mưa lớn",
        start: now + 3600,
        end: now + 18000,
        description: "Dự báo có mưa lớn từ 15:00 đến 20:00, lượng mưa từ 30-50mm.",
        tags: ["Rain", "Flood"],
      },
    ]
  }

  return (
    <WeatherContext.Provider
      value={{
        weatherSettings,
        saveWeatherSettings,
        weatherData,
        weatherForecast,
        weatherAlerts,
        location,
        isLoading,
        error,
        refreshWeatherData,
        checkWeatherAlertsForShift,
        getWeatherForecastForShift,
        convertTemperature,
      }}
    >
      {children}
    </WeatherContext.Provider>
  )
}
