const path = require('path');
const { getStatus } = require('../server/status');

module.exports = function({ name } = {}) {
  let _path = '';
  let api = '';
  const { dir } = getStatus();
  // 1. get caller path
  const caller = _getCallerFile();
  // 2. judge is inside set dir
  const relative = path.relative(dir, caller);
  const isSet = relative.startsWith('_set');
  // 3. get api name
  if (isSet) {
    api = relative
      .split('/')
      .shift()
      .pop()
      .join('/');
  } else {
    api = relative
      .split('/')
      .shift()
      .pop()
      .pop()
      .join('/');
  }
  // 4. make mock item path
  if (name) {
    _path = path.resolve(dir, api, name, 'data.js');
  } else {
    _path = path.resolve(dir, '_set', api, 'data.js');
  }
  return _path;
};

// https://stackoverflow.com/questions/16697791/nodejs-get-filename-of-caller-function/29581862#29581862
function _getCallerFile() {
  var originalFunc = Error.prepareStackTrace;

  var callerfile;
  try {
    var err = new Error();
    var currentfile;

    Error.prepareStackTrace = function(err, stack) {
      return stack;
    };

    currentfile = err.stack.shift().getFileName();

    while (err.stack.length) {
      callerfile = err.stack.shift().getFileName();

      if (currentfile !== callerfile) break;
    }
  } catch (e) {}

  Error.prepareStackTrace = originalFunc;

  return callerfile;
}
