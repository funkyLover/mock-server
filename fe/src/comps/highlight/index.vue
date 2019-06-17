<script>
export default {
  name: 'Comps-Highlight',
  props: {
    str: {
      type: String,
      default: ''
    }
  },
  render(h) {
    const content = this.$slots.default[0].text;
    if (!this.str || this.str.length === 0) {
      return h('div', content);
    }
    const list = content.split(this.str);
    const len = list.length;
    const ele = [];

    list.forEach((v, i) => {
      ele.push(v);
      if (i !== len - 1) ele.push(h('span', this.str));
    });

    return h('div', ele);
  }
};
</script>

<style lang="scss" scoped>
@import '../../element-variables.scss';

span {
  color: $--color-primary;
}
</style>
