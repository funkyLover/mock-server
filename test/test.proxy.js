const Koa = require('koa');
const axios = require('axios');
const mockMiddleware = require('../lib/server/mock');
const proxyMiddleware = require('../lib/server/proxy');
const { getStatus } = require('../lib/server/index');

jest.mock('../lib/server/index');

const defaultMock = {
  delay: 0.1,
  status: 200,
  header: {
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  },
  data: { code: 1 }
};

test('it will return from mock server', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8880 }
  });
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [defaultMock, defaultMock],
        _proxy: {
          'api.mock.com': 'http://127.0.0.1:8881'
        }
      },
      mockChecked: { 'api.mock.com/api': 1 }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  app.use(proxyMiddleware);
  const server = app.listen(8880);

  return instance.get('/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual({ code: 1 });
    server.close();
  });
});

test('it will return from target server', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8880 }
  });
  getStatus.mockImplementation(() => {
    return {
      mock: {
        'api.mock.com/api': [defaultMock, defaultMock],
        _proxy: {
          'api.mock.com': 'http://127.0.0.1:8881'
        }
      },
      mockChecked: { 'api.mock.com/api': 1 }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  app.use(proxyMiddleware);
  const server = app.listen(8880);

  const targetApp = new Koa();
  const msg = 'return from target server';
  targetApp.use(ctx => {
    ctx.body = msg;
  });
  const targetServer = targetApp.listen(8881);

  return instance.get('/api2').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toBe(msg);
    server.close();
    targetServer.close();
  });
});
