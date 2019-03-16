import Vue from 'vue';
import axios from 'axios';

const defaults = {
  loading: false,
  autoError: true
};

Vue.prototype.$req = ({ url, method = 'get', data = {}, ...args }) => {
  let opt = {};

  opt.method = method;
  opt.url = url;

  if (method === 'get' && data) {
    opt.params = data;
  } else {
    opt.data = data;
  }

  const config = {
    ...defaults,
    ...args
  };

  let loading = config.loading && Vue.prototype.$loading();

  return axios(opt).then(
    res => {
      loading && loading.close();
      if (res.status !== 200) {
        let err = {
          code: res.status,
          msg: 'request error'
        };
        config.autoError && errorHandler(err);
        return Promise.reject(err);
      }

      return res.data;
    },
    err => {
      loading && loading.close();
      const { response: res, request: req } = err;
      let data = {
        code: '-3',
        msg: err.message
      };
      if (res) {
        data = {
          code: res.status,
          msg: 'request error'
        };
      } else if (req) {
        data = {
          code: '-2',
          msg: 'network error'
        };
      }

      config.autoError && errorHandler(data);
      return Promise.reject(data);
    }
  );
};

function errorHandler(err) {
  Vue.prototype.$message.error(`[${err.code}]${err.msg}`);
}
