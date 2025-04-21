"use client"

import { createContext } from "react"

// Tạo context
export const BackupContext = createContext()

export const BackupProvider = ({ children }) => {
  return <BackupContext.Provider value={{}}>{children}</BackupContext.Provider>
}
