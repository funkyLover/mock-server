const { getPort } = require('../lib/getPort');
const tcpPortUsed = require('tcp-port-used');

jest.mock('tcp-port-used');

test('return 8080 when input 8080 is idle', async () => {
  tcpPortUsed.check.mockResolvedValue(false);

  return getPort('8080').then(port => {
    expect(port).toBe('8080');
  });
});

test('return 8081 when input 8080 is busy and 8081 is idle', async () => {
  tcpPortUsed.check.mockResolvedValueOnce(true);
  tcpPortUsed.check.mockResolvedValueOnce(false);

  return getPort('8080').then(port => {
    expect(port).toBe('8081');
  });
});

test('return 8081 when error occurred checking 8080', async () => {
  tcpPortUsed.check.mockRejectedValueOnce(new Error('Error'));
  tcpPortUsed.check.mockResolvedValueOnce(false);

  return getPort('8080').then(port => {
    expect(port).toBe('8081');
  });
});
