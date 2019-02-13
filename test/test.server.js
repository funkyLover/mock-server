const chokidar = require('chokidar');
const Koa = require('koa');
const mock = require('../lib/getMock');
const { getStatus, startMock } = require('../lib/server/index');
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
  return {
    on: () => {},
    close: () => {}
  };
};

test('mock will update when mock file change', async () => {
  mock.getMock.mockReturnValueOnce(1);
  mock.getMock.mockReturnValueOnce(2);
  Koa.mockImplementationOnce(KoaMockFn);

  chokidar.watch.mockImplementationOnce(() => {
    return {
      on: (type, cb) => {
        setTimeout(() => {
          cb('.');
        }, 200);
      }
    };
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

test('mock server will be started when koa success setup an server', async () => {
  chokidar.watch.mockImplementationOnce(chokidarWatchMockFn);
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
  expect(getStatus().server).toMatchObject({ port: '8080' });
});

test('mock server will not be started when error', async () => {
  chokidar.watch.mockImplementationOnce(chokidarWatchMockFn);
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
  expect(getStatus().mock).toMatchObject({});
});
