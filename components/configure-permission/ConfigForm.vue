<template>
  <v-form ref="form">
    <v-text-field
			label="Método"
			placeholder="Digite aqui..."
			outlined
			dense
			v-model="formData.method"
			:error="$v.formData.method.$error"
			:error-messages="$v.formData.method.$error ? 'Esse campo é obrigatório' : ''"
		></v-text-field>
		<v-text-field
			label="Rota"
			placeholder="Digite aqui..."
			outlined
			dense
			v-model="formData.path"
			:error="$v.formData.path.$error"
			:error-messages="$v.formData.path.$error ? 'Esse campo é obrigatório' : ''"
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
    itemName: String
  },
  data: () => ({
    formData: {
      method: '',
      path: ''
    }
  }),
  validations: {
    formData: {
      method: { required },
      path: { required }
    }
  },
  computed: mapGetters(['permissions']),
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
      this.getPermission(id)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updPermission', this.formData)
      } else {
        await this.$store.dispatch('addPermission', this.formData)
      }

      await this.$store.dispatch('fetchPermissions')

      this.handleCancel()

    },
    async getPermission(itemId) {
      await this.$store.dispatch('fetchPermissions')
      const { created_at, updated_at, ...content } = this.permissions.find(
        permission => permission.id == itemId
      )
      this.formData = { ...content, id: itemId }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>
