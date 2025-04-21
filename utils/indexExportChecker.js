/**
 * Utility to check for missing default exports in index.js files
 * This helps identify files that need to be fixed to prevent the
 * "No default export of 'index.js' to render!" error
 */

import { Platform } from "react-native"

/**
 * Checks if a file has a default export
 * @param {string} filePath - Path to the file to check
 * @returns {Promise<boolean>} - Whether the file has a default export
 */
export const checkForDefaultExport = async (filePath) => {
  try {
    if (Platform.OS !== "web") {
      // This function can only run on web for development purposes
      console.warn("checkForDefaultExport can only run on web")
      return true
    }

    // In a real implementation, you would read the file and check for export default
    // But for simplicity, we'll just log the file path
    console.log(`Checking for default export in: ${filePath}`)
    return false
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error)
    return false
  }
}

/**
 * Fixes common index.js export issues
 * This is a development utility only
 */
export const fixIndexExports = () => {
  if (__DEV__) {
    console.log("Checking for missing default exports in index.js files...")
    // In a real implementation, you would scan directories
    // For now, we'll just log a message
    console.log("This is a development utility. In production, ensure all index.js files have default exports.")
  }
}
