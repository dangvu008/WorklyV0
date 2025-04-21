"use client"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { format, addDays, isAfter, isSameDay, isBefore, startOfWeek } from "date-fns"
import { useTheme, useTranslation, useWork } from "../hooks"

const WeekStatusGrid = ({ onDayPress }) => {
  const { theme, isDarkMode } = useTheme()
  const { t, language } = useTranslation()
  const { getDayStatus, updateDayStatus } = useWork()
  const [selectedDay, setSelectedDay] = useState(null)

  // Lấy ngày đầu tuần (thứ 2)
  const getWeekDays = () => {
    const today = new Date()
    const startDay = startOfWeek(today, { weekStartsOn: 1 }) // Bắt đầu từ thứ 2

    return Array(7)
      .fill(0)
      .map((_, i) => {
        const date = addDays(startDay, i)
        const status = getDayStatus(date)
        return {
          date,
          ...status,
          isFuture: isAfter(date, today) && !isSameDay(date, today),
          isPast: isBefore(date, today) && !isSameDay(date, today),
          isToday: isSameDay(date, today),
        }
      })
  }

  const weekDays = getWeekDays()

  // Lấy tên thứ viết tắt
  const getDayName = (date) => {
    const dayIndex = date.getDay()
    const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
    return t(`weekdays.${days[dayIndex]}`)
  }

  // Lấy màu nền dựa vào trạng thái
  const getStatusColor = (status, isFuture) => {
    if (isFuture) return "transparent"

    switch (status) {
      case "full_work":
        return "#4CD964" // Xanh lá - đủ công
      case "missing_action":
        return "#FF9500" // Cam - thiếu chấm công
      case "leave":
        return "#5AC8FA" // Xanh dương - nghỉ phép
      case "sick":
        return "#FF2D55" // Đỏ - nghỉ bệnh
      case "holiday":
        return "#AF52DE" // Tím - nghỉ lễ
      case "absent":
        return "#8E8E93" // Xám - vắng mặt
      case "late_early":
        return "#FFCC00" // Vàng - đi muộn/về sớm
      case "not_set":
        return "transparent" // Trong suốt - chưa thiết lập
      default:
        return "transparent"
    }
  }

  // Lấy icon trạng thái
  const getStatusIcon = (status, isFuture) => {
    if (isFuture) return "--"

    switch (status) {
      case "full_work":
        return "✓"
      case "missing_action":
        return "!"
      case "leave":
        return "P"
      case "sick":
        return "B"
      case "holiday":
        return "H"
      case "absent":
        return "X"
      case "late_early":
        return "RV"
      case "not_set":
        return "?"
      default:
        return "?"
    }
  }

  // Xử lý khi nhấn vào ô ngày
  const handleDayPress = (day) => {
    setSelectedDay(day)
    if (onDayPress) {
      onDayPress({
        date: day.date.toISOString(),
        status: day.status,
        checkInTime: day.checkInTime,
        checkOutTime: day.checkOutTime,
        totalHours: day.totalHours,
        shiftName: day.shiftName,
        remarks: day.remarks,
        vaoLogTime: day.vaoLogTime,
        raLogTime: day.raLogTime,
      })
    }
  }

  // Xử lý khi nhấn giữ để cập nhật trạng thái
  const handleLongPress = (day) => {
    // Chỉ cho phép cập nhật trạng thái cho ngày tương lai với một số trạng thái nhất định
    if (day.isFuture) {
      Alert.alert(t("weekStatus.updateStatus"), t("weekStatus.selectStatus"), [
        {
          text: t("workStatus.leave"),
          onPress: () => updateDayStatus(day.date, "leave"),
        },
        {
          text: t("workStatus.holiday"),
          onPress: () => updateDayStatus(day.date, "holiday"),
        },
        {
          text: t("workStatus.absent"),
          onPress: () => updateDayStatus(day.date, "absent"),
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ])
    } else {
      // Cho ngày hiện tại và quá khứ, hiển thị nhiều lựa chọn hơn
      Alert.alert(t("weekStatus.updateStatus"), t("weekStatus.selectStatus"), [
        {
          text: t("workStatus.fullWork"),
          onPress: () => updateDayStatus(day.date, "full_work"),
        },
        {
          text: t("workStatus.missingAction"),
          onPress: () => updateDayStatus(day.date, "missing_action"),
        },
        {
          text: t("workStatus.leave"),
          onPress: () => updateDayStatus(day.date, "leave"),
        },
        {
          text: t("workStatus.sick"),
          onPress: () => updateDayStatus(day.date, "sick"),
        },
        {
          text: t("workStatus.absent"),
          onPress: () => updateDayStatus(day.date, "absent"),
        },
        {
          text: t("workStatus.lateEarly"),
          onPress: () => updateDayStatus(day.date, "late_early"),
        },
        {
          text: t("common.cancel"),
          style: "cancel",
        },
      ])
    }
  }

  // Render icon cho trạng thái
  const renderStatusIcon = (day) => {
    const icon = getStatusIcon(day.status, day.isFuture)
    const color = getStatusColor(day.status, day.isFuture)

    return (
      <View style={[styles.statusIndicator, { backgroundColor: color }]}>
        <Text style={[styles.statusIcon, { color: color === "transparent" ? theme.colors.textSecondary : "#FFFFFF" }]}>
          {icon}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {weekDays.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayCell,
              day.isToday && [styles.todayCell, { borderColor: theme.colors.primary }],
              day === selectedDay && { backgroundColor: isDarkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
            ]}
            onPress={() => handleDayPress(day)}
            onLongPress={() => handleLongPress(day)}
            delayLongPress={500}
          >
            <Text style={[styles.dayName, { color: theme.colors.textSecondary }]}>{getDayName(day.date)}</Text>
            <Text style={[styles.dayNumber, { color: day.isToday ? theme.colors.primary : theme.colors.text }]}>
              {format(day.date, "d")}
            </Text>
            {renderStatusIcon(day)}
          </TouchableOpacity>
        ))}
      </View>

      {/* Chú thích */}
      <View style={styles.legend}>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#4CD964" }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t("workStatus.fullWork")}</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#FF9500" }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>
              {t("workStatus.missingAction")}
            </Text>
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#FFCC00" }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t("workStatus.lateEarly")}</Text>
          </View>

          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: "#5AC8FA" }]} />
            <Text style={[styles.legendText, { color: theme.colors.textSecondary }]}>{t("workStatus.leave")}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 0.8,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "transparent",
    marginHorizontal: 2,
    padding: 4,
  },
  todayCell: {
    borderWidth: 2,
  },
  dayName: {
    fontSize: 12,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  statusIcon: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  legend: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
})

export default WeekStatusGrid
