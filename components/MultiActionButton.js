"use client"

import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation } from "../hooks"

const MultiActionButton = ({ workStatus, onAction, onReset, showResetButton = false, simpleMode = false }) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  // Animated values
  const scaleAnim = React.useRef(new Animated.Value(1)).current
  const rotateAnim = React.useRef(new Animated.Value(0)).current

  // Xác định trạng thái nút
  const getButtonConfig = () => {
    // Nếu ở chế độ đơn giản, chỉ hiển thị nút "Đi làm"
    if (simpleMode) {
      if (workStatus === "completed") {
        return {
          text: t("button.completed"),
          icon: "checkmark-circle",
          color: "#8E8E93", // Màu xám
          disabled: true,
        }
      }

      return {
        text: t("button.goToWork"),
        icon: "walk-outline",
        color: theme.colors.primary,
        action: "go_work",
        disabled: false,
      }
    }

    // Chế độ đầy đủ
    switch (workStatus) {
      case "not_started":
        return {
          text: t("button.goToWork"),
          icon: "walk-outline",
          color: theme.colors.primary,
          action: "go_work",
          disabled: false,
        }

      case "going_to_work":
        return {
          text: t("button.checkIn"),
          icon: "log-in-outline",
          color: "#4CD964", // Màu xanh lá
          action: "check_in",
          disabled: false,
        }

      case "checked_in":
        return {
          text: t("button.checkOut"),
          icon: "log-out-outline",
          color: "#FF9500", // Màu cam
          action: "check_out",
          disabled: false,
        }

      case "checked_out":
        return {
          text: t("button.complete"),
          icon: "checkmark-circle-outline",
          color: "#FF3B30", // Màu đỏ
          action: "complete",
          disabled: false,
        }

      case "completed":
        return {
          text: t("button.completed"),
          icon: "checkmark-circle",
          color: "#8E8E93", // Màu xám
          disabled: true,
        }

      default:
        return {
          text: t("button.goToWork"),
          icon: "walk-outline",
          color: theme.colors.primary,
          action: "go_work",
          disabled: false,
        }
    }
  }

  const buttonConfig = getButtonConfig()

  // Xử lý khi nhấn nút
  const handlePress = () => {
    if (buttonConfig.disabled) return

    // Animation khi nhấn
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start()

    // Gọi hàm xử lý
    if (buttonConfig.action) {
      onAction(buttonConfig.action)
    }
  }

  // Xử lý khi nhấn nút reset
  const handleReset = () => {
    // Animation khi nhấn
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0)
      if (onReset) onReset()
    })
  }

  // Chuyển đổi giá trị animation thành độ xoay
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  })

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: scaleAnim }] }]}>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: buttonConfig.color },
            buttonConfig.disabled && styles.disabledButton,
          ]}
          onPress={handlePress}
          disabled={buttonConfig.disabled}
          activeOpacity={0.8}
        >
          <Ionicons name={buttonConfig.icon} size={32} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>{buttonConfig.text}</Text>
        </TouchableOpacity>

        {/* Nút Reset */}
        {showResetButton && (
          <Animated.View style={[styles.resetButtonContainer, { transform: [{ rotate }] }]}>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: theme.colors.card }]}
              onPress={handleReset}
            >
              <Ionicons name="refresh" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  buttonContainer: {
    position: "relative",
    width: 200,
    height: 200,
  },
  button: {
    width: "100%",
    height: "100%",
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonIcon: {
    marginBottom: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    paddingHorizontal: 10,
  },
  resetButtonContainer: {
    position: "absolute",
    top: 0,
    right: 0,
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
})

export default MultiActionButton
