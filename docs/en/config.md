# Configuration(data & http)

Each interface mock data configuration directory, you can export the data to be responded by `data.js`, and `http.js` is used to define the http response behavior.

```js
// http default configuration
{
  delay: 0.2, // request time consuming
  status: 200, // http status code
  header: { // http response header
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  }
}
```

## Response html

```js
// mock/****/data.js
module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Document</title>
</head>
<body>return html</body>
</html>
`;

// mock/****/http.js
module.exports = {
  header: {
    'Content-Type': 'text/html; charset=UTF-8'
  }
};
```

## Time consuming api

If you want to simulate the control interface processing time, such as too long time, the front-end request timeout, etc., can be configured in `http.js`

```js
// mock/****/data.js
module.exports = {
  code: '0',
  msg: 'response after 2s'
};

// mock/****/http.js
module.exports = {
  delay: 2
};
```

## Http status code

If you need the analog interface to return an http status code other than 200, you can also specify it in `http.js`

```js
// mock/****/data.js
module.exports = 'Not Found';

// mock/****/http.js
module.exports = {
  status: 404
};
```

## Function

If you want to simulate the actual behavior of the interface, such as parameter checking, or use `mock.js` to generate random data returns, etc.

You can execute js logic by exporting the function in `data.js`, which is called [koa#ctx](https://koajs.com/#context)

```js
// mock/****/data.js
module.exports = (ctx) => {
  // parameter check
  // response data generation
  // .....

  return {
    data: {}, // response data
    header: {}, // optional return, same as http.js#header
    status: 200, // optional return, same as http.js#status
    delay: 0.2, // optional return, same as http.js#delay
  }
}

// Asynchronous logic can use the async method, or return a promise
module.exports = async (ctx) => {
  // ...

  return {
    data: {}
  };
}
```

**Note**: When relying on external npm libraries in the mock configuration (such as relying on [mockjs] (https://github.com/nuysoft/Mock) to generate data), please perform dependency installation outside the mock configuration directory, such as mock The parent directory of the directory

```bash
|- proj
  |- mock
    |- ... #mock configuration
  |- node_modules
  |- package.json
```

```js
// mock/****/data.js
const xxx = require('xxx'); // npm dependency
module.exports = {};
```
