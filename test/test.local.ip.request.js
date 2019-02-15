const Koa = require('koa');
const axios = require('axios');
const { getStatus } = require('../lib/server/status');
const localMiddleware = require('../lib/server/local');

jest.mock('../lib/server/status');

test('it will return html when request "/" by local ip(127.0.0.1)', () => {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8880',
    proxy: { host: '127.0.0.1', port: 8880 }
  });

  getStatus.mockImplementationOnce(() => {
    return {
      localIp: ['127.0.0.1:8880']
    };
  });

  const app = new Koa();
  app.use(localMiddleware);
  const server = app.listen(8880);

  return instance.get('/').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toMatch(`<html>`);
    server.close();
  });
});

test('it will return mock data when request "/$mock" by local ip(127.0.0.1)', () => {
  const instance = axios.create({
    baseURL: 'http://127.0.0.1:8881',
    proxy: { host: '127.0.0.1', port: 8881 }
  });

  const mockData = {
    mock: { 'api.mock.com': [] },
    mockChecked: { 'api.mock.com': 1 }
  };

  getStatus.mockImplementationOnce(() => {
    return { localIp: ['127.0.0.1:8881'] };
  });
  getStatus.mockImplementationOnce(() => {
    return { localIp: ['127.0.0.1:8881'], ...mockData };
  });

  const app = new Koa();
  app.use(localMiddleware);
  const server = app.listen(8881);

  return instance.get('/$mock').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(mockData);
    server.close();
  });
});
