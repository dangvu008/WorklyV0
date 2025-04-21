"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useColorScheme } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Create context
const ThemeContext = createContext()

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme()
  const [isDarkMode, setIsDarkMode] = useState(undefined)
  const [isLoading, setIsLoading] = useState(true)

  // Load theme from storage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("@theme_preference")
        if (savedTheme !== null) {
          setIsDarkMode(savedTheme === "dark")
        } else {
          // Use system theme if no saved preference
          setIsDarkMode(systemColorScheme === "dark")
        }
      } catch (error) {
        console.error("Error loading theme:", error)
        setIsDarkMode(systemColorScheme === "dark")
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [systemColorScheme])

  // Save theme when changed
  useEffect(() => {
    if (isDarkMode !== undefined) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem("@theme_preference", isDarkMode ? "dark" : "light")
        } catch (error) {
          console.error("Error saving theme:", error)
        }
      }

      saveTheme()
    }
  }, [isDarkMode])

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode)
  }

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, isLoading }}>
      {!isLoading && children}
    </ThemeContext.Provider>
  )
}

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }

  return context
}
