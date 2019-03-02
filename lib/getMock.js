const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const { resolve, extname, dirname, basename, parse } = path;
const { existsSync, statSync, readdirSync, readFileSync } = fs;

const HTTP = {
  delay: 0.2,
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
 * 获取data数据
 * @param {String} fp - datafile存放路径
 * @returns {Object}
 */
function getMockData(fp) {
  let data = {};

  const label = basename(dirname(fp));
  const ext = extname(fp);

  if (ext === '.js' || ext === '.json') {
    data = require(fp);
  } else {
    const content = readFileSync(fp, 'utf8');
    data = JSON.parse(content);
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

  if (existsSync(httpPath)) {
    let httpOpt = require(httpPath) || {};
    opt = Object.assign({}, opt, httpOpt);
    if (httpOpt.header) {
      opt.header = Object.assign({}, HTTP.header, httpOpt.header);
    }
  }

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
      recursionMock(filepath, nextid, mock, isSet);
    }

    if (filename === 'data') {
      mockid = isSet ? mockid : dirname(mockid);

      let data = getMockData(filepath);

      mock[mockid] = mock[mockid] || [];

      if (isSet) {
        mock[mockid] = data;
      } else {
        mock[mockid].push(data);
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
  mock = _.omitBy(mock, (v, k) => k.startsWith('_set/'));
  mock._proxy = getProxy(mockPath);
  mock._set = getMockSet(mockPath);
  return mock;
}

// getMock('/Users/funkyLover/Desktop/mock-server/example/simple');

module.exports = {
  getMockPath,
  isMockExist,
  getMock
};
