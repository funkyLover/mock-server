import Vue from 'vue';
import Router from 'vue-router';
import Mock from './views/mock';
import MockSet from './views/set';
import ProxyConfig from './views/proxy';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: 'view',
  routes: [
    {
      path: '/mocks',
      name: 'mocks',
      component: Mock
    },
    {
      path: '/sets',
      name: 'sets',
      component: MockSet
    },
    {
      path: '/proxys',
      name: 'proxys',
      component: ProxyConfig
    }
  ]
});
