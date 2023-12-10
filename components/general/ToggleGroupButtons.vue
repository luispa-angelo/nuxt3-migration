<template>
  <v-btn-toggle
    v-bind="$attrs"
    v-on="$listeners"
    rounded
    mandatory
    class="custom_btn_toggle_wrapper"
    :value="value"
    v-if="buttons && buttons.length > 0"
  >
    <!-- Max number of buttons allowed on component (6) -->
    <v-btn
      v-for="(button, index) in buttons.slice(0, 5)"
      :key="index"
      :small="size === 'small' ? true : false"
      v-tooltip="{
        content: ` ${
          button.description
            ? `<div class='v-btn-tooltip'>${button.description}</div>`
            : ''
        }`,
        boundariesElement: 'window',
        placement: placement,
      }"
      :disabled="button.disabled ? button.disabled : false"
      @click="$emit('input', index)"
      :data-test="
        button.dataTest !== '' ? button.dataTest : `btnToggleGroup-${index}`
      "
    >
      <v-icon class="material-icons-outlined" v-if="button.icon"
        >{{ button.icon }}
      </v-icon>
      <span class="font-stamp-medium button_text" v-if="button.text"
        >{{ button.text }}
      </span>
    </v-btn>
  </v-btn-toggle>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    value: [Number, String],
    buttons: {
      /** Object interface { icon?: '', description?: '': text?: '', disabled: false, dataTest: '' }  **/
      type: Array,
    },
    size: {
      type: String,
      default: 'default' /** default | small **/,
    },
    placement: {
      type: String,
      default: 'top',
    },
  },
}
</script>

<style lang="scss" scoped>
.custom_btn_toggle_wrapper {
  position: relative;
  background: var(--v-grey-lighten5) !important;

  .v-btn {
    height: 40px !important;
    min-width: 44px !important;
    background: var(--v-grey-lighten5) !important;
    border: none !important;

    .button_text {
      padding-bottom: 2px;
      padding-left: 4px;
    }

    .button_text,
    i {
      color: var(--v-sub-text-base) !important;
    }

    i {
      font-size: 1.4rem;
      padding: 4px;
    }

    &.v-size--small {
      height: 36px !important;
    }
    &.v-item--active {
      background: var(--v-white-base) !important;
      border-radius: inherit;
      border: 1px solid rgba(0, 0, 0, 0.12) !important;
    }

    &:hover:not(.v-item--active) {
      background: var(--v-stroke-lighten3) !important;
      border-radius: inherit;
      i,
      .button_text {
        color: var(--v-grey-base) !important;
      }
    }
    &.v-item--active {
      i,
      .button_text {
        color: var(--v-primary-base) !important;
      }
    }
    &.v-btn--disabled {
      padding: 0 9px !important;
      background: var(--v-grey-lighten5) !important;
      .button_text,
      i {
        color: var(--v-stroke-darken1) !important;
      }
    }
  }
}
</style>
