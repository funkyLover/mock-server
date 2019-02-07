const cli = require('../../lib/cli');
const should = require('should');

const val = {
  dir: '',
  port: ''
};

cli.action(function(cmd) {
  val.dir = cmd.dir;
  val.port = cmd.port;
});

cli.parse(['node', 'mock', '-d', '.']);

val.should.have.property('port', undefined);
val.should.have.property('dir', '.');
