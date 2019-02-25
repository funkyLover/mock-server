const Router = require('koa-router');
const { getStatus, setStatus } = require('./status');
const send = require('koa-send');
const resolve = require('path').resolve;

const router = new Router();

router
  .get('/view', async (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    await send(ctx, 'fe/dist/index.html', {
      root: resolve(__dirname, '../..')
    });
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
  .get('/$mock-check', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const { request: req } = ctx;

    let { id, index } = req.query;

    index = parseInt(index);
    if (!id || index < 0) {
      ctx.body = {
        code: '-1',
        msg: 'params error'
      };
      return;
    }

    const { mockChecked } = getStatus();
    let update = { [id]: index };

    if (mockChecked[id] === index) {
      update = { [id]: -1 };
    }

    setStatus('mockChecked', {
      ...mockChecked,
      ...update
    });

    ctx.body = {
      code: '0',
      msg: 'ok'
    };
  })
  .all('/*', async (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    await send(ctx, ctx.path, {
      root: resolve(__dirname, '../..')
    });
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
