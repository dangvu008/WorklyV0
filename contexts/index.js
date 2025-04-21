// Import all contexts and providers
import { ThemeContext, ThemeProvider } from "./ThemeContext"
import { LanguageContext, LanguageProvider } from "./LanguageContext"
import { WorkContext, WorkProvider } from "./WorkContext"
import { NotificationContext, NotificationProvider } from "./NotificationContext"
import { AlarmContext, AlarmProvider } from "./AlarmContext"
import { WeatherContext, WeatherProvider } from "./WeatherContext"
import { BackupContext, BackupProvider } from "./BackupContext"
import { NotesContext, NotesProvider } from "./NotesContext"

// Named exports for individual imports
export {
  ThemeContext,
  ThemeProvider,
  LanguageContext,
  LanguageProvider,
  WorkContext,
  WorkProvider,
  NotificationContext,
  NotificationProvider,
  AlarmContext,
  AlarmProvider,
  WeatherContext,
  WeatherProvider,
  BackupContext,
  BackupProvider,
  NotesContext,
  NotesProvider,
}

// Default export for the directory
const Contexts = {
  ThemeContext,
  ThemeProvider,
  LanguageContext,
  LanguageProvider,
  WorkContext,
  WorkProvider,
  NotificationContext,
  NotificationProvider,
  AlarmContext,
  AlarmProvider,
  WeatherContext,
  WeatherProvider,
  BackupContext,
  BackupProvider,
  NotesContext,
  NotesProvider,
}

export default Contexts
