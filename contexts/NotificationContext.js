"use client"

import { createContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device" // Fixed import statement
import { Platform } from "react-native"
import { SoundService, FileSystem } from "../services"

// Tạo context
export const NotificationContext = createContext()

// Cấu hình thông báo
Notifications.setNotificationHandler({
  handleNotification: async () => {
    // Lấy URI âm thanh tùy chỉnh
    const soundUri = await SoundService.getSoundFileUri()

    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      sound: soundUri, // Sử dụng âm thanh tùy chỉnh nếu có
    }
  },
})

export const NotificationProvider = ({ children }) => {
  const [notificationSettings, setNotificationSettings] = useState({
    sound: true,
    vibration: true,
  })
  const [expoPushToken, setExpoPushToken] = useState("")

  // Cập nhật cài đặt thông báo
  const updateNotificationSettings = (settings) => {
    const updatedSettings = {
      ...notificationSettings,
      ...settings,
    }
    setNotificationSettings(updatedSettings)
    saveNotificationSettings(updatedSettings)
  }

  // Lưu cài đặt thông báo
  const saveNotificationSettings = async (settings) => {
    try {
      await AsyncStorage.setItem("notification_settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Error saving notification settings:", error)
    }
  }

  // Đăng ký thông báo và tải cài đặt
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => setExpoPushToken(token))

    // Khởi tạo dịch vụ âm thanh
    SoundService.initSoundService()

    // Tải cài đặt thông báo
    const loadSettings = async () => {
      try {
        const settingsData = await AsyncStorage.getItem("notification_settings")
        if (settingsData) {
          setNotificationSettings(JSON.parse(settingsData))
        }
      } catch (error) {
        console.error("Error loading notification settings:", error)
      }
    }

    loadSettings()

    // Thiết lập listener cho thông báo
    const notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification)
    })

    const responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log("Notification response received:", response)
    })

    return () => {
      Notifications.removeNotificationSubscription(notificationListener)
      Notifications.removeNotificationSubscription(responseListener)
    }
  }, [])

  // Cập nhật hàm scheduleNotification để kiểm tra âm thanh đã tải xuống
  const scheduleNotification = async (title, body, trigger, data = {}) => {
    try {
      // Lấy URI âm thanh tùy chỉnh
      const soundUri = await SoundService.getSoundFileUri()

      // Kiểm tra xem file âm thanh có tồn tại không
      let soundExists = false
      if (soundUri) {
        const soundInfo = await FileSystem.getInfoAsync(soundUri)
        soundExists = soundInfo.exists
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: notificationSettings.sound && soundExists ? soundUri : null, // Chỉ sử dụng âm thanh nếu file tồn tại
          vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
          data,
        },
        trigger,
      })
      return true
    } catch (error) {
      console.error("Error scheduling notification:", error)
      return false
    }
  }

  // Lên lịch thông báo cho ca làm việc
  const scheduleShiftNotifications = async (shift) => {
    if (!shift) return false

    try {
      // Hủy tất cả thông báo hiện tại
      await Notifications.cancelAllScheduledNotificationsAsync()

      // Lấy ngày hiện tại
      const now = new Date()
      const today = now.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ...

      // Chuyển đổi Chủ nhật từ 0 sang 7 để phù hợp với appliedDays
      const currentDay = today === 0 ? 7 : today

      // Kiểm tra xem hôm nay có phải là ngày áp dụng ca làm việc không
      if (!shift.appliedDays.includes(currentDay)) {
        return false
      }

      // Lấy URI âm thanh tùy chỉnh
      const soundUri = await SoundService.getSoundFileUri()

      // Lên lịch thông báo xuất phát
      const departureTime = parseTimeString(shift.departureTime)
      if (
        departureTime.hours > now.getHours() ||
        (departureTime.hours === now.getHours() && departureTime.minutes > now.getMinutes())
      ) {
        const departureTrigger = new Date()
        departureTrigger.setHours(departureTime.hours)
        departureTrigger.setMinutes(departureTime.minutes)
        departureTrigger.setSeconds(0)

        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Đến giờ xuất phát",
            body: `Đã đến giờ xuất phát để đi làm. Ca làm việc của bạn bắt đầu lúc ${shift.startTime}.`,
            sound: notificationSettings.sound ? soundUri : null,
            vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
            data: { type: "departure" },
          },
          trigger: departureTrigger,
        })
      }

      // Lên lịch thông báo trước giờ vào
      const startTime = parseTimeString(shift.startTime)
      const reminderBeforeStart = shift.reminderBefore || 15

      const checkInReminderTime = new Date()
      checkInReminderTime.setHours(startTime.hours)
      checkInReminderTime.setMinutes(startTime.minutes - reminderBeforeStart)
      checkInReminderTime.setSeconds(0)

      if (checkInReminderTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Nhắc nhở chấm công vào",
            body: `Đừng quên chấm công vào. Ca làm việc của bạn bắt đầu lúc ${shift.startTime}.`,
            sound: notificationSettings.sound ? soundUri : null,
            vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
            data: { type: "check_in_reminder" },
          },
          trigger: checkInReminderTime,
        })
      }

      // Lên lịch thông báo sau giờ làm
      const endTime = parseTimeString(shift.endTime)
      const reminderAfterEnd = shift.reminderAfter || 15

      const checkOutReminderTime = new Date()
      checkOutReminderTime.setHours(endTime.hours)
      checkOutReminderTime.setMinutes(endTime.minutes + reminderAfterEnd)
      checkOutReminderTime.setSeconds(0)

      if (checkOutReminderTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Nhắc nhở chấm công ra",
            body: "Đừng quên chấm công ra trước khi về nhà.",
            sound: notificationSettings.sound ? soundUri : null,
            vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
            data: { type: "check_out_reminder" },
          },
          trigger: checkOutReminderTime,
        })
      }

      return true
    } catch (error) {
      console.error("Error scheduling shift notifications:", error)
      return false
    }
  }

  // Lên lịch thông báo cho ghi chú
  const scheduleNoteNotifications = async (note) => {
    if (!note) return false

    try {
      // Lấy ngày hiện tại
      const now = new Date()
      const today = now.getDay() // 0 = Chủ nhật, 1 = Thứ 2, ...

      // Chuyển đổi Chủ nhật từ 0 sang 7 để phù hợp với appliedDays
      const currentDay = today === 0 ? 7 : today

      // Kiểm tra xem hôm nay có phải là ngày áp dụng ghi chú không
      if (!note.appliedDays.includes(currentDay)) {
        return false
      }

      // Lấy URI âm thanh tùy chỉnh
      const soundUri = await SoundService.getSoundFileUri()

      // Lên lịch thông báo ghi chú
      const reminderTime = parseTimeString(note.reminderTime)

      const notificationTime = new Date()
      notificationTime.setHours(reminderTime.hours)
      notificationTime.setMinutes(reminderTime.minutes)
      notificationTime.setSeconds(0)

      if (notificationTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: note.title,
            body: note.content,
            sound: notificationSettings.sound ? soundUri : null,
            vibrate: notificationSettings.vibration ? [0, 250, 250, 250] : null,
            data: {
              type: "note_reminder",
              noteId: note.id,
            },
          },
          trigger: notificationTime,
        })
        return true
      }

      return false
    } catch (error) {
      console.error("Error scheduling note notification:", error)
      return false
    }
  }

  // Hàm trợ giúp để phân tích chuỗi thời gian (HH:MM)
  const parseTimeString = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    return { hours, minutes }
  }

  return (
    <NotificationContext.Provider
      value={{
        notificationSettings,
        expoPushToken,
        updateNotificationSettings,
        scheduleNotification,
        scheduleShiftNotifications,
        scheduleNoteNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

// Hàm đăng ký thông báo
async function registerForPushNotificationsAsync() {
  let token

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    })
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      console.log("Failed to get push token for push notification!")
      return
    }

    token = (await Notifications.getExpoPushTokenAsync()).data
  } else {
    console.log("Must use physical device for Push Notifications")
  }

  return token
}
