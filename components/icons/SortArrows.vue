<template>
  <div class="icons-container mr-3 mb-1">
    <v-icon class="material-icons-round" :color="ascColor" :small="!size" :size="size">north</v-icon>
    <v-icon class="material-icons-round icon-approach" :color="descColor" :small="!size" :size="size">south</v-icon>
  </div>
</template>

<script>
export default {
  props: {
    ascColor: {
      type: String,
      default: ''
    },
    descColor: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: null
    }
  }
}
</script>

<style scoped>
  .icons-container {
    position: relative;
  }
  .icon-approach {
    position: absolute;
    top: 4px;
    right: 0;
    bottom: 0;
    left: 12px;
  }
</style>