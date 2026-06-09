const path = require('path');
const fs = require('fs');

const localConfigPath = path.resolve(__dirname, '../config.local.json');
const defaultConfigPath = path.resolve(__dirname, '../config.default.json');

function loadConfig() {
  let config = {};

  if (fs.existsSync(defaultConfigPath)) {
    config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
  }

  if (fs.existsSync(localConfigPath)) {
    const localConfig = JSON.parse(fs.readFileSync(localConfigPath, 'utf-8'));
    config = deepMerge(config, localConfig);
  }

  return config;
}

function deepMerge(target, source) {
  const result = { ...target };
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

module.exports = loadConfig();
