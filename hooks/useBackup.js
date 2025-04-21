"use client"

import { useContext } from "react"
import { BackupContext } from "../contexts"

export const useBackup = () => {
  const context = useContext(BackupContext)

  if (!context) {
    throw new Error("useBackup must be used within a BackupProvider")
  }

  return context
}
