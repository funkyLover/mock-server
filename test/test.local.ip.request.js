const path = require('path');
const fs = require('fs-extra');
const Koa = require('koa');
const axios = require('axios');
const { getStatus, setStatus } = require('../lib/server/status');
const localMiddleware = require('../lib/server/local');
const send = require('koa-send');

jest.mock('../lib/server/status');
jest.mock('koa-send');

function setupEnv(port) {
  const instance = axios.create({
    baseURL: `http://127.0.0.1:${port}`,
    proxy: { host: '127.0.0.1', port: port }
  });

  getStatus.mockImplementationOnce(() => {
    return { localIp: [`127.0.0.1:${port}`] };
  });

  const app = new Koa();
  app.use(localMiddleware);
  const server = app.listen(port);

  return { instance, server };
}

test('it will return html when request "/view" by local ip(127.0.0.1)', () => {
  const { instance, server } = setupEnv(8890);
  send.mockImplementationOnce(ctx => {
    ctx.body = '<html></html>';
  });

  return instance.get('/view').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toMatch(`<html>`);
    server.close();
  });
});

test('it will return mock data when request "/$mock" by local ip(127.0.0.1)', () => {
  const { instance, server } = setupEnv(8891);

  const mockData = {
    mock: { 'api.mock.com': [] },
    mockChecked: { 'api.mock.com': 1 }
  };

  getStatus.mockImplementationOnce(() => {
    return { localIp: ['127.0.0.1:8881'], ...mockData };
  });

  return instance.get('/$mock').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(mockData);
    server.close();
  });
});

test('it will return 404', () => {
  const { instance, server } = setupEnv(8892);

  return instance.get('/whatever').then(
    res => {},
    err => {
      expect(err.response.status).toBe(404);
      server.close();
    }
  );
});

test('it will code -1 when request "/$mock-check" with error id', () => {
  const { instance, server } = setupEnv(8893);

  return instance.get('/$mock-check?id=&index=1').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('-1');
    server.close();
  });
});

test('it will code -1 when request "/$mock-check" with error index', () => {
  const { instance, server } = setupEnv(8894);

  getStatus.mockImplementation(() => {
    return require.requireActual('../lib/server/status').getStatus();
  });
  setStatus.mockImplementationOnce((key, val) => {
    return require.requireActual('../lib/server/status').setStatus(key, val);
  });

  return instance.get('/$mock-check?id=api.mock.com&index=').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('-1');
    server.close();
  });
});

test('it will code 0 when request "/$mock-check" with correct params', () => {
  const { instance, server } = setupEnv(8895);

  getStatus.mockImplementation(() => {
    return require.requireActual('../lib/server/status').getStatus();
  });
  setStatus.mockImplementationOnce((key, val) => {
    return require.requireActual('../lib/server/status').setStatus(key, val);
  });

  return instance.get('/$mock-check?id=api.mock.com&index=1').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(getStatus().mockChecked['api.mock.com']).toBe(1);
    getStatus.mockReset();
    server.close();
  });
});

test('it will code -1 when request "/$set-check" with error params', () => {
  const { instance, server } = setupEnv(8896);

  return instance.get('/$set-check?id=').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('-1');
    server.close();
  });
});

test('it will code 0 when request "/$set-check" with correct params', () => {
  const { instance, server } = setupEnv(8897);

  getStatus.mockImplementation(() => {
    return require.requireActual('../lib/server/status').getStatus();
  });
  setStatus.mockImplementationOnce((key, val) => {
    return require.requireActual('../lib/server/status').setStatus(key, val);
  });
  const setId = 'a set of api';
  return instance.get(`/$set-check?id=${setId}`).then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(getStatus().setChecked).toBe(setId);
    getStatus.mockReset();
    server.close();
  });
});

test('it will create default mock template when request "/$create"', () => {
  const { instance, server } = setupEnv(8897);
  const dir = path.resolve(__dirname, './__test.create__');
  const apiPath = path.join(dir, 'api.mock.com');
  const proxyPath = path.join(dir, '_proxy.js');
  const setPath = path.join(dir, '_set');
  getStatus.mockImplementation(() => ({ dir }));

  return instance.get('/$create').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');

    expect(fs.existsSync(apiPath)).toBe(true);
    expect(fs.existsSync(proxyPath)).toBe(true);
    expect(fs.existsSync(setPath)).toBe(true);

    server.close();
    fs.removeSync(apiPath);
    fs.removeSync(setPath);
    fs.removeSync(proxyPath);
  });
});
