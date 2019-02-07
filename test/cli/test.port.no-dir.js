const cli = require('../../lib/cli');
const should = require('should');

const val = {
  port: '',
  dir: ''
};

cli.action(function(cmd) {
  val.port = cmd.port;
  val.dir = cmd.dir;
});

cli.parse(['node', 'mock', '-p', '8080']);

val.should.have.property('dir', undefined);
val.should.have.property('port', '8080');
