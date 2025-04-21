"use client"
import { View, Text, StyleSheet } from "react-native"
import { Svg, G, Path, Circle } from "react-native-svg"

const StatusPieChart = ({ data, theme }) => {
  const size = 200
  const radius = size / 2
  const center = size / 2
  const strokeWidth = 40

  // Calculate total value
  const total = data.reduce((sum, item) => sum + item.value, 0)

  // Generate pie segments
  const generatePieSegments = () => {
    const segments = []
    let startAngle = 0

    data.forEach((item, index) => {
      if (item.value === 0) return

      const angle = (item.value / total) * 360
      const endAngle = startAngle + angle

      // Calculate path
      const x1 = center + radius * Math.cos((Math.PI * startAngle) / 180)
      const y1 = center + radius * Math.sin((Math.PI * startAngle) / 180)
      const x2 = center + radius * Math.cos((Math.PI * endAngle) / 180)
      const y2 = center + radius * Math.sin((Math.PI * endAngle) / 180)

      // Determine if the arc should be drawn the long way around
      const largeArcFlag = angle > 180 ? 1 : 0

      // Create SVG path
      const path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `

      segments.push(<Path key={index} d={path} fill={item.color} />)

      startAngle = endAngle
    })

    return segments
  }

  // If no data or all values are 0, show empty circle
  if (total === 0) {
    return (
      <View style={styles.container}>
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius - strokeWidth / 2}
            stroke={theme.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
        </Svg>
        <View style={styles.emptyTextContainer}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No data</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <G>
          {generatePieSegments()}
          {/* Inner circle for donut effect */}
          <Circle cx={center} cy={center} r={radius - strokeWidth} fill={theme.card} />
        </G>
      </Svg>

      <View style={styles.centerTextContainer}>
        <Text style={[styles.totalText, { color: theme.text }]}>{total}</Text>
        <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Days</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  centerTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  totalLabel: {
    fontSize: 12,
  },
  emptyTextContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    fontStyle: "italic",
  },
})

export default StatusPieChart
