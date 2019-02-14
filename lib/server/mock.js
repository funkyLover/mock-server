const { URL } = require('url');
const { getStatus } = require('./status');

/**
 * mock中间间
 * @param {Object} ctx - koa middleware ctx
 * @param {Function} next - koa middleware nect
 */
const mockMiddleware = async (ctx, next) => {
  let {
    request: { href }
  } = ctx;
  const api = getMockConfig(`${href}`);

  if (!api) {
    return next();
  }

  const { data, header, status, delay } = getMockData(api, ctx);

  ctx.body = typeof data === 'string' ? data : JSON.stringify(data);
  ctx.status = status;
  for (const key in header) {
    ctx.set({ key: header[key] });
  }

  if (delay) {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, delay * 1000);
    });
  }
};

/**
 * 获取mock数据
 * @param {Object} url - 请求的url对象
 * @returns {Object|Function}
 */
function getMockConfig(url) {
  url = new URL(url);
  const id = `${url.host}${url.pathname === '/' ? '' : url.pathname}`;

  const { mock, mockChecked } = getStatus();

  const apis = mock[id];
  const checked = mockChecked[id];

  if (!apis || (!checked && checked !== 0)) {
    return null;
  }

  const api = apis[checked];

  if (!api) {
    return null;
  }

  return api;
}

/**
 * 获取mock数据
 * @param {Object} api - mock配置
 * @param {Object} ctx - koa ctx对象
 */
function getMockData(api, ctx) {
  let { data, header, status, delay } = api;

  if (typeof data === 'function') {
    const dataRes = data(ctx);
    data = dataRes.data;
    dataRes.header && (header = Object.assign({}, header, dataRes.header));
    dataRes.status && (status = dataRes.status);
    dataRes.delay && (delay = dataRes.delay);
  }

  return {
    data,
    header,
    status,
    delay
  };
}

module.exports = mockMiddleware;
