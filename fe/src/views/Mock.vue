<template>
  <div class="page-mock">
    <div v-if="!isEmpty">
      <el-input
        class="search"
        placeholder="url to search"
        prefix-icon="el-icon-search"
        v-model="search"
      >
      </el-input>
      <el-collapse>
        <el-collapse-item v-for="(val, key) in mocks" :key="key">
          <template slot="title">
            <mk-highlight :str="search">{{ key }}</mk-highlight>
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
    <div v-if="isEmpty" class="tips">
      No data yet, want
      <el-button type="text" @click="bindGenerate"
        >generate with template</el-button
      >?
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Page-Mock',
  data() {
    return {
      search: ''
    };
  },
  computed: {
    ...mapState(['mocks', 'mockChecked']),
    isEmpty() {
      return _.isEmpty(this.mocks);
    }
  },
  methods: {
    async bindGenerate() {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$create'
      });

      const { err } = await $awaitTo(req);
      if (err) {
        return;
      }
      this.$message.success('success');
    },
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
  .search {
    margin-bottom: 10px;
  }
  .el-collapse-item__header {
    font-size: 18px;
    line-height: 1.2;
    padding-left: 10px;
  }

  .el-collapse-item__content {
    padding-left: 30px;

    .el-checkbox__label {
      font-size: 16px;
      &:hover {
        color: $main;
      }
    }
  }

  .tips {
    font-size: 20px;
    text-align: center;
    padding-bottom: 10px;
    border-bottom: 1px solid $white;
    .el-button {
      font-size: 20px;
      font-weight: 400;
    }
  }
}
</style>
