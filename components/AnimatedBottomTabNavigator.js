"use client"

import React from "react"
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

// Import các màn hình (giả định)
import { HomeScreen, CalendarScreen, NotificationsScreen, ProfileScreen, SettingsScreen } from "../screens"

const Tab = createBottomTabNavigator()

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()
  const animatedValues = React.useRef(state.routes.map(() => new Animated.Value(0))).current

  React.useEffect(() => {
    // Animate the active tab
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

  return (
    <View style={[styles.tabBarContainer, { paddingBottom: insets.bottom > 0 ? insets.bottom : 10 }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const label = options.tabBarLabel || options.title || route.name
        const isFocused = state.index === index

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
              {isFocused && <View style={styles.activeBackground} />}
              <Animated.View
                style={{
                  transform: [{ scale }, { translateY }],
                }}
              >
                <Ionicons name={iconName} size={24} color={isFocused ? "#4A6FFF" : "#8E8E93"} />
              </Animated.View>
              <Text style={[styles.tabLabel, { color: isFocused ? "#4A6FFF" : "#8E8E93" }]}>{label}</Text>
            </View>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const AnimatedBottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Trang chủ" }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarLabel: "Lịch" }} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ tabBarLabel: "Thông báo" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: "Cá nhân" }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: "Cài đặt" }} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    height: 60,
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
    height: "100%",
  },
  activeBackground: {
    position: "absolute",
    top: 0,
    left: "15%",
    right: "15%",
    height: 3,
    backgroundColor: "#4A6FFF",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: "500",
  },
})

export default AnimatedBottomTabNavigator
