const URL = require('url').URL;
const httpProxy = require('http-proxy');

/**
 * proxy to target server
 * @param {Object} ctx - koa ctx object
 * @param {Object} ctx.req - koa ctx.req object
 * @param {Object} ctx.res - koa ctx.res object
 *
 * @typedef res
 * @property {Object} header - res http header
 * @property {Number} status - res http status code
 * @property {Object<Buffer>} data - res data
 *
 * @returns {Promise<res>}
 */
async function proxy(ctx, opt = {}) {
  const { req, res } = ctx;
  let { url, ip, pfx, passphrase, port } = opt;

  const agent = httpProxy.createServer({
    secure: false // @NOTE: risk?
  });

  if (!url) {
    return {
      data: 'url is required when proxy to target server!'
    };
  }
  const config = {};

  try {
    url = new URL(url);
    config.host = ip || url.host;
    config.protocol = url.protocol;
    config.hostname = url.host;

    port && (config.port = port);
    pfx && (config.pfx = pfx);
    passphrase && (config.passphrase = passphrase);
  } catch (err) {
    return {
      data: err
    };
  }

  agent.web(req, res, {
    target: config,
    selfHandleResponse: true
  });

  agent.once('proxyReq', async function(proxyReq, req, res, options) {
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
  });

  return new Promise((resolve, reject) => {
    agent.once('proxyRes', function(proxyRes, req, res) {
      let body = [];
      let size = 0;
      function onData(chunk) {
        body.push(chunk);
        size += chunk.length;
      }
      // proxyRes.setEncoding('utf8');
      proxyRes.on('data', onData).once('end', () => {
        proxyRes.off('data', onData);
        body = Buffer.concat(body, size);
        resolve({
          header: proxyRes.headers,
          data: body,
          status: proxyRes.statusCode
        });
      });
    });
  });
}

module.exports = proxy;
