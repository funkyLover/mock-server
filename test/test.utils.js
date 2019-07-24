const resolver = require('../lib/utils/reslover');
const { getStatus } = require('../lib/server/status');
const path = require('path');

jest.mock('../lib/server/status');

beforeEach(() => {
  jest.resetModules();
});

it('it will console.error when name and set param is empty', () => {
  const spy = jest.spyOn(console, 'error');
  getStatus.mockImplementation(() => ({ dir: '' }));

  const m1 = resolver();
  const m2 = resolver({});

  expect(spy).toHaveBeenCalledTimes(2);
  expect(m1).toBe(null);
  expect(m2).toBe(null);
});

it('it will require correct mock item', () => {
  const dir = path.resolve(__dirname, '../example/simple');
  const mock = require(`${dir}/api.mock.com/option 1/data.js`);

  getStatus.mockImplementationOnce(() => ({ dir }));

  Error = jest.fn(() => {
    this.stack = [
      {
        getFileName: () => `${dir}/_set/flow1/api.mock.com/data.js`
      },
      {
        getFileName: () => `${dir}/_set/flow1/api.mock.com/data.js`
      }
    ];
    return this;
  });

  const m = resolver({ name: 'option 1' });
  expect(m).toEqual(mock);
});

it('it will require correct mock item', () => {
  const dir = path.resolve(__dirname, '../example/data with mock set');
  const mock = require(`${dir}/_set/api flow/api.mock.com/api1/data.js`);

  getStatus.mockImplementationOnce(() => ({ dir }));

  Error = jest.fn(() => {
    this.stack = [
      {
        getFileName: () => `${dir}/api.mock.com/api1/option 1/data.js`
      },
      {
        getFileName: () => `${dir}/api.mock.com/api1/option 1/data.js`
      }
    ];
    return this;
  });

  const m = resolver({ set: 'api flow' });
  expect(m).toEqual(mock);
});
