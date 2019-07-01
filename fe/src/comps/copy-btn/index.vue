<template>
  <el-button size="small" class="btn-copy" @click="bindCopy">
    <slot></slot>
  </el-button>
</template>

<script>
// import Clipboard from 'clipboard';

export default {
  name: 'Comps-CopyBtn',
  props: {
    content: {
      type: String,
      required: true
    }
  },
  methods: {
    bindCopy() {}
  }
};
</script>
