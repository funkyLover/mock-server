const { join, resolve } = require('path');
const { getMockPath, isMockExist, getMock } = require('../lib/getMock');

const current = __dirname;
const parent = resolve(current, '..');

test('input "." return current exec path with mock', () => {
  expect(getMockPath('.')).toBe(join(parent));
});

test('input ".." return parent dir path with mock', () => {
  expect(getMockPath('..')).toBe(resolve(parent, '..'));
});

test('input relative "./aaa" path', () => {
  expect(getMockPath('./aaa')).toBe(resolve(parent, 'aaa'));
});

test('input absolute "/" path', () => {
  expect(getMockPath('/')).toBe('/');
});

test('input absolute "/Users/xxx" path', () => {
  expect(getMockPath('/Users/xxx')).toBe('/Users/xxx');
});

test('return false when mock is file', () => {
  const mockPath = getMockPath('./example/file');
  expect(isMockExist(mockPath)).toBe(false);
});

test('return true when mock dir is exist', () => {
  const mockPath = getMockPath('./example/empty');
  expect(isMockExist(mockPath)).toBe(true);
});

test('return false when mock dir is exist', () => {
  const mockPath = getMockPath('./path/not/existed');
  expect(isMockExist(mockPath)).toBe(false);
});

test('return empty object when mock data is not exist(input an exist mock path)', () => {
  expect(getMock('./example/empty')).toEqual({
    _proxy: {},
    _set: {}
  });
});

test('return empty object when mock data is not exist(input a not exist mock path)', () => {
  expect(getMock('./path/not/existed')).toEqual({});
});

test('return mock object when mock data is exist(example/simple)', () => {
  expect(getMock('./example/simple')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/data in json file)', () => {
  expect(getMock('./example/data in json file')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 2,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/data in file(not js || json))', () => {
  expect(getMock('./example/data in file(not js || json)')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 2,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/http delay 2s)', () => {
  expect(getMock('./example/http delay 2s')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 2,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/status 404)', () => {
  expect(getMock('./example/status 404')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: 'Not Found',
        delay: 0,
        status: 404,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/http keep alive)', () => {
  expect(getMock('./example/http keep alive')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'keep-alive',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/with proxy)', () => {
  expect(getMock('./example/with proxy')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {
      'api.mock.com': 'https://www.xxx.yy.zzz'
    },
    _set: {}
  });
});

test('return mock object when mock data is exist(example/with proxy dir)', () => {
  const mock = getMock('./example/with proxy dir');
  expect(mock).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {},
    _set: {}
  });
});

test('return mock object when mock data is exist(example/multiple options)', () => {
  expect(getMock('./example/multiple options')).toMatchObject({
    'api.mock.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      },
      {
        label: 'option 2',
        data: { code: '-1' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    'api.mock2.com': [
      {
        label: 'option 1',
        data: { code: '0' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    'api.mock2.com/api/login': [
      {
        label: 'fail',
        data: { code: '-1', msg: 'login fail' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      },
      {
        label: 'success',
        data: { code: '0', msg: 'ok' },
        delay: 0,
        status: 200,
        header: {
          'Content-Type': 'application/json; charset=UTF-8',
          Connection: 'Close',
          'Access-Control-Allow-Origin': '*'
        }
      }
    ],
    _proxy: {
      'api.mock.com': 'https://www.xxx.yy.zzz',
      'api.mock2.com': 'https://www2.xxx.yy.zzz'
    },
    _set: {}
  });
});

test('it will get a mock set data', () => {
  const mockData = getMock('./example/data with mock set');
  const mockSet = mockData._set;

  const expectObj = {
    'api.mock.com/api1': expect.objectContaining({
      data: { code: '1', msg: 'not ok' }
    }),
    'api.mock.com/api2': expect.objectContaining({
      data: { code: '0', msg: 'ok' }
    })
  };

  expect(mockSet['api flow']).toMatchObject(expectObj);
});
