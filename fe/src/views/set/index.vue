<template>
  <div class="page-set">
    <el-collapse v-if="!isEmpty">
      <el-collapse-item
        class="sets"
        v-for="(setVal, setKey) in sets"
        :key="setKey"
      >
        <template slot="title">
          <el-checkbox
            class="set-check"
            :value="setChecked === setKey"
            @change="bindCheckItem(setKey)"
          ></el-checkbox
          >{{ setKey }}
        </template>
        <div v-for="(api, apiKey) in setVal" :key="apiKey">
          <el-collapse accordion class="api-details">
            <el-collapse-item>
              <template slot="title">
                {{ apiKey }}
              </template>
              <p class="details"><span>data</span>: {{ api.data }}</p>
              <p class="details"><span>http header</span>: {{ api.header }}</p>
              <p class="details"><span>http status</span>: {{ api.status }}</p>
              <p class="details"><span>time cost</span>: {{ api.delay }}s</p>
            </el-collapse-item>
          </el-collapse>
        </div>
      </el-collapse-item>
    </el-collapse>
    <div v-if="isEmpty" class="tips">
      No set data yet, want
      <el-button type="text" @click="bindGenerate"
        >generate with template</el-button
      >?
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Page-Set',
  data() {
    return {};
  },
  computed: {
    ...mapState(['sets', 'setChecked']),
    isEmpty() {
      return _.isEmpty(this.sets);
    }
  },
  methods: {
    async bindGenerate() {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$create',
        data: {
          type: 'set'
        },
        loading: true
      });

      const { err } = await $awaitTo(req);
      if (err) {
        return;
      }
      this.$message.success('success');
    },
    async reqestSetCheck(id) {
      const { $req, $awaitTo } = this;

      const req = $req({
        url: '/$set-check',
        data: { id }
      });

      await $awaitTo(req);
    },
    bindCheckItem(id) {
      switch (this.setChecked) {
        case null:
          break;
        case id:
          id = -1;
          break;
        default:
          break;
      }

      this.$store.commit('setChecked', { id });
      this.reqestSetCheck(id);
    }
  }
};
</script>

<style lang="scss">
.page-set {
  .sets .el-collapse-item__header {
    font-size: 18px;
    line-height: 1.2;
    margin-left: 40px;
    position: relative;
  }

  .sets .set-check {
    position: absolute;
    transform: translate(-50%);
    left: -20px;
  }

  .el-collapse-item__content {
    .el-checkbox__label {
      font-size: 16px;
    }
  }

  .api-details {
    .el-collapse-item__header {
      font-size: 16px;
      padding-left: 20px;
      margin-left: 0;
    }

    .el-collapse-item__content {
      padding-left: 30px;
    }

    p.details {
      font-size: 15px;
      margin: 5px;
      margin: 0 auto;
      font-size: 15px;

      span {
        width: 90px;
        display: inline-block;
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
