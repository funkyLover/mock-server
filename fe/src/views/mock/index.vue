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
      <el-collapse v-if="isMockEmpty">
        <el-collapse-item v-for="(val, key) in matchMocks" :key="key">
          <template slot="title">
            <el-checkbox
              @click.stop
              class="title-check"
              :value="isTitleChecked(key)"
              :disabled="isTitleCheckDisable(key)"
              @change="bindTitleCheck(key)"
            ></el-checkbox>
            <mk-highlight :str="search" class="title">{{ key }}</mk-highlight>
            <el-button
              @click.stop="bindVerify($event, key)"
              size="mini"
              class="btn"
              >verify</el-button
            >
            <copy-btn
              :content="key"
              size="mini"
              class="btn last"
              @click.native.stop
              @success="$message.success('copy url: ' + key)"
              @error="$message.error('error occurred')"
              type="primary"
              >copy</copy-btn
            >
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
      <div v-else class="tips">no api match `{{ this.search }}`</div>
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
    const base = `${window.location.protocol}//${window.location.host}`;
    return {
      search: '',
      base
    };
  },
  computed: {
    ...mapState(['mocks', 'mockChecked']),
    isEmpty() {
      return _.isEmpty(this.mocks);
    },
    isMockEmpty() {
      return Object.keys(this.matchMocks).length !== 0;
    },
    matchMocks() {
      if (!this.search || this.search.length === 0) {
        return this.mocks;
      }
      let mocks = {};
      Object.keys(this.mocks).forEach(k => {
        if (k.includes(this.search)) {
          mocks[k] = this.mocks[k];
        }
      });
      return mocks;
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
      console.log(this.mockChecked[key]);
      switch (this.mockChecked[key]) {
        case undefined:
          break;
        case index:
          index = -1;
          break;
      }
      this.$store.commit('mockChecked', { key, index });
      this.reqestMockCheck(key, index);
    },
    bindVerify(e, key) {
      const url = `${this.base}/$mock-api?api=${key}`;
      window.open(url, '_blank');
    },
    isTitleCheckDisable(key) {
      const apiMocks = this.mocks[key];
      const checked = this.mockChecked[key];

      if (apiMocks.length === 1) {
        return false;
      }

      if (checked !== -1 && (checked || checked === 0)) {
        return false;
      }

      return true;
    },
    isTitleChecked(key) {
      const checked = this.mockChecked[key];

      if (checked !== -1 && (checked || checked === 0)) {
        return true;
      }

      return false;
    },
    bindTitleCheck(key) {
      const apiMocks = this.mocks[key];
      const checked = this.mockChecked[key];

      if (apiMocks.length === 1) {
        return this.bindCheckItem(key, 0);
      }

      // 已勾选
      if (checked !== -1 && (checked || checked === 0)) {
        this.bindCheckItem(key, checked);
      }
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

  .title-check {
    margin-right: 10px;
    margin-top: 4px;
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
  .title {
    flex: 1;
  }
  .btn {
    padding: 5px 8px;
    margin-right: 10px;

    &.last {
      margin-left: 0;
    }
  }
}
</style>
