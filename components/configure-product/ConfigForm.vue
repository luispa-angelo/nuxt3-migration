<template>
  <v-form ref="form">
    <v-text-field
      label="Nome"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.name"
      :error="$v.formData.name.$error"
      :error-messages="
        $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-text-field>
    <v-select
      attach
      label="Estado do produto"
      v-model="formData.state"
      :items="meta.productState"
      item-text="name"
      item-value="value"
      outlined
      dense
      :error="$v.formData.state.$error"
      :error-messages="
        $v.formData.state.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-select>
    <v-select
      attach
      label="Tipo do produto"
      v-model="formData.type"
      :items="meta.productType"
      item-text="name"
      item-value="value"
      outlined
      dense
      :error="$v.formData.type.$error"
      :error-messages="
        $v.formData.type.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-select>
    <v-text-field
      type="number"
      label="Valor"
      v-model="formData.value"
      outlined
      dense
      :error="$v.formData.value.$error"
      :error-messages="
        $v.formData.value.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-text-field>
  </v-form>
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
    itemName: String,
  },
  data: () => ({
    formData: {
      name: '',
      state: '',
      type: '',
      value: '',
    },
    stateList: [
      { name: 'Ativo', value: 'active' },
      { name: 'Em obsolescência', value: 'deprecated' },
      { name: 'Inativo', value: 'inactive' },
    ],
  }),
  validations: {
    formData: {
      name: { required },
      state: { required },
      type: { required },
      value: { required },
    },
  },
  computed: mapGetters(['products', 'meta']),
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.itemId)
      }
    },
  },
  methods: {
    loadForm(id) {
      this.getProduct(id)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updProduct', this.formData)
      } else {
        await this.$store.dispatch('addProduct', this.formData)
      }

      await this.$store.dispatch('fetchProducts')

      this.handleCancel()
    },

    async getProduct(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem('/ecosystem/product', `&id=${itemId}`)
      this.formData = { ...content, id: itemId }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  },
}
</script>
