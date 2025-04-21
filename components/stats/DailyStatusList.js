"use client"
import { View, Text, StyleSheet, FlatList } from "react-native"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale/vi"
import { enUS } from "date-fns/locale/en-US"

const DailyStatusList = ({ month, dailyWorkStatus, getStatusColor, theme, language = "en" }) => {
  // Filter work status for the selected month
  const monthData = dailyWorkStatus.filter((status) => status.date.startsWith(month))

  // Sort by date
  monthData.sort((a, b) => a.date.localeCompare(b.date))

  // Get status name
  const getStatusName = (status) => {
    switch (status) {
      case "full_work":
        return "Full Work"
      case "missing_action":
        return "Missing Action"
      case "leave":
        return "Leave"
      case "sick":
        return "Sick"
      case "holiday":
        return "Holiday"
      case "absent":
        return "Absent"
      case "late_early":
        return "Late/Early"
      default:
        return "Unknown"
    }
  }

  // Format date for display
  const formatDate = (dateString) => {
    const date = parseISO(dateString)
    const locale = language === "vi" ? vi : enUS
    return format(date, "EEE, MMM dd", { locale })
  }

  // Render item
  const renderItem = ({ item }) => (
    <View style={[styles.itemContainer, { borderBottomColor: theme.border }]}>
      <View style={styles.dateContainer}>
        <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(item.date)}</Text>
      </View>

      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusName(item.status)}</Text>
        </View>
      </View>

      <View style={styles.hoursContainer}>
        <Text style={[styles.hoursText, { color: theme.text }]}>{item.totalHours ? `${item.totalHours}h` : "-"}</Text>
      </View>
    </View>
  )

  if (monthData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>No work data available for this month</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={monthData}
      renderItem={renderItem}
      keyExtractor={(item) => item.date}
      contentContainerStyle={styles.listContent}
    />
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateContainer: {
    flex: 2,
  },
  dateText: {
    fontSize: 14,
  },
  statusContainer: {
    flex: 2,
    alignItems: "flex-start",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  hoursContainer: {
    flex: 1,
    alignItems: "flex-end",
  },
  hoursText: {
    fontSize: 14,
    fontWeight: "500",
  },
  noDataContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
  },
})

export default DailyStatusList
