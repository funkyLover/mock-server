
# Proxy

In the iterative process of the project, not all interfaces require mock simulation.

There may be some available interfaces already deployed in the test/production environment. At this time, you will want to request the available interfaces directly, and mock the new interfaces.

One way to do this is to modify the configuration of the agent.

```bash
# Add interface to the mock server
api.target.com/api/new1 127.0.0.1:8888

api.target.com/api/new2 127.0.0.1:8888

# The rest of the interfaces are forwarded directly to the online/test machine data.
api.target.com/api xxx.xx.x.xxx
```

Or you can use the simple proxy function provided by the mock server

Just create a new `proxy.js` file in the mock directory.

```js
|- mock
  |- proxy.js

// proj/mock/proxy.js
module.exports = {
  // Here you can specify ip or specify the domain name, you need to bring the protocol type
  'api.target.com': 'https://xxx.xx.x.xxx'
}
```

Then the proxy tool is still the same configuration as before, and all interfaces are proxyed.

```bash
# All interfaces are forwarded to the mock server
api.target.com/api 127.0.0.1:8888
```

When the requested interface is not configured in the mock server or the corresponding interface mock is not checked for data to be responded to

The interface request will be forwarded to the target ip or url

And if `proxy.js` is not configured with forwarding rules, it will directly request online.
