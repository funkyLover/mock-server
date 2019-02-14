#!/usr/bin/env node
const os = require('os');
const cli = require('../lib/cli');
const { startMock } = require('../lib/server/index');
const { getPort } = require('../lib/getPort');

cli.parse(process.argv);

const port = cli.hasPortOpt ? cli.port : getPort(cli.port);
const dir = cli.dir;

const isServerUp = startMock(dir, port);

if (isServerUp) {
  const networks = os.networkInterfaces();
  let localIp = '';
  const defaultIp = '127.0.0.1';
  Object.keys(networks).forEach(function(name) {
    networks[name].forEach(function(item) {
      if ('IPv4' !== item.family || item.internal !== false) {
        return;
      }
      localIp = item.address;
    });
  });

  console.log('you can access mock server:');
  console.log(`http://${defaultIp}:${port}`);
  console.log(`http://${localIp}:${port}`);
}
