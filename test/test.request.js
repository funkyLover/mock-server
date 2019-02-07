const Koa = require('koa');
const axios = require('axios');
const mockMiddleware = require('../lib/server/mock');
const { getStatus } = require('../lib/server/index');

jest.mock('../lib/server/index');

const defaultHeader = {
  delay: 0.1,
  status: 200,
  header: {
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  }
};

test('it will return code: 1 from mock', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8080 }
  });
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [{ data, ...defaultHeader }]
      },
      mockChecked: { 'api.mock.com': 0 }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8080);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(data);
    server.close();
  });
});

test('it will return code: 2 from mock(multiple mock)', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8081 }
  });
  const data = { code: 2 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [
          { data: { code: 1 }, ...defaultHeader },
          { data, ...defaultHeader }
        ]
      },
      mockChecked: { 'api.mock.com': 1 }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8081);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(data);
    server.close();
  });
});

test('it will return code: 3 from mock(multiple api mock)', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8082 }
  });
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [
          { data: { code: 1 }, ...defaultHeader },
          { data: { code: 2 }, ...defaultHeader }
        ],
        'api.mock.com/api': [{ data, ...defaultHeader }]
      },
      mockChecked: {
        'api.mock.com': 1,
        'api.mock.com/api': 0
      }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8082);

  return instance.get('/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(data);
    server.close();
  });
});

test('it will cost over 500ms for the request', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8083 }
  });
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultHeader,
            ...{ delay: 0.5 }
          }
        ]
      },
      mockChecked: {
        'api.mock.com/api': 0
      }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8083);

  const start = Date.now();
  return instance.get('/api').then(res => {
    const cost = Date.now() - start;
    expect(res.status).toBe(200);
    expect(res.data).toMatchObject(data);
    expect(cost).toBeGreaterThan(500);
    server.close();
  });
});

test('it will return 404 for the request', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8084 }
  });
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultHeader,
            ...{ status: 404 }
          }
        ]
      },
      mockChecked: {
        'api.mock.com/api': 0
      }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8084);

  return instance.get('/api').then(
    () => {},
    res => {
      expect(res.response.status).toBe(404);
      expect(res.response.data).toMatchObject(data);
      server.close();
    }
  );
});

test('it will return string data for the request', () => {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: 8085 }
  });
  // @NOTE: 如果data为对象, 并不会反悔对应的JSON字符创
  //        是axios自动转的吗?
  const data = 'string data';
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultHeader,
            ...{
              header: { 'Content-Type': 'text/plain; charset=UTF-8' }
            }
          }
        ]
      },
      mockChecked: {
        'api.mock.com/api': 0
      }
    };
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(8085);

  return instance.get('/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toBe(data);
    server.close();
  });
});
