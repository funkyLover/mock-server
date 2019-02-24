import Vue from 'vue';
import axios from 'axios';

Vue.prototype.$req = ({ url, method = 'get', data = {} }) => {
  let opt = {};

  opt.method = method;
  opt.url = url;

  if (method === 'get' && data) {
    opt.params = data;
  } else {
    opt.data = data;
  }

  return axios(opt).then(
    res => {
      if (res.status !== 200) {
        return Promise.reject({
          code: res.status,
          msg: 'request error'
        });
      }

      return res.data;
    },
    err => {
      const { response: res, request: req } = err;
      if (res) {
        return Promise.reject({
          code: res.status,
          msg: 'request error'
        });
      } else if (req) {
        return Promise.reject({
          code: '-2',
          msg: 'network error'
        });
      }

      return Promise.reject({
        code: '-3',
        msg: err.message
      });
    }
  );
};
