import AsyncStorage from "@react-native-async-storage/async-storage"

/**
 * Lấy ca làm việc đang được áp dụng
 */
export const getActiveShift = async () => {
  try {
    // Lấy ID ca làm việc đang áp dụng
    const activeShiftId = await AsyncStorage.getItem("activeShiftId")
    if (!activeShiftId) return null

    // Lấy danh sách ca làm việc
    const shiftsData = await AsyncStorage.getItem("shifts")
    if (!shiftsData) return null

    const shifts = JSON.parse(shiftsData)

    // Tìm ca làm việc đang áp dụng
    return shifts.find((shift) => shift.id === activeShiftId) || null
  } catch (error) {
    console.error("Error getting active shift:", error)
    return null
  }
}

/**
 * Phân tích chuỗi thời gian (HH:MM)
 */
export const parseTimeString = (timeString) => {
  if (!timeString) return { hours: 0, minutes: 0 }

  const [hours, minutes] = timeString.split(":").map(Number)
  return { hours: hours || 0, minutes: minutes || 0 }
}

/**
 * Kiểm tra xem ngày hiện tại có thuộc ca làm việc không
 */
export const isWorkingDay = (shift) => {
  if (!shift) return false

  const today = new Date().getDay() // 0 = Chủ nhật, 1 = Thứ 2, ...
  const currentDay = today === 0 ? 7 : today

  return shift.appliedDays.includes(currentDay)
}

/**
 * Tính toán thời gian làm việc
 */
export const calculateWorkHours = (checkInTime, checkOutTime) => {
  if (!checkInTime || !checkOutTime) return 0

  const [checkInHour, checkInMinute] = checkInTime.split(":").map(Number)
  const [checkOutHour, checkOutMinute] = checkOutTime.split(":").map(Number)

  const checkInMinutes = checkInHour * 60 + checkInMinute
  const checkOutMinutes = checkOutHour * 60 + checkOutMinute

  // Nếu thời gian ra < thời gian vào, giả định là qua ngày hôm sau
  const totalMinutes =
    checkOutMinutes < checkInMinutes ? 24 * 60 - checkInMinutes + checkOutMinutes : checkOutMinutes - checkInMinutes

  return Math.round((totalMinutes / 60) * 10) / 10 // Làm tròn 1 chữ số thập phân
}
