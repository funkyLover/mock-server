<template>
  <el-button size="small" class="btn-copy">
    <slot></slot>
  </el-button>
</template>

<script>
import Clipboard from 'clipboard';

export default {
  name: 'Comps-CopyBtn',
  props: {
    content: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      cb: null
    };
  },
  mounted() {
    this.setupClipboard();
  },
  beforeDestroy() {
    this.cb && this.cb.destroy();
  },
  methods: {
    setupClipboard() {
      this.cb = new Clipboard(this.$el, {
        text: trigger => {
          return this.content;
        }
      });

      this.cb.on('success', e => {
        e.clearSelection();
        this.$emit('success');
      });

      this.cb.on('error', e => {
        this.$emit('error');
      });
    }
  }
};
</script>
