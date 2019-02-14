const koaConnect = require('koa2-connect');
const httpProxy = require('http-proxy-middleware');
const { getStatus } = require('./status');

/**
 * 代理目标服务器中间件
 * @param {Object} ctx - koa ctx
 * @param {Function} next  - koa next
 */
const proxyMiddleware = async (ctx, next) => {
  const host = getProxyHost(ctx);
  const proxy = httpProxy({ target: host, logLevel: 'silent' });

  await koaConnect(proxy)(ctx, next);
};

/**
 * 获取目标服务器具体ip/域名
 * @param {Object} ctx - koa ctx
 * @returns {String}
 */
const getProxyHost = ctx => {
  const proxyConfig = getStatus().mock._proxy || {};
  const { host, origin } = ctx;
  let proxyHost = null;

  if (proxyConfig[host]) {
    // 如果有, 直接用proxy配置的ip去请求
    proxyHost = proxyConfig[host];
  } else {
    proxyHost = origin;
  }

  return proxyHost;
};

module.exports = proxyMiddleware;
