"use client"
import { View, Text, StyleSheet } from "react-native"
import { Switch } from "react-native"

const SettingToggle = ({ title, description, value, onToggle }) => {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <Switch
        trackColor={{ false: "#D1D1D6", true: "#4CD964" }}
        thumbColor={"#FFFFFF"}
        ios_backgroundColor="#D1D1D6"
        onValueChange={onToggle}
        value={value}
        style={styles.switch}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  textContainer: {
    flex: 1,
    paddingRight: 16,
  },
  title: {
    fontSize: 15,
    color: "#000000",
  },
  description: {
    fontSize: 13,
    color: "#8E8E93",
    marginTop: 4,
    lineHeight: 18,
  },
  switch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }], // Ensure consistent size
  },
})

export default SettingToggle
