<template>
  <div class="mocks">
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
export default {
  name: 'Page-Mock',
  beforeRouteLeave(to, from, next) {
    this.$requestId && clearTimeout(this.$requestId);
    return next();
  },
  data() {
    return {
      mocks: {},
      proxy: {},
      mockChecked: {}
    };
  },
  mounted() {
    this.reqestMock();
  },
  methods: {
    async reqestMock() {
      const { $req, $awaitTo } = this;

      const req = $req({ url: '/$mock' });
      const { data } = await $awaitTo(req);

      console.log(data);
      const mocks = data.mock;
      const mockChecked = data.mockChecked;

      this.mocks = this._.omit(mocks, ['_proxy']);
      this.mockChecked = mockChecked;
      this.proxy = mocks._proxy;

      this.$requestId = setTimeout(() => {
        this.reqestMock();
      }, 1000);
    },
    async reqestMockCheck(id, index) {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$mock-check',
        data: { id, index }
      });

      await $awaitTo(req);
    },
    bindCheckItem(key, i) {
      switch (this.mockChecked[key]) {
        case undefined:
          this.$set(this.mockChecked, key, i);
          break;
        case i:
          this.mockChecked[key] = -1;
          break;
        case 0:
          this.mockChecked[key] = i;
          break;
        default:
          this.mockChecked[key] = i;
          break;
      }

      this.reqestMockCheck(key, i);
    }
  }
};
</script>

<style lang="scss">
.mocks {
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
