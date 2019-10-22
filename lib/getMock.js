const path = require('path');
const fs = require('fs');
const { resolve, extname, dirname, basename, parse } = path;
const { existsSync, statSync, readdirSync, readFileSync } = fs;

const HTTP = {
  delay: 0,
  status: 200,
  header: {
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  }
};

/**
 * 获取mock数据存放目录
 * @param {String} _path - 输入路径
 * @returns {String} mock dir path
 */
function getMockPath(_path = '.') {
  return resolve(process.cwd(), _path);
}

/**
 * 检查mock目录是否存在
 * @param {String} _path - mock数据存放目录
 * @returns {Boolean}
 */
function isMockExist(_path) {
  return existsSync(_path) && statSync(_path).isDirectory();
}

/**
 * @typedef mock
 * @property {Object} http
 * @property {Number} http.delay - 耗时
 * @property {Object} http.header - http头
 * @property {Number} http.status - http状态码
 * @property {String} label - mock项名称
 * @property {Object|Function} data - mock数据, 或产生mock数据的方法
 */
/**
 * 获取data数据
 * @param {String} fp - datafile存放路径
 * @returns {mock}
 */
function getMockData(fp) {
  let data = {};

  const label = basename(dirname(fp));
  const ext = extname(fp);
  try {
    if (ext === '.js' || ext === '.json') {
      data = require(fp);
    } else {
      const content = readFileSync(fp, 'utf8');
      data = JSON.parse(content);
    }
  } catch (e) {
    data = {};
  }

  const http = getMockHttpExtend(fp);

  return Object.assign(http, { label, data });
}

/**
 * 获取http扩展配置
 * @param {String} fp - datafile存放路径
 * @returns {Object}
 */
function getMockHttpExtend(fp) {
  const httpPath = resolve(fp, '..', 'http.js');

  let opt = Object.assign({}, HTTP);

  try {
    if (existsSync(httpPath)) {
      let httpOpt = require(httpPath) || {};
      opt = Object.assign({}, opt, httpOpt);
      if (httpOpt.header) {
        opt.header = Object.assign({}, HTTP.header, httpOpt.header);
      }
    }
  } catch (e) {}

  return opt;
}

/**
 * 递归mock目录获取mock数据
 * @param {String} mockPath - 递归时父级目录
 * @param {String} mockid - mock数据对象id
 * @param {Object} mock - mock数据
 * @param {Boolean} isSet - 是否获取mock set数据
 * @returns {Object}
 */
function recursionMock(mockPath, mockid, mock = {}, isSet = false) {
  let files = readdirSync(mockPath);

  for (const v of files) {
    const filepath = resolve(mockPath, v);
    const isDir = statSync(filepath).isDirectory();
    const filename = isDir ? v : parse(v).name;

    if (isDir) {
      const nextid = mockid ? `${mockid}/${v}` : v;
      if (filename !== '_set' || mockid) {
        recursionMock(filepath, nextid, mock, isSet);
      }
    }

    if (filename === 'data' && !isDir) {
      mockid = isSet ? mockid : dirname(mockid);

      let data = getMockData(filepath);
      // @FIX: for windows folder name valid characters
      let url = mockid;
      try {
        url = decodeURIComponent(mockid);
      } catch (e) {
        console.log(e, mockid);
      }

      mock[url] = mock[url] || [];
      if (isSet) {
        mock[url] = data;
      } else {
        mock[url].push(data);
      }
    }
  }

  return mock;
}

/**
 * 获取host代理配置
 * @param {String} mockPath - mock数据根目录
 * @returns {Object}
 */
function getProxy(mockPath) {
  const proxyPath = path.join(mockPath, 'proxy.js');

  const isExist = existsSync(proxyPath);
  let proxy = {};

  if (!isExist) {
    return proxy;
  }

  const isDir = statSync(proxyPath).isDirectory();
  if (isDir) {
    return proxy;
  }

  try {
    proxy = require(proxyPath);
  } catch (e) {
    console.log(e);
  }

  return proxy;
}

/**
 * 获取mock set配置
 * @param {String} mockPath - mock数据根目录
 * @returns {Object}
 */
function getMockSet(mockPath) {
  const setPath = path.join(mockPath, '_set');
  const isExist = existsSync(setPath);
  let set = {};

  if (!isExist) {
    return set;
  }

  const isDir = statSync(setPath).isDirectory();
  if (!isDir) {
    return set;
  }

  let files = readdirSync(setPath);
  files.forEach(f => {
    const fp = resolve(setPath, f);
    let _set = {};
    recursionMock(fp, '', _set, true);

    set[f] = _set;
  });

  return set;
}

/**
 * 获取mock数据
 * @param {String} _path - 输入路径
 * @returns {Object}
 */
function getMock(_path) {
  const mockPath = getMockPath(_path);
  const pathExist = isMockExist(mockPath);
  let mock = {};

  if (!pathExist) {
    return mock;
  }
  mock = recursionMock(mockPath, '', mock);
  mock._proxy = getProxy(mockPath);
  mock._set = getMockSet(mockPath);
  return mock;
}

module.exports = {
  getMockPath,
  isMockExist,
  getMock
};
