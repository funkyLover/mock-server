import Vue from 'vue';
import Router from 'vue-router';
import Mock from './views/Mock.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  base: 'view',
  routes: [
    {
      path: '/mocks',
      name: 'mocks',
      component: Mock
    }
  ]
});
