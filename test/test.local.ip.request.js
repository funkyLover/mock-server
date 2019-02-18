const Koa = require('koa');
const axios = require('axios');
const { getStatus } = require('../lib/server/status');
const localMiddleware = require('../lib/server/local');

jest.mock('../lib/server/status');

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

test('it will return html when request "/" by local ip(127.0.0.1)', () => {
  const { instance, server } = setupEnv(8890);

  return instance.get('/').then(res => {
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

  return instance.get('/whatever').then(res => {}, err => {
    expect(err.response.status).toBe(404);
    server.close();
  });
});
