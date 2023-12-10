<template>
  <div>
    <v-list-item v-if="requestType == 'Apoio'">
      <v-btn
        @click="dialog = !dialog"
        block
        text
        :color="isDialog ? 'primary' : ''"
        :disabled="disableBtn"
      >
        Cancelar Solicitação
      </v-btn>
    </v-list-item>
    <v-dialog v-model="dialog" max-width="390">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="dialog = !dialog" />
        <v-card-text class="text-center pt-3">
          <p class="subtitle-1 mb-2">
            <v-icon color="orange" large class="material-symbols-outlined" style="margin-left: -185px">icon_close</v-icon>
            Cancelar Solicitação
          </p>
          <p class="mb-0">Tem certeza que deseja cancelar essa solicitação?</p>
        </v-card-text>
        <DialogAction
          :show-divider="false"
          actions-align="center"
          submit-text="Sim, cancelar"
          cancel-text="Não, voltar"
          @submit="submitForm"
          @cancel="handleCancel"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    isDialog: {
      type: Boolean,
      default: false
    },
    disableBtn: {
      type: Boolean,
      default: false
    },
    requestType: {
      type: String
    },
    itemId: {
      type: Number
    }
  },
  data: () => ({
    dialog: false,
    url: {
      cancelRequest: '/csc/cancel-request'
    }
  }),
  methods: {
    async submitForm() {
      await this.updateData(`${this.url.cancelRequest}?id=${this.itemId}`)
      await this.handleCancel()
      this.$swal({
        position: 'top-end',
        icon: 'success',
        title: 'Solicitação cancelada com sucesso!',
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })
      await this.$emit('reloadData')
    },
    handleCancel() {
      this.dialog = false
    }
  }
}
</script>