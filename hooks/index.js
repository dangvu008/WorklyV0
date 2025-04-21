// Import all hooks
// Using Snack compatible versions
import { useTheme } from "./useThemeSnack"
import { useTranslation } from "./useTranslationSnack"
import { useWork } from "./useWork"
import { useNotification } from "./useNotification"
import { useAlarm } from "./useAlarm"
import { useWeather } from "./useWeather"
import { useBackup } from "./useBackup"
import { useNotes } from "./useNotes"

// Named exports for individual imports
export { useTheme, useTranslation, useWork, useNotification, useAlarm, useWeather, useBackup, useNotes }

// Default export for the directory
const Hooks = {
  useTheme,
  useTranslation,
  useWork,
  useNotification,
  useAlarm,
  useWeather,
  useBackup,
  useNotes,
}

export default Hooks
