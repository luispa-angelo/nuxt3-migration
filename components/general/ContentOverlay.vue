<template>
  <v-overlay :value="showOverlay">
    <div class="overlay-wrapper" v-click-outside="handleCloseOnClick">
      <slot name="overlay" />

      <span class="close" @click="$emit('closeOverlay')">
        Sair da tela cheia

        <i class="icon-presets material-symbols-rounded pl-2 theme--light">
          fullscreen_exit
        </i>
      </span>
    </div>
  </v-overlay>
</template>

<script>
export default {
  props: {
    showOverlay: Boolean,
    closeOnClick: Boolean,
  },
  data: () => ({}),
  methods: {
    handleCloseOnClick() {
      if (this.closeOnClick && this.showOverlay)
        return this.$emit('closeOverlay')
    },
  },
}
</script>

<style scoped lang="scss">
.overlay-wrapper {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  background: #fff;

  padding: 3rem 0.8rem 0.8rem;
  border-radius: 6px;

  .close {
    position: absolute;
    top: 10px;
    right: 10px;

    display: flex;
    align-items: center;
    cursor: pointer;

    &,
    i {
      color: var(--v-sub-text-base);
    }
  }
}
</style>
