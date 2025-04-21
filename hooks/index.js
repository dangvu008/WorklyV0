// Import all hooks
import { useTheme } from "./useTheme"
import { useTranslation } from "./useTranslation"
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
