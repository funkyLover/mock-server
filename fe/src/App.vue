<template>
  <el-container class="app">
    <el-header class="app-header"><p>Mock Server</p></el-header>
    <el-container>
      <el-aside class="app-menu">
        aside
      </el-aside>
      <el-main class="app-content">
        main
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'app',
  components: {},
  methods: {
    async bindGetMocks() {
      const { $req, $awaitTo } = this;

      const req = $req({ url: '/$mock' });
      const { data } = await $awaitTo(req);

      console.log(data);
    }
  }
};
</script>

<style>
@import './styles/app.scss';

.app .app-header {
}
</style>
