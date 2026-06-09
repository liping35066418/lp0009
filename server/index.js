const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config');
const logger = require('./logger');

const app = express();
const PORT = config.server.port;
const HOST = config.server.host;

const screenshotsDir = path.resolve(__dirname, '..', config.paths.screenshots);
const publicDir = path.resolve(__dirname, '..', config.paths.public);

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

app.use(cors({
  origin: ['http://localhost:3000', `http://localhost:${PORT}`],
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(express.static(publicDir));

app.get('/api/config', (req, res) => {
  logger.info('客户端请求配置信息');
  res.json({
    defaultSpaceWidth: config.app.defaultSpaceWidth,
    defaultSpaceDepth: config.app.defaultSpaceDepth,
    maxModelCount: config.app.maxModelCount
  });
});

app.post('/api/screenshot', (req, res) => {
  try {
    const { image, name } = req.body;

    if (!image) {
      logger.warn('截图请求缺少image数据');
      return res.status(400).json({ error: '缺少截图数据' });
    }

    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    const timestamp = Date.now();
    const fileName = `${name || 'screenshot'}_${timestamp}.png`;
    const filePath = path.join(screenshotsDir, fileName);

    fs.writeFile(filePath, base64Data, 'base64', (err) => {
      if (err) {
        logger.error('保存截图失败:', err);
        return res.status(500).json({ error: '保存截图失败' });
      }

      logger.info(`截图保存成功: ${fileName}`);
      res.json({
        success: true,
        fileName,
        filePath,
        url: `/screenshots/${fileName}`
      });
    });
  } catch (error) {
    logger.error('截图接口出错:', error);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

app.get('/api/screenshots', (req, res) => {
  try {
    if (!fs.existsSync(screenshotsDir)) {
      return res.json([]);
    }

    const files = fs.readdirSync(screenshotsDir)
      .filter(file => file.endsWith('.png'))
      .map(file => ({
        name: file,
        url: `/screenshots/${file}`,
        created: fs.statSync(path.join(screenshotsDir, file)).ctime
      }))
      .sort((a, b) => b.created - a.created);

    logger.info(`获取截图列表，共 ${files.length} 张`);
    res.json(files);
  } catch (error) {
    logger.error('获取截图列表失败:', error);
    res.status(500).json({ error: '获取截图列表失败' });
  }
});

app.use('/screenshots', express.static(screenshotsDir));

app.get('*', (req, res, next) => {
  const indexPath = path.join(publicDir, 'index.html');
  if (fs.existsSync(indexPath) && !req.path.startsWith('/api/') && !req.path.startsWith('/screenshots/')) {
    res.sendFile(indexPath);
  } else {
    next();
  }
});

app.listen(PORT, HOST, () => {
  logger.info(`======================================`);
  logger.info(`  3D庭院设计服务已启动`);
  logger.info(`  地址: http://${HOST}:${PORT}`);
  logger.info(`  仅限本机访问`);
  logger.info(`  日志目录: ${config.paths.logs}`);
  logger.info(`  截图目录: ${config.paths.screenshots}`);
  logger.info(`======================================`);
});

module.exports = app;
