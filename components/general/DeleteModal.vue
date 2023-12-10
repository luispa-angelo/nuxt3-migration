<template>
  <main>
    <v-dialog v-model="dialog" max-width="400">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          data-test="btnDeleteModalOpen"
          v-if="iconDelete"
          text
          icon
          v-bind="attrs"
          v-on="on"
          :disabled="disabled"
        >
          <v-icon dense>mdi-trash-can-outline</v-icon>
        </v-btn>
        <v-list-item
          data-test="listDeleteModalOpen"
          v-else-if="!menuButton"
          v-bind="attrs"
          v-on="on"
        >
          <v-list-item-content>
            <v-list-item-title>
              {{ label }}
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-btn
          data-test="btnDeleteModalOpen"
          v-else
          v-bind="attrs"
          v-on="on"
          text
        >
          {{ label }}
        </v-btn>
      </template>
      <v-card>
        <DialogHeader :elevation="0" @onCancel="handleCancel" />
        <v-card-text class="text-center pt-3">
          <h6 class="title">
            <v-icon color="error" class="mr-2" large>mdi-alert-outline</v-icon>
            <slot name="title"></slot>
          </h6>
          <p style="font-size: 14px">
            <slot name="sub-title-1"></slot>
          </p>
          <v-form v-if="hasForm" @submit.prevent="submitForm" id="form" ref="form">
            <p class="subTitle2">
              <slot name="sub-title-2"></slot>
            </p>
            <v-text-field
              data-test="inputDeleteModalText"
              dense
              outlined
              hide-details="auto"
              v-model="formData.delete"
              :error="$v.formData.delete.$error"
              :error-messages="$v.formData.delete.$error ? 'Esse campo é obrigatório' : ''"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <DialogAction 
          actions-align="space-between"
          class="px-4"
          :show-divider="false"
          @submit="handleCancel"
          submit-text="Não, cancelar"
          submit-color="secondary"
          @cancel="submitForm"
          cancel-text="Sim, excluir"
          cancel-color="error"
        />
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogError" max-width="400">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="dialogError = !dialogError" />
        <v-card-text class="text-center">
          <h6 class="d-flex justify-center align-center mb-3">
            <v-icon color="error" class="mr-2" large>mdi-alert-outline</v-icon>
            Erro ao excluir
          </h6>
          <p class="font-body-large">
            {{ messageError }}
          </p>
          <v-btn data-test="btnDeleteModalClose" @click="dialogError = !dialogError" color="primary">Ok, fechar</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </main>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
const initialState = () => {
  return {
    dialog: false,
    dialogError: false,
    messageError: null,
    removeSpecialChars: /[^a-zA-Z0-9]/g,
    label: 'Excluir',
    formData: {
      delete: null,
    }
  }
}
export default {
  props: {
    itemId: Number,
    itemName: String,
    endpoint: String,
    hasForm: Boolean,
    iconDelete: Boolean,
    disabled: Boolean,
    isEmitEvent: Boolean,
    menuButton: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return initialState()
  },
  validations: {
    formData: {
      delete: { required }
    }
  },
  methods: {
    canDelete() {
      if(this.formData.delete === null) return false
      let text = this.formData.delete
      var clearText = text.replace(this.removeSpecialChars, '').toLowerCase()
      if(clearText === 'excluir') {
        return true
      }
      return false
    },
    async submitForm() {
      if(this.formData.delete) {
        this.$v.formData.$touch()
        if (this.$v.formData.$error) return
      }

      const canDelete = this.canDelete()
      if(canDelete || !this.hasForm) {
        try {
          await this.$axios.delete(`${this.endpoint}/${this.itemId}`)
          this.$emit('update-parent')
          this.handleCancel() 
        } catch (error) {
          const { data } = error
          const { detail } = data
          const message = this.translateDetail(detail)
          this.handleCancel()
          this.messageError = message
          this.dialogError = true
        }
      }else {
        this.$swal({
          icon: 'warning',
          html: `
            <h6>Aviso!</h6>
            <p class="subtitle-1">Você não digitou corretamente.</p>
          `,
          showConfirmButton: false,
          showCloseButton: true,
          timer: 2000,
          timerProgressBar: true,
          target: document.querySelector('#form')
        })
      }
    },
    translateDetail(detail) {
      if(/cannot delete pipeline associated to business:/i.test(detail)) {
        return 'Não é possível excluir pipeline associada a um negócio'
      } else {
        switch (detail) {
        case 'Company is associated with another team':
          return 'Essa Empresa está associada a um time, por isso não será possível realizar a exclusão.'
        case 'Remove opportunity before removing company':
          return 'Essa Empresa está associada a uma oportunidade, por isso não será possível realizar a exclusão.'
        case 'Remove subscription before removing company':
          return 'Essa Empresa está associada a uma assinatura, por isso não será possível realizar a exclusão.'
        case 'Remove association before removing company':
          return 'Essa Empresa está associada a um usuário, por isso não será possível realizar a exclusão.'
        case 'Remove opportunity aggregate before removing company':
          return 'Essa Empresa está associada a uma oportunidade, por isso não será possível realizar a exclusão.'
        case 'Remove invoice product before removing company':
          return 'Essa Empresa está associada a um produto, por isso não será possível realizar a exclusão.'
        case 'cannot delete stage with opportunities':
          return 'A fase não pode ser deletada com oportunidades.'
        case 'Cannot delete this business item because it has a pipeline associated':
          return 'Não é possível excluir este item de negócios porque ele possui um pipeline associado.'
        default:
          return detail
        }
      }
    },
    handleCancel() {
      this.$v.$reset()
      Object.assign(this.$data, initialState())
    }
  }
}
</script>
<style lang="scss" scoped>
.title {
  text-align: center;
  font-size: 18px;
  color: #252F40;
  margin-bottom: 24px;
  font-weight: 600;
}
.subTitle2 {
  margin-bottom: 16px;
  font-size: 14px;
  color: #252F40;
}
</style>