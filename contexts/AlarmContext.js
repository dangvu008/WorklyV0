"use client"

import { createContext, useState } from "react"

// Tạo context
export const AlarmContext = createContext()

export const AlarmProvider = ({ children }) => {
  const [alarms, setAlarms] = useState([])

  return (
    <AlarmContext.Provider
      value={{
        alarms,
      }}
    >
      {children}
    </AlarmContext.Provider>
  )
}
