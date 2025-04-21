import AsyncStorage from "@react-native-async-storage/async-storage"
import { v4 as uuidv4 } from "uuid"
import { format, addDays, subDays } from "date-fns"

// Tạo dữ liệu mẫu cho ca làm việc
export const createSampleShifts = async () => {
  try {
    const sampleShifts = [
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
      {
        id: uuidv4(),
        name: "Ca Đêm",
        departureTime: "21:30",
        startTime: "22:00",
        officeEndTime: "06:00",
        endTime: "06:30",
        reminderBefore: 15,
        reminderAfter: 15,
        showSignButton: true,
        appliedDays: [1, 2, 3, 4, 5], // Thứ 2 đến thứ 6
        isApplied: false,
      },
      {
        id: uuidv4(),
        name: "Ca Cuối Tuần",
        departureTime: "08:30",
        startTime: "09:00",
        officeEndTime: "16:00",
        endTime: "16:30",
        reminderBefore: 15,
        reminderAfter: 15,
        showSignButton: true,
        appliedDays: [6, 7], // Thứ 7, Chủ nhật
        isApplied: false,
      },
    ]

    // Lưu ca làm việc mẫu
    await AsyncStorage.setItem("shifts", JSON.stringify(sampleShifts))

    // Lưu ca làm việc đang áp dụng
    await AsyncStorage.setItem("activeShiftId", sampleShifts[0].id)

    return sampleShifts
  } catch (error) {
    console.error("Error creating sample shifts:", error)
    throw error
  }
}

// Tạo dữ liệu mẫu cho trạng thái làm việc
export const createSampleWorkStatus = async () => {
  try {
    const today = new Date()
    const sampleWorkLogs = []

    // Tạo dữ liệu cho 30 ngày gần đây
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i)
      const dateString = format(date, "yyyy-MM-dd")
      const dayOfWeek = date.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ...

      // Bỏ qua ngày cuối tuần
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue
      }

      // Tạo log ngẫu nhiên
      const randomStatus = Math.random()
      let status, checkInTime, checkOutTime, totalHours, remarks

      if (randomStatus < 0.6) {
        // Đủ công
        status = "full_work"
        checkInTime = "08:00"
        checkOutTime = "17:00"
        totalHours = 8
        remarks = ""
      } else if (randomStatus < 0.8) {
        // Đi muộn/về sớm
        status = "late_early"
        checkInTime = "08:30"
        checkOutTime = "16:30"
        totalHours = 7.5
        remarks = "Đi muộn 30 phút, về sớm 30 phút"
      } else if (randomStatus < 0.9) {
        // Nghỉ phép
        status = "leave"
        checkInTime = null
        checkOutTime = null
        totalHours = 0
        remarks = "Nghỉ phép"
      } else {
        // Nghỉ bệnh
        status = "sick"
        checkInTime = null
        checkOutTime = null
        totalHours = 0
        remarks = "Nghỉ bệnh"
      }

      sampleWorkLogs.push({
        date: dateString,
        status,
        checkInTime,
        checkOutTime,
        totalHours,
        remarks,
        shiftId: "sample_shift_id",
        shiftName: "Ca Hành Chính",
        createdAt: date.toISOString(),
        updatedAt: date.toISOString(),
      })
    }

    // Lưu trạng thái làm việc mẫu
    await AsyncStorage.setItem("work_logs", JSON.stringify(sampleWorkLogs))
    await AsyncStorage.setItem("daily_work_status", JSON.stringify(sampleWorkLogs))

    return sampleWorkLogs
  } catch (error) {
    console.error("Error creating sample work status:", error)
    throw error
  }
}

// Tạo dữ liệu mẫu cho ghi chú
export const createSampleNotes = async () => {
  try {
    const sampleNotes = [
      {
        id: uuidv4(),
        title: "Họp dự án mới",
        content: "Chuẩn bị tài liệu cho cuộc họp dự án mới vào thứ 2 tuần sau. Nhớ mang theo laptop và bản kế hoạch.",
        reminderTime: "09:00",
        selectedDays: [1, 2, 3, 4, 5],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Đặt lịch khám sức khỏe",
        content: "Gọi điện đặt lịch khám sức khỏe định kỳ tại bệnh viện. Số điện thoại: 0123456789",
        reminderTime: "10:30",
        selectedDays: [3],
        createdAt: subDays(new Date(), 2).toISOString(),
        updatedAt: subDays(new Date(), 2).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Nộp báo cáo hàng tuần",
        content: "Hoàn thành và nộp báo cáo công việc hàng tuần cho quản lý trước 17h00.",
        reminderTime: "15:00",
        selectedDays: [5],
        createdAt: subDays(new Date(), 5).toISOString(),
        updatedAt: subDays(new Date(), 5).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Mua quà sinh nhật",
        content: "Mua quà sinh nhật cho đồng nghiệp. Có thể mua sách, chocolate hoặc quà lưu niệm.",
        reminderTime: "12:00",
        selectedDays: [4],
        createdAt: subDays(new Date(), 7).toISOString(),
        updatedAt: subDays(new Date(), 7).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Thanh toán hóa đơn",
        content: "Thanh toán hóa đơn điện, nước, internet trước ngày 25 hàng tháng.",
        reminderTime: "18:00",
        selectedDays: [1, 2, 3, 4, 5, 6, 7],
        createdAt: subDays(new Date(), 10).toISOString(),
        updatedAt: subDays(new Date(), 10).toISOString(),
      },
    ]

    // Lưu ghi chú mẫu
    await AsyncStorage.setItem("notes", JSON.stringify(sampleNotes))

    return sampleNotes
  } catch (error) {
    console.error("Error creating sample notes:", error)
    throw error
  }
}

// Tạo dữ liệu mẫu cho báo thức
export const createSampleAlarms = async () => {
  try {
    const sampleAlarms = [
      {
        id: uuidv4(),
        title: "Thức dậy",
        description: "Đã đến giờ thức dậy",
        time: "06:00",
        type: "recurring",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        isEnabled: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        title: "Chuẩn bị đi làm",
        description: "Đã đến giờ chuẩn bị đi làm",
        time: "07:00",
        type: "recurring",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        isEnabled: true,
        createdAt: subDays(new Date(), 1).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Tập thể dục",
        description: "Đã đến giờ tập thể dục",
        time: "17:30",
        type: "recurring",
        days: ["Mon", "Wed", "Fri"],
        isEnabled: true,
        createdAt: subDays(new Date(), 3).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Họp dự án",
        description: "Cuộc họp dự án quan trọng",
        time: "09:30",
        type: "one_time",
        date: addDays(new Date(), 2).toISOString().split("T")[0],
        isEnabled: true,
        createdAt: subDays(new Date(), 5).toISOString(),
      },
      {
        id: uuidv4(),
        title: "Uống thuốc",
        description: "Nhớ uống thuốc đúng giờ",
        time: "12:00",
        type: "recurring",
        days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        isEnabled: false,
        createdAt: subDays(new Date(), 7).toISOString(),
      },
    ]

    // Lưu báo thức mẫu
    await AsyncStorage.setItem("alarms", JSON.stringify(sampleAlarms))

    return sampleAlarms
  } catch (error) {
    console.error("Error creating sample alarms:", error)
    throw error
  }
}

// Tạo dữ liệu mẫu cho cài đặt
export const createSampleSettings = async () => {
  try {
    const sampleSettings = {
      simpleButtonMode: false,
      weatherAlertsEnabled: true,
      noteRemindersEnabled: true,
      shiftReminderMode: "ask_weekly",
    }

    // Lưu cài đặt mẫu
    await AsyncStorage.setItem("settings", JSON.stringify(sampleSettings))

    // Cài đặt thông báo
    const notificationSettings = {
      sound: true,
      vibration: true,
    }
    await AsyncStorage.setItem("notification_settings", JSON.stringify(notificationSettings))

    // Cài đặt báo thức
    const alarmSettings = {
      soundEnabled: true,
      vibrationEnabled: true,
      soundName: "default",
      snoozeMinutes: 5,
    }
    await AsyncStorage.setItem("alarm_settings", JSON.stringify(alarmSettings))

    return sampleSettings
  } catch (error) {
    console.error("Error creating sample settings:", error)
    throw error
  }
}

// Tạo tất cả dữ liệu mẫu
export const createAllSampleData = async () => {
  try {
    const shifts = await createSampleShifts()
    const workStatus = await createSampleWorkStatus()
    const notes = await createSampleNotes()
    const alarms = await createSampleAlarms()
    const settings = await createSampleSettings()

    return {
      shifts,
      workStatus,
      notes,
      alarms,
      settings,
    }
  } catch (error) {
    console.error("Error creating all sample data:", error)
    throw error
  }
}

// Xóa tất cả dữ liệu
export const clearAllData = async () => {
  try {
    // Danh sách các key cần xóa
    const keys = [
      "shifts",
      "activeShiftId",
      "work_logs",
      "daily_work_status",
      "notes",
      "alarms",
      "settings",
      "notification_settings",
      "alarm_settings",
      "work_status",
      "action_history",
      "downloaded_sounds",
      "selected_sound",
      "sound_volume",
      "custom_sounds",
    ]

    // Xóa tất cả dữ liệu
    await AsyncStorage.multiRemove(keys)

    return true
  } catch (error) {
    console.error("Error clearing all data:", error)
    throw error
  }
}
