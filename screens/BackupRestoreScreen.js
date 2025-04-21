"use client"
import { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useBackup } from "../hooks"
import { BackupRestoreSection } from "../components"

const BackupRestoreScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { isBackingUp, isRestoring, lastBackupDate, createBackup, restoreFromBackup, clearAllData } = useBackup()
  const [result, setResult] = useState(null)

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    warning: "#FF9500",
    danger: "#FF3B30",
    success: "#4CD964",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Xử lý xóa tất cả dữ liệu
  const handleClearAllData = () => {
    Alert.alert("Xóa tất cả dữ liệu", "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          const result = await clearAllData()
          setResult(result)
          if (result.success) {
            setTimeout(() => {
              Alert.alert("Thành công", "Đã xóa tất cả dữ liệu. Ứng dụng sẽ khởi động lại.", [
                {
                  text: "OK",
                  onPress: () => navigation.reset({ index: 0, routes: [{ name: "Home" }] }),
                },
              ])
            }, 1000)
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Sao lưu & Khôi phục</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Backup & Restore Section */}
        <BackupRestoreSection />

        {/* Data Management */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quản lý dữ liệu</Text>

          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              Dữ liệu của bạn được lưu trữ cục bộ trên thiết bị. Để đảm bảo an toàn, hãy sao lưu dữ liệu thường xuyên.
            </Text>
          </View>

          <View style={styles.dataTypes}>
            <View style={styles.dataTypeItem}>
              <Ionicons name="briefcase-outline" size={24} color={theme.accent} style={styles.dataTypeIcon} />
              <Text style={[styles.dataTypeName, { color: theme.textPrimary }]}>Ca làm việc</Text>
            </View>

            <View style={styles.dataTypeItem}>
              <Ionicons name="calendar-outline" size={24} color={theme.accent} style={styles.dataTypeIcon} />
              <Text style={[styles.dataTypeName, { color: theme.textPrimary }]}>Nhật ký chấm công</Text>
            </View>

            <View style={styles.dataTypeItem}>
              <Ionicons name="document-text-outline" size={24} color={theme.accent} style={styles.dataTypeIcon} />
              <Text style={[styles.dataTypeName, { color: theme.textPrimary }]}>Ghi chú</Text>
            </View>

            <View style={styles.dataTypeItem}>
              <Ionicons name="alarm-outline" size={24} color={theme.accent} style={styles.dataTypeIcon} />
              <Text style={[styles.dataTypeName, { color: theme.textPrimary }]}>Báo thức</Text>
            </View>

            <View style={styles.dataTypeItem}>
              <Ionicons name="settings-outline" size={24} color={theme.accent} style={styles.dataTypeIcon} />
              <Text style={[styles.dataTypeName, { color: theme.textPrimary }]}>Cài đặt</Text>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={[styles.section, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.dangerTitle, { color: theme.danger }]}>Vùng nguy hiểm</Text>

          <View style={styles.dangerInfo}>
            <Ionicons name="warning-outline" size={24} color={theme.warning} style={styles.warningIcon} />
            <Text style={[styles.dangerText, { color: theme.textSecondary }]}>
              Các hành động dưới đây không thể hoàn tác. Hãy cân nhắc kỹ trước khi thực hiện.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.dangerButton, { backgroundColor: theme.danger }]}
            onPress={handleClearAllData}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.dangerButtonIcon} />
            <Text style={styles.dangerButtonText}>Xóa tất cả dữ liệu</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerRight: {
    width: 32,
  },
  content: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dataTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dataTypeItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dataTypeIcon: {
    marginRight: 8,
  },
  dataTypeName: {
    fontSize: 14,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  dangerInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  warningIcon: {
    marginRight: 8,
  },
  dangerText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  dangerButtonIcon: {
    marginRight: 8,
  },
  dangerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default BackupRestoreScreen
