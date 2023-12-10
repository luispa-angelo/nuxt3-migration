<template>
  <div class="d-flex">
    <div class="icons-container">
      <v-icon class="overlay-icon" v-bind="overlayIconProps">{{overlayIcon}}</v-icon>
      <v-icon class="original-icon" v-bind="originalIconProps">{{originalIcon}}</v-icon>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    overlayIcon: String,
    originalIcon: String,
    overlayIconProps: Object,
    originalIconProps: Object,
  }
}
</script>

<style scoped>
  .icons-container {
    position: relative;
  }
  .overlay-icon {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    scale: 1.5;
    z-index: 1;
  }
  .original-icon {
    z-index: 0;
  }
</style>