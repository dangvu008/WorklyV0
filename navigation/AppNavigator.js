"use client"
import { createStackNavigator } from "@react-navigation/stack"
import BottomTabNavigator from "../components/BottomTabNavigator"

// Import các màn hình không thuộc bottom tab
import DetailScreen from "../screens/DetailScreen"
import SearchScreen from "../screens/SearchScreen"
import SoundSettingsScreen from "../screens/SoundSettingsScreen"
// Thêm import
import SampleDataScreen from "../screens/SampleDataScreen"
// Thêm các màn hình khác nếu cần

const Stack = createStackNavigator()

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Màn hình chính với bottom tabs */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />

      {/* Các màn hình không thuộc bottom tabs */}
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="SoundSettings" component={SoundSettingsScreen} />
      {/* Thêm vào Stack.Navigator */}
      <Stack.Screen name="SampleData" component={SampleDataScreen} />
      {/* Thêm các màn hình khác nếu cần */}
    </Stack.Navigator>
  )
}

export default AppNavigator
