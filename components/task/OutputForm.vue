<template>
  <v-dialog v-model="dialog" hide-overlay scrollable persistent max-width="464">
    <v-card>
      <DialogHeader :elevation="0" @onCancel="handleCancel" />
      <v-card-text class="pt-3">
        <div class="d-flex align-center justify-center mb-2">
          <span class="font-weight-bold">Resultado</span>
        </div>
        <p class="font-body-medium text-center justify-center">Selecione o Resultado para finalizar a tarefa ou<br/>clique em Cancelar para retornar ao modal da tarefa.</p>
        <v-form ref="form">
          <v-select
            attach
            dense
            outlined
            return-object
            label="Selecione o Resultado"
            item-text="value"
            v-model="output"
            :items="outputs"
            :error="$v.output.$error"
            :error-messages="$v.output.$error ? 'Esse campo é obrigatório' : ''"
          >
          </v-select>
        </v-form>
      </v-card-text>
      <DialogAction
        cancel-text="Cancelar"
        submit-text="Concluir"
        :disable-submit="!output"
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
    propDialog: Boolean,
    statusValue: String,
    outputs: Array,
  },
  data: () => ({
    output: null,
  }),
  validations: {
    output: { required },
  },
  computed: {
    dialog: function() {
      return this.propDialog
    },
  },
  watch: {
  },
  methods: {
    async handleSubmit() {
      this.$v.output.$touch()
      if (this.$v.output.$error) return
      this.$emit('onClose', this.output)
      this.restartModal()
    },
    restartModal() {
      this.output = null
      this.$v.$reset()
    },
    handleCancel() {
      this.restartModal()
      this.$emit('onClose', null)
    }
  }
}
</script>

<style>

</style>