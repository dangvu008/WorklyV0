"use client"

import { useContext } from "react"
import { LanguageContext } from "../contexts/LanguageContext"

// Custom hook to use translation - Snack compatible version
export const useTranslation = () => {
  return useContext(LanguageContext)
}

export default useTranslation
