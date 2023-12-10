<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
      ></v-text-field>
      <v-select
        attach
        label="Tipo de solicitação"
        outlined
        dense
        :items="requestType"
        item-text="name"
        item-value="value"
        v-model="formData.type"
        :error="$v.formData.type.$error"
        :error-messages="$v.formData.type.$error ? 'Esse campo é obrigatório' : ''"
      ></v-select>
      <v-textarea
        label="Descrição"
        placeholder="Digite aqui..."
        outlined
        dense
        rows="3"
        no-resize
        v-model="formData.description"
      ></v-textarea>
    </v-form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    endpoint: '/csc/request-type',
    requestType: [
      { name: 'Transferência', value: 'transfer' },
      { name: 'Voucher', value: 'voucher' },
      { name: 'Apoio', value: 'support' },
    ],
    formData: {
      name: null,
      type: null,
      description: null
    },
  }),
  validations: {
    formData: {
      name: { required },
      type: { required }
    },
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  computed: mapGetters(['meta']),
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
      const { id, name, type, description } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { id, name, type, description }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
