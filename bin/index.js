#!/usr/bin/env node
const os = require('os');
const cli = require('../lib/cli');
const { startMock } = require('../lib/server/index');
const { getPort } = require('../lib/getPort');
const { setStatus } = require('../lib/server/status');

cli.parse(process.argv);

setupMockServer();

async function setupMockServer() {
  const dir = cli.dir;
  const port = cli.hasPortOpt ? cli.port : await getPort(cli.port);

  const isServerUp = startMock(dir, port);
  const localIp = [`localhost:${port}`, `127.0.0.1:${port}`];

  if (isServerUp) {
    const networks = os.networkInterfaces();
    Object.keys(networks).forEach(function(name) {
      networks[name].forEach(function(item) {
        if ('IPv4' !== item.family || item.internal !== false) {
          return;
        }
        localIp.push(`${item.address}:${port}`);
      });
    });
    setStatus('localIp', localIp);

    console.log('you can access mock server:');
    console.log(localIp.map(i => `http://${i} \n`).join(''));

    console.log('you can access mock server view:');
    console.log(localIp.map(i => `http://${i}/view \n`).join(''));
  }
}
