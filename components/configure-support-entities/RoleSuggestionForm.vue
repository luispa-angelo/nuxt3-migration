<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome do Cargo"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
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
    endpoint: '/ecosystem/role-suggestion',
    formData: {
      name: null
    },
  }),
  validations: {
    formData: {
      name: { required }
    },
  },
  async mounted() {
    await this.loadForm(this.itemId)
  },
  watch: {
    async dialog(newValue) {
      if (this.isEditing && newValue) {
        await this.loadForm(this.itemId)
      }
    }
  },
  methods: {
    async loadForm(id) {
      if (this.isEditing) {
        await this.getContent(id)
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
      const { name } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { name }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
