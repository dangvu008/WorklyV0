// App Navigation Types
export type RootStackParamList = {
  MainTabs: undefined
  Detail: { itemId: string; title: string }
  Search: undefined
  SoundSettings: undefined
  SampleData: undefined
  BackupRestore: undefined
  AddEditNote: { noteId?: string }
  AddEditAlarm: { alarm?: Alarm }
  WeatherSettings: undefined
  AddEditShift: { shift?: Shift }
}

export type MainTabParamList = {
  Home: undefined
  Notes: undefined
  Stats: undefined
  Settings: undefined
}

// Model Types
export interface Shift {
  id: string
  name: string
  departureTime: string
  startTime: string
  officeEndTime: string
  endTime: string
  reminderBefore: number
  reminderAfter: number
  showSignButton: boolean
  appliedDays: number[] // 1-7 where 1 is Monday and 7 is Sunday
  isApplied: boolean
}

export interface WorkLog {
  date: string
  status: WorkStatus
  goWorkTime?: string
  checkInTime?: string
  checkOutTime?: string
  completeTime?: string
  totalHours?: number
  remarks?: string
  shiftName?: string
  vaoLogTime?: string
  raLogTime?: string
}

export interface Note {
  id: string
  title: string
  content: string
  reminderTime?: string
  selectedDays?: number[]
  linkedShiftIds?: string[]
  createdAt: string
  updatedAt?: string
}

export interface Alarm {
  id: string
  title: string
  description?: string
  time: string
  type: "one_time" | "recurring" | "shift_linked"
  days?: string[] // For recurring alarms
  date?: string // For one-time alarms
  isEnabled: boolean
  createdAt: string
}

export interface WeatherData {
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  name: string
  coord: {
    lat: number
    lon: number
  }
}

export interface WeatherAlert {
  sender_name: string
  event: string
  start: number
  end: number
  description: string
  tags?: string[]
}

export interface WeatherSettings {
  enabled: boolean
  useCurrentLocation: boolean
  manualLocation?: { latitude: number; longitude: number }
  updateFrequency: number
  warningEnabled: boolean
  temperatureUnit: "C" | "F"
  temperatureThreshold?: number
  rainThreshold?: number
}

export interface AppSettings {
  simpleButtonMode: boolean
  weatherAlertsEnabled: boolean
  noteRemindersEnabled: boolean
  shiftReminderMode: "ask_daily" | "ask_weekly" | "auto"
}

export interface NotificationSettings {
  sound: boolean
  vibration: boolean
}

export interface Sound {
  id: string
  name: string
  url?: string
  filename?: string
  isDefault?: boolean
  isCustom?: boolean
}

// Enum Types
export type WorkStatus = "not_started" | "going_to_work" | "checked_in" | "checked_out" | "completed"

export type DayStatus =
  | "full_work"
  | "missing_action"
  | "leave"
  | "sick"
  | "holiday"
  | "absent"
  | "late_early"
  | "not_set"

export type ActionType = "go_work" | "check_in" | "check_out" | "complete" | "punch"

export interface ActionHistoryItem {
  type: ActionType
  time: string
  timestamp: string
  icon: string
}
