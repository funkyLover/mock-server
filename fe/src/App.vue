<template>
  <el-container class="app">
    <el-header class="app-header" height="70px">
      <img class="logo" src="@/assets/nav-logo.png" />

      <div class="links">
        <a
          class="link"
          href="https://github.com/funkyLover/mock-server"
          target="_blank"
        >
          <img class="ico" src="@/assets/github.svg" /><span>GitHub</span>
        </a>
        <a
          class="link"
          href="https://github.com/funkyLover/mock-server/blob/master/README.md"
          target="_blank"
        >
          <img class="ico" src="@/assets/docs.svg" /><span>Docs</span>
        </a>
        <el-dropdown>
          <a class="link" href="javascript:void(0)">
            <img class="ico" src="@/assets/earth.svg" /><span>EN</span>
          </a>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>中文</el-dropdown-item>
            <el-dropdown-item>English</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>
    <el-container class="app-container">
      <el-aside class="app-menu" width="20%">
        <el-menu class="menu" :router="true" :default-active="$route.path">
          <el-menu-item class="menu-item" index="/mocks">
            <img class="ico" src="@/assets/file.svg" />
            <span class="menu-title" slot="title">API mock</span>
          </el-menu-item>
          <el-menu-item class="menu-item" index="/sets">
            <img class="ico" src="@/assets/flow.svg" />
            <span class="menu-title" slot="title">Flow mock</span>
          </el-menu-item>
          <el-menu-item class="menu-item" index="/proxys">
            <img class="ico" src="@/assets/proxy.svg" />
            <span class="menu-title" slot="title">Proxy</span>
          </el-menu-item>
        </el-menu>
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
  components: {},
  mounted() {
    this.reqestMock();
  },
  methods: {
    async reqestMock() {
      const { $req, $awaitTo } = this;

      const req = $req({ url: '/$mock', autoError: false });
      const { data, err } = await $awaitTo(req);

      if (data) {
        this.error = false;
        this.$store.commit('updateMock', data);
      }

      if (err && !this.error) {
        this.error = true;
        this.$message.error(`[${err.code}]${err.msg}`);
      }

      this.$requestId = setTimeout(() => {
        this.reqestMock();
      }, 1500);
    }
  }
};
</script>

<style lang="scss">
@import './styles/common/colors.scss';
@import './styles/app.scss';

.app .app-header {
  background: $main;
  align-items: center;
  display: flex;
  padding: 0 30px;
  justify-content: space-between;

  .logo {
    width: 235px;
    height: 42px;
    display: block;
  }

  p {
    margin: 0;
  }

  .links {
    margin-left: 20px;
    flex: 1;
    display: flex;
    justify-content: flex-end;

    .link {
      color: $black;
      font-size: 24px;
      line-height: 31px;
      display: flex;
      align-items: center;
      margin-left: 30px;
      text-decoration: none;
    }

    .link .ico {
      height: 24px;
      width: auto;
    }

    .link span {
      margin-left: 10px;
    }

    .link:hover {
      text-decoration: underline;
    }
  }
}

.app .app-menu {
  background: $white;
  max-width: 380px;
  min-width: 220px;

  .menu {
    height: 100%;
    border-right: none;
    background-image: linear-gradient(
      to bottom,
      white,
      $white-dark 50%,
      white 100%
    );
    background-size: 1px;
    background-position: right;
    background-repeat: no-repeat;
  }

  .menu-item {
    display: flex;
    align-items: center;
    padding-left: 30px;
  }

  .menu-title {
    font-size: 24px;
    line-height: 31px;
    margin-left: 10px;
  }

  .ico {
    display: block;
    height: 26px;
    width: auto;
  }
}

.app .app-container {
  margin-top: 25px;
}
</style>
