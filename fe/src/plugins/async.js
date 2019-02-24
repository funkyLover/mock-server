import Vue from 'vue';

Vue.prototype.$awaitTo = p => {
  return p.then(
    data => Promise.resolve({ data, err: null }),
    err => Promise.resolve({ err, data: null })
  );
};

Vue.prototype.$delay = delay => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, delay * 1000);
  });
};
