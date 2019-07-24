const path = require('path');
const { getStatus } = require('../server/status');

module.exports = function({ name, set } = {}) {
  const { dir } = getStatus();
  const caller = _getCallerFile();
  let _path = '';
  let api = '';
  let matchs = null;

  if (!name && !set) {
    console.error('need ({ name? || set? }) params to resolve mock item ');
    return null;
  }

  const relative = path.relative(dir, caller);
  const isSet = relative.startsWith('_set');

  if (isSet) {
    matchs = relative.match(/_set\/[\S\s]*?\/([\S]*)\/data\.js/);
    api = matchs.length > 0 ? matchs[1] : '';
  } else {
    matchs = relative.match(/(\S*)\/([\s\S]*\/data\.js)$/);
  }

  api = matchs && matchs.length > 0 ? matchs[1] : '';

  // 4. make mock item path
  if (set) {
    _path = path.resolve(dir, '_set', set, api, 'data.js');
  } else {
    _path = path.resolve(dir, api, name, 'data.js');
  }

  try {
    return require(_path);
  } catch (e) {
    console.error(e.message);
    return null;
  }
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
