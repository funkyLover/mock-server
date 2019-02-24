module.exports = {
  lintOnSave: false,
  publicPath: '/fe/dist/',
  devServer: {
    proxy: 'http://127.0.0.1:8888'
  }
};
