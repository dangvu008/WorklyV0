import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import { getActiveShift } from "./ShiftService"

// Storage keys
const STORAGE_KEYS = {
  NOTES: "notes",
  NOTE_REMINDERS_ENABLED: "note_reminders_enabled",
}

// Notification ID prefix
const NOTIFICATION_PREFIX = "note_reminder_"

/**
 * Check if note reminders are enabled
 */
export const isNoteRemindersEnabled = async () => {
  try {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTE_REMINDERS_ENABLED)
    return enabled !== "false" // Default to true
  } catch (error) {
    console.error("Error checking if note reminders are enabled:", error)
    return true
  }
}

/**
 * Enable or disable note reminders
 */
export const setNoteRemindersEnabled = async (enabled) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.NOTE_REMINDERS_ENABLED, enabled ? "true" : "false")
    return true
  } catch (error) {
    console.error("Error setting note reminders enabled:", error)
    return false
  }
}

/**
 * Get all notes
 */
export const getNotes = async () => {
  try {
    const notesData = await AsyncStorage.getItem(STORAGE_KEYS.NOTES)
    return notesData ? JSON.parse(notesData) : []
  } catch (error) {
    console.error("Error getting notes:", error)
    return []
  }
}

/**
 * Schedule reminders for all notes
 */
export const scheduleAllNoteReminders = async () => {
  try {
    // Check if reminders are enabled
    const remindersEnabled = await isNoteRemindersEnabled()
    if (!remindersEnabled) return false

    // Get all notes
    const notes = await getNotes()

    // Get active shift
    const activeShift = await getActiveShift()

    // Cancel all existing note reminders
    await cancelAllNoteReminders()

    // Get today's day of week (1-7, where 1 is Monday and 7 is Sunday)
    const today = new Date().getDay()
    const dayIndex = today === 0 ? 7 : today

    // Schedule reminders for notes that should be shown today
    for (const note of notes) {
      // Skip notes without reminder time
      if (!note.reminderTime) continue

      let shouldSchedule = false

      // Check if note is linked to active shift
      if (note.linkedShiftIds && note.linkedShiftIds.length > 0) {
        if (activeShift && note.linkedShiftIds.includes(activeShift.id)) {
          shouldSchedule = true
        }
      }
      // Check if note should be shown on this day of week
      else if (note.selectedDays && note.selectedDays.includes(dayIndex)) {
        shouldSchedule = true
      }

      if (shouldSchedule) {
        await scheduleNoteReminder(note)
      }
    }

    return true
  } catch (error) {
    console.error("Error scheduling all note reminders:", error)
    return false
  }
}

/**
 * Schedule reminder for a specific note
 */
export const scheduleNoteReminder = async (note) => {
  try {
    // Check if reminders are enabled
    const remindersEnabled = await isNoteRemindersEnabled()
    if (!remindersEnabled) return false

    // Skip notes without reminder time
    if (!note.reminderTime) return false

    // Parse reminder time
    const [hours, minutes] = note.reminderTime.split(":").map(Number)

    // Create Date object for reminder time
    const now = new Date()
    const reminderTime = new Date(now)
    reminderTime.setHours(hours, minutes, 0, 0)

    // If reminder time is in the past, don't schedule
    if (reminderTime < now) return false

    // Schedule notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: note.title || "Nhắc nhở",
        body: note.content || "Bạn có một nhắc nhở.",
        data: { type: "note_reminder", noteId: note.id },
      },
      trigger: reminderTime,
      identifier: `${NOTIFICATION_PREFIX}${note.id}`,
    })

    return true
  } catch (error) {
    console.error("Error scheduling note reminder:", error)
    return false
  }
}

/**
 * Cancel reminder for a specific note
 */
export const cancelNoteReminder = async (noteId) => {
  try {
    await Notifications.cancelScheduledNotificationAsync(`${NOTIFICATION_PREFIX}${noteId}`)
    return true
  } catch (error) {
    console.error("Error canceling note reminder:", error)
    return false
  }
}

/**
 * Cancel all note reminders
 */
export const cancelAllNoteReminders = async () => {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync()

    for (const notification of scheduledNotifications) {
      if (notification.identifier.startsWith(NOTIFICATION_PREFIX)) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier)
      }
    }

    return true
  } catch (error) {
    console.error("Error canceling all note reminders:", error)
    return false
  }
}

/**
 * Get notes for today
 */
export const getTodayNotes = async () => {
  try {
    // Get all notes
    const notes = await getNotes()

    // Get active shift
    const activeShift = await getActiveShift()

    // Get today's day of week (1-7, where 1 is Monday and 7 is Sunday)
    const today = new Date().getDay()
    const dayIndex = today === 0 ? 7 : today

    // Filter notes that should be shown today
    return notes.filter((note) => {
      // Check if note is linked to active shift
      if (note.linkedShiftIds && note.linkedShiftIds.length > 0) {
        if (activeShift && note.linkedShiftIds.includes(activeShift.id)) {
          return true
        }
      }
      // Check if note should be shown on this day of week
      else if (note.selectedDays && note.selectedDays.includes(dayIndex)) {
        return true
      }

      return false
    })
  } catch (error) {
    console.error("Error getting today's notes:", error)
    return []
  }
}

/**
 * Add a new note
 */
export const addNote = async (noteData) => {
  try {
    // Get all notes
    const notes = await getNotes()

    // Create new note
    const newNote = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...noteData,
    }

    // Add to notes list
    const updatedNotes = [...notes, newNote]
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes))

    // Schedule reminder if needed
    if (newNote.reminderTime) {
      await scheduleNoteReminder(newNote)
    }

    return newNote
  } catch (error) {
    console.error("Error adding note:", error)
    throw error
  }
}

/**
 * Update an existing note
 */
export const updateNote = async (noteId, noteData) => {
  try {
    // Get all notes
    const notes = await getNotes()

    // Find note index
    const noteIndex = notes.findIndex((note) => note.id === noteId)
    if (noteIndex === -1) {
      throw new Error("Note not found")
    }

    // Cancel existing reminder
    await cancelNoteReminder(noteId)

    // Update note
    const updatedNote = {
      ...notes[noteIndex],
      ...noteData,
      updatedAt: new Date().toISOString(),
    }

    // Update notes list
    const updatedNotes = [...notes]
    updatedNotes[noteIndex] = updatedNote
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes))

    // Schedule new reminder if needed
    if (updatedNote.reminderTime) {
      await scheduleNoteReminder(updatedNote)
    }

    return updatedNote
  } catch (error) {
    console.error("Error updating note:", error)
    throw error
  }
}

/**
 * Delete a note
 */
export const deleteNote = async (noteId) => {
  try {
    // Get all notes
    const notes = await getNotes()

    // Filter out the note to delete
    const updatedNotes = notes.filter((note) => note.id !== noteId)
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(updatedNotes))

    // Cancel reminder
    await cancelNoteReminder(noteId)

    return true
  } catch (error) {
    console.error("Error deleting note:", error)
    throw error
  }
}
