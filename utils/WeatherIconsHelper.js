"use client"

// Hàm lấy icon thời tiết từ Ionicons dựa vào điều kiện thời tiết
export const getIonIconName = (condition, temperature) => {
  // Định nghĩa các icon thời tiết từ Ionicons
  const WEATHER_ICONS = {
    sunny: "sunny",
    partlyCloudy: "partly-sunny",
    cloudy: "cloudy",
    rainy: "rainy",
    thunderstorm: "thunderstorm",
    snow: "snow",
  }

  if (condition) {
    // Nếu có condition cụ thể, ưu tiên sử dụng
    switch (condition.toLowerCase()) {
      case "clear":
        return WEATHER_ICONS.sunny
      case "partly cloudy":
        return WEATHER_ICONS.partlyCloudy
      case "cloudy":
        return WEATHER_ICONS.cloudy
      case "rain":
      case "light rain":
      case "drizzle":
        return WEATHER_ICONS.rainy
      case "thunderstorm":
        return WEATHER_ICONS.thunderstorm
      case "snow":
        return WEATHER_ICONS.snow
      default:
        // Fallback dựa vào nhiệt độ
        break
    }
  }

  // Fallback dựa vào nhiệt độ
  if (temperature >= 30) return WEATHER_ICONS.sunny
  if (temperature >= 25) return WEATHER_ICONS.partlyCloudy
  if (temperature >= 20) return WEATHER_ICONS.cloudy
  if (temperature >= 15) return WEATHER_ICONS.rainy
  if (temperature < 5) return WEATHER_ICONS.snow
  return WEATHER_ICONS.cloudy
}

// Hàm lấy đường dẫn đến icon thời tiết tùy chỉnh
export const getWeatherIconPath = (condition, temperature) => {
  let iconName = "cloudy"

  if (condition) {
    switch (condition.toLowerCase()) {
      case "clear":
        iconName = "clear"
        break
      case "partly cloudy":
        iconName = "partly-cloudy"
        break
      case "cloudy":
        iconName = "cloudy"
        break
      case "rain":
      case "light rain":
        iconName = "rain"
        break
      case "thunderstorm":
        iconName = "thunderstorm"
        break
      case "snow":
        iconName = "snow"
        break
      default:
        // Fallback dựa vào nhiệt độ
        break
    }
  } else {
    // Fallback dựa vào nhiệt độ
    if (temperature >= 30) iconName = "clear"
    else if (temperature >= 25) iconName = "partly-cloudy"
    else if (temperature >= 20) iconName = "cloudy"
    else if (temperature >= 15) iconName = "rain"
    else if (temperature < 5) iconName = "snow"
  }

  return require(`../assets/weather-icons/${iconName}.png`)
}

// Hàm lấy mô tả thời tiết dựa vào điều kiện
export const getWeatherDescription = (condition, temperature) => {
  if (condition) {
    switch (condition.toLowerCase()) {
      case "clear":
        return "Trời nắng"
      case "partly cloudy":
        return "Có mây rải rác"
      case "cloudy":
        return "Nhiều mây"
      case "rain":
        return "Có mưa"
      case "light rain":
        return "Mưa nhẹ"
      case "drizzle":
        return "Mưa phùn"
      case "thunderstorm":
        return "Giông bão"
      case "snow":
        return "Tuyết rơi"
      default:
        // Fallback dựa vào nhiệt độ
        break
    }
  }

  // Fallback dựa vào nhiệt độ
  if (temperature >= 30) return "Trời nắng nóng"
  if (temperature >= 25) return "Trời nắng"
  if (temperature >= 20) return "Trời mát"
  if (temperature >= 15) return "Trời lạnh"
  if (temperature < 5) return "Trời rất lạnh"
  return "Thời tiết ôn hòa"
}
