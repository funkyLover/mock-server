const { URL } = require('url');
const { getStatus } = require('./status');
const pathToRegex = require('path-to-regexp');
const _ = require('lodash');

/**
 * mock中间间
 * @param {Object} ctx - koa middleware ctx
 * @param {Function} next - koa middleware nect
 */
const mockMiddleware = async (ctx, next) => {
  let {
    request: { href },
    $mockApi
  } = ctx;

  let api = null;
  if ($mockApi) {
    $mockApi = /^(http|https):\/\//.test($mockApi)
      ? $mockApi
      : `http://${$mockApi}`;
    api = getMockConfig($mockApi, ctx);
  } else {
    api = getMockConfig(href, ctx);
  }

  if (!api) {
    if ($mockApi) {
      ctx.body = {
        code: '-1',
        msg: `not found api match request ${$mockApi}`
      };
      return;
    }

    const { mock } = getStatus();
    const proxy = mock._proxy;
    if (!proxy || !proxy[ctx.host]) {
      ctx.status = 404;
      return;
    }

    return next();
  }

  const { data, header, status, delay, selfHandle } = await getMockData(
    api,
    ctx
  );

  if (selfHandle) {
    return;
  }

  const dataType = Object.prototype.toString.call(data);
  if (dataType === '[object Uint8Array]' || dataType === '[object String]') {
    ctx.body = data;
  } else {
    ctx.body = JSON.stringify(data);
  }

  ctx.status = status;
  for (const key in header) {
    ctx.set(key, header[key]);
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
 * @param {Object} ctx - koa ctx
 * @returns {Object|Function}
 */
function getMockConfig(url, ctx) {
  url = new URL(url);
  const id = `${url.host}${url.pathname === '/' ? '' : url.pathname}`;

  const { mock, mockChecked, setChecked } = getStatus();
  const set = mock._set;
  if (set && setChecked && set[setChecked] && set[setChecked][id]) {
    const checkedSet = set[setChecked];

    const { apis } = matchPathWithRegex(checkedSet, id, ctx);
    return apis;
  }

  const { apis, mockKey } = matchPathWithRegex(mock, id, ctx);
  const checked = mockChecked[mockKey];

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
 * 使用正则匹配请求url path
 * @param {Object} mocks - mock数据
 * @param {String} id - 请求url(不带queryString)
 * @param {Object} ctx - ctx params
 */
function matchPathWithRegex(mocks, id, ctx) {
  let mockKey = '';

  const apis = _.find(mocks, (m, key) => {
    const paramsKey = [];
    const regex = pathToRegex(key, paramsKey);

    if (regex.test(id)) {
      mockKey = key;

      const matchs = regex.exec(id);
      ctx.params = {};
      _.forEach(paramsKey, function(o, i) {
        const paramKey = o.name;
        ctx.params = { ...ctx.params, [paramKey]: matchs[i + 1] };
      });

      return true;
    }
    return false;
  });

  return { apis, mockKey };
}

/**
 * 获取mock数据
 * @param {Object} api - mock配置
 * @param {Object} ctx - koa ctx对象
 */
async function getMockData(api, ctx) {
  let { data, header, status, delay } = api;
  let selfHandle = false;
  if (typeof data === 'function') {
    const dataRes = await data(ctx);
    data = dataRes.data;
    selfHandle = !!dataRes.selfHandle;
    dataRes.header && (header = Object.assign({}, header, dataRes.header));
    dataRes.status && (status = dataRes.status);
    dataRes.delay && (delay = dataRes.delay);
  }

  return {
    selfHandle,
    data,
    header,
    status,
    delay
  };
}

module.exports = {
  getMockData: getMockData,
  getMockConfig: getMockConfig,
  mockMiddleware: mockMiddleware
};
