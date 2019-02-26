const tcpPortUsed = require('tcp-port-used');

/**
 * 获取一个可用的端口号
 * @param {String} port - 可用的端口号
 */
async function getPort(port) {
  port = parseInt(port);
  let isPortBusy = false;
  try {
    isPortBusy = await tcpPortUsed.check(port, '127.0.0.1');
  } catch (e) {
    return await getPort(port + 1);
  }

  if (isPortBusy) {
    return await getPort(port + 1);
  }

  return port;
}

module.exports = {
  getPort
};
