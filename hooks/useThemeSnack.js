"use client"

import { useContext } from "react"
import { ThemeContext } from "../contexts/ThemeContext"

// Custom hook to use theme - Snack compatible version
export const useTheme = () => {
  return useContext(ThemeContext)
}

export default useTheme
