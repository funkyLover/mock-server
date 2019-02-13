const cli = require('../../lib/cli');
const should = require('should');

const val = {
  dir: '',
  port: ''
};

cli.action(function(cmd) {
  val.dir = cmd.dir;
  val.port = cmd.port;
  val.hasPortOpt = cmd.hasPortOpt;
});

cli.parse(['node', 'mock', '-d', '.']);

val.should.have.property('port', '8888');
val.should.have.property('dir', '.');
val.should.have.property('hasPortOpt', false);
