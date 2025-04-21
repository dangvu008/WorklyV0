"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl, Modal } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { format, vi, enUS } from "date-fns"

// Import from index files
import { MultiActionButton, WeekStatusGrid, WorkNotesList, WeatherAlert, WeatherWidget } from "../components"
import { useTheme, useTranslation, useWork, useNotification, useWeather, useAlarm } from "../hooks"

const HomeScreen = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme()
  const { t, language } = useTranslation()
  const { currentShift, workStatus, actionHistory, performAction, resetDayStatus, settings, updateDayStatus } =
    useWork()
  const { scheduleNotification } = useNotification()
  const { weatherAlerts, checkWeatherAlertsForShift, weatherSettings } = useWeather()
  const { alarms } = useAlarm()

  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [relevantAlerts, setRelevantAlerts] = useState([])
  const [dismissedAlerts, setDismissedAlerts] = useState([])
  const [showPunchButton, setShowPunchButton] = useState(false)
  const [showResetButton, setShowResetButton] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedDayStatus, setSelectedDayStatus] = useState(null)

  // Cập nhật thời gian hiện tại mỗi phút
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Kiểm tra cảnh báo thời tiết liên quan đến ca làm việc
  useEffect(() => {
    if (currentShift && weatherSettings.warningEnabled) {
      const alerts = checkWeatherAlertsForShift(currentShift)
      setRelevantAlerts(alerts)
    } else {
      setRelevantAlerts([])
    }
  }, [currentShift, weatherAlerts, weatherSettings.warningEnabled, checkWeatherAlertsForShift])

  // Kiểm tra trạng thái nút Ký Công
  useEffect(() => {
    if (currentShift && currentShift.showPunch && workStatus === "checked_in") {
      setShowPunchButton(true)
    } else {
      setShowPunchButton(false)
    }
  }, [currentShift, workStatus])

  // Kiểm tra trạng thái nút Reset
  useEffect(() => {
    if (actionHistory.length > 0) {
      setShowResetButton(true)
    } else {
      setShowResetButton(false)
    }
  }, [actionHistory])

  // Xử lý kéo để làm mới
  const onRefresh = async () => {
    setRefreshing(true)
    // Làm mới dữ liệu
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  // Xử lý reset trạng thái ngày
  const handleReset = () => {
    Alert.alert(t("home.resetConfirmTitle"), t("home.resetConfirmMessage"), [
      {
        text: t("common.cancel"),
        style: "cancel",
      },
      {
        text: t("common.confirm"),
        onPress: () => {
          resetDayStatus()

          // Kích hoạt lại các báo thức cho ngày hiện tại
          const todayAlarms = alarms.filter((alarm) => alarm.type === "shift_linked" && alarm.isEnabled)

          todayAlarms.forEach((alarm) => {
            // Lên lịch lại báo thức
            if (alarm.scheduleAlarm) {
              alarm.scheduleAlarm()
            }
          })
        },
      },
    ])
  }

  // Xử lý ký công
  const handlePunch = () => {
    performAction("punch")
  }

  // Xử lý bỏ qua cảnh báo thời tiết
  const handleDismissAlert = (alertIndex) => {
    setDismissedAlerts([...dismissedAlerts, alertIndex])
  }

  // Xử lý khi nhấn vào ô trạng thái tuần
  const handleDayStatusPress = (status) => {
    setSelectedDayStatus(status)
    setShowStatusModal(true)
  }

  // Format ngày giờ theo ngôn ngữ
  const formatDateTime = (date) => {
    const locale = language === "vi" ? vi : enUS
    return format(date, "EEEE, dd/MM/yyyy", { locale })
  }

  const formatTime = (date) => {
    return format(date, "HH:mm")
  }

  // Lọc cảnh báo chưa bỏ qua
  const filteredAlerts = relevantAlerts.filter((_, index) => !dismissedAlerts.includes(index))

  // Lấy màu nền dựa vào trạng thái
  const getStatusColor = (status) => {
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
  const getStatusIcon = (status) => {
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

  // Xử lý cập nhật trạng thái ngày
  const handleDayStatusUpdate = (day) => {
    Alert.alert(t("weekStatus.updateStatus"), t("weekStatus.selectStatus"), [
      {
        text: t("workStatus.fullWork"),
        onPress: () => updateDayStatus(new Date(day.date), "full_work"),
      },
      {
        text: t("workStatus.missingAction"),
        onPress: () => updateDayStatus(new Date(day.date), "missing_action"),
      },
      {
        text: t("workStatus.leave"),
        onPress: () => updateDayStatus(new Date(day.date), "leave"),
      },
      {
        text: t("workStatus.sick"),
        onPress: () => updateDayStatus(new Date(day.date), "sick"),
      },
      {
        text: t("workStatus.absent"),
        onPress: () => updateDayStatus(new Date(day.date), "absent"),
      },
      {
        text: t("workStatus.lateEarly"),
        onPress: () => updateDayStatus(new Date(day.date), "late_early"),
      },
      {
        text: t("common.cancel"),
        style: "cancel",
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Thanh trên cùng */}
        <View style={styles.header}>
          <View style={styles.dateTimeContainer}>
            <Text style={[styles.currentTime, { color: theme.colors.text }]}>{formatTime(currentTime)}</Text>
            <Text style={[styles.currentDate, { color: theme.colors.textSecondary }]}>
              {formatDateTime(currentTime)}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate("Settings")}>
            <Ionicons name="settings-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Cảnh báo thời tiết */}
        {filteredAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            {filteredAlerts.map((alert, index) => (
              <WeatherAlert
                key={index}
                alert={alert}
                onDismiss={() => handleDismissAlert(index)}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        )}

        {/* Hiển thị thông tin ca làm việc */}
        <View style={[styles.shiftInfoContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.shiftTitle, { color: theme.colors.text }]}>{t("home.currentShift")}</Text>
          {currentShift ? (
            <View style={styles.shiftDetails}>
              <Text style={[styles.shiftName, { color: theme.colors.primary }]}>{currentShift.name}</Text>
              <Text style={[styles.shiftTime, { color: theme.colors.textSecondary }]}>
                {`${currentShift.startTime} - ${currentShift.endTime}`}
              </Text>
            </View>
          ) : (
            <Text style={[styles.noShift, { color: theme.colors.textSecondary }]}>{t("home.noShiftApplied")}</Text>
          )}
        </View>

        {/* Nút đa năng và lịch sử */}
        <View style={[styles.actionButtonContainer, { backgroundColor: theme.colors.card }]}>
          <MultiActionButton
            workStatus={workStatus}
            onAction={performAction}
            onReset={handleReset}
            showResetButton={showResetButton}
            simpleMode={settings.simpleButtonMode}
          />

          {/* Nút Ký Công */}
          {showPunchButton && (
            <TouchableOpacity
              style={[styles.punchButton, { backgroundColor: theme.colors.primary }]}
              onPress={handlePunch}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.punchButtonText}>{t("button.punch")}</Text>
            </TouchableOpacity>
          )}

          {/* Hiển thị lịch sử hành động */}
          {actionHistory.length > 0 && (
            <View style={styles.historyContainer}>
              <Text style={[styles.historyTitle, { color: theme.colors.text }]}>{t("home.actionHistory")}</Text>
              {actionHistory.map((action, index) => (
                <View key={index} style={[styles.historyItem, { borderBottomColor: theme.colors.border }]}>
                  <Ionicons name={action.icon} size={18} color={theme.colors.primary} />
                  <Text style={[styles.historyText, { color: theme.colors.text }]}>
                    {`${t(`workStatus.${action.type}`)} - ${action.time}`}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Thời tiết */}
        <WeatherWidget onRefresh={onRefresh} showForecast={false} />

        {/* Lưới trạng thái tuần */}
        <View style={[styles.weekGridContainer, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("home.weekStatus")}</Text>
          <WeekStatusGrid onDayPress={handleDayStatusPress} />
        </View>

        {/* Ghi chú công việc */}
        <View style={[styles.notesContainer, { backgroundColor: theme.colors.card }]}>
          <View style={styles.notesTitleContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t("home.workNotes")}</Text>
            <TouchableOpacity style={styles.addNoteButton} onPress={() => navigation.navigate("AddEditNote")}>
              <Ionicons name="add-circle" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <WorkNotesList limit={3} navigation={navigation} />
        </View>
      </ScrollView>

      {/* Modal hiển thị chi tiết trạng thái ngày */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowStatusModal(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            {selectedDayStatus && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                    {format(new Date(selectedDayStatus.date), "dd/MM/yyyy")}
                  </Text>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowStatusModal(false)}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.statusDetails}>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                      {t("workStatus.status")}:
                    </Text>
                    <View style={styles.statusValueContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedDayStatus.status) }]}>
                        <Text style={styles.statusBadgeText}>{getStatusIcon(selectedDayStatus.status)}</Text>
                      </View>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {t(`workStatus.${selectedDayStatus.status}`)}
                      </Text>
                    </View>
                  </View>

                  {selectedDayStatus.shiftName && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.shift")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {selectedDayStatus.shiftName}
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.checkInTime && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.checkIn")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {selectedDayStatus.checkInTime}
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.checkOutTime && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.checkOut")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {selectedDayStatus.checkOutTime}
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.vaoLogTime && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.actualCheckIn")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {new Date(selectedDayStatus.vaoLogTime).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.raLogTime && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.actualCheckOut")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text }]}>
                        {new Date(selectedDayStatus.raLogTime).toLocaleTimeString()}
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.totalHours > 0 && (
                    <View style={styles.statusRow}>
                      <Text style={[styles.statusLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.totalHours")}:
                      </Text>
                      <Text style={[styles.statusValue, { color: theme.colors.text, fontWeight: "600" }]}>
                        {selectedDayStatus.totalHours.toFixed(1)}h
                      </Text>
                    </View>
                  )}

                  {selectedDayStatus.remarks && (
                    <View style={styles.remarksContainer}>
                      <Text style={[styles.remarksLabel, { color: theme.colors.textSecondary }]}>
                        {t("workStatus.remarks")}:
                      </Text>
                      <Text style={[styles.remarksText, { color: theme.colors.text }]}>
                        {selectedDayStatus.remarks}
                      </Text>
                    </View>
                  )}
                </View>

                {!selectedDayStatus.isFuture && (
                  <TouchableOpacity
                    style={[styles.updateStatusButton, { backgroundColor: theme.colors.primary }]}
                    onPress={() => {
                      setShowStatusModal(false)
                      setTimeout(() => {
                        handleDayStatusUpdate(selectedDayStatus)
                      }, 300)
                    }}
                  >
                    <Ionicons name="create-outline" size={18} color="#FFFFFF" style={styles.updateButtonIcon} />
                    <Text style={styles.updateButtonText}>{t("workStatus.updateStatus")}</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dateTimeContainer: {
    flex: 1,
  },
  currentTime: {
    fontSize: 36,
    fontWeight: "bold",
  },
  currentDate: {
    fontSize: 16,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  alertsContainer: {
    marginBottom: 16,
  },
  shiftInfoContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  shiftDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shiftName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  shiftTime: {
    fontSize: 16,
  },
  noShift: {
    fontSize: 16,
    fontStyle: "italic",
  },
  actionButtonContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    alignItems: "center",
  },
  punchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  punchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  historyContainer: {
    width: "100%",
    marginTop: 16,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  historyText: {
    marginLeft: 8,
    fontSize: 14,
  },
  weekGridContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  notesContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  notesTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  addNoteButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  statusDetails: {
    marginBottom: 20,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  remarksContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 8,
  },
  remarksText: {
    fontSize: 14,
    fontStyle: "italic",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalCloseButton: {
    padding: 4,
  },
  statusValueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  remarksLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  updateStatusButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  updateButtonIcon: {
    marginRight: 8,
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default HomeScreen
