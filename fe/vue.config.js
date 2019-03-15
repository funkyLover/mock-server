module.exports = {
  lintOnSave: false,
  publicPath: '/fe/dist/',
  devServer: {
    proxy: 'http://127.0.0.1:8888'
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
