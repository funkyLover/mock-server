
let status = {
  server: null,
  mock: {},
  mockChecked: {
    'api.mock.com/api': 0
  },
  mockWatcher: null
};

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
  status = {
    server: null,
    mock: {},
    mockChecked: {},
    mockWatcher: null
  };
}

module.exports = {
  getStatus,
  setStatus,
  resetStaus
};
