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

cli.parse(['node', 'mock']);

val.should.have.property('port', undefined);
val.should.have.property('dir', undefined);
