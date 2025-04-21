"use client"
import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useAlarm } from "../hooks"
import { AlarmItem } from "../components"

const AlarmsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { alarms, toggleAlarm, deleteAlarm } = useAlarm()
  const [filteredAlarms, setFilteredAlarms] = useState([])
  const [activeFilter, setActiveFilter] = useState("all")

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    cardBackground: isDarkMode ? "#1E2636" : "#FFFFFF",
    textPrimary: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    accent: "#4A6FFF",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
  }

  // Lọc báo thức
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredAlarms(alarms)
    } else if (activeFilter === "active") {
      setFilteredAlarms(alarms.filter((alarm) => alarm.isEnabled))
    } else if (activeFilter === "inactive") {
      setFilteredAlarms(alarms.filter((alarm) => !alarm.isEnabled))
    } else if (activeFilter === "recurring") {
      setFilteredAlarms(alarms.filter((alarm) => alarm.type === "recurring"))
    } else if (activeFilter === "one_time") {
      setFilteredAlarms(alarms.filter((alarm) => alarm.type === "one_time"))
    } else if (activeFilter === "shift_linked") {
      setFilteredAlarms(alarms.filter((alarm) => alarm.type === "shift_linked"))
    }
  }, [alarms, activeFilter])

  // Xử lý bật/tắt báo thức
  const handleToggleAlarm = (alarmId, isEnabled) => {
    toggleAlarm(alarmId, isEnabled)
  }

  // Xử lý chỉnh sửa báo thức
  const handleEditAlarm = (alarm) => {
    navigation.navigate("AddEditAlarm", { alarm })
  }

  // Xử lý xóa báo thức
  const handleDeleteAlarm = (alarmId) => {
    Alert.alert("Xóa báo thức", "Bạn có chắc chắn muốn xóa báo thức này không?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: () => deleteAlarm(alarmId),
      },
    ])
  }

  // Xử lý thêm báo thức mới
  const handleAddAlarm = () => {
    navigation.navigate("AddEditAlarm")
  }

  // Render báo thức
  const renderAlarmItem = ({ item }) => (
    <AlarmItem alarm={item} onToggle={handleToggleAlarm} onEdit={handleEditAlarm} onDelete={handleDeleteAlarm} />
  )

  // Render khi không có báo thức
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="alarm-outline" size={64} color={theme.textSecondary} style={styles.emptyIcon} />
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Chưa có báo thức nào</Text>
      <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.accent }]} onPress={handleAddAlarm}>
        <Text style={styles.addButtonText}>Thêm báo thức mới</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Báo thức</Text>
        <TouchableOpacity style={styles.addHeaderButton} onPress={handleAddAlarm}>
          <Ionicons name="add" size={24} color={theme.accent} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: theme.cardBackground }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "all" && [styles.activeFilterTab, { borderColor: theme.accent }],
            ]}
            onPress={() => setActiveFilter("all")}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === "all" && [styles.activeFilterText, { color: theme.accent }],
                { color: activeFilter === "all" ? theme.accent : theme.textSecondary },
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "active" && [styles.activeFilterTab, { borderColor: theme.accent }],
            ]}
            onPress={() => setActiveFilter("active")}
          >
            <Text
              style={[styles.filterText, { color: activeFilter === "active" ? theme.accent : theme.textSecondary }]}
            >
              Đang bật
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "recurring" && [styles.activeFilterTab, { borderColor: theme.accent }],
            ]}
            onPress={() => setActiveFilter("recurring")}
          >
            <Text
              style={[styles.filterText, { color: activeFilter === "recurring" ? theme.accent : theme.textSecondary }]}
            >
              Lặp lại
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "one_time" && [styles.activeFilterTab, { borderColor: theme.accent }],
            ]}
            onPress={() => setActiveFilter("one_time")}
          >
            <Text
              style={[styles.filterText, { color: activeFilter === "one_time" ? theme.accent : theme.textSecondary }]}
            >
              Một lần
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === "shift_linked" && [styles.activeFilterTab, { borderColor: theme.accent }],
            ]}
            onPress={() => setActiveFilter("shift_linked")}
          >
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === "shift_linked" ? theme.accent : theme.textSecondary },
              ]}
            >
              Liên kết ca
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Alarm List */}
      <FlatList
        data={filteredAlarms}
        renderItem={renderAlarmItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
      />

      {/* Add Button */}
      {alarms.length > 0 && (
        <TouchableOpacity style={[styles.floatingButton, { backgroundColor: theme.accent }]} onPress={handleAddAlarm}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
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
  addHeaderButton: {
    padding: 4,
  },
  filterContainer: {
    paddingVertical: 12,
    marginBottom: 8,
  },
  filterScrollContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  activeFilterTab: {
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 24,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
})

export default AlarmsScreen
