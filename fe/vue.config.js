module.exports = {
  lintOnSave: false,
  publicPath: '/fe/dist/',
  devServer: {
    proxy: {
      '^/\\$': {
        target: 'http://127.0.0.1:8888',
        headers: {
          host: '127.0.0.1:8888' // not work
        },
        onProxyReq: function(proxyReq, req, res) {
          proxyReq.setHeader('host', '127.0.0.1:8888');
        }
      }
    }
  },
  css: {
    loaderOptions: {
      sass: {
        includePaths: ['./src/styles'],
        data: `
          @import "common/colors.scss";
        `
      }
    }
  }
};
