const cli = require('../../lib/cli');
const should = require('should');

const val = {
  port: '',
  dir: ''
};

cli.action(function(cmd) {
  val.port = cmd.port;
  val.dir = cmd.dir;
  val.hasPortOpt = cmd.hasPortOpt;
});

cli.parse(['node', 'mock']);

val.should.have.property('port', '8888');
val.should.have.property('dir', '.');
val.should.have.property('hasPortOpt', false);
