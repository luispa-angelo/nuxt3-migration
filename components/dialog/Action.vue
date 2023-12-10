<template>
  <div>
    <v-divider v-if="showDivider"></v-divider>
    <v-card-actions :class="alignClass" class="py-4">
      <slot name="customButton"></slot>
      <v-btn
        data-test="btnDialogActionCancel"
        v-if="!hideCancel"
        id="btn-cancel-dialog"
        class="mr-2"
        :color="cancelColor"
        :disabled="disableCancel"
        @click="handleCancel"
      >
        {{ cancelText }}
      </v-btn>
      <v-btn
        data-test="btnDialogActionSubmit"
        v-if="!hideSubmit"
        id="btn-submit-dialog"
        :disabled="disableSubmit"
        :loading="loadingSubmit"
        :color="submitColor"
        @click="submit"
      >
        {{ submitText }}
      </v-btn>
    </v-card-actions>
  </div>
</template>
<script>
export default {
  props: {
    showDivider: {
      type: Boolean,
      default: true
    },
    actionsAlign: {
      type: String,
      default: 'end'
    },
    hideSubmit: {
      type: Boolean,
      default: false
    },
    hideCancel: {
      type: Boolean,
      default: false
    },
    disableSubmit: { 
      type: Boolean,
      default: false
    },
    disableCancel: { 
      type: Boolean,
      default: false
    },
    submitColor: {
      type: String,
      default: 'primary'
    },
    cancelColor: {
      type: String,
      default: 'secondary'
    },
    submitText: {
      type: String,
      default: 'Salvar'
    },
    cancelText: {
      type: String,
      default: 'Cancelar'
    },
    loadingSubmit: { 
      type: Boolean,
      default: false
    },
  },
  computed: {
    alignClass: function() {
      var value = null
      if(this.actionsAlign == 'start') {
        value = 'd-flex justify-start'
      }else if(this.actionsAlign == 'center') {
        value = 'd-flex justify-center'
      }else if(this.actionsAlign == 'end') {
        value = 'd-flex justify-end'
      }else if(this.actionsAlign == 'space-between') {
        value = 'd-flex justify-space-between'
      }
      return value
    }
  },
  methods: {
    submit() {
      this.$emit('submit')
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>