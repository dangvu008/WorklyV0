"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Slider,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation } from "../hooks"
import { SoundService } from "../services"

const SoundSettingsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()

  const [sounds, setSounds] = useState([])
  const [selectedSoundId, setSelectedSoundId] = useState("default")
  const [volume, setVolume] = useState(1.0)
  const [isLoading, setIsLoading] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [soundToRename, setSoundToRename] = useState(null)
  const [newSoundName, setNewSoundName] = useState("")

  // Thêm state để theo dõi trạng thái tải xuống
  const [downloadingSoundId, setDownloadingSoundId] = useState(null)
  const [downloadedSoundIds, setDownloadedSoundIds] = useState([])

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    danger: "#FF3B30",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
  }

  // Load settings
  useEffect(() => {
    loadSettings()
  }, [])

  // Thêm useEffect để tải danh sách âm thanh đã tải xuống
  useEffect(() => {
    const checkDownloadedSounds = async () => {
      try {
        const downloadedSounds = await SoundService.getDownloadedSounds()
        setDownloadedSoundIds(downloadedSounds.map((sound) => sound.id))
      } catch (error) {
        console.error("Error checking downloaded sounds:", error)
      }
    }

    checkDownloadedSounds()
  }, [])

  // Cập nhật hàm loadSettings để xử lý lỗi
  const loadSettings = async () => {
    try {
      setIsLoading(true)

      // Initialize sound service
      await SoundService.initSoundService()

      // Get all sounds
      const allSounds = await SoundService.getAllSounds()
      setSounds(allSounds)

      // Get selected sound
      const selectedSound = await SoundService.getSelectedSound()
      setSelectedSoundId(selectedSound.id)

      // Get volume
      const savedVolume = await SoundService.getSoundVolume()
      setVolume(savedVolume)
    } catch (error) {
      console.error("Error loading sound settings:", error)
      Alert.alert("Lỗi cài đặt âm thanh", "Không thể tải cài đặt âm thanh. Vui lòng thử lại sau.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle sound selection
  const handleSelectSound = async (soundId) => {
    setSelectedSoundId(soundId)
    await SoundService.setSelectedSound(soundId)
  }

  // Handle volume change
  const handleVolumeChange = async (value) => {
    setVolume(value)
    await SoundService.setSoundVolume(value)
  }

  // Preview sound
  const handlePreviewSound = async (soundId) => {
    if (isPlaying) return

    setIsPlaying(true)
    const success = await SoundService.previewSound(soundId)

    if (!success) {
      Alert.alert("Lỗi phát âm thanh", "Không thể phát âm thanh này. Vui lòng thử lại hoặc chọn âm thanh khác.")
    }

    setTimeout(() => setIsPlaying(false), 1000) // Prevent rapid tapping
  }

  // Upload custom sound
  const handleUploadSound = async () => {
    try {
      setIsUploading(true)
      const newSound = await SoundService.addCustomSound()

      if (newSound) {
        // Refresh sounds list
        const allSounds = await SoundService.getAllSounds()
        setSounds(allSounds)

        // Select the new sound
        setSelectedSoundId(newSound.id)
        await SoundService.setSelectedSound(newSound.id)

        // Preview the new sound
        await SoundService.previewSound(newSound.id)
      }
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tải lên âm thanh")
    } finally {
      setIsUploading(false)
    }
  }

  // Delete custom sound
  const handleDeleteSound = async (sound) => {
    if (!sound.isCustom) return

    Alert.alert("Xóa âm thanh", `Bạn có chắc chắn muốn xóa âm thanh "${sound.name}"?`, [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await SoundService.deleteCustomSound(sound.id)

            // Refresh sounds list
            const allSounds = await SoundService.getAllSounds()
            setSounds(allSounds)

            // If this was the selected sound, update UI
            if (selectedSoundId === sound.id) {
              setSelectedSoundId("default")
            }
          } catch (error) {
            Alert.alert("Lỗi", "Không thể xóa âm thanh")
          }
        },
      },
    ])
  }

  // Rename custom sound
  const handleRenameSound = (sound) => {
    if (!sound.isCustom) return

    setSoundToRename(sound)
    setNewSoundName(sound.name)
    setIsRenaming(true)
  }

  // Save renamed sound
  const handleSaveRename = async () => {
    if (!soundToRename || !newSoundName.trim()) {
      setIsRenaming(false)
      return
    }

    try {
      await SoundService.renameCustomSound(soundToRename.id, newSoundName.trim())

      // Refresh sounds list
      const allSounds = await SoundService.getAllSounds()
      setSounds(allSounds)

      setIsRenaming(false)
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đổi tên âm thanh")
    }
  }

  // Thêm hàm tải xuống âm thanh
  const handleDownloadSound = async (soundId) => {
    if (downloadingSoundId) return // Đang tải xuống âm thanh khác

    try {
      setDownloadingSoundId(soundId)
      await SoundService.downloadSound(soundId)

      // Cập nhật danh sách đã tải xuống
      setDownloadedSoundIds((prev) => [...prev, soundId])

      Alert.alert("Thành công", "Đã tải xuống âm thanh thành công")
    } catch (error) {
      Alert.alert("Lỗi", error.message || "Không thể tải xuống âm thanh")
    } finally {
      setDownloadingSoundId(null)
    }
  }

  // Thêm hàm xóa âm thanh đã tải xuống
  const handleDeleteDownloadedSound = async (soundId) => {
    try {
      await SoundService.deleteDownloadedSound(soundId)

      // Cập nhật danh sách đã tải xuống
      setDownloadedSoundIds((prev) => prev.filter((id) => id !== soundId))

      Alert.alert("Thành công", "Đã xóa âm thanh đã tải xuống")
    } catch (error) {
      Alert.alert("Lỗi", "Không thể xóa âm thanh đã tải xuống")
    }
  }

  // Cập nhật renderSoundItem để hiển thị trạng thái tải xuống
  const renderSoundItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.soundItem,
        selectedSoundId === item.id && { backgroundColor: `${theme.primary}20` },
        { borderBottomColor: theme.border },
      ]}
      onPress={() => handleSelectSound(item.id)}
    >
      <View style={styles.soundInfo}>
        <Text style={[styles.soundName, { color: theme.text }]}>{item.name}</Text>
        {item.isCustom && <Text style={[styles.customBadge, { color: theme.primary }]}>Tùy chỉnh</Text>}
        {downloadedSoundIds.includes(item.id) && !item.isCustom && (
          <Text style={[styles.customBadge, { color: theme.success || "#4CD964" }]}>Đã tải xuống</Text>
        )}
      </View>

      <View style={styles.soundActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
          onPress={() => handlePreviewSound(item.id)}
          disabled={isPlaying}
        >
          <Ionicons name={isPlaying ? "volume-mute" : "volume-medium"} size={18} color={theme.primary} />
        </TouchableOpacity>

        {!item.isCustom &&
          item.id !== "default" &&
          (downloadedSoundIds.includes(item.id) ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => handleDeleteDownloadedSound(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => handleDownloadSound(item.id)}
              disabled={downloadingSoundId === item.id}
            >
              {downloadingSoundId === item.id ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <Ionicons name="download-outline" size={18} color={theme.primary} />
              )}
            </TouchableOpacity>
          ))}

        {item.isCustom && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => handleRenameSound(item)}
            >
              <Ionicons name="pencil" size={18} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.inputBackground }]}
              onPress={() => handleDeleteSound(item)}
            >
              <Ionicons name="trash-outline" size={18} color={theme.danger} />
            </TouchableOpacity>
          </>
        )}

        {selectedSoundId === item.id && <Ionicons name="checkmark-circle" size={22} color={theme.primary} />}
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Cài đặt âm thanh</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Đang tải âm thanh...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cài đặt âm thanh</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        {/* Volume Control */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Âm lượng</Text>

          <View style={styles.volumeContainer}>
            <Ionicons name="volume-low" size={22} color={theme.textSecondary} />
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={handleVolumeChange}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <Ionicons name="volume-high" size={22} color={theme.textSecondary} />
          </View>
        </View>

        {/* Sound Selection */}
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Âm thanh thông báo</Text>
            <TouchableOpacity
              style={[styles.uploadButton, { backgroundColor: theme.primary }]}
              onPress={handleUploadSound}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="add" size={18} color="#FFFFFF" style={styles.uploadIcon} />
                  <Text style={styles.uploadText}>Tải lên</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <FlatList
            data={sounds}
            renderItem={renderSoundItem}
            keyExtractor={(item) => item.id}
            style={styles.soundsList}
          />

          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Âm thanh sẽ được áp dụng cho tất cả thông báo và báo thức trong ứng dụng.
          </Text>
        </View>

        {/* Thêm phần thông tin về tải xuống âm thanh */}
        {/* Thêm vào sau phần "Sound Selection" */}
        <View style={[styles.section, { backgroundColor: theme.card, marginTop: 16 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Âm thanh ngoại tuyến</Text>
          <Text style={[styles.noteText, { color: theme.textSecondary }]}>
            Tải xuống âm thanh để sử dụng khi không có kết nối internet. Các âm thanh đã tải xuống sẽ được đánh dấu "Đã
            tải xuống".
          </Text>
          <Text style={[styles.noteText, { color: theme.textSecondary, marginTop: 8 }]}>
            Nhấn vào biểu tượng tải xuống để lưu âm thanh vào thiết bị.
          </Text>
        </View>
      </View>

      {/* Rename Sound Modal */}
      <Modal visible={isRenaming} transparent={true} animationType="fade" onRequestClose={() => setIsRenaming(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Đổi tên âm thanh</Text>

            <TextInput
              style={[
                styles.renameInput,
                {
                  color: theme.text,
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.border,
                },
              ]}
              value={newSoundName}
              onChangeText={setNewSoundName}
              placeholder="Nhập tên mới"
              placeholderTextColor={theme.textSecondary}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { borderColor: theme.border }]}
                onPress={() => setIsRenaming(false)}
              >
                <Text style={[styles.modalButtonText, { color: theme.text }]}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveRename}
              >
                <Text style={styles.modalButtonTextPrimary}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  uploadIcon: {
    marginRight: 4,
  },
  uploadText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  volumeSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  soundsList: {
    maxHeight: 400,
  },
  soundItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  soundInfo: {
    flex: 1,
  },
  soundName: {
    fontSize: 16,
  },
  customBadge: {
    fontSize: 12,
    marginTop: 4,
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    fontStyle: "italic",
    padding: 16,
    paddingTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  renameInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 1,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtonTextPrimary: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
})

export default SoundSettingsScreen
