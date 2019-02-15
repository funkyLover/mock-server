const Router = require('koa-router');
const { getStatus } = require('./status');

const router = new Router();

router
  .get('/', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    // @TODO: mock-server front-end page
    ctx.body = '<html></html>';
  })
  .get('/$mock', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const status = getStatus();

    ctx.body = {
      mock: status.mock,
      mockChecked: status.mockChecked
    };
  })
  .get('/$mock-checked', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    let {
      req: { url }
    } = ctx;

    url = new URL(url);
    console.log(url);
    // @TODO: handle check request
  });

/**
 * 请求是否来自local ip
 * @param {String} host - request host
 * @returns {Boolean}
 */
function isFromLocalIp(ctx) {
  const {
    request: {
      headers: { host }
    }
  } = ctx;
  const locals = getStatus().localIp;

  return locals.includes(host);
}

module.exports = router.routes();
