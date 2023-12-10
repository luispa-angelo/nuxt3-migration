<template>
  <main>
    <v-app-bar color="secondary" :elevation="elevation">
      <div class="w-100 d-flex justify-space-between align-center">
        <div class="d-flex justify-space-between align-center">
          <h6 class="default-text--text mr-3">{{ title }}</h6>
          <slot name="subtitle"></slot>
        </div>
        <div>
          <v-btn
            data-test="btnDialogHeaderConfirm"
            v-if="hasConfirmButton"
            fab
            color="secondary"
            class="mr-2"
            @click="handleConfirm"
          >
            <v-icon>mdi-check</v-icon>
          </v-btn>
          <v-btn
            data-test="btnDialogHeaderMinimize"
            v-if="enableMinimize"
            fab
            color="secondary"
            @click="handleMinimize"
            v-tooltip="{
            content: `
                <div class='v-btn-tooltip'>
                  Minimizar
                </div>
              `,
              placement: 'bottom-center',
            }"
          >
            <v-icon>mdi-minus</v-icon>
          </v-btn>
          <v-btn 
            data-test="btnDialogHeaderClose"
            fab
            color="secondary"
            @click="handleCancel"
            v-tooltip="{
            content: `
                <div class='v-btn-tooltip'>
                  Fechar
                </div>
              `,
              placement: 'bottom-center',
            }"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </div>
    </v-app-bar>
    <v-card-subtitle v-if="subtitle" class="v-card-subtitle sub-text--text pl-4">{{ subtitle }}</v-card-subtitle>
  </main>
</template>
<script>
export default {
  props: {
    elevation: {
      type: Number,
      default: 1
    },
    title: {
      type: String,
      default: '',
    },
    subtitle: {
      type: String,
      default: '',
    },
    hasConfirmButton: {
      type: Boolean,
      default: false,
    },
    enableMinimize: {
      type: Boolean,
      default: false,
    }
  },
  methods: {
    handleMinimize() {
      this.$emit('onMinimize')
    },
    handleCancel() {
      this.$emit('onCancel')
    },
    handleConfirm() {
      this.$emit('onConfirm')
    }
  }
}
</script>

<style scoped>
  .v-card-subtitle {
    margin-top: -20px
  }
</style>