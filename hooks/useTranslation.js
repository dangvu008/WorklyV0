"use client"

import { useContext } from "react"
import { LanguageContext } from "../contexts"

export const useTranslation = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider")
  }

  return context
}
