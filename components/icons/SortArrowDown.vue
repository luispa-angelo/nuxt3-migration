<template>
  <svg :width="width" :height="height" :fill="color" viewBox="0 0 8 14" xmlns="http://www.w3.org/2000/svg">
    <path fill-rule="evenodd" clip-rule="evenodd" d="M6.91701 9.92637C7.20458 9.70222 7.6241 9.74779 7.85401 10.0282C8.08393 10.3085 8.03719 10.7175 7.74962 10.9417L4.83261 13.2154C4.34577 13.5949 3.65423 13.5949 3.16739 13.2154L0.250384 10.9417C-0.0371911 10.7175 -0.0839316 10.3085 0.145986 10.0282C0.375905 9.74778 0.795417 9.70222 1.08299 9.92637L3.33334 11.6804L3.33334 1.14995C3.33334 0.790994 3.63181 0.5 4 0.5C4.36819 0.5 4.66666 0.790994 4.66666 1.14995L4.66666 11.6804L6.91701 9.92637Z" fill="#949CAB"/>
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