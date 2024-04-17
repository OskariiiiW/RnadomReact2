const { getDefaultConfig } = require('expo/metro-config'); //En ole varma onko tiedosto tarpeellinen

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('db');

module.exports = defaultConfig;
