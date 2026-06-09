const path = require('path');
const fs = require('fs');
const config = require('./config');

const logsDir = path.resolve(__dirname, '..', config.paths.logs);

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

function formatMessage(level, message, meta) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const metaStr = meta && Object.keys(meta).length
    ? ' ' + JSON.stringify(meta)
    : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}\n`;
}

function appendToFile(filename, data) {
  try {
    const filePath = path.join(logsDir, filename);
    fs.appendFileSync(filePath, data, 'utf-8');
  } catch (err) {
    console.error('日志写入失败:', err.message);
  }
}

const logger = {
  info: (message, meta) => {
    const msg = formatMessage('info', message, meta);
    console.log(msg.trim());
    appendToFile('combined.log', msg);
  },
  warn: (message, meta) => {
    const msg = formatMessage('warn', message, meta);
    console.warn(msg.trim());
    appendToFile('combined.log', msg);
  },
  error: (message, meta) => {
    const msg = formatMessage('error', message, meta);
    console.error(msg.trim());
    appendToFile('error.log', msg);
    appendToFile('combined.log', msg);
  },
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      const msg = formatMessage('debug', message, meta);
      console.debug(msg.trim());
    }
  }
};

module.exports = logger;
