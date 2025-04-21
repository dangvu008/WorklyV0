"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"
import { SampleDataService } from "../services"

const SampleDataScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingType, setLoadingType] = useState("")

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    success: "#4CD964",
    warning: "#FF9500",
    danger: "#FF3B30",
  }

  // Tạo dữ liệu mẫu cho ca làm việc
  const handleCreateSampleShifts = async () => {
    try {
      setIsLoading(true)
      setLoadingType("shifts")
      await SampleDataService.createSampleShifts()
      Alert.alert("Thành công", "Đã tạo dữ liệu mẫu cho ca làm việc")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu cho ca làm việc")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Tạo dữ liệu mẫu cho trạng thái làm việc
  const handleCreateSampleWorkStatus = async () => {
    try {
      setIsLoading(true)
      setLoadingType("workStatus")
      await SampleDataService.createSampleWorkStatus()
      Alert.alert("Thành công", "Đã tạo dữ liệu mẫu cho trạng thái làm việc")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu cho trạng thái làm việc")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Tạo dữ liệu mẫu cho ghi chú
  const handleCreateSampleNotes = async () => {
    try {
      setIsLoading(true)
      setLoadingType("notes")
      await SampleDataService.createSampleNotes()
      Alert.alert("Thành công", "Đã tạo dữ liệu mẫu cho ghi chú")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu cho ghi chú")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Tạo dữ liệu mẫu cho báo thức
  const handleCreateSampleAlarms = async () => {
    try {
      setIsLoading(true)
      setLoadingType("alarms")
      await SampleDataService.createSampleAlarms()
      Alert.alert("Thành công", "Đã tạo dữ liệu mẫu cho báo thức")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu cho báo thức")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Tạo dữ liệu mẫu cho cài đặt
  const handleCreateSampleSettings = async () => {
    try {
      setIsLoading(true)
      setLoadingType("settings")
      await SampleDataService.createSampleSettings()
      Alert.alert("Thành công", "Đã tạo dữ liệu mẫu cho cài đặt")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo dữ liệu mẫu cho cài đặt")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Tạo tất cả dữ liệu mẫu
  const handleCreateAllSampleData = async () => {
    try {
      setIsLoading(true)
      setLoadingType("all")
      await SampleDataService.createAllSampleData()
      Alert.alert("Thành công", "Đã tạo tất cả dữ liệu mẫu")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tạo tất cả dữ liệu mẫu")
    } finally {
      setIsLoading(false)
      setLoadingType("")
    }
  }

  // Xóa tất cả dữ liệu
  const handleClearAllData = async () => {
    Alert.alert("Xóa tất cả dữ liệu", "Bạn có chắc chắn muốn xóa tất cả dữ liệu? Hành động này không thể hoàn tác.", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setIsLoading(true)
            setLoadingType("clear")
            await SampleDataService.clearAllData()
            Alert.alert("Thành công", "Đã xóa tất cả dữ liệu")
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa tất cả dữ liệu")
          } finally {
            setIsLoading(false)
            setLoadingType("")
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Dữ liệu mẫu</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tạo dữ liệu mẫu</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Tạo dữ liệu mẫu để kiểm tra các tính năng của ứng dụng. Dữ liệu mẫu sẽ thay thế dữ liệu hiện tại.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleCreateSampleShifts}
              disabled={isLoading}
            >
              {isLoading && loadingType === "shifts" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="calendar-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Ca làm việc</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleCreateSampleWorkStatus}
              disabled={isLoading}
            >
              {isLoading && loadingType === "workStatus" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="stats-chart-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Trạng thái làm việc</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleCreateSampleNotes}
              disabled={isLoading}
            >
              {isLoading && loadingType === "notes" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Ghi chú</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleCreateSampleAlarms}
              disabled={isLoading}
            >
              {isLoading && loadingType === "alarms" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="alarm-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Báo thức</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primary }]}
              onPress={handleCreateSampleSettings}
              disabled={isLoading}
            >
              {isLoading && loadingType === "settings" ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="settings-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                  <Text style={styles.buttonText}>Cài đặt</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.fullButton, { backgroundColor: theme.success }]}
            onPress={handleCreateAllSampleData}
            disabled={isLoading}
          >
            {isLoading && loadingType === "all" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Tạo tất cả dữ liệu mẫu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Xóa dữ liệu</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Xóa tất cả dữ liệu trong ứng dụng. Hành động này không thể hoàn tác.
          </Text>

          <TouchableOpacity
            style={[styles.fullButton, { backgroundColor: theme.danger }]}
            onPress={handleClearAllData}
            disabled={isLoading}
          >
            {isLoading && loadingType === "clear" ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Xóa tất cả dữ liệu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Thông tin</Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Dữ liệu mẫu được tạo ra để giúp bạn kiểm tra các tính năng của ứng dụng. Dữ liệu này không phản ánh dữ liệu
            thực tế của bạn.
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary, marginTop: 8 }]}>
            Sau khi tạo dữ liệu mẫu, bạn có thể cần khởi động lại ứng dụng để thấy các thay đổi.
          </Text>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fullButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default SampleDataScreen
