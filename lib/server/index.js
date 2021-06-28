const path = require('path');
const chokidar = require('chokidar');
const Koa = require('koa');
const { getMock } = require('../getMock');
const clearCache = require('../clearCache');
const { getStatus, setStatus, resetStaus } = require('./status');
const bodyParserMiddleware = require('koa-bodyparser');
const localMiddleware = require('./local');
const { mockMiddleware } = require('./mock');
const proxyMiddleware = require('./proxy');

/**
 * 获取mock数据, 设置mock数据文件夹监听, 以及调用启动服务器方法启动服务器
 * @param {String} mockPath - mock数据存放目录
 * @param {String} port - mock服务器监听端口
 * @returns {Boolean} 是否成功启动服务器
 */
function startMock(mockPath, port) {
  let mock = getMock(mockPath);
  setStatus('mock', mock);
  setStatus('dir', path.resolve(process.cwd(), mockPath));
  // 监听mock目录变化
  watcher = chokidar.watch(mockPath, {
    ignored: '.*',
    ignoreInitial: true
  });
  setStatus('mockWatcher', watcher);

  function handlerChange(type, _path) {
    type === 'change' && clearCache(path.resolve(_path));
    mock = getMock(mockPath);
    setStatus('mock', mock);
  }

  watcher
    .on('change', _path => handlerChange('change', _path))
    .on('addDir', _path => handlerChange('add', _path))
    .on('add', _path => handlerChange('add', _path))
    .on('unlinkDir', _path => handlerChange('rm', _path))
    .on('unlink', _path => handlerChange('rm', _path));

  return startServer(port);
}

/**
 * 实际启动服务器的方法, 以及定义服务器相关处理逻辑
 * @param {String} port - 启动服务器
 * @returns {Boolean} 是否成功启动服务器
 */
function startServer(port) {
  const app = new Koa();

  app.use(bodyParserMiddleware());
  app.use(localMiddleware);
  app.use(mockMiddleware);
  app.use(proxyMiddleware);

  let server = null;
  try {
    server = app.listen(port);
  } catch (err) {
    server = null;
    console.error(err);
  }

  setStatus('server', server);
  const isServerUp = !!server;
  !isServerUp && stopServer();

  return isServerUp;
}

/**
 * 关闭mock服务器, 重置所有状态
 */
function stopServer() {
  const status = getStatus();

  status.watcher && status.watcher.close();
  status.server && status.server.close();
  resetStaus();
}

module.exports = {
  stopServer,
  startServer,
  startMock
};
