const queryString = require('querystring');
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
  if (!host) return;

  const proxy = httpProxy({
    target: host,
    logLevel: 'debug',
    secure: false, // Error occurred while trying to proxy request (CERT_HAS_EXPIRED)
    onProxyReq: (proxyReq, req, res) => {
      // @NOTE:
      // https://github.com/nodejitsu/node-http-proxy/issues/1279
      // https://github.com/chimurai/http-proxy-middleware/issues/299
      // https://github.com/nodejitsu/node-http-proxy/blob/master/examples/middleware/bodyDecoder-middleware.js
      req.body = ctx.request.body;
      if (!req.body) {
        return;
      }

      var contentType = proxyReq.getHeader('Content-Type');
      var bodyData;

      if (contentType.includes('application/json')) {
        bodyData = JSON.stringify(req.body);
      }

      if (contentType.includes('application/x-www-form-urlencoded')) {
        bodyData = queryString.stringify(req.body);
      }

      if (bodyData) {
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
    }
  });

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

  const type = Object.prototype.toString.call(proxyConfig[host]);

  if (proxyConfig[host] && type === '[object Boolean]') {
    // 如果有, 直接用proxy配置的ip去请求
    proxyHost = origin;
  } else if (proxyConfig[host] && type === '[object String]') {
    proxyHost = proxyConfig[host];
  } else {
    ctx.status = 500;
    ctx.body = `please correct the proxy config, { ${host}: true } or { ${host}: http://foo.bar }`;
  }

  return proxyHost;
};

module.exports = proxyMiddleware;
