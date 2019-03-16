import Vue from 'vue';
import Vuex from 'vuex';
import _ from 'lodash';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    mocks: {},
    mockChecked: {},
    sets: {},
    setChecked: null,
    proxy: {}
  },
  mutations: {
    updateMock(state, mockData) {
      state.mocks = _.omit(mockData.mock, ['_set', '_proxy']);
      state.sets = mockData.mock._set;
      state.proxy = mockData.mock._proxy;
      state.mockChecked = mockData.mockChecked;
      state.setChecked = mockData.setChecked;
    },
    mockChecked(state, { key, index }) {
      state.mockChecked[key] = index;
    },
    setChecked(state, { id }) {
      state.setChecked = id;
    }
  },
  actions: {}
});
