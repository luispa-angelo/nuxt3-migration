<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Razão (motivo)"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.value"
        :error="$v.formData.value.$error"
        :error-messages="$v.formData.value.$error ? 'Esse campo é obrigatório' : ''"
      ></v-text-field>
      <v-select
        attach
        label="Tipo"
        outlined
        dense
        :items="withdrawalType"
        item-text="name"
        item-value="value"
        v-model="formData.type"
        :error="$v.formData.type.$error"
        :error-messages="$v.formData.type.$error ? 'Esse campo é obrigatório' : ''"
      ></v-select>
      <Autocomplete
        label="Time"
        outlined
        :initial-value="formData.team_id"
				endpoint="/ecosystem/any-team?ordel=level"
        @valueSelected="(value) => {formData.team_id = value}"
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
    endpoint: '/cash/opportunity-withdrawal',
    withdrawalType: [
      { name: 'Perdido', value: 'lost' },
      { name: 'Cancelado', value: 'cancelled' },
    ],
    formData: {
      value: null,
      type: null,
      team_id: null
    },
  }),
  validations: {
    formData: {
      value: { required },
      type: { required },
			team_id: { required }
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
      const { id, value, type, team_id } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { id, value, type, team_id }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
