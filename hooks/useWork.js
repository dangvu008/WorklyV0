"use client"

import { useContext } from "react"
import { WorkContext } from "../contexts"

export const useWork = () => {
  const context = useContext(WorkContext)

  if (!context) {
    throw new Error("useWork must be used within a WorkProvider")
  }

  return context
}
