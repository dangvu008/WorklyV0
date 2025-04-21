import AsyncStorage from "@react-native-async-storage/async-storage"
import { format, parseISO, isSameDay } from "date-fns"
import { getActiveShift } from "./ShiftService"

// Storage keys
const STORAGE_KEYS = {
  WORK_LOGS: "work_logs",
  DAILY_WORK_STATUS: "daily_work_status",
  WORK_STATUS: "work_status",
  ACTION_HISTORY: "action_history",
}

// Work status types
export const WORK_STATUS = {
  NOT_STARTED: "not_started",
  GOING_TO_WORK: "going_to_work",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  COMPLETED: "completed",
}

// Day status types
export const DAY_STATUS = {
  FULL_WORK: "full_work",
  MISSING_ACTION: "missing_action",
  LEAVE: "leave",
  SICK: "sick",
  HOLIDAY: "holiday",
  ABSENT: "absent",
  LATE_EARLY: "late_early",
  NOT_SET: "not_set",
}

/**
 * Get current work status
 */
export const getCurrentWorkStatus = async () => {
  try {
    const statusData = await AsyncStorage.getItem(STORAGE_KEYS.WORK_STATUS)
    if (!statusData) {
      return {
        status: WORK_STATUS.NOT_STARTED,
        date: new Date().toISOString(),
        history: [],
      }
    }

    const parsedStatus = JSON.parse(statusData)

    // Check if status is from today
    if (isSameDay(new Date(), parseISO(parsedStatus.date))) {
      return parsedStatus
    }

    // If status is from a different day, reset to NOT_STARTED
    return {
      status: WORK_STATUS.NOT_STARTED,
      date: new Date().toISOString(),
      history: [],
    }
  } catch (error) {
    console.error("Error getting current work status:", error)
    return {
      status: WORK_STATUS.NOT_STARTED,
      date: new Date().toISOString(),
      history: [],
    }
  }
}

/**
 * Save work status
 */
export const saveWorkStatus = async (status, history = []) => {
  try {
    const statusData = {
      status,
      date: new Date().toISOString(),
      history,
    }

    await AsyncStorage.setItem(STORAGE_KEYS.WORK_STATUS, JSON.stringify(statusData))
    return true
  } catch (error) {
    console.error("Error saving work status:", error)
    return false
  }
}

/**
 * Perform a work action (go_work, check_in, check_out, complete)
 */
export const performWorkAction = async (action, simpleMode = false) => {
  try {
    // Get current status and history
    const { status: currentStatus, history } = await getCurrentWorkStatus()

    // Get current time
    const now = new Date()
    const timeString = format(now, "HH:mm")

    // Determine new status based on action
    let newStatus = currentStatus
    const newHistory = [...history]

    switch (action) {
      case "go_work":
        newStatus = simpleMode ? WORK_STATUS.COMPLETED : WORK_STATUS.GOING_TO_WORK
        newHistory.push({
          type: "go_work",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "briefcase-outline",
        })
        break

      case "check_in":
        newStatus = WORK_STATUS.CHECKED_IN
        newHistory.push({
          type: "check_in",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "log-in-outline",
        })
        break

      case "check_out":
        newStatus = WORK_STATUS.CHECKED_OUT
        newHistory.push({
          type: "check_out",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "log-out-outline",
        })
        break

      case "complete":
        newStatus = WORK_STATUS.COMPLETED
        newHistory.push({
          type: "complete",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "checkmark-circle-outline",
        })
        break

      case "punch":
        // Punch action doesn't change status, just adds to history
        newHistory.push({
          type: "punch",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "create-outline",
        })
        break
    }

    // Save new status and history
    await saveWorkStatus(newStatus, newHistory)

    // Update work log
    await updateWorkLog(action, timeString, now.toISOString())

    // Calculate and update daily work status if needed
    if (action === "check_out" || action === "complete" || (simpleMode && action === "go_work")) {
      await calculateAndUpdateDailyWorkStatus()
    }

    return {
      status: newStatus,
      history: newHistory,
    }
  } catch (error) {
    console.error("Error performing work action:", error)
    throw error
  }
}

/**
 * Update work log
 */
export const updateWorkLog = async (action, timeString, timestamp) => {
  try {
    const today = format(new Date(), "yyyy-MM-dd")
    const workLogs = await getWorkLogs()

    // Get active shift
    const activeShift = await getActiveShift()

    // Find log for today
    const existingLogIndex = workLogs.findIndex((log) => log.date === today)

    if (existingLogIndex >= 0) {
      // Update existing log
      const updatedLogs = [...workLogs]
      const log = { ...updatedLogs[existingLogIndex] }

      switch (action) {
        case "go_work":
          log.goWorkTime = timeString
          log.goWorkTimestamp = timestamp
          log.shiftId = activeShift?.id
          log.shiftName = activeShift?.name
          break

        case "check_in":
          log.checkInTime = timeString
          log.checkInTimestamp = timestamp
          break

        case "check_out":
          log.checkOutTime = timeString
          log.checkOutTimestamp = timestamp
          break

        case "complete":
          log.completeTime = timeString
          log.completeTimestamp = timestamp
          break

        case "punch":
          log.punchTime = timeString
          log.punchTimestamp = timestamp
          break
      }

      updatedLogs[existingLogIndex] = log
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(updatedLogs))
    } else {
      // Create new log
      const newLog = {
        date: today,
        shiftId: activeShift?.id,
        shiftName: activeShift?.name,
      }

      switch (action) {
        case "go_work":
          newLog.goWorkTime = timeString
          newLog.goWorkTimestamp = timestamp
          break

        case "check_in":
          newLog.checkInTime = timeString
          newLog.checkInTimestamp = timestamp
          break

        case "check_out":
          newLog.checkOutTime = timeString
          newLog.checkOutTimestamp = timestamp
          break

        case "complete":
          newLog.completeTime = timeString
          newLog.completeTimestamp = timestamp
          break

        case "punch":
          newLog.punchTime = timeString
          newLog.punchTimestamp = timestamp
          break
      }

      const updatedLogs = [...workLogs, newLog]
      await AsyncStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(updatedLogs))
    }

    return true
  } catch (error) {
    console.error("Error updating work log:", error)
    return false
  }
}

/**
 * Get all work logs
 */
export const getWorkLogs = async () => {
  try {
    const logsData = await AsyncStorage.getItem(STORAGE_KEYS.WORK_LOGS)
    return logsData ? JSON.parse(logsData) : []
  } catch (error) {
    console.error("Error getting work logs:", error)
    return []
  }
}

/**
 * Calculate and update daily work status
 */
export const calculateAndUpdateDailyWorkStatus = async () => {
  try {
    const today = format(new Date(), "yyyy-MM-dd")
    const workLogs = await getWorkLogs()
    const todayLog = workLogs.find((log) => log.date === today)

    if (!todayLog) {
      return false
    }

    // Get active shift
    const activeShift = await getActiveShift()
    if (!activeShift) {
      return false
    }

    // Calculate status
    let status = DAY_STATUS.MISSING_ACTION
    let remarks = ""

    // Calculate total hours if check-in and check-out times exist
    let totalHours = 0
    if (todayLog.checkInTime && todayLog.checkOutTime) {
      const [checkInHour, checkInMinute] = todayLog.checkInTime.split(":").map(Number)
      const [checkOutHour, checkOutMinute] = todayLog.checkOutTime.split(":").map(Number)

      const checkInMinutes = checkInHour * 60 + checkInMinute
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute

      // If check-out time is earlier than check-in time, assume it's the next day
      const totalMinutes =
        checkOutMinutes < checkInMinutes ? 24 * 60 - checkInMinutes + checkOutMinutes : checkOutMinutes - checkInMinutes

      totalHours = Math.round((totalMinutes / 60) * 10) / 10 // Round to 1 decimal place
    }

    // Check if all required actions are completed
    if (todayLog.goWorkTime && todayLog.checkInTime && todayLog.checkOutTime && todayLog.completeTime) {
      status = DAY_STATUS.FULL_WORK
    } else {
      status = DAY_STATUS.MISSING_ACTION
      remarks = "Thiếu một số hành động chấm công"
    }

    // Check for late arrival or early departure
    if (todayLog.checkInTime && todayLog.checkOutTime) {
      const [shiftStartHour, shiftStartMinute] = activeShift.startTime.split(":").map(Number)
      const [shiftEndHour, shiftEndMinute] = activeShift.endTime.split(":").map(Number)

      const [checkInHour, checkInMinute] = todayLog.checkInTime.split(":").map(Number)
      const [checkOutHour, checkOutMinute] = todayLog.checkOutTime.split(":").map(Number)

      const shiftStartMinutes = shiftStartHour * 60 + shiftStartMinute
      const shiftEndMinutes = shiftEndHour * 60 + shiftEndMinute
      const checkInMinutes = checkInHour * 60 + checkInMinute
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute

      // Check for late arrival (more than 5 minutes late)
      if (checkInMinutes > shiftStartMinutes + 5) {
        status = DAY_STATUS.LATE_EARLY
        remarks = `Đi muộn ${Math.floor((checkInMinutes - shiftStartMinutes) / 60)}h${(checkInMinutes - shiftStartMinutes) % 60}p`
      }

      // Check for early departure (more than 5 minutes early)
      // Handle night shifts where end time is on the next day
      let adjustedShiftEndMinutes = shiftEndMinutes
      if (shiftEndHour < shiftStartHour) {
        adjustedShiftEndMinutes += 24 * 60 // Add 24 hours in minutes
      }

      let adjustedCheckOutMinutes = checkOutMinutes
      if (checkOutHour < checkInHour) {
        adjustedCheckOutMinutes += 24 * 60 // Add 24 hours in minutes
      }

      if (adjustedCheckOutMinutes < adjustedShiftEndMinutes - 5) {
        status = DAY_STATUS.LATE_EARLY
        const earlyMinutes = adjustedShiftEndMinutes - adjustedCheckOutMinutes
        remarks = remarks
          ? `${remarks}, Về sớm ${Math.floor(earlyMinutes / 60)}h${earlyMinutes % 60}p`
          : `Về sớm ${Math.floor(earlyMinutes / 60)}h${earlyMinutes % 60}p`
      }
    }

    // Update daily work status
    const dailyWorkStatus = await getDailyWorkStatus()
    const existingStatusIndex = dailyWorkStatus.findIndex((s) => s.date === today)

    if (existingStatusIndex >= 0) {
      // Update existing status
      const updatedStatus = [...dailyWorkStatus]
      updatedStatus[existingStatusIndex] = {
        ...updatedStatus[existingStatusIndex],
        status,
        checkInTime: todayLog.checkInTime,
        checkOutTime: todayLog.checkOutTime,
        totalHours,
        remarks,
        shiftId: activeShift.id,
        shiftName: activeShift.name,
        updatedAt: new Date().toISOString(),
      }

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(updatedStatus))
    } else {
      // Create new status
      const newStatus = {
        date: today,
        status,
        checkInTime: todayLog.checkInTime,
        checkOutTime: todayLog.checkOutTime,
        totalHours,
        remarks,
        shiftId: activeShift.id,
        shiftName: activeShift.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedStatus = [...dailyWorkStatus, newStatus]
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(updatedStatus))
    }

    return true
  } catch (error) {
    console.error("Error calculating and updating daily work status:", error)
    return false
  }
}

/**
 * Get daily work status
 */
export const getDailyWorkStatus = async () => {
  try {
    const statusData = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_WORK_STATUS)
    return statusData ? JSON.parse(statusData) : []
  } catch (error) {
    console.error("Error getting daily work status:", error)
    return []
  }
}

/**
 * Get status for a specific day
 */
export const getDayStatus = async (date) => {
  try {
    const dateString = format(date, "yyyy-MM-dd")
    const dailyWorkStatus = await getDailyWorkStatus()
    const dayStatus = dailyWorkStatus.find((s) => s.date === dateString)

    if (dayStatus) {
      return dayStatus
    }

    // If no status exists for this day, return default
    return {
      date: dateString,
      status: DAY_STATUS.NOT_SET,
      checkInTime: null,
      checkOutTime: null,
      totalHours: 0,
      remarks: null,
    }
  } catch (error) {
    console.error("Error getting day status:", error)
    return {
      date: format(date, "yyyy-MM-dd"),
      status: DAY_STATUS.NOT_SET,
      checkInTime: null,
      checkOutTime: null,
      totalHours: 0,
      remarks: null,
    }
  }
}

/**
 * Update status for a specific day
 */
export const updateDayStatus = async (date, status, additionalData = {}) => {
  try {
    const dateString = format(date, "yyyy-MM-dd")
    const dailyWorkStatus = await getDailyWorkStatus()
    const existingStatusIndex = dailyWorkStatus.findIndex((s) => s.date === dateString)

    if (existingStatusIndex >= 0) {
      // Update existing status
      const updatedStatus = [...dailyWorkStatus]
      updatedStatus[existingStatusIndex] = {
        ...updatedStatus[existingStatusIndex],
        status,
        ...additionalData,
        updatedAt: new Date().toISOString(),
      }

      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(updatedStatus))
    } else {
      // Create new status
      const newStatus = {
        date: dateString,
        status,
        ...additionalData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedStatus = [...dailyWorkStatus, newStatus]
      await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(updatedStatus))
    }

    return true
  } catch (error) {
    console.error("Error updating day status:", error)
    return false
  }
}

/**
 * Reset today's work status
 */
export const resetTodayWorkStatus = async () => {
  try {
    // Reset work status
    await saveWorkStatus(WORK_STATUS.NOT_STARTED, [])

    // Remove today's log
    const today = format(new Date(), "yyyy-MM-dd")
    const workLogs = await getWorkLogs()
    const updatedLogs = workLogs.filter((log) => log.date !== today)
    await AsyncStorage.setItem(STORAGE_KEYS.WORK_LOGS, JSON.stringify(updatedLogs))

    // Reset today's daily work status
    const dailyWorkStatus = await getDailyWorkStatus()
    const updatedStatus = dailyWorkStatus.filter((s) => s.date !== today)
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_WORK_STATUS, JSON.stringify(updatedStatus))

    return true
  } catch (error) {
    console.error("Error resetting today's work status:", error)
    return false
  }
}

/**
 * Get monthly statistics
 */
export const getMonthlyStats = async (year, month) => {
  try {
    const monthString = `${year}-${month.toString().padStart(2, "0")}`
    const dailyWorkStatus = await getDailyWorkStatus()

    // Filter status for the specified month
    const monthStatus = dailyWorkStatus.filter((s) => s.date.startsWith(monthString))

    // Calculate statistics
    const stats = {
      totalDays: monthStatus.length,
      fullWork: monthStatus.filter((s) => s.status === DAY_STATUS.FULL_WORK).length,
      missingAction: monthStatus.filter((s) => s.status === DAY_STATUS.MISSING_ACTION).length,
      leave: monthStatus.filter((s) => s.status === DAY_STATUS.LEAVE).length,
      sick: monthStatus.filter((s) => s.status === DAY_STATUS.SICK).length,
      holiday: monthStatus.filter((s) => s.status === DAY_STATUS.HOLIDAY).length,
      absent: monthStatus.filter((s) => s.status === DAY_STATUS.ABSENT).length,
      lateEarly: monthStatus.filter((s) => s.status === DAY_STATUS.LATE_EARLY).length,
      totalHours: monthStatus.reduce((sum, day) => sum + (day.totalHours || 0), 0),
    }

    // Calculate average hours per day
    stats.averageHours = stats.totalDays > 0 ? Math.round((stats.totalHours / stats.totalDays) * 10) / 10 : 0

    return {
      stats,
      details: monthStatus,
    }
  } catch (error) {
    console.error("Error getting monthly statistics:", error)
    return {
      stats: {
        totalDays: 0,
        fullWork: 0,
        missingAction: 0,
        leave: 0,
        sick: 0,
        holiday: 0,
        absent: 0,
        lateEarly: 0,
        totalHours: 0,
        averageHours: 0,
      },
      details: [],
    }
  }
}

/**
 * Export monthly report
 */
export const exportMonthlyReport = async (year, month) => {
  try {
    const { stats, details } = await getMonthlyStats(year, month)

    // Format month name
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // Create report data
    const reportData = {
      title: `Work Report - ${monthNames[month - 1]} ${year}`,
      generatedAt: new Date().toISOString(),
      summary: stats,
      details: details.sort((a, b) => a.date.localeCompare(b.date)),
    }

    return reportData
  } catch (error) {
    console.error("Error exporting monthly report:", error)
    throw error
  }
}
