module.exports = (api) => {
  api.cache(true)
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [".ios.js", ".android.js", ".js", ".ts", ".tsx", ".json"],
          alias: {
            "@": "./",
            "@components": "./components",
            "@screens": "./screens",
            "@hooks": "./hooks",
            "@contexts": "./contexts",
            "@utils": "./utils",
            "@services": "./services",
            "@assets": "./assets",
          },
        },
      ],
    ],
  }
}
