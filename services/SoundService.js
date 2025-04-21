import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"
import * as DocumentPicker from "expo-document-picker"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Storage keys
const STORAGE_KEYS = {
  SELECTED_SOUND: "selected_sound",
  SOUND_VOLUME: "sound_volume",
  CUSTOM_SOUNDS: "custom_sounds",
}

// Default sounds
export const DEFAULT_SOUNDS = [
  {
    id: "default",
    name: "Mặc định",
    url: null, // Uses system default sound
    isDefault: true,
  },
  {
    id: "gentle_chime",
    name: "Chuông nhẹ nhàng",
    url: "https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=notification-sound-7062.mp3",
    filename: "gentle_chime.mp3",
    isDefault: true,
  },
  {
    id: "soft_bell",
    name: "Chuông êm dịu",
    url: "https://cdn.pixabay.com/download/audio/2021/08/04/audio_12b0c19614.mp3?filename=interface-124464.mp3",
    filename: "soft_bell.mp3",
    isDefault: true,
  },
  {
    id: "calm_tone",
    name: "Âm thanh bình yên",
    url: "https://cdn.pixabay.com/download/audio/2022/11/21/audio_febc508be1.mp3?filename=notification-sound-for-games-and-apps-132473.mp3",
    filename: "calm_tone.mp3",
    isDefault: true,
  },
  {
    id: "gentle_alert",
    name: "Thông báo nhẹ",
    url: "https://cdn.pixabay.com/download/audio/2022/03/15/audio_942421d0ce.mp3?filename=interface-124464.mp3",
    filename: "gentle_alert.mp3",
    isDefault: true,
  },
]

// Sound directory
const SOUND_DIRECTORY = `${FileSystem.documentDirectory}sounds/`

// Thêm hàm kiểm tra kết nối internet
export const checkInternetConnection = async () => {
  try {
    const response = await fetch("https://www.google.com", {
      method: "HEAD",
      timeout: 5000,
    })
    return response.status === 200
  } catch (error) {
    console.log("No internet connection available")
    return false
  }
}

// Cập nhật hàm initSoundService để tải trước các âm thanh mặc định
export const initSoundService = async () => {
  try {
    // Create sounds directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(SOUND_DIRECTORY)
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SOUND_DIRECTORY, { intermediates: true })
    }

    // Kiểm tra các âm thanh đã tải xuống
    const downloadedSounds = (await AsyncStorage.getItem("downloaded_sounds")) || "[]"
    const downloadedSoundIds = JSON.parse(downloadedSounds)

    // Kiểm tra kết nối internet
    const hasInternet = await checkInternetConnection()

    // Download default sounds if they don't exist
    for (const sound of DEFAULT_SOUNDS) {
      if (sound.url && sound.filename) {
        const soundPath = `${SOUND_DIRECTORY}${sound.filename}`
        const soundInfo = await FileSystem.getInfoAsync(soundPath)

        if (!soundInfo.exists && hasInternet) {
          try {
            await FileSystem.downloadAsync(sound.url, soundPath)
            console.log(`Downloaded sound: ${sound.name}`)

            // Thêm vào danh sách đã tải xuống
            if (!downloadedSoundIds.includes(sound.id)) {
              downloadedSoundIds.push(sound.id)
              await AsyncStorage.setItem("downloaded_sounds", JSON.stringify(downloadedSoundIds))
            }
          } catch (downloadError) {
            console.error(`Error downloading sound ${sound.name}:`, downloadError)
            // Không dừng quá trình nếu một âm thanh không tải được
          }
        } else if (soundInfo.exists && !downloadedSoundIds.includes(sound.id)) {
          // Nếu file tồn tại nhưng chưa được đánh dấu là đã tải
          downloadedSoundIds.push(sound.id)
          await AsyncStorage.setItem("downloaded_sounds", JSON.stringify(downloadedSoundIds))
        }
      }
    }

    return true
  } catch (error) {
    console.error("Error initializing sound service:", error)
    return false
  }
}

// Thêm hàm tải xuống âm thanh cụ thể
export const downloadSound = async (soundId) => {
  try {
    const sound = DEFAULT_SOUNDS.find((s) => s.id === soundId)
    if (!sound || !sound.url) {
      throw new Error("Âm thanh không hợp lệ hoặc không có URL")
    }

    // Kiểm tra kết nối internet
    const hasInternet = await checkInternetConnection()
    if (!hasInternet) {
      throw new Error("Không có kết nối internet. Vui lòng thử lại sau.")
    }

    const soundPath = `${SOUND_DIRECTORY}${sound.filename}`

    // Tải xuống âm thanh
    await FileSystem.downloadAsync(sound.url, soundPath)

    // Cập nhật danh sách đã tải xuống
    const downloadedSounds = (await AsyncStorage.getItem("downloaded_sounds")) || "[]"
    const downloadedSoundIds = JSON.parse(downloadedSounds)

    if (!downloadedSoundIds.includes(sound.id)) {
      downloadedSoundIds.push(sound.id)
      await AsyncStorage.setItem("downloaded_sounds", JSON.stringify(downloadedSoundIds))
    }

    return true
  } catch (error) {
    console.error("Error downloading sound:", error)
    throw error
  }
}

// Thêm hàm kiểm tra âm thanh đã tải xuống chưa
export const isSoundDownloaded = async (soundId) => {
  try {
    // Kiểm tra trong danh sách đã tải xuống
    const downloadedSounds = (await AsyncStorage.getItem("downloaded_sounds")) || "[]"
    const downloadedSoundIds = JSON.parse(downloadedSounds)

    if (downloadedSoundIds.includes(soundId)) {
      // Kiểm tra file có tồn tại không
      const sound = DEFAULT_SOUNDS.find((s) => s.id === soundId)
      if (sound) {
        const soundPath = `${SOUND_DIRECTORY}${sound.filename}`
        const soundInfo = await FileSystem.getInfoAsync(soundPath)
        return soundInfo.exists
      }
    }

    return false
  } catch (error) {
    console.error("Error checking downloaded sound:", error)
    return false
  }
}

// Thêm hàm xóa âm thanh đã tải xuống
export const deleteDownloadedSound = async (soundId) => {
  try {
    const sound = DEFAULT_SOUNDS.find((s) => s.id === soundId)
    if (!sound) return false

    const soundPath = `${SOUND_DIRECTORY}${sound.filename}`

    // Xóa file
    const soundInfo = await FileSystem.getInfoAsync(soundPath)
    if (soundInfo.exists) {
      await FileSystem.deleteAsync(soundPath)
    }

    // Cập nhật danh sách đã tải xuống
    const downloadedSounds = (await AsyncStorage.getItem("downloaded_sounds")) || "[]"
    let downloadedSoundIds = JSON.parse(downloadedSounds)
    downloadedSoundIds = downloadedSoundIds.filter((id) => id !== soundId)
    await AsyncStorage.setItem("downloaded_sounds", JSON.stringify(downloadedSoundIds))

    return true
  } catch (error) {
    console.error("Error deleting downloaded sound:", error)
    return false
  }
}

// Thêm hàm lấy danh sách âm thanh đã tải xuống
export const getDownloadedSounds = async () => {
  try {
    const downloadedSounds = (await AsyncStorage.getItem("downloaded_sounds")) || "[]"
    const downloadedSoundIds = JSON.parse(downloadedSounds)

    // Lọc các âm thanh mặc định đã tải xuống
    const sounds = DEFAULT_SOUNDS.filter((sound) => downloadedSoundIds.includes(sound.id))

    return sounds
  } catch (error) {
    console.error("Error getting downloaded sounds:", error)
    return []
  }
}

/**
 * Get all sounds (default + custom)
 */
export const getAllSounds = async () => {
  try {
    // Get custom sounds
    const customSounds = await getCustomSounds()

    // Combine default and custom sounds
    return [...DEFAULT_SOUNDS, ...customSounds]
  } catch (error) {
    console.error("Error getting all sounds:", error)
    return DEFAULT_SOUNDS
  }
}

/**
 * Get custom sounds
 */
export const getCustomSounds = async () => {
  try {
    const customSoundsData = await AsyncStorage.getItem(STORAGE_KEYS.CUSTOM_SOUNDS)
    return customSoundsData ? JSON.parse(customSoundsData) : []
  } catch (error) {
    console.error("Error getting custom sounds:", error)
    return []
  }
}

/**
 * Save custom sounds
 */
export const saveCustomSounds = async (customSounds) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.CUSTOM_SOUNDS, JSON.stringify(customSounds))
    return true
  } catch (error) {
    console.error("Error saving custom sounds:", error)
    return false
  }
}

/**
 * Add custom sound
 */
export const addCustomSound = async () => {
  try {
    // Pick audio file
    const result = await DocumentPicker.getDocumentAsync({
      type: "audio/*",
      copyToCacheDirectory: true,
    })

    if (result.canceled) {
      return null
    }

    const file = result.assets[0]

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      throw new Error("File quá lớn. Vui lòng chọn file nhỏ hơn 2MB.")
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const timestamp = Date.now()
    const filename = `custom_${timestamp}.${fileExt}`
    const soundPath = `${SOUND_DIRECTORY}${filename}`

    // Copy file to app directory
    await FileSystem.copyAsync({
      from: file.uri,
      to: soundPath,
    })

    // Create sound object
    const newSound = {
      id: `custom_${timestamp}`,
      name: file.name.replace(`.${fileExt}`, ""),
      filename: filename,
      isCustom: true,
    }

    // Add to custom sounds list
    const customSounds = await getCustomSounds()
    const updatedCustomSounds = [...customSounds, newSound]
    await saveCustomSounds(updatedCustomSounds)

    return newSound
  } catch (error) {
    console.error("Error adding custom sound:", error)
    throw error
  }
}

/**
 * Delete custom sound
 */
export const deleteCustomSound = async (soundId) => {
  try {
    // Get custom sounds
    const customSounds = await getCustomSounds()
    const soundToDelete = customSounds.find((sound) => sound.id === soundId)

    if (!soundToDelete) {
      return false
    }

    // Delete file
    const soundPath = `${SOUND_DIRECTORY}${soundToDelete.filename}`
    await FileSystem.deleteAsync(soundPath, { idempotent: true })

    // Remove from custom sounds list
    const updatedCustomSounds = customSounds.filter((sound) => sound.id !== soundId)
    await saveCustomSounds(updatedCustomSounds)

    // If this was the selected sound, reset to default
    const selectedSound = await getSelectedSound()
    if (selectedSound.id === soundId) {
      await setSelectedSound("default")
    }

    return true
  } catch (error) {
    console.error("Error deleting custom sound:", error)
    return false
  }
}

/**
 * Rename custom sound
 */
export const renameCustomSound = async (soundId, newName) => {
  try {
    // Get custom sounds
    const customSounds = await getCustomSounds()
    const soundIndex = customSounds.findIndex((sound) => sound.id === soundId)

    if (soundIndex === -1) {
      return false
    }

    // Update name
    const updatedCustomSounds = [...customSounds]
    updatedCustomSounds[soundIndex] = {
      ...updatedCustomSounds[soundIndex],
      name: newName,
    }

    await saveCustomSounds(updatedCustomSounds)
    return true
  } catch (error) {
    console.error("Error renaming custom sound:", error)
    return false
  }
}

/**
 * Get selected sound
 */
export const getSelectedSound = async () => {
  try {
    const selectedSoundId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_SOUND)
    if (!selectedSoundId) return DEFAULT_SOUNDS[0] // Default sound

    // Get all sounds
    const allSounds = await getAllSounds()
    const selectedSound = allSounds.find((sound) => sound.id === selectedSoundId)
    return selectedSound || DEFAULT_SOUNDS[0]
  } catch (error) {
    console.error("Error getting selected sound:", error)
    return DEFAULT_SOUNDS[0]
  }
}

/**
 * Set selected sound
 */
export const setSelectedSound = async (soundId) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_SOUND, soundId)
    return true
  } catch (error) {
    console.error("Error setting selected sound:", error)
    return false
  }
}

/**
 * Get sound volume
 */
export const getSoundVolume = async () => {
  try {
    const volume = await AsyncStorage.getItem(STORAGE_KEYS.SOUND_VOLUME)
    return volume ? Number.parseFloat(volume) : 1.0 // Default to full volume
  } catch (error) {
    console.error("Error getting sound volume:", error)
    return 1.0
  }
}

/**
 * Set sound volume
 */
export const setSoundVolume = async (volume) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SOUND_VOLUME, volume.toString())
    return true
  } catch (error) {
    console.error("Error setting sound volume:", error)
    return false
  }
}

// Cập nhật hàm playSound để xử lý lỗi phát âm thanh
export const playSound = async (soundId = null) => {
  try {
    // If no sound ID is provided, use the selected sound
    const allSounds = await getAllSounds()
    const sound = soundId ? allSounds.find((s) => s.id === soundId) : await getSelectedSound()

    if (!sound) return false

    // If it's the default sound, don't play anything (system will handle it)
    if (sound.id === "default") return true

    // Get volume
    const volume = await getSoundVolume()

    // Load and play sound
    const soundPath = `${SOUND_DIRECTORY}${sound.filename}`

    // Kiểm tra xem file âm thanh có tồn tại không
    const soundExists = await FileSystem.getInfoAsync(soundPath)
    if (!soundExists.exists) {
      console.error(`Sound file not found: ${soundPath}`)
      return false
    }

    try {
      const { sound: audioSound } = await Audio.Sound.createAsync({ uri: soundPath }, { volume })

      await audioSound.playAsync()

      // Unload sound after playing
      audioSound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          audioSound.unloadAsync()
        }
      })

      return true
    } catch (playError) {
      console.error("Error playing sound:", playError)
      return false
    }
  } catch (error) {
    console.error("Error in playSound function:", error)
    return false
  }
}

/**
 * Get sound file URI for notifications
 */
export const getSoundFileUri = async () => {
  try {
    const selectedSound = await getSelectedSound()

    // If it's the default sound, return null (system will use default)
    if (selectedSound.id === "default") return null

    return `${SOUND_DIRECTORY}${selectedSound.filename}`
  } catch (error) {
    console.error("Error getting sound file URI:", error)
    return null
  }
}

/**
 * Preview sound
 */
export const previewSound = async (soundId) => {
  return await playSound(soundId)
}
