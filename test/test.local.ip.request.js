const path = require('path');
const fs = require('fs-extra');
const Koa = require('koa');
const axios = require('axios');
const { getStatus, setStatus } = require('../lib/server/status');
const localMiddleware = require('../lib/server/local');
const { mockMiddleware } = require('../lib/server/mock');
const send = require('koa-send');

jest.mock('../lib/server/status');
jest.mock('koa-send');

const TEST_DIR = path.resolve(__dirname, './__test.create__');

afterAll(() => {
  fs.removeSync(path.resolve(TEST_DIR, '_checked.js'));
  fs.removeSync(path.resolve(TEST_DIR, 'api.mock.com'));
  fs.removeSync(path.resolve(TEST_DIR, 'proxy.js'));
  fs.removeSync(path.resolve(TEST_DIR, '_set'));
});

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
  setStatus.mockImplementation((key, val) => {
    return require.requireActual('../lib/server/status').setStatus(key, val);
  });
  setStatus('dir', TEST_DIR);

  return instance.get('/$mock-check?id=api.mock.com&index=1').then(res => {
    const status = getStatus();
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(status.mockChecked['api.mock.com']).toBe(1);
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

test('it will return code 0 when request "/$set-check" with correct params', () => {
  const { instance, server } = setupEnv(8897);

  getStatus.mockImplementation(() => {
    return {
      ...require.requireActual('../lib/server/status').getStatus(),
      dir: TEST_DIR
    };
  });
  setStatus.mockImplementation((key, val) => {
    return require.requireActual('../lib/server/status').setStatus(key, val);
  });
  setStatus('dir', TEST_DIR);
  const setId = 'a set of api';

  return instance.get(`/$set-check?id=${setId}`).then(async res => {
    const status = getStatus();
    // const dir = status.dir;
    // const checkFile = path.resolve(dir, '_checked.js');
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(status.setChecked).toBe(setId);
    // expect(fs.existsSync(checkFile)).toBe(true);
    getStatus.mockReset();
    server.close();
  });
});

test('it will create default mock template when request "/$create"', () => {
  const { instance, server } = setupEnv(8898);
  const apiPath = path.join(TEST_DIR, 'api.mock.com');
  getStatus.mockImplementation(() => ({ dir: TEST_DIR, mock: {} }));

  return instance.get('/$create').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(fs.existsSync(apiPath)).toBe(true);
    server.close();
  });
});

test('it will create default mock template when request "/$create" with type proxy', () => {
  const { instance, server } = setupEnv(8899);
  const proxyPath = path.join(TEST_DIR, 'proxy.js');
  getStatus.mockImplementation(() => ({ dir: TEST_DIR, mock: {} }));

  return instance.get('/$create?type=proxy').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(fs.existsSync(proxyPath)).toBe(true);
    server.close();
  });
});

test('it will create default mock template when request "/$create" with type set', () => {
  const { instance, server } = setupEnv(8900);
  const setPath = path.join(TEST_DIR, '_set');
  getStatus.mockImplementation(() => ({ dir: TEST_DIR, mock: {} }));

  return instance.get('/$create?type=set').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('0');
    expect(fs.existsSync(setPath)).toBe(true);
    server.close();
  });
});

test('it will return error when mock data is exist', () => {
  const { instance, server } = setupEnv(8901);
  getStatus.mockImplementation(() => ({
    dir: TEST_DIR,
    mock: { _set: { notEmpty: true } }
  }));

  return instance.get('/$create?type=set').then(res => {
    expect(res.status).toBe(200);
    expect(res.data.code).toBe('-1');
    server.close();
  });
});

test('can access mock through local ip request', () => {
  const { instance, server } = setupEnv(8902);
  const data = { code: 1 };
  getStatus.mockImplementationOnce(() => {
    return { localIp: ['127.0.0.1:8902'] };
  });
  getStatus.mockImplementationOnce(() => {
    return {
      mock: {
        'api.mock.com/api': [
          {
            data: () => ({ data }),
            ...defaultConfig
          }
        ],
        _set: {}
      },
      mockChecked: { 'api.mock.com/api': 0 },
      setChecked: null
    };
  });

  return instance.get('/$mock-api?api=api.mock.com/api').then(res => {
    expect(res.status).toBe(200);
    expect(res.data).toEqual(data);
    server.close();
  });
});
