const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Multi-core parallel JS bundling for faster Metro build speeds
config.maxWorkers = 4;

module.exports = config;
