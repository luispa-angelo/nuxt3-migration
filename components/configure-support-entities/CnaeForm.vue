<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Código"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.code"
        :error="$v.formData.code.$error"
        :error-messages="
          $v.formData.code.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
      <v-text-field
        label="Descrição"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.description"
        :error="$v.formData.description.$error"
        :error-messages="
          $v.formData.description.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
    </v-form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    endpoint: '/customer/cnae',
    formData: {
      code: '',
      description: ''
    },
  }),
  validations: {
    formData: {
      code: { required },
      description: { required }
    }
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.itemId)
      }
    }
  },
  methods: {
    loadForm(id) {
      if (this.isEditing) {
        this.getContent(id)
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.updateData(this.endpoint, this.formData)
      } else {
        await this.createItem(this.endpoint, this.formData)
      }
      this.$emit('formSubmitted')
      this.handleCancel()
    },
    async getContent(itemId) {
      const { id, code, description } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { id, code, description }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
