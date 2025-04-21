"use client"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { format, parseISO } from "date-fns"

const DailyHoursChart = ({ month, dailyWorkStatus, theme }) => {
  // Filter work status for the selected month
  const monthData = dailyWorkStatus.filter((status) => status.date.startsWith(month))

  // Sort by date
  monthData.sort((a, b) => a.date.localeCompare(b.date))

  // Find max hours for scaling
  const maxHours = Math.max(
    ...monthData.map((day) => day.totalHours || 0),
    8, // Default to at least 8 hours for scaling
  )

  // Format date for display
  const formatDay = (dateString) => {
    const date = parseISO(dateString)
    return format(date, "dd")
  }

  // Get bar color based on status
  const getBarColor = (status) => {
    switch (status) {
      case "full_work":
        return theme.success
      case "missing_action":
        return theme.warning
      case "leave":
        return theme.info
      case "sick":
        return theme.error
      case "holiday":
        return theme.purple
      case "absent":
        return theme.gray
      case "late_early":
        return theme.yellow
      default:
        return theme.gray
    }
  }

  if (monthData.length === 0) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={[styles.noDataText, { color: theme.textSecondary }]}>No work data available for this month</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Y-axis labels */}
      <View style={styles.yAxisContainer}>
        <Text style={[styles.yAxisLabel, { color: theme.textSecondary }]}>{maxHours}h</Text>
        <Text style={[styles.yAxisLabel, { color: theme.textSecondary }]}>{Math.round(maxHours / 2)}h</Text>
        <Text style={[styles.yAxisLabel, { color: theme.textSecondary }]}>0h</Text>
      </View>

      {/* Chart content */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chartContent}>
        {/* Grid lines */}
        <View style={styles.gridContainer}>
          <View style={[styles.gridLine, { borderColor: theme.border, top: 0 }]} />
          <View style={[styles.gridLine, { borderColor: theme.border, top: "50%" }]} />
          <View style={[styles.gridLine, { borderColor: theme.border, top: "100%" }]} />
        </View>

        {/* Bars */}
        <View style={styles.barsContainer}>
          {monthData.map((day, index) => (
            <View key={index} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${((day.totalHours || 0) / maxHours) * 100}%`,
                      backgroundColor: getBarColor(day.status),
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, { color: theme.textSecondary }]}>{formatDay(day.date)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    flexDirection: "row",
  },
  yAxisContainer: {
    width: 40,
    height: "100%",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 10,
    textAlign: "right",
    paddingRight: 5,
  },
  chartContent: {
    flexGrow: 1,
    height: "100%",
  },
  gridContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gridLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    borderTopWidth: 1,
    borderStyle: "dashed",
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: "100%",
    paddingTop: 10,
    paddingBottom: 20,
  },
  barColumn: {
    width: 30,
    height: "100%",
    alignItems: "center",
    marginHorizontal: 2,
  },
  barWrapper: {
    width: 20,
    height: "100%",
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: 10,
    marginTop: 5,
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

export default DailyHoursChart
