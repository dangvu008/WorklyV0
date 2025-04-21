"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"
import { NoteReminderService } from "../services"

// Create context
export const NotesContext = createContext()

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load notes from AsyncStorage
  useEffect(() => {
    const loadNotes = async () => {
      try {
        setIsLoading(true)
        const notesData = await AsyncStorage.getItem("notes")
        if (notesData) {
          const parsedNotes = JSON.parse(notesData)
          setNotes(parsedNotes)
        }
      } catch (error) {
        console.error("Error loading notes:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [])

  // Save notes to AsyncStorage
  const saveNotes = async (updatedNotes) => {
    try {
      await AsyncStorage.setItem("notes", JSON.stringify(updatedNotes))
    } catch (error) {
      console.error("Error saving notes:", error)
      throw error
    }
  }

  // Add a new note
  const addNote = async (noteData) => {
    try {
      const newNote = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...noteData,
      }

      const updatedNotes = [newNote, ...notes]
      setNotes(updatedNotes)
      await saveNotes(updatedNotes)

      // Schedule reminder if needed
      if (newNote.reminderTime) {
        await NoteReminderService.scheduleNoteReminder(newNote)
      }

      return newNote
    } catch (error) {
      console.error("Error adding note:", error)
      throw error
    }
  }

  // Update an existing note
  const updateNote = async (noteId, noteData) => {
    try {
      // Cancel existing reminder
      await NoteReminderService.cancelNoteReminder(noteId)

      const updatedNotes = notes.map((note) => {
        if (note.id === noteId) {
          const updatedNote = {
            ...note,
            ...noteData,
            updatedAt: new Date().toISOString(),
          }

          // Schedule new reminder if needed
          if (updatedNote.reminderTime) {
            NoteReminderService.scheduleNoteReminder(updatedNote)
          }

          return updatedNote
        }
        return note
      })

      setNotes(updatedNotes)
      await saveNotes(updatedNotes)
    } catch (error) {
      console.error("Error updating note:", error)
      throw error
    }
  }

  // Delete a note
  const deleteNote = async (noteId) => {
    try {
      // Cancel reminder
      await NoteReminderService.cancelNoteReminder(noteId)

      const updatedNotes = notes.filter((note) => note.id !== noteId)
      setNotes(updatedNotes)
      await saveNotes(updatedNotes)
    } catch (error) {
      console.error("Error deleting note:", error)
      throw error
    }
  }

  // Get a note by ID
  const getNoteById = (noteId) => {
    return notes.find((note) => note.id === noteId)
  }

  // Get notes for today
  const getTodayNotes = async () => {
    try {
      return await NoteReminderService.getTodayNotes()
    } catch (error) {
      console.error("Error getting today's notes:", error)
      return []
    }
  }

  // Search notes
  const searchNotes = (query) => {
    if (!query.trim()) return notes

    const lowercaseQuery = query.toLowerCase()
    return notes.filter(
      (note) =>
        note.title?.toLowerCase().includes(lowercaseQuery) || note.content?.toLowerCase().includes(lowercaseQuery),
    )
  }

  return (
    <NotesContext.Provider
      value={{
        notes,
        isLoading,
        addNote,
        updateNote,
        deleteNote,
        getNoteById,
        getTodayNotes,
        searchNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  )
}

export default NotesProvider
