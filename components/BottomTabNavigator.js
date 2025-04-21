"use client"
import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "../hooks"

// Import screens
import { HomeScreen, CalendarScreen, NotificationsScreen, ProfileScreen, SettingsScreen } from "../screens"

const Tab = createBottomTabNavigator()

// Custom tab bar component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()
  const { isDarkMode } = useTheme()

  // Animation values for each tab
  const animatedValues = React.useRef(state.routes.map(() => new Animated.Value(0))).current

  // Animate the active tab
  React.useEffect(() => {
    const focusedTab = state.index

    // Reset all tabs
    animatedValues.forEach((value, i) => {
      if (i !== focusedTab) {
        Animated.timing(value, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start()
      }
    })

    // Animate the focused tab
    Animated.timing(animatedValues[focusedTab], {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
  }, [state.index, animatedValues])

  // Theme colors
  const theme = {
    tabBarBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    activeColor: "#4A6FFF",
    inactiveColor: isDarkMode ? "#A0A9BD" : "#8E8E93",
    borderColor: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          backgroundColor: theme.tabBarBackground,
          borderTopColor: theme.borderColor,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel || options.title || route.name
        const isFocused = state.index === index

        // Handle tab press
        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          })

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name)
          }
        }

        // Get icon name based on route
        let iconName
        switch (route.name) {
          case "Home":
            iconName = isFocused ? "home" : "home-outline"
            break
          case "Calendar":
            iconName = isFocused ? "calendar" : "calendar-outline"
            break
          case "Notifications":
            iconName = isFocused ? "notifications" : "notifications-outline"
            break
          case "Profile":
            iconName = isFocused ? "person" : "person-outline"
            break
          case "Settings":
            iconName = isFocused ? "settings" : "settings-outline"
            break
          default:
            iconName = "help-circle-outline"
        }

        // Animation values
        const scale = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        })

        const translateY = animatedValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -4],
        })

        return (
          <TouchableOpacity key={index} activeOpacity={0.7} onPress={onPress} style={styles.tabButton}>
            <View style={styles.tabItem}>
              {isFocused && <View style={[styles.activeIndicator, { backgroundColor: theme.activeColor }]} />}
              <Animated.View
                style={{
                  transform: [{ scale }, { translateY }],
                }}
              >
                <Ionicons name={iconName} size={24} color={isFocused ? theme.activeColor : theme.inactiveColor} />
              </Animated.View>
              <Text style={[styles.tabLabel, { color: isFocused ? theme.activeColor : theme.inactiveColor }]}>
                {label}
              </Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

// Bottom tab navigator
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Trang chủ",
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarLabel: "Lịch làm việc",
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: "Thông báo",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Cá nhân",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: "Cài đặt",
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    height: 60,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  tabButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 8,
    width: "100%",
  },
  activeIndicator: {
    position: "absolute",
    top: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
})

export default BottomTabNavigator
