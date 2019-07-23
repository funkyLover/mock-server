const resolver = require('../lib/utils/reslover');

beforeEach(() => {
  jest.resetModules();
});

it('it will console.error when name and set param is empty', () => {
  const spy = jest.spyOn(console, 'error');

  const m1 = resolver();
  const m2 = resolver({});

  expect(spy).toHaveBeenCalledTimes(2);
  expect(m1).toBe(null);
  expect(m2).toBe(null);
});

// it('it will ', () => {
//   jest.mock('path/to/mock/module', () => {
//     return {};
//   });

//   Error = jest.fn(() => {
//     return { stack: [] }
//   });

// });
