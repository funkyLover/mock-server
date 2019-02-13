#!/usr/bin/env node

const cli = require('../lib/cli');
const { startMock } = require('../lib/server/index');
const { getPort } = require('../lib/getPort');

cli.parse(process.argv);

console.log(cli.dir);
console.log(cli.port);

const port = cli.hasPortOpt ? cli.port : getPort(cli.port);
const dir = cli.dir;

startMock(dir, port);
