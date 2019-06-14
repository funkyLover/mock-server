import Vue from 'vue';
import Router from 'vue-router';
import Mock from './views/Mock';
import MockSet from './views/Set';
import ProxyConfig from './views/Proxy';

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
