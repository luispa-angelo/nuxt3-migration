<template>
  <main>
    <v-btn color="primary" @click="dialog = true">Criar organização</v-btn>
    <v-dialog v-model="dialog" max-width="550">
      <v-card height="288">
        <DialogHeader :elevation="0" @onCancel="handleCancel" />
        <v-card-text class="pt-3 pb-1 cardForm">
          <h6 class="text-center mb-8">Criar Organização</h6>
          <v-form ref="form">
            <v-text-field
              label="Nome da organização"
              dense
              outlined
              v-model="formData.name"
              hide-details
              class="textField"
              :error="$v.formData.name.$error"
              :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <div class="cardForm">
          <DialogAction 
            actions-align="space-between"
            style="width: 362px"
            :show-divider="false"
            submit-text="Criar"
            @submit="submitForm"
            @cancel="handleCancel"
          />
        </div>
      </v-card>
    </v-dialog>
  </main>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  data: () => ({
    endointTenant: '/ecosystem/tenant',
    dialog: false,
    formData: {
      name: null,
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  methods: {
    async submitForm() {
      await this.createItem(this.endointTenant, this.formData)
      this.$emit('update-parent')
      this.handleCancel()
    },
    handleCancel() {
      this.dialog = false
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
<style lang="scss" scoped>
.cardForm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .textField {
    width: 362px;
  }
}
</style>