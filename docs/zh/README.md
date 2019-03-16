# Mock Server

一个用于解决前后端分离并行开发时前端依赖接口数据问题的小工具, 通过读取本地文件生成mock api配置并启动node服务器. 然后只需把前端请求转发到该服务器即可

## 安装

mock-server-local运行环境需node v8.x及以上版本支持

全局安装

```bash
npm install -g mock-server-local
```

或作为项目开发依赖安装

```bash
npm install mock-server-local --save-dev
```

## 使用

```bash
Usage: mock [options]

Mock your apis with a node server

Options:
  -v, --version      output the version number

  -p, --port [port]  port server should listen on, defalut 8888, +1 when port is used

  -d, --dir [dir]    dir path of mock data, default "."

  -h, --help         output usage information
```

**注意**: 当指定端口号时(`-p/--port`), 如果指定的端口已被占用, 会直接返回启动失败, 只有使用默认端口号启动, 才会进行端口可用性检查, 并动态确定可用端口

### 启动服务器

```bash
mock -p 8888 -d ./mock # ./mock 为存放mock数据的目录

you can access mock server:
http://127.0.0.1:8888
http://192.168.0.1:8888 # local ip

you can access mock server view:
http://127.0.0.1:8888/view
http://192.168.0.1:8888/view # local ip
```

然后使用浏览器访问前端页面(`http://127.0.0.1:${port}/view`)

## 项目设置

启动mock服务器后, 我们需要把项目的请求都代理到我们mock服务器上去

假设我们的服务器为`http://127.0.0.1:8888`, mock的api为`api.mock.com/api-bin/*`

### react(create-react-app)

详情可看[create-react-app#docs](https://facebook.github.io/create-react-app/docs/proxying-api-requests-in-development#configuring-the-proxy-manually)

```js
// src/setupProxy.js
const proxy = require('http-proxy-middleware');

module.exports = function(app) {
  const options = {
    target: 'http://127.0.0.1:8888', // mock服务器
    headers: {
      host: 'api.mock.com' // 这里要填具体mock的api的host
    }
  };
  app.use(proxy('/api-bin', options));
};
```

### vue-cli 3.x

```js
// vue.config.js
// ...
devServer: {
  proxy: {
    '/api-bin': {
      target: 'http://127.0.0.1:8888',
      headers: {
        host: 'api.mock.com' // 本地测试不起效
      },
      onProxyReq: function(proxyReq, req, res) {
        proxyReq.setHeader('host', 'api.mock.com');
      }
    }
  }
}
// ...
```

### vue webpack模板(vue-cli 2.x)

```js
// config/index.js
//...
proxyTable: {
  '/api': {
    target: 'http://127.0.0.1:8888',
    headers: {
      host: 'api.mock.com'
    }
  }
}
//...
```

### webpack

[webpack.devServer](https://webpack.js.org/configuration/dev-server/)的代理功能使用的是[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)

其配置项和上面三者没有区别, 因为上面三者使用的也是[webpack.devServer](https://webpack.js.org/configuration/dev-server/)

### 代理工具

如果你的项目不依赖webpack(或其他类似打包工具), 也没有办法使用[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)进行代理

那可以使用代理工具进行转发, 如[whistle](https://github.com/avwo/whistle)

```bash
api.mock.com/api-bin 127.0.0.1:8888 # api.mock.com/api-bin/*的请求都会被转发到mock服务器
api.mock.com 127.0.0.1:8080 # 开发时用于server前端资源启动的本地服务器
# api.mock.com /path/to/your/fe/project/index.html # 或者直接使用本地文件
```

## mock api

如果你想mock的api完整url为`api.mock.com/api-bin/api1`, 目录结构应该如下所示(文档中出现的完整配置, 可见[docs/mock](../mock))

```
${mock dir}
  |- api.mock.com
    |- api-bin
      |- api1
        |- option1
          |- data.js
        |- option2
          |- data.js
```

## 多状态切换

你可以在一个api下存放多个状态的数据返回, 通过在前端页面(`http://127.0.0.1:${port}/view/mocks`), 勾选中希望返回的状态

```js
// ${mock dir}/api.mock.com/api1/option1/data.js
module.exports = {
  code: '0',
  msg: 'return option 1'
};

// ${mock dir}/api.mock.com/api1/option2/data.js
module.exports = {
  code: '0',
  msg: 'return option 2'
};
```

![check select option1](../img/1.png)

然后通过代理请求到`api.mock.com/api-bin/api1`

![response with option1](../img/2.png)

## 更多配置

### 返回html

```js
// ${mock dir}/path/represent/your/api/return html/data.js
module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Document</title>
</head>
<body>return html</body>
</html>
`;
```

![check select return html](../img/3.png)
![response with option1 - return html](../img/4.png)

### 耗时api

如果要模拟耗时过长的api, 可通过`http.js`进行指定

```js
// ${mock dir}/path/represent/your/api/time cose 2s/data.js
module.exports = {
  code: '0',
  msg: 'response after 2s'
};

// ${mock dir}/path/represent/your/api/time cose 2s/http.js
module.exports = {
  delay: 2, // 如果没有http.js文件或没有指定delay, 默认为0.2
}
```

![response after 2s](../img/5.png)
![status of response](../img/6.png)

### http请求状态码

如果需要模拟api除200以外的状态码, 同样可以通过`http.js`中指定

```js
// ${mock dir}/path/represent/your/api/http statuc code 404/data.js
module.exports = 'Not Found';

// ${mock dir}/path/represent/your/api/http statuc code 404/http.js
module.exports = {
  status: 404
}
```

![response Not Found](../img/7.png)
![response status code 404](../img/8.png)

### http.js更多配置

`http.js`支持的配置项和默认值如下, 可根据需求自行调整

```js
// http.js
module.exports = {
  header: {
    Connection: 'Close',
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*'
  }, // http header
  status: 200, // http请求状态码, 默认为200
  delay: 0.2 // 请求耗时, 默认为0.2s
}
```

### js逻辑

`data.js`可export一个函数, 传入参数[ctx](https://koajs.com/#context), 需要返回一个带data字段数据的对象

```
function(ctx: koa context): Object { data, [header, status, delay] }
```

```js
// ${mock dir}/path/represent/your/api/mock with function/data.js
module.exports = function(ctx) {
  const { request: req } = ctx;
  let { id } = req.query;

  return {
    data: {
      code: '0',
      msg: `you request with id: ${id}`
    }
  };
}
```

![mock with function](../img/9.png)

你可以在方法中尽可能去模拟线上api的行为, 包括http请求方法的限制, 参数检查等, 并根据不同的输入响应不同的输出.

**注意**: 当`data.js`中需要使用外部npm模块时, 务必不要在模块安装到`${mock dir}`根目录下, 请安装到`${mock dir}`的父级目录

```bash
# cwd: ./
npm install
```

```js
// cwd: ./mock/path/represent/your/api/mock with function/data.js
const xxx = require('xxx'); // npm模块
module.exports = {};
```

## 代理线上数据

有时候在项目迭代中, 线上/测试环境服务器上的部分api是可用的

这时可能只需要mock新增的api, 而没有勾选返回的mock api或mock数据没有定义的api, 则直接请求到目标服务器

```js
// ${mock dir}/proxy.js
module.exports = {
  'api.mock.com': 'https://192.168.0.xxx' // ip为请求最终指向的服务器ip, 注意协议https/http不可省略
};
```

![proxy to target server](../img/10.png)

这个时候你请求 `api.mock.com/api-bin/api1` 或 `api.mock.com/api-bin/api2`, 都会最终请求到ip为`192.168.0.xxx`的服务器.

## 批量切换

不同的业务逻辑/异常流程, 可能都不仅仅只牵扯到1个接口

当要模拟线上完整的操作流程时, 如果涉及多个接口多个状态切换, 可能就会比较麻烦

这个时候可以定义在mock数据存放目录下新增`_set`目录, 用于存放多个mock api流程的数据

```
${mock dir}
  |- _set
    |- api flow 1
      |- api.mock.com
        |- api-bin
          |- api1
            |- data.js
          |- api2
            |- data.js
```

```js
// ${mock dir}/_set/path/represent/your/api/api1/data.js
module.exports = {
  code: '0',
  msg: 'match api flow, return from api1'
}

// ${mock dir}/_set/path/represent/your/api/api2/data.js
module.exports = {
  code: '0',
  msg: 'match api flow, return from api2'
}

// 另外你可以直接使用mock api配置中的data
// ${mock dir}/_set/path/represent/your/api/api2/data.js
const data = require('${mock dir}/path/represent/your/api/option1/data.js');
module.exports = data;
```

然后进入页面(`http://127.0.0.1:${port}/view/sets`)进行勾选

![mock with function](../img/11.png)
![mock with function](../img/12.png)
![mock with function](../img/13.png)

这个时候请求api会优先对mock set中的api进行匹配

如匹配到了则返回, 如匹配失败就会在mock api中再次匹配

如果mock api中也匹配失败, 则会检查`proxy.js`并转发到线上

如并没有配置线上ip, 则会直接返回404

## 推荐用法

建议将mock-server-local作为开发依赖安装到具体项目中去

```bash
cd xxx_project

npm install mock-server-local --save-dev
```

在项目目录下新建mock目录用于存放mock api配置

```
|- xxx_project
  |- mock
  |- package.json
```

然后使用npm script来启动mock服务器

```js
// package.json
{
  //...
  "scripts": {
    "mock": "mock -p 8888 -d ./mock"
  },
  //...
}
```

```bash
npm run mock
```

以项目为维度存放mock数据, 项目成员共同维护

而且项目的新加入成员也可以通过mock数据更好的了解熟悉具体的业务逻辑/异常流程

## 开发

```bash
git clone https://github.com/funkyLover/mock-server.git

cd mock-server && npm install

cd fe && npm install

npm run dev # cwd: /path/to/mock-server
```

## Roadmap

- socket支持
- 以后台进程运行
- 请求记录与展示
- ...
