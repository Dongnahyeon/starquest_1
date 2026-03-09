const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude cache directories from Metro bundler
config.resolver.blockList = [
  /node_modules\/react-native-css-interop\/.cache\//,
  /node_modules\/\.cache\//,
  /\.cache\//,
];

// Ensure watchFolders doesn't include cache
config.watchFolders = [
  __dirname,
];

// Disable caching for problematic modules
config.cacheStores = [];

// Apply NativeWind after cache configuration
const finalConfig = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});

module.exports = finalConfig;
