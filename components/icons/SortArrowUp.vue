<template>
  <svg :width="width" :height="height" :fill="color" viewBox="0 0 8 14" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M1.08299 4.07363C0.795416 4.29778 0.375904 4.25221 0.145986 3.97185C-0.0839325 3.69148 -0.0371922 3.28248 0.250383 3.05832L3.16739 0.784606C3.65423 0.405132 4.34577 0.405131 4.83261 0.784606L7.74962 3.05832C8.03719 3.28248 8.08393 3.69148 7.85401 3.97185C7.6241 4.25221 7.20458 4.29778 6.91701 4.07363L4.66666 2.31955L4.66666 12.85C4.66666 13.209 4.36819 13.5 4 13.5C3.63181 13.5 3.33334 13.209 3.33334 12.85L3.33334 2.31955L1.08299 4.07363Z" fill="#949CAB"/>
  </svg>
</template>

<script>
export default {
  props: {
    width: { type: String, default: '16' },
    height: { type: String, default: '16' },
    fill: { type: String, default: 'inherit' },
  },
  computed: {
    color: function() {
      if (this.fill === 'none') {
        return this.fill
      }
      return `var(--v-${this.fill})`
    }
  }
}
</script>

<style lang="scss" scoped>
  .fill-class {
    fill: var(--v-internal-icon-text-base);
  }
</style>