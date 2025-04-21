"use client"
import { View, Text, StyleSheet, SafeAreaView } from "react-native"
import { useTheme, useTranslation } from "../hooks"

const ProfileScreen = () => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Hồ sơ cá nhân</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Vui lòng tạo dữ liệu mẫu trong phần Cài đặt
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
})

export default ProfileScreen
