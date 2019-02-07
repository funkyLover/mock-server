const program = require('commander');
const pkg = require('../package.json');

const cli = program
  .version(pkg.version, '-v, --version')
  .name('mock')
  .description('Server your mock data for development')
  .option(
    '-p, --port [port]',
    'server listen port, defalut 8888, +1 when port is used'
  )
  .option('-d, --dir [dir]', 'dir path of mock data, default "."');

module.exports = cli;
