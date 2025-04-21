"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { format, isAfter } from "date-fns"
import { v4 as uuidv4 } from "uuid"

// Tạo context
export const WorkContext = createContext()

export const WorkProvider = ({ children }) => {
  // State
  const [shifts, setShifts] = useState([])
  const [currentShift, setCurrentShift] = useState(null)
  const [workStatus, setWorkStatus] = useState("not_started")
  const [actionHistory, setActionHistory] = useState([])
  const [workLogs, setWorkLogs] = useState([])
  const [dailyWorkStatus, setDailyWorkStatus] = useState([])
  const [settings, setSettings] = useState({
    simpleButtonMode: false,
    weatherAlertsEnabled: true,
    noteRemindersEnabled: true,
    shiftReminderMode: "ask_weekly",
  })
  const [weatherAlerts, setWeatherAlerts] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Tải dữ liệu từ AsyncStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        // Initialize default shifts if needed
        await initializeDefaultShifts()

        // Load shifts
        const shiftsData = await AsyncStorage.getItem("shifts")
        if (shiftsData) {
          setShifts(JSON.parse(shiftsData))
        }

        // Load active shift
        const activeShiftId = await AsyncStorage.getItem("activeShiftId")
        if (activeShiftId && shiftsData) {
          const parsedShifts = JSON.parse(shiftsData)
          const activeShift = parsedShifts.find((shift) => shift.id === activeShiftId)
          setCurrentShift(activeShift)
        }

        // Load settings
        const settingsData = await AsyncStorage.getItem("settings")
        if (settingsData) {
          setSettings(JSON.parse(settingsData))
        }
      } catch (error) {
        console.error("Error loading work data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Khởi tạo ca làm việc mặc định
  const initializeDefaultShifts = async () => {
    try {
      // Kiểm tra xem đã có ca làm việc nào chưa
      const shiftsData = await AsyncStorage.getItem("shifts")
      if (shiftsData) {
        return JSON.parse(shiftsData)
      }

      // Tạo ca làm việc mặc định
      const defaultShifts = [
        {
          id: uuidv4(),
          name: "Ca Hành Chính",
          departureTime: "07:30",
          startTime: "08:00",
          officeEndTime: "17:00",
          endTime: "17:30",
          reminderBefore: 15,
          reminderAfter: 15,
          showSignButton: true,
          appliedDays: [1, 2, 3, 4, 5], // Thứ 2 đến thứ 6
          isApplied: true,
        },
        {
          id: uuidv4(),
          name: "Ca Sáng",
          departureTime: "05:30",
          startTime: "06:00",
          officeEndTime: "14:00",
          endTime: "14:30",
          reminderBefore: 15,
          reminderAfter: 15,
          showSignButton: true,
          appliedDays: [1, 2, 3, 4, 5, 6], // Thứ 2 đến thứ 7
          isApplied: false,
        },
        {
          id: uuidv4(),
          name: "Ca Chiều",
          departureTime: "13:30",
          startTime: "14:00",
          officeEndTime: "22:00",
          endTime: "22:30",
          reminderBefore: 15,
          reminderAfter: 15,
          showSignButton: true,
          appliedDays: [1, 2, 3, 4, 5, 6], // Thứ 2 đến thứ 7
          isApplied: false,
        },
      ]

      // Lưu ca làm việc mặc định
      await AsyncStorage.setItem("shifts", JSON.stringify(defaultShifts))
      await AsyncStorage.setItem("activeShiftId", defaultShifts[0].id)

      setShifts(defaultShifts)
      setCurrentShift(defaultShifts[0])

      return defaultShifts
    } catch (error) {
      console.error("Error initializing default shifts:", error)
      return []
    }
  }

  // Lưu cài đặt vào AsyncStorage
  const saveSettings = async (newSettings) => {
    try {
      const updatedSettings = {
        ...settings,
        ...newSettings,
      }

      setSettings(updatedSettings)
      await AsyncStorage.setItem("settings", JSON.stringify(updatedSettings))

      return true
    } catch (error) {
      console.error("Error saving settings:", error)
      return false
    }
  }

  // Lưu ca làm việc vào AsyncStorage
  const saveShifts = async (newShifts) => {
    try {
      await AsyncStorage.setItem("shifts", JSON.stringify(newShifts))
    } catch (error) {
      console.error("Error saving shifts:", error)
    }
  }

  // Lưu trạng thái làm việc vào AsyncStorage
  const saveWorkStatus = async (status, history) => {
    try {
      const statusData = {
        status,
        date: new Date().toISOString(),
        history: history || actionHistory,
      }
      await AsyncStorage.setItem("work_status", JSON.stringify(statusData))
    } catch (error) {
      console.error("Error saving work status:", error)
    }
  }

  // Lưu nhật ký làm việc vào AsyncStorage
  const saveWorkLogs = async (newLogs) => {
    try {
      await AsyncStorage.setItem("work_logs", JSON.stringify(newLogs))
    } catch (error) {
      console.error("Error saving work logs:", error)
    }
  }

  // Thêm ca làm việc mới
  const addShift = (shiftData) => {
    const newShift = {
      id: uuidv4(),
      isApplied: false,
      ...shiftData,
    }

    const newShifts = [...shifts, newShift]
    setShifts(newShifts)
    saveShifts(newShifts)
  }

  // Cập nhật ca làm việc
  const updateShift = (shiftId, shiftData) => {
    const newShifts = shifts.map((shift) => {
      if (shift.id === shiftId) {
        const updatedShift = {
          ...shift,
          ...shiftData,
        }

        // Nếu đang cập nhật ca làm việc đang áp dụng
        if (shift.isApplied) {
          setCurrentShift(updatedShift)
        }

        return updatedShift
      }
      return shift
    })

    setShifts(newShifts)
    saveShifts(newShifts)
  }

  // Xóa ca làm việc
  const deleteShift = (shiftId) => {
    const shiftToDelete = shifts.find((shift) => shift.id === shiftId)

    // Nếu đang xóa ca làm việc đang áp dụng
    if (shiftToDelete && shiftToDelete.isApplied) {
      setCurrentShift(null)
    }

    const newShifts = shifts.filter((shift) => shift.id !== shiftId)
    setShifts(newShifts)
    saveShifts(newShifts)
  }

  // Áp dụng ca làm việc
  const applyShift = (shiftId) => {
    const newShifts = shifts.map((shift) => {
      if (shift.id === shiftId) {
        const updatedShift = {
          ...shift,
          isApplied: true,
        }
        setCurrentShift(updatedShift)
        return updatedShift
      }
      return {
        ...shift,
        isApplied: false,
      }
    })

    setShifts(newShifts)
    saveShifts(newShifts)
  }

  // Thực hiện hành động (đi làm, chấm công vào, chấm công ra, hoàn tất)
  const performAction = (action) => {
    const now = new Date()
    const timeString = format(now, "HH:mm")

    let newStatus = workStatus
    const newHistory = [...actionHistory]

    switch (action) {
      case "go_work":
        newStatus = settings.simpleButtonMode ? "completed" : "going_to_work"
        newHistory.push({
          type: "go_work",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "briefcase-outline",
        })
        break
      case "check_in":
        newStatus = "checked_in"
        newHistory.push({
          type: "check_in",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "log-in-outline",
        })
        break
      case "check_out":
        newStatus = "checked_out"
        newHistory.push({
          type: "check_out",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "log-out-outline",
        })
        break
      case "complete":
        newStatus = "completed"
        newHistory.push({
          type: "complete",
          time: timeString,
          timestamp: now.toISOString(),
          icon: "checkmark-circle-outline",
        })
        break
    }

    // Cập nhật trạng thái và lịch sử
    setWorkStatus(newStatus)
    setActionHistory(newHistory)
    saveWorkStatus(newStatus, newHistory)

    // Cập nhật nhật ký làm việc
    updateWorkLog(action, timeString)
  }

  // Cập nhật nhật ký làm việc
  const updateWorkLog = (action, timeString) => {
    const today = new Date()
    const dateString = format(today, "yyyy-MM-dd")

    // Tìm nhật ký của ngày hôm nay
    const existingLogIndex = workLogs.findIndex((log) => log.date === dateString)

    if (existingLogIndex >= 0) {
      // Cập nhật nhật ký hiện có
      const updatedLogs = [...workLogs]
      const log = { ...updatedLogs[existingLogIndex] }

      switch (action) {
        case "go_work":
          log.goWorkTime = timeString
          log.status = settings.simpleButtonMode ? "full_work" : "missing_action"
          break
        case "check_in":
          log.checkInTime = timeString
          log.status = "missing_action"
          break
        case "check_out":
          log.checkOutTime = timeString
          log.status = "missing_action"
          break
        case "complete":
          log.completeTime = timeString
          log.status = "full_work"
          break
      }

      updatedLogs[existingLogIndex] = log
      setWorkLogs(updatedLogs)
      saveWorkLogs(updatedLogs)
    } else {
      // Tạo nhật ký mới
      const newLog = {
        date: dateString,
        status: settings.simpleButtonMode && action === "go_work" ? "full_work" : "missing_action",
      }

      switch (action) {
        case "go_work":
          newLog.goWorkTime = timeString
          break
        case "check_in":
          newLog.checkInTime = timeString
          break
        case "check_out":
          newLog.checkOutTime = timeString
          break
        case "complete":
          newLog.completeTime = timeString
          newLog.status = "full_work"
          break
      }

      const updatedLogs = [...workLogs, newLog]
      setWorkLogs(updatedLogs)
      saveWorkLogs(updatedLogs)
    }
  }

  // Reset trạng thái ngày làm việc
  const resetDayStatus = () => {
    // Reset trạng thái
    setWorkStatus("not_started")
    setActionHistory([])
    saveWorkStatus("not_started", [])

    // Xóa nhật ký của ngày hôm nay
    const today = format(new Date(), "yyyy-MM-dd")
    const updatedLogs = workLogs.filter((log) => log.date !== today)
    setWorkLogs(updatedLogs)
    saveWorkLogs(updatedLogs)
  }

  // Lấy trạng thái các ngày trong tuần
  const getWeekDaysStatus = (date = new Date()) => {
    const dateString = format(date, "yyyy-MM-dd")
    const log = workLogs.find((log) => log.date === dateString)

    if (!log) {
      return {
        status: isAfter(date, new Date()) ? "not_set" : "absent",
        checkInTime: null,
        checkOutTime: null,
      }
    }

    return {
      status: log.status,
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
    }
  }

  // Lấy trạng thái của một ngày cụ thể
  const getDayStatus = (date) => {
    const dateString = format(date, "yyyy-MM-dd")
    const log = workLogs.find((log) => log.date === dateString)

    if (!log) {
      return {
        status: isAfter(date, new Date()) ? "not_set" : "absent",
        checkInTime: null,
        checkOutTime: null,
        totalHours: 0,
        remarks: null,
      }
    }

    // Tính toán số giờ làm việc nếu có check-in và check-out
    let totalHours = 0
    if (log.checkInTime && log.checkOutTime) {
      const [checkInHour, checkInMinute] = log.checkInTime.split(":").map(Number)
      const [checkOutHour, checkOutMinute] = log.checkOutTime.split(":").map(Number)

      const checkInMinutes = checkInHour * 60 + checkInMinute
      const checkOutMinutes = checkOutHour * 60 + checkOutMinute

      // Nếu thời gian ra < thời gian vào, giả định là qua ngày hôm sau
      const totalMinutes =
        checkOutMinutes < checkInMinutes ? 24 * 60 - checkInMinutes + checkOutMinutes : checkOutMinutes - checkInMinutes

      totalHours = Math.round((totalMinutes / 60) * 10) / 10 // Làm tròn 1 chữ số thập phân
    }

    return {
      status: log.status,
      checkInTime: log.checkInTime,
      checkOutTime: log.checkOutTime,
      totalHours: totalHours,
      remarks: log.remarks,
      shiftName: log.shiftName,
      vaoLogTime: log.vaoLogTime,
      raLogTime: log.raLogTime,
    }
  }

  // Cập nhật trạng thái của một ngày
  const updateDayStatus = (date, status) => {
    const dateString = format(date, "yyyy-MM-dd")
    const existingLogIndex = workLogs.findIndex((log) => log.date === dateString)

    if (existingLogIndex >= 0) {
      // Cập nhật nhật ký hiện có
      const updatedLogs = [...workLogs]
      updatedLogs[existingLogIndex] = {
        ...updatedLogs[existingLogIndex],
        status,
      }
      setWorkLogs(updatedLogs)
      saveWorkLogs(updatedLogs)
    } else {
      // Tạo nhật ký mới
      const newLog = {
        date: dateString,
        status,
      }
      const updatedLogs = [...workLogs, newLog]
      setWorkLogs(updatedLogs)
      saveWorkLogs(updatedLogs)
    }
  }

  // Lấy thống kê tháng
  const getMonthStats = (date = new Date()) => {
    const month = format(date, "yyyy-MM")
    const monthLogs = workLogs.filter((log) => log.date.startsWith(month))

    // Tính tổng số ngày làm việc
    const totalDays = monthLogs.length

    // Đếm số ngày theo trạng thái
    const fullWork = monthLogs.filter((log) => log.status === "full_work").length
    const missingAction = monthLogs.filter((log) => log.status === "missing_action").length
    const leave = monthLogs.filter((log) => log.status === "leave").length
    const sick = monthLogs.filter((log) => log.status === "sick").length
    const holiday = monthLogs.filter((log) => log.status === "holiday").length
    const absent = monthLogs.filter((log) => log.status === "absent").length
    const lateEarly = monthLogs.filter((log) => log.status === "late_early").length

    // Tính tổng số giờ làm việc (giả định 8 giờ/ngày cho đủ công)
    const totalHours = fullWork * 8

    // Tính trung bình giờ làm việc mỗi ngày
    const averageHours = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0

    return {
      totalDays,
      fullWork,
      missingAction,
      leave,
      sick,
      holiday,
      absent,
      lateEarly,
      totalHours,
      averageHours,
    }
  }

  // Xuất báo cáo tháng
  const exportMonthlyReport = (date = new Date()) => {
    const month = format(date, "yyyy-MM")
    const stats = getMonthStats(date)

    // Tạo nội dung báo cáo
    const reportContent = {
      month,
      stats,
      logs: workLogs.filter((log) => log.date.startsWith(month)),
    }

    // Trong thực tế, đây là nơi bạn sẽ xuất báo cáo ra file hoặc gửi đi
    console.log("Exporting monthly report:", reportContent)

    // Trả về nội dung báo cáo để sử dụng nếu cần
    return reportContent
  }

  // Cập nhật cài đặt
  const updateSettings = (newSettings) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
    }
    setSettings(updatedSettings)
    saveSettings(updatedSettings)
  }

  const dismissWeatherAlert = () => {
    setWeatherAlerts(null)
  }

  return (
    <WorkContext.Provider
      value={{
        shifts,
        currentShift,
        workStatus,
        actionHistory,
        workLogs,
        dailyWorkStatus,
        settings,
        weatherAlerts,
        isLoading,
        addShift,
        updateShift,
        deleteShift,
        applyShift,
        performAction,
        resetDayStatus,
        getDayStatus,
        updateDayStatus,
        getMonthStats,
        exportMonthlyReport,
        saveSettings,
        dismissWeatherAlert,
      }}
    >
      {children}
    </WorkContext.Provider>
  )
}

export default WorkProvider
