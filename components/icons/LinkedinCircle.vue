<template>
  <svg :width="width" :height="height" :fill="color" viewBox="0 0 25 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12.3125" cy="12" r="11.5" fill="white" :stroke="color"/>
    <path 
      d="M13.7768 17.1078H10.7768V8.6792H13.7768V9.40097C13.7768 9.51562 14.0801 9.6137 14.1677 9.53971C14.6064 9.16908 15.4084 8.81737 16.6339 8.81737C18.2054 8.81737 19.0625 10.0609 19.0625 11.4427V14.2752V17.1078H16.2054V11.9954C16.2054 11.5808 15.8911 11.1663 14.9197 11.1663C14.0625 11.1663 13.7768 11.5808 13.7768 11.9954V17.1078Z"
      :fill="color"
    />
    <path d="M9.16964 8.67871H6.3125V17.1073H9.16964V8.67871Z" :fill="color" />
    <ellipse cx="7.74107" cy="6.53571" rx="1.42857" ry="1.28571" :fill="color" />
  </svg>
</template>

<script>
export default {
  props: {
    width: { type: Number, default: 16 },
    height: { type: Number, default: 16 },
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