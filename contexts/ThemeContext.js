"use client"

import { createContext, useState, useEffect } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

export const ThemeContext = createContext()

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Lấy theme từ AsyncStorage khi component được mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@theme_preference")
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark")
        } else {
          // Nếu không có theme đã lưu, sử dụng theme hệ thống
          setIsDarkMode(systemColorScheme === "dark")
        }
      } catch (error) {
        console.error("Lỗi khi tải theme:", error)
        // Fallback to system theme
        setIsDarkMode(systemColorScheme === "dark")
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [systemColorScheme])

  // Lưu theme vào AsyncStorage khi thay đổi
  useEffect(() => {
    if (isDarkMode !== undefined) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem("@theme_preference", isDarkMode ? "dark" : "light")
        } catch (error) {
          console.error("Lỗi khi lưu theme:", error)
        }
      }

      saveTheme()
    }
  }, [isDarkMode])

  // Hàm để toggle theme
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  // Tạo đối tượng theme cho React Navigation
  const theme = {
    dark: isDarkMode,
    colors: {
      primary: "#4A6FFF",
      background: isDarkMode ? "#121826" : "#F2F2F7",
      card: isDarkMode ? "#1E2636" : "#FFFFFF",
      text: isDarkMode ? "#FFFFFF" : "#000000",
      border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
      notification: "#FF3B30",
      textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    },
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoading, theme }}>
      {!isLoading && children}
    </ThemeContext.Provider>
  )
}
