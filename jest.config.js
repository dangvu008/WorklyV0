module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  setupFilesAfterEnv: ["@testing-library/jest-native/extend-expect"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^@components/(.*)$": "<rootDir>/components/$1",
    "^@screens/(.*)$": "<rootDir>/screens/$1",
    "^@hooks/(.*)$": "<rootDir>/hooks/$1",
    "^@contexts/(.*)$": "<rootDir>/contexts/$1",
    "^@utils/(.*)$": "<rootDir>/utils/$1",
    "^@services/(.*)$": "<rootDir>/services/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
  },
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/coverage/**",
    "!**/node_modules/**",
    "!**/babel.config.js",
    "!**/jest.setup.js",
  ],
}
