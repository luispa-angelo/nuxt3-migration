<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="handleCancel" />
        <v-card-text class="pt-3">
          <v-row class="text-center align-center justify-center mb-4">
            <v-icon class="mr-2" color="warning">warning_amber</v-icon>
            <h6>Arquivo muito grande</h6>
          </v-row>
          <v-row class="d-flex flex-column mb-2 align-center justify-center text-center">
          <span class="mb-2">{{text}}</span>
        </v-row>
        </v-card-text>
        <DialogAction
          hide-submit
          actions-align="center"
          cancel-text="Fechar"
          cancel-color="primary"
          :show-divider="false"
          @cancel="handleCancel"
        />
      </v-card>
    </v-dialog>
</template>

<script>

export default {
  props: {
    propDialog: Boolean,
    files: Array,
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    text: function() {
      const filesName = this.files.map((file) => file.file.name)
      return `${this.files.length > 1 ? 'Os arquivos' : 'O arquivo'} ${filesName.join(', ')} tem mais de 20 MB e não ${this.files.length > 1 ? 'podem ser anexados.' : 'pode ser anexado.'}`
    }
  },
  watch: {
    propDialog(newValue) {
      this.dialog = newValue
    }
  },
  methods: {
    handleCancel() {
      this.dialog = false
      this.$emit('onClose', false)
    },
  }
}
</script>

<style>

</style>