const Router = require('koa-router');
const { getStatus, setStatus } = require('./status');
const send = require('koa-send');
const resolve = require('path').resolve;
const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');

const template = path.resolve(__dirname, '../template');

const router = new Router();

router
  .get(/^\/view(?:\/|$)/, async (ctx, next) => {
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
      mockChecked: status.mockChecked,
      setChecked: status.setChecked
    };
  })
  .get('/$mock-check', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const { request: req } = ctx;
    let { id, index } = req.query;

    index = parseInt(index);
    if (!id || (!index && index !== 0)) {
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
  .get('/$set-check', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const { request: req } = ctx;
    let { id } = req.query;

    if (!id) {
      ctx.body = {
        code: '-1',
        msg: 'params error'
      };
      return;
    }
    id = id === '-1' ? null : id;
    setStatus('setChecked', id);

    ctx.body = {
      code: '0',
      msg: 'ok'
    };
  })
  .get('/$create', (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const { request: req } = ctx;
    let { type } = req.query;
    let res = null;
    try {
      res = copyTemplate(type);
    } catch (e) {
      console.error(e);
      ctx.body = {
        code: '-1',
        msg: e.message
      };
      return;
    }

    ctx.body = res || {
      code: '0',
      msg: 'ok'
    };
  })
  .all('/$mock-api', async (ctx, next) => {
    if (!isFromLocalIp(ctx)) {
      return next();
    }

    const api = ctx.query['api'];
    if (!api) {
      ctx.body = {
        code: '-1',
        msg:
          'please request with query[api], such as 127.0.0.1/$mock-api?api=api.mock.com/target/mock'
      };
      return;
    }

    ctx.$mockApi = api;
    return next();
  })
  .all('/*', async (ctx, next) => {
    if (!isFromLocalIp(ctx) || ctx.$mockApi) {
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

function copyTemplate(type) {
  const { dir, mock } = getStatus();
  let name = 'api.mock.com';

  if (type === 'proxy') {
    name = 'proxy.js';
  } else if (type === 'set') {
    name = '_set';
  }

  const data = mock[`_${type}`];
  if (type && data && !_.isEmpty(data)) {
    return {
      code: '-1',
      msg: `${type} is not empty, please extend config with code editor.`
    };
  }

  fs.copySync(path.join(template, name), path.join(dir, name));
}

module.exports = router.routes();
