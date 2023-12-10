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
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
      <v-select
        attach
        label="Status"
        v-model="formData.active"
        :items="activeStatus"
        item-value="value"
        item-text="name"
        outlined
        dense
      ></v-select>
      <Autocomplete
        label="Tenant"
        outlined
        endpoint="/ecosystem/tenant"
        :initial-value="formData.tenant_id"
        @valueSelected="(value) => {formData.tenant_id = value}"
      ></Autocomplete>
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
    endpoint: '/cash/opportunity-origin',
    formData: {
      name: null,
      active: true,
      tenant_id: null,
    },
    activeStatus: [
      { name: 'Ativo', value: true },
      { name: 'Inativo', value: false }
    ]
  }),
  validations: {
    formData: {
      name: { required },
    }
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
      const { created_at, updated_at, ...content } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { ...content }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
