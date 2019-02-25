<template>
  <el-container class="app">
    <el-header class="app-header"><p>Mock Server</p></el-header>
    <el-container>
      <el-aside class="app-menu">
        <el-row>
          <el-col :span="24">
            <el-menu class="menu" :router="true">
              <el-menu-item index="/mocks">Mock Data</el-menu-item>
            </el-menu>
          </el-col>
        </el-row>
      </el-aside>
      <el-main class="app-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'app',
  components: {}
};
</script>

<style lang="scss">
@import './styles/common/colors.scss';
@import './styles/app.scss';

.app .app-header {
  background: $black;
  color: #fff;
  font-weight: 600;
  font-size: 24px;
  align-items: center;
  display: flex;
  p {
    margin: 0;
  }
}

.app .app-menu {
  background: $white;
}
</style>
