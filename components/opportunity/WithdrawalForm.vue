<template>
  <v-dialog v-model="dialog" hide-overlay scrollable persistent max-width="464">
    <v-card>
      <DialogHeader :elevation="0" @onCancel="handleCancel" />
      <v-card-text class="pt-3">
        <div class="d-flex align-center justify-center mb-2">
          <v-icon class="material-icons mr-2" color="warning">warning</v-icon>
          <span class="font-weight-bold">Alteração do Status da Oportunidade</span>
        </div>
        <p class="font-body-medium text-center justify-center">Informe o motivo do Cancelamento da Oportunidade para seguir com a ação.</p>
        <v-form ref="form">
          <v-select            
            dense
            outlined
            return-object
            label="Motivo do Cancelamento"
            item-text="value"
            v-model="withdrawal"
            :items="withdrawalReasons"
            :error="$v.formData.withdrawal_reason_id.$error"
            :error-messages="$v.formData.withdrawal_reason_id.$error ? 'Esse campo é obrigatório' : ''"
          >
          </v-select>
          <v-textarea
            v-if="showTextArea"
            dense
            outlined
            counter
            label="Descreva o Motivo do Cancelamento"
            :rules="rules"
            v-model="formData.withdrawal_reason_description"
          >
          </v-textarea>
        </v-form>
      </v-card-text>
      <DialogAction
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    withdrawalDialog: Boolean,
    opportunityId: { type: [String, Number], default: null },
    opportunityTeam: { type: [String, Number], default: null },
    statusValue: String
  },
  data: () => ({
    withdrawal: {
      id: null,
      value: null,
    },
    formData: {
      withdrawal_reason_id: null,
      withdrawal_reason_description: null
    },
    withdrawalReasons: [],
    rules: [v => (v || '' ).length <= 89 || 'Máximo de 89 caracteres']
  }),
  validations: {
    formData: {
      withdrawal_reason_id: { required },
    },
  },
  computed: {
    dialog: function() {
      return this.withdrawalDialog
    },
    showTextArea: function() {
      if (this.withdrawal.value === 'Outros') {
        return true
      }
      return false
    }
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        const { data } = await this.getList('/cash/eligigble-withdrawal-reasons', `type=${this.statusValue}&team_id=${this.opportunityTeam}`)
        this.withdrawalReasons = data
      }
    },
    withdrawal(newValue) {
      this.formData.withdrawal_reason_id = newValue.id
    }
  },
  methods: {
    async handleSubmit() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (!this.$refs.form.validate()) return
      const payload = { ...this.formData, id: this.opportunityId, status: this.statusValue }
      try {
        await this.updateData('/cash/opportunity', payload, { throwError: true })
        this.restartModal()
        this.$emit('onUpdate', false)
      } catch (error) {
        console.log(error)
      }
    },
    restartModal() {
      this.formData = {
        withdrawal_reason_id: null,
        withdrawal_reason: null
      }
      this.withdrawal = {
        id: null,
        value: null,
      }
      this.$v.$reset()
    },
    handleCancel() {
      this.restartModal()
      this.$emit('onClose', false)
    }
  }
}
</script>

<style>

</style>