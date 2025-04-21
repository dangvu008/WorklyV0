// Import all services
import * as WeatherService from "./WeatherService"
import * as ShiftService from "./ShiftService"
import * as WorkLogService from "./WorkLogService"
import * as WeatherAlertService from "./WeatherAlertService"
import * as NoteReminderService from "./NoteReminderService"
import * as SoundService from "./SoundService"
import * as SampleDataService from "./SampleDataService"

// Named exports for individual imports
export {
  WeatherService,
  ShiftService,
  WorkLogService,
  WeatherAlertService,
  NoteReminderService,
  SoundService,
  SampleDataService,
}

// Default export for the directory
const Services = {
  WeatherService,
  ShiftService,
  WorkLogService,
  WeatherAlertService,
  NoteReminderService,
  SoundService,
  SampleDataService,
}

export default Services
