"use client"
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useBackup } from "../hooks"
import { useState } from "react"

const BackupRestoreSection = () => {
  const { isDarkMode } = useTheme()
  const { isBackingUp, isRestoring, lastBackupDate, createBackup, restoreFromBackup, clearAllData } = useBackup()
  const [result, setResult] = useState(null)

  // Theme colors
  const theme = {
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    success: "#4CD964",
    error: "#FF3B30",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Format ngày
  const formatDate = (date) => {
    if (!date) return "Chưa có"
    return new Date(date).toLocaleString()
  }

  // Xử lý sao lưu
  const handleBackup = async () => {
    setResult(null)
    const result = await createBackup()
    setResult(result)
  }

  // Xử lý khôi phục
  const handleRestore = async () => {
    setResult(null)
    const result = await restoreFromBackup()
    setResult(result)
  }

  // Xử lý xóa dữ liệu
  const handleClear = async () => {
    setResult(null)
    const result = await clearAllData()
    setResult(result)
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Sao lưu & Khôi phục</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Sao lưu gần nhất:</Text>
          <Text style={[styles.value, { color: theme.textPrimary }]}>{formatDate(lastBackupDate)}</Text>
        </View>

        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleBackup}
            disabled={isBackingUp || isRestoring}
          >
            {isBackingUp ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Sao lưu</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accent }]}
            onPress={handleRestore}
            disabled={isBackingUp || isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
                <Text style={styles.buttonText}>Khôi phục</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.error }]}
            onPress={handleClear}
            disabled={isBackingUp || isRestoring}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Xóa dữ liệu</Text>
          </TouchableOpacity>
        </View>

        {result && (
          <View
            style={[
              styles.resultContainer,
              { backgroundColor: result.success ? "rgba(76, 217, 100, 0.1)" : "rgba(255, 59, 48, 0.1)" },
            ]}
          >
            <Ionicons
              name={result.success ? "checkmark-circle" : "close-circle"}
              size={20}
              color={result.success ? theme.success : theme.error}
              style={styles.resultIcon}
            />
            <Text style={[styles.resultText, { color: result.success ? theme.success : theme.error }]}>
              {result.message}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "500",
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonIcon: {
    marginRight: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  resultIcon: {
    marginRight: 8,
  },
  resultText: {
    fontSize: 14,
    flex: 1,
  },
})

export default BackupRestoreSection
