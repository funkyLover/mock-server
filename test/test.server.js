const chokidar = require('chokidar');
const Koa = require('koa');
const mock = require('../lib/getMock');
const path = require('path');
const { startMock } = require('../lib/server/index');
const { getStatus } = require('../lib/server/status');
jest.mock('chokidar');
jest.mock('../lib/getMock');
jest.mock('koa');
global.console = { error: jest.fn() };

let KoaMockFn = () => {
  return {
    listen: () => {
      return {
        close: () => {}
      };
    },
    use: () => {}
  };
};

let chokidarWatchMockFn = () => {
  const watch = {
    on: () => watch,
    close: () => {}
  };
  return watch;
};

test('mock will update when mock file change', async () => {
  mock.getMock.mockReturnValueOnce(1);
  mock.getMock.mockReturnValue(2);
  Koa.mockImplementationOnce(KoaMockFn);

  chokidar.watch.mockImplementation(() => {
    const watch = {
      on: (type, cb) => {
        setTimeout(() => {
          cb('.');
        }, 200);
        return watch;
      }
    };
    return watch;
  });

  startMock('.', '8080');
  expect(getStatus().mock).toBe(1);
  await new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 400);
  });
  expect(getStatus().mock).toBe(2);
});

test('mock server will be started when koa success setup a server', async () => {
  chokidar.watch.mockImplementation(chokidarWatchMockFn);
  Koa.mockImplementationOnce(() => {
    return {
      listen: port => {
        return { port };
      },
      use: () => {}
    };
  });

  const res = startMock('.', '8080');
  expect(res).toBe(true);
  expect(getStatus().server).toEqual({ port: '8080' });
  expect(getStatus().dir).toEqual(path.resolve(process.cwd(), '.'));
});

test('mock server will not be started when error', async () => {
  chokidar.watch.mockImplementation(chokidarWatchMockFn);
  Koa.mockReset();
  Koa.mockImplementationOnce(() => {
    return {
      listen: () => {
        throw new Error('Error');
      },
      use: () => {}
    };
  });

  const res = startMock('.', '8080');
  expect(console.error).toBeCalled();
  expect(res).toBe(false);
  expect(getStatus().server).toBe(null);
  expect(getStatus().mock).toEqual({});
  expect(getStatus().setChecked).toEqual(null);
  expect(getStatus().dir).toEqual('');
});
