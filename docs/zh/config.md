# mock 配置说明

## api 文件目录配置

```bash
# mock api: api.target.com/api/login

|- mock
  |- api.target.com
    |- api
      |- login
        |- 登录成功
          |- data.js # data文件定义响应的数据
        |- 登录失败
          |- data.js
        |- 耗时过长导致前端超时
          |- data.js
          |- http.js # http文件控制响应行为, 如定义http header, 请求耗时等
```

### restful api

```bash
# mock api: api.target.com/users/:id

|- mock
  |- api.target.com
    |- users
      |- :id
        |- 返回用户信息
          |- data.js # data文件定义响应的数据
```

**注意**: 由于Windows系统下不能以`:` 和 `*`等字符命名文件夹, 要定义restful api文件目录配置时, Windows下可使用`%3A`代替`:`, 可使用`%2A`代替`*`

```bash
# windows mock api: api.target.com/users/:id

|- mock
  |- api.target.com
    |- users
      |- %3Aid
        |- 返回用户信息
          |- data.js # data文件定义响应的数据
```

### 通配符匹配

```bash
# mock api: api.target.com/(.*)

|- mock
  |- api.target.com
    |- (.*)
      |- 返回数据
        |- data.js # data文件定义响应的数据
```

## data & http 配置

每个接口 mock 数据配置目录下, 可以通过`data.js`导出要响应的数据, 而`http.js`则用于定义http响应行为

```js
// http默认配置
{
  delay: 0.2, // 请求耗时
  status: 200, // http状态码
  header: { // http响应头
    'Content-Type': 'application/json; charset=UTF-8',
    Connection: 'Close',
    'Access-Control-Allow-Origin': '*'
  }
}
```

### 响应数据

```js
// mock/****/data.js
module.exports = {
  code: '0',
  msg: 'ok'
};
```

### 响应 html 页面

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

### 耗时接口

如希望模拟控制接口处理时间, 如耗时过长导致前端请求超时等场景, 可在`http.js`中配置

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

### http 状态码

如果需要模拟接口返回 200 以外的 http 状态码, 同样可以通过`http.js`中指定

```js
// mock/****/data.js
module.exports = 'Not Found';

// mock/****/http.js
module.exports = {
  status: 404
};
```

### 使用函数处理复杂逻辑

如果希望模拟接口的真实行为, 如进行参数检查, 或使用`mock.js`生成随机数据返回等

可以通过在`data.js`导出函数来执行 js 逻辑, 该函数入参为[koa#ctx](https://koajs.com/#context)

```js
// mock/****/data.js
module.exports = (ctx) => {
  // 参数检查
  // 响应数据生成
  // .....

  return {
    data: {}, // 响应的数据
    header: {}, // 可选返回, 同http.js#header
    status: 200, // 可选返回, 同http.js#status
    delay: 0.2, // 可选返回, 同http.js#delay
  }
}

// 异步逻辑可以使用async方法, 或返回promise
module.exports = async (ctx) => {
  // ...

  return {
    data: {}
  };
}
```

**注意**: 当 mock 配置中依赖外部 npm 库时(如依赖[mockjs](https://github.com/nuysoft/Mock)生成数据), 请在 mock 配置目录外进行依赖安装, 如 mock 目录的父级目录

```bash
|- proj
  |- mock
    |- ... # mock配置
  |- node_modules
  |- package.json
```

```js
// mock/****/data.js
const xxx = require('xxx'); // npm依赖
module.exports = {};
```

### 直接使用ctx处理响应逻辑

```js
const send = require('koa-send');
const static = '/path/to/static/path';

module.exports = async (ctx) => {
  await send(ctx, ctx.path, {
    root: static
  });

  return {
    selfHandle: true
  };
};
```
