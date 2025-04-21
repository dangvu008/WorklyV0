"use client"

import "react-native-gesture-handler"
import { useEffect } from "react"
import { NavigationContainer } from "@react-navigation/native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createStackNavigator } from "@react-navigation/stack"
import { Ionicons } from "@expo/vector-icons"
import { StatusBar } from "react-native"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import screens from the index.js file
import { HomeScreen, SettingsScreen, NotesScreen, StatsScreen, SampleDataScreen } from "./screens"

// Import contexts from the index.js file
import {
  ThemeProvider,
  LanguageProvider,
  WorkProvider,
  NotificationProvider,
  AlarmProvider,
  WeatherProvider,
  BackupProvider,
} from "./contexts"

// Import utils from the index.js file
import { shiftUtils } from "./utils"
import { useTheme } from "./hooks/useTheme"
import { useTranslation } from "./hooks/useTranslation"

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Tạo các stack navigator riêng cho từng tab
const HomeStack = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ title: t("home.title"), headerShown: false }} />
    </Stack.Navigator>
  )
}

const SettingsStack = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ title: t("settings.title") }} />
      <Stack.Screen name="SampleData" component={SampleDataScreen} options={{ title: "Dữ liệu mẫu" }} />
    </Stack.Navigator>
  )
}

const NotesStack = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="NotesMain" component={NotesScreen} options={{ title: t("notes.title") }} />
    </Stack.Navigator>
  )
}

const StatsStack = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen name="StatsMain" component={StatsScreen} options={{ title: t("stats.title") }} />
    </Stack.Navigator>
  )
}

const AppContent = () => {
  const { theme } = useTheme()
  const { t } = useTranslation()
  const { initializeDefaultShifts } = shiftUtils

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Kiểm tra xem đã có ca làm việc mặc định chưa
        const shiftsData = await AsyncStorage.getItem("shifts")
        if (!shiftsData) {
          // Nếu chưa có, khởi tạo ca làm việc mặc định
          await initializeDefaultShifts()
        }
      } catch (error) {
        console.error("Error initializing app:", error)
      }
    }

    initializeApp()
  }, [initializeDefaultShifts])

  return (
    <NavigationContainer theme={theme}>
      <StatusBar barStyle={theme.dark ? "light-content" : "dark-content"} backgroundColor={theme.colors.background} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName

            if (route.name === "Home") {
              iconName = focused ? "home" : "home-outline"
            } else if (route.name === "Settings") {
              iconName = focused ? "settings" : "settings-outline"
            } else if (route.name === "Notes") {
              iconName = focused ? "document-text" : "document-text-outline"
            } else if (route.name === "Stats") {
              iconName = focused ? "stats-chart" : "stats-chart-outline"
            }

            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarActiveTintColor: theme.colors.primary,
          tabBarInactiveTintColor: theme.colors.text,
          tabBarStyle: {
            backgroundColor: theme.colors.card,
            borderTopColor: theme.colors.border,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t("tabs.home") }} />
        <Tab.Screen name="Notes" component={NotesStack} options={{ tabBarLabel: t("tabs.notes") }} />
        <Tab.Screen name="Stats" component={StatsStack} options={{ tabBarLabel: t("tabs.stats") }} />
        <Tab.Screen name="Settings" component={SettingsStack} options={{ tabBarLabel: t("tabs.settings") }} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <WorkProvider>
          <NotificationProvider>
            <AlarmProvider>
              <WeatherProvider>
                <BackupProvider>
                  <AppContent />
                </BackupProvider>
              </WeatherProvider>
            </AlarmProvider>
          </NotificationProvider>
        </WorkProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
