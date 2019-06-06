const Koa = require('koa');
const axios = require('axios');
const mockMiddleware = require('../lib/server/mock');
const { getStatus } = require('../lib/server/status');

jest.mock('../lib/server/index');
jest.mock('../lib/server/status');

function setEnv(port) {
  const instance = axios.create({
    baseURL: 'http://api.mock.com',
    proxy: { host: '127.0.0.1', port: port }
  });

  const app = new Koa();
  app.use(mockMiddleware);
  const server = app.listen(port);

  return { instance, server };
}

const defaultConfig = {
  delay: 0.1,
  status: 200,
  header: {
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  }
};

test('it will return code: 1 from mock', () => {
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [{ data, ...defaultConfig }]
      },
      mockChecked: { 'api.mock.com': 0 }
    };
  });

  const { instance, server } = setEnv(8080);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('it will return code: 2 from mock(multiple mock)', () => {
  const data = { code: 2 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [
          { data: { code: 1 }, ...defaultConfig },
          { data, ...defaultConfig }
        ]
      },
      mockChecked: { 'api.mock.com': 1 }
    };
  });
  const { instance, server } = setEnv(8081);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('it will return code: 3 from mock(multiple api mock)', () => {
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [
          { data: { code: 1 }, ...defaultConfig },
          { data: { code: 2 }, ...defaultConfig }
        ],
        'api.mock.com/api': [{ data, ...defaultConfig }]
      },
      mockChecked: {
        'api.mock.com': 1,
        'api.mock.com/api': 0
      }
    };
  });

  const { instance, server } = setEnv(8082);

  return instance.get('/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('it will cost over 500ms for the request', () => {
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultConfig,
            ...{ delay: 0.5 }
          }
        ]
      },
      mockChecked: {
        'api.mock.com/api': 0
      }
    };
  });

  const { instance, server } = setEnv(8083);

  const start = Date.now();
  return instance.get('/api').then(res => {
    const cost = Date.now() - start;
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    expect(cost).toBeGreaterThan(500);
    server.close();
  });
});

test('it will return 404 for the request', () => {
  const data = { code: 3 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultConfig,
            ...{ status: 404 }
          }
        ]
      },
      mockChecked: {
        'api.mock.com/api': 0
      }
    };
  });

  const { instance, server } = setEnv(8084);

  return instance.get('/api').then(
    () => {},
    res => {
      expect(res.response.status).toBe(404);
      expect(res.response.data).toEqual(data);
      server.close();
    }
  );
});

test('it will return string data for the request', () => {
  // @NOTE: 如果data为对象, 并不会返回对应的JSON字符串
  //        是axios自动转的吗?
  const data = 'string data';
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data,
            ...defaultConfig,
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

  const { instance, server } = setEnv(8085);

  return instance.get('/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toBe(data);
    server.close();
  });
});

test('it will match the mock set', () => {
  const data1 = { code: 1 };
  const data2 = { code: 2 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [{ data: data1, ...defaultConfig }],
        _set: {
          'a set of mock': {
            'api.mock.com': { data: data2, ...defaultConfig }
          }
        }
      },
      mockChecked: { 'api.mock.com': 0 },
      setChecked: 'a set of mock'
    };
  });
  const { instance, server } = setEnv(8086);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data2);
    server.close();
  });
});

test('mock with data', () => {
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com': [
          {
            data: () => ({ data }),
            ...defaultConfig
          }
        ],
        _set: {}
      },
      mockChecked: { 'api.mock.com': 0 },
      setChecked: null
    };
  });
  const { instance, server } = setEnv(8087);

  return instance.get('').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('mock with restful api', () => {
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api/:id/name': [
          {
            data: () => ({ data }),
            ...defaultConfig
          }
        ],
        _set: {}
      },
      mockChecked: { 'api.mock.com/api/:id/name': 0 },
      setChecked: null
    };
  });
  const { instance, server } = setEnv(8088);

  return instance.get('/api/123/name').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('mock with restful api 2', () => {
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api/:id/name/:flow': [
          {
            data: () => ({ data }),
            ...defaultConfig
          }
        ],
        _set: {}
      },
      mockChecked: { 'api.mock.com/api/:id/name/:flow': 0 },
      setChecked: null
    };
  });
  const { instance, server } = setEnv(8088);

  return instance.get('/api/123/name/new').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});

test('mock with self handle', () => {
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api/login': [
          {
            data: ctx => {
              ctx.body = data;
              return { selfHandle: true };
            },
            ...defaultConfig
          }
        ],
        _set: {}
      },
      mockChecked: { 'api.mock.com/api/login': 0 },
      setChecked: null
    };
  });
  const { instance, server } = setEnv(8089);

  return instance.get('/api/login').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});
