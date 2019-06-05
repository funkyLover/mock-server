const path = require('path');
const fs = require('fs-extra');

let defaultStatus = {
  dir: '',
  server: null,
  mock: {}, // { ...mockApi, _set. _proxy }
  mockChecked: {},
  mockWatcher: null,
  localIp: [],
  setChecked: null
};

let status = { ...defaultStatus };

/** 服务退出时主动记录勾选状态 */
process.on('exit', () => recordChecked());
process.on('SIGINT', () => process.exit());

/**
 * 获取所有mock server数据
 */
function getStatus() {
  return status;
}

/**
 * 设置mock server数据
 * @param {String} key - status key
 * @param {Object} val - status val
 */
function setStatus(key, val) {
  status[key] = val;

  if (key === 'dir') {
    reproduceCheckedStatus(val);
  }
}

function resetStaus() {
  status = { ...defaultStatus };
}

/**
 * 设置勾选状态
 * @param {String} dir - mock dir path
 */
function reproduceCheckedStatus(dir) {
  const checkFile = path.resolve(dir, '_checked.js');
  if (!fs.existsSync(checkFile)) {
    return;
  }

  try {
    const checked = require(checkFile);
    status.mockChecked = checked.mockChecked || {};
    status.setChecked = checked.setChecked || null;
  } catch (e) {}
}

/**
 * 记录勾选状态, 用于重启服务时恢复上次使用时的勾选状态
 */
function recordChecked() {
  const { setChecked, mockChecked, dir } = getStatus();
  const checkFile = path.resolve(dir, '_checked.js');
  const content = `
    /**
     * file to record checked status when exit mock server
     * can be deleted if not needed
     * should ignored from git
     */
    module.exports = {
      mockChecked: ${JSON.stringify(mockChecked)},
      setChecked: ${setChecked ? `'${setChecked}'` : 'null'}
    }
  `;

  try {
    fs.outputFileSync(checkFile, content);
  } catch (e) {
    console.log(e);
  }
}

module.exports = {
  getStatus,
  setStatus,
  resetStaus
};
