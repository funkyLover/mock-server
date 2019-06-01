# 请求转发

在项目的迭代过程中, 并不是所有接口都是需要 mock 模拟的

可能会有部分可用接口已经部署在测试/生产环境, 这个时候会希望可用接口直接请求, 而对新增接口进行 mock

一种做法的是修改代理的配置

```bash
# 新增接口转发至mock server
api.target.com/api/new1 127.0.0.1:8888

api.target.com/api/new2 127.0.0.1:8888

# 其余接口直接转发到线上/测试机数据
api.target.com/api xxx.xx.x.xxx
```

或者可以使用 mock server 提供的简单的代理功能

只需要在 mock 目录下新建`proxy.js`文件

```js
|- mock
  |- proxy.js

// proj/mock/proxy.js
module.exports = {
  // 这里可以指定ip也可以指定域名, 都需要带上协议类型
  'api.target.com': 'https://xxx.xx.x.xxx'
}
```

然后代理工具中依然和之前一样的配置, 把所有的接口都代理 mock server

```bash
# 所有接口都转发到mock server
api.target.com/api 127.0.0.1:8888
```

当请求的接口在 mock server 中没有配置或没有被勾选时, 就会被请求转发到目标 ip 或 url

而如果连`proxy.js`也没有配置转发规则, 则会直接请求线上
