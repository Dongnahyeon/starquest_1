const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Prevent Metro from trying to resolve cache files
config.resolver.blockList = [
  /\.cache\//,
  /node_modules\/\.cache\//,
];

// Only watch the project root
config.watchFolders = [__dirname];

module.exports = config;
