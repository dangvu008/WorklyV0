import AsyncStorage from "@react-native-async-storage/async-storage"

// Types
export interface WeatherData {
  main: {
    temp: number
    feels_like: number
    temp_min: number
    temp_max: number
    pressure: number
    humidity: number
  }
  weather: Array<{
    id: number
    main: string
    description: string
    icon: string
  }>
  wind: {
    speed: number
    deg: number
  }
  clouds: {
    all: number
  }
  dt: number
  sys: {
    country: string
    sunrise: number
    sunset: number
  }
  name: string
  coord: {
    lat: number
    lon: number
  }
}

interface WeatherCache {
  data: WeatherData
  timestamp: number
  location: {
    lat: number
    lon: number
  }
}

// Configuration
const CONFIG = {
  API_KEYS: [
    "db077a0c565a5ff3e7a3ca8ff9623575",
    "33b47107af3d15baccd58ff918b6e8e9",
    "949aa0ee4adae3c3fcec31fc01a7fd05",
    "47dc407065ba8fda36983034776b8176",
    "c1b419e1da6cd8f8f207fe5b7a49d8bb",
  ],
  BASE_URL: "https://api.openweathermap.org/data/2.5/weather",
  CACHE_KEY: "WEATHER_CACHE",
  API_KEY_INDEX_KEY: "WEATHER_API_KEY_INDEX",
  PAID_API_KEY_STORAGE: "WEATHER_PAID_API_KEY",
  PAID_API_ENABLED_STORAGE: "WEATHER_PAID_API_ENABLED",
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // 1s, 2s, 4s
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
}

/**
 * Checks if a paid API key is enabled and available
 * @returns Promise with boolean indicating if paid API is enabled
 */
export async function isPaidApiEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(CONFIG.PAID_API_ENABLED_STORAGE)
    const paidKey = await AsyncStorage.getItem(CONFIG.PAID_API_KEY_STORAGE)

    return enabled === "true" && !!paidKey
  } catch (error) {
    console.error("Error checking paid API status:", error)
    return false
  }
}

/**
 * Gets the paid API key if available
 * @returns Promise with the paid API key or null if not available
 */
export async function getPaidApiKey(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(CONFIG.PAID_API_KEY_STORAGE)
  } catch (error) {
    console.error("Error getting paid API key:", error)
    return null
  }
}

/**
 * Sets the paid API key and enables it
 * @param apiKey The paid API key to set
 * @returns Promise indicating success
 */
export async function setPaidApiKey(apiKey: string): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CONFIG.PAID_API_KEY_STORAGE, apiKey)
    await AsyncStorage.setItem(CONFIG.PAID_API_ENABLED_STORAGE, "true")
    return true
  } catch (error) {
    console.error("Error setting paid API key:", error)
    return false
  }
}

/**
 * Enables or disables the paid API key
 * @param enabled Boolean indicating if paid API should be enabled
 * @returns Promise indicating success
 */
export async function enablePaidApi(enabled: boolean): Promise<boolean> {
  try {
    await AsyncStorage.setItem(CONFIG.PAID_API_ENABLED_STORAGE, enabled ? "true" : "false")
    return true
  } catch (error) {
    console.error("Error setting paid API status:", error)
    return false
  }
}

/**
 * Removes the paid API key and disables it
 * @returns Promise indicating success
 */
export async function removePaidApiKey(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(CONFIG.PAID_API_KEY_STORAGE)
    await AsyncStorage.setItem(CONFIG.PAID_API_ENABLED_STORAGE, "false")
    return true
  } catch (error) {
    console.error("Error removing paid API key:", error)
    return false
  }
}

/**
 * Gets the appropriate API key based on configuration
 * If paid API is enabled, returns the paid key
 * Otherwise rotates through free keys
 * @returns Promise with the API key to use
 */
export async function getApiKey(): Promise<string> {
  // Check if paid API is enabled
  if (await isPaidApiEnabled()) {
    const paidKey = await getPaidApiKey()
    if (paidKey) {
      console.log("Using paid API key")
      return paidKey
    }
  }

  // Fall back to free key rotation if paid key is not available or enabled
  return rotateApiKey()
}

/**
 * Rotates to the next free API key and saves the index to AsyncStorage
 * @returns Promise with the next API key
 */
export async function rotateApiKey(): Promise<string> {
  try {
    // Get the last used index from AsyncStorage
    const lastIndexStr = await AsyncStorage.getItem(CONFIG.API_KEY_INDEX_KEY)
    const lastIndex = lastIndexStr ? Number.parseInt(lastIndexStr, 10) : -1

    // Calculate the next index (with modulo to wrap around)
    const nextIndex = (lastIndex + 1) % CONFIG.API_KEYS.length

    // Save the new index
    await AsyncStorage.setItem(CONFIG.API_KEY_INDEX_KEY, nextIndex.toString())

    // Return the API key at the new index
    return CONFIG.API_KEYS[nextIndex]
  } catch (error) {
    console.error("Error rotating API key:", error)
    // Fallback to the first key if there's an error
    return CONFIG.API_KEYS[0]
  }
}

/**
 * Determines if the weather cache should be refreshed based on timestamp and shift start
 * @param cache The current weather cache
 * @param shiftStart The start time of the shift
 * @returns Boolean indicating if cache should be refreshed
 */
export function shouldRefreshCache(cache: WeatherCache | null, shiftStart: Date): boolean {
  if (!cache) return true

  const now = new Date()
  const cacheTime = new Date(cache.timestamp)
  const threeHoursBeforeShift = new Date(shiftStart.getTime() - 3 * 60 * 60 * 1000)

  // Check if cache is older than 24 hours
  const cacheExpired = now.getTime() - cacheTime.getTime() > CONFIG.CACHE_DURATION

  // Check if we're within 3 hours of shift start and haven't refreshed today
  const isNearShiftStart = now >= threeHoursBeforeShift && now <= shiftStart
  const isSameDay = now.toDateString() === cacheTime.toDateString()

  return cacheExpired || (isNearShiftStart && !isSameDay)
}

/**
 * Fetches current location coordinates
 * @returns Promise with latitude and longitude
 */
async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  // In a real app, you would use geolocation services
  // For this example, we'll return a default location (Hanoi)
  return { lat: 21.0278, lon: 105.8342 }
}

/**
 * Fetches weather data from OpenWeatherMap API with retry logic
 * @param location Location coordinates
 * @returns Promise with weather data
 */
async function fetchWeatherWithRetry(location: { lat: number; lon: number }): Promise<WeatherData> {
  let lastError: Error | null = null
  let attemptsCount = 0
  let isPaid = await isPaidApiEnabled()

  // Try each API key with backoff delays
  while (attemptsCount < CONFIG.MAX_RETRIES) {
    try {
      // Get the appropriate API key (paid or free)
      const apiKey = isPaid ? (await getPaidApiKey()) || (await rotateApiKey()) : await rotateApiKey()

      const url = `${CONFIG.BASE_URL}?lat=${location.lat}&lon=${location.lon}&units=metric&appid=${apiKey}`

      // Add delay for retries (not for the first attempt)
      if (attemptsCount > 0) {
        await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAYS[attemptsCount - 1]))
      }

      const response = await fetch(url)

      // Handle rate limiting or API key errors
      if (response.status === 429 || response.status === 401) {
        attemptsCount++

        // If using paid key and it failed, disable it and switch to free keys
        if (isPaid) {
          console.warn("Paid API key failed, switching to free keys")
          await enablePaidApi(false)
          isPaid = false
        }

        lastError = new Error(`API key error: ${response.status} ${response.statusText}`)
        console.warn(`API key error (attempt ${attemptsCount}): ${response.status} ${response.statusText}`)
        continue // Try the next key
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      attemptsCount++
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`Weather fetch error (attempt ${attemptsCount}):`, error)
    }
  }

  // If we've exhausted all retries, throw the last error
  throw lastError || new Error("Failed to fetch weather data after multiple attempts")
}

/**
 * Saves weather data to AsyncStorage cache
 * @param data Weather data to cache
 * @param location Location coordinates
 */
async function saveWeatherCache(data: WeatherData, location: { lat: number; lon: number }): Promise<void> {
  try {
    const cache: WeatherCache = {
      data,
      timestamp: Date.now(),
      location,
    }
    await AsyncStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cache))
  } catch (error) {
    console.error("Error saving weather cache:", error)
  }
}

/**
 * Retrieves cached weather data from AsyncStorage
 * @returns Promise with cached weather data or null if not found
 */
async function getWeatherCache(): Promise<WeatherCache | null> {
  try {
    const cacheStr = await AsyncStorage.getItem(CONFIG.CACHE_KEY)
    if (!cacheStr) return null
    return JSON.parse(cacheStr) as WeatherCache
  } catch (error) {
    console.error("Error retrieving weather cache:", error)
    return null
  }
}

/**
 * Main function to get weather data, using cache when appropriate
 * @param shiftStart The start time of the shift
 * @returns Promise with weather data
 */
export async function getWeather(shiftStart: Date): Promise<WeatherData> {
  try {
    // Get current location
    const location = await getCurrentLocation()

    // Check cache
    const cache = await getWeatherCache()

    // Determine if we should use cache or fetch new data
    if (!shouldRefreshCache(cache, shiftStart)) {
      console.log("Using cached weather data")
      return cache!.data
    }

    // Fetch new weather data
    console.log("Fetching fresh weather data")
    const weatherData = await fetchWeatherWithRetry(location)

    // Save to cache
    await saveWeatherCache(weatherData, location)

    return weatherData
  } catch (error) {
    console.error("Weather service error:", error)
    throw new Error("Failed to get weather data: " + (error instanceof Error ? error.message : String(error)))
  }
}

/**
 * Clears the weather cache (useful for testing)
 */
export async function clearWeatherCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONFIG.CACHE_KEY)
  } catch (error) {
    console.error("Error clearing weather cache:", error)
  }
}

/**
 * Resets the API key rotation index (useful for testing)
 */
export async function resetApiKeyIndex(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CONFIG.API_KEY_INDEX_KEY)
  } catch (error) {
    console.error("Error resetting API key index:", error)
  }
}
