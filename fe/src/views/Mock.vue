<template>
  <div class="page-mock">
    <el-collapse accordion>
      <el-collapse-item v-for="(val, key) in mocks" :key="key">
        <template slot="title">
          {{ key }}
        </template>
        <div v-for="(mock, i) in val" :key="mock.label">
          <el-checkbox
            :value="mockChecked[key] === i"
            @change="bindCheckItem(key, i)"
            >{{ mock.label }}</el-checkbox
          >
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Page-Mock',
  data() {
    return {};
  },
  computed: {
    ...mapState(['mocks', 'mockChecked'])
  },
  methods: {
    async reqestMockCheck(id, index) {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$mock-check',
        data: { id, index }
      });

      await $awaitTo(req);
    },
    bindCheckItem(key, index) {
      switch (this.mockChecked[key]) {
        case undefined:
          break;
        case index:
          index = -1;
          break;
      }
      this.$store.commit('mockChecked', { key, index });
      this.reqestMockCheck(key, index);
    }
  }
};
</script>

<style lang="scss">
.page-mock {
  .el-collapse-item__header {
    font-size: 18px;
    padding-left: 10px;
  }

  .el-collapse-item__content {
    padding-left: 30px;

    .el-checkbox__label {
      font-size: 16px;
    }
  }
}
</style>
