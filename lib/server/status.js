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
}

function resetStaus() {
  status = { ...defaultStatus };
}

module.exports = {
  getStatus,
  setStatus,
  resetStaus
};
