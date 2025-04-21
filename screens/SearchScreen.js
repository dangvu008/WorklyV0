"use client"
import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, FlatList } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useTheme, useTranslation } from "../hooks"

const SearchScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme()
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState([])

  // Theme colors
  const theme = {
    background: isDarkMode ? "#121826" : "#F2F2F7",
    card: isDarkMode ? "#1E2636" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#000000",
    textSecondary: isDarkMode ? "#A0A9BD" : "#8E8E93",
    border: isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)",
    primary: "#4A6FFF",
    inputBackground: isDarkMode ? "#2C3A59" : "#F0F0F5",
  }

  // Hàm tìm kiếm mẫu
  const handleSearch = (query) => {
    setSearchQuery(query)

    if (query.trim() === "") {
      setResults([])
      return
    }

    // Dữ liệu mẫu
    const sampleResults = [
      { id: "1", title: "Kết quả tìm kiếm 1" },
      { id: "2", title: "Kết quả tìm kiếm 2" },
      { id: "3", title: "Kết quả tìm kiếm 3" },
    ].filter((item) => item.title.toLowerCase().includes(query.toLowerCase()))

    setResults(sampleResults)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Tìm kiếm..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.resultItem, { borderBottomColor: theme.border }]}
              onPress={() => navigation.navigate("Detail", { itemId: item.id, title: item.title })}
            >
              <Text style={[styles.resultTitle, { color: theme.text }]}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {searchQuery.length > 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Không tìm thấy kết quả nào</Text>
          ) : (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nhập từ khóa để tìm kiếm</Text>
          )}
        </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    marginRight: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
  },
  resultItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  resultTitle: {
    fontSize: 16,
  },
})

export default SearchScreen
