<template>
  <div class="page-proxy">
    <el-table
      v-if="proxyConfig.length !== 0"
      :data="proxyConfig"
      style="width: 100%"
    >
      <el-table-column prop="host" label="Host" min-width="200">
      </el-table-column>
      <el-table-column prop="target" label="Target" min-width="200">
      </el-table-column>
    </el-table>
    <div v-else class="tips">
      No proxy config yet, want
      <el-button type="text" @click="bindGenerate"
        >generate with template</el-button
      >?
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Page-Proxy',
  data() {
    return {};
  },
  computed: {
    ...mapState(['proxy']),
    proxyConfig() {
      const proxy = this.proxy;
      console.log(proxy);
      if (_.isEmpty(proxy)) return [];

      return Object.keys(proxy).map(k => ({ host: k, target: proxy[k] }));
    }
  },
  methods: {
    async bindGenerate() {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$create',
        data: {
          type: 'proxy'
        },
        loading: true
      });

      const { err } = await $awaitTo(req);
      if (err) {
        return;
      }
      this.$message.success('success');
    }
  }
};
</script>

<style lang="scss">
.page-proxy {
  .el-table th > .cell {
    font-size: 20px;
  }

  .el-table .cell {
    font-size: 18px;
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
