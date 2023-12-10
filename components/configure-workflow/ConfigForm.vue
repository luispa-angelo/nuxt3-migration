<template>
  <v-form ref="form">
		<v-text-field
			:label="title"
			placeholder="Digite aqui..."
			outlined
			v-model="formData.name"
			:error="$v.formData.name.$error"
			:error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
		></v-text-field>
		<Flow v-if="isEditing" ref="flow" :id="itemId" />
	</v-form>
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
    formData: {
      name: ''
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  mounted() {
    this.loadForm()
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.loadForm()
      }
    },
  },
  methods: {
    loadForm() {
      if (this.isEditing) {
        this.formData.name = this.itemName
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        this.formData.content = this.$refs.flow.exportContentData()
        await this.$store.dispatch('updWorkflow', this.formData)
      } else {
        await this.$store.dispatch('addWorkflow', this.formData)
      }

      await this.$store.dispatch('fetchWorkflows') 

      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')

    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>