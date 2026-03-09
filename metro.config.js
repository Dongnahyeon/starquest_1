const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Critical: Prevent Metro from trying to resolve cache files
// This is the root cause of the Vercel build failure
config.resolver.blockList = [
  // Exclude all cache directories
  /\.cache\//,
  /node_modules\/\.cache\//,
  /node_modules\/react-native-css-interop\/\.cache\//,
];

// Only watch the project root, not node_modules
config.watchFolders = [__dirname];

// Disable Metro caching entirely for web builds
if (process.env.EXPO_USE_METRO_WORKSPACE_ROOT) {
  config.cacheStores = [];
}

// Apply NativeWind with minimal configuration
const finalConfig = withNativeWind(config, {
  input: "./global.css",
  forceWriteFileSystem: true,
});

module.exports = finalConfig;
