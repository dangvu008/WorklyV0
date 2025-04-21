import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"

// Khởi tạo ca làm việc mặc định
export const initializeDefaultShifts = async () => {
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

    return defaultShifts
  } catch (error) {
    console.error("Error initializing default shifts:", error)
    return []
  }
}

// Kiểm tra xem ngày hiện tại có thuộc ca làm việc không
export const isWorkingDay = (shift) => {
  if (!shift) return false

  const today = new Date().getDay() // 0 = Chủ nhật, 1 = Thứ 2, ...
  const currentDay = today === 0 ? 7 : today

  return shift.appliedDays.includes(currentDay)
}

// Tính toán thời gian làm việc
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
