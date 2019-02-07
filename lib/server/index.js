const chokidar = require('chokidar');
const Koa = require('koa');
const { getMock } = require('../getMock');
const mockMiddleware = require('./mock');
const proxyMiddleware = require('./proxy');

let server = null;
let mock = {};
let mockChecked = {};
let mockWatcher = null;

/**
 * 获取所有mock server数据
 */
function getStatus() {
  return {
    mock,
    mockChecked,
    server,
    mockWatcher
  };
}

/**
 * 获取mock数据, 设置mock数据文件夹监听, 以及调用启动服务器方法启动服务器
 * @param {String} mockPath - mock数据存放目录
 * @param {String} port - mock服务器监听端口
 * @returns {Boolean} 是否成功启动服务器
 */
function startMock(mockPath, port) {
  mock = getMock(mockPath);

  // 监听mock目录变化
  watcher = chokidar.watch(mockPath);
  watcher.on('change', path => {
    // 清除require缓存
    delete require.cache[path];
    mock = getMock(mockPath);
  });

  return startServer(port);
}

/**
 * 实际启动服务器的方法, 以及定义服务器相关处理逻辑
 * @param {String} port - 启动服务器
 * @returns {Boolean} 是否成功启动服务器
 */
function startServer(port) {
  const app = new Koa();

  app.use(mockMiddleware);
  app.use(proxyMiddleware);

  try {
    server = app.listen(port);
  } catch (err) {
    server = null;
    console.error(err);
  }

  const isServerUp = !!server;
  !isServerUp && stopServer();

  return isServerUp;
}

/**
 * 关闭mock服务器, 重置所有状态
 */
function stopServer() {
  watcher && watcher.close();
  server && server.close();
  watcher = null;
  server = null;
  mock = {};
  mockChecked = {};
  mockWatcher = null;
}

module.exports = {
  stopServer,
  startServer,
  startMock,
  getStatus
};
