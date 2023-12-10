<template>
  <v-form ref="form">
    <v-text-field
			label="Nome do campo"
			placeholder="Digite aqui..."
			outlined
			v-model="formData.name"
			:error="$v.formData.name.$error"
			:error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
		></v-text-field>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    title: String,
    isEditing: Boolean,
    itemId: Number,
    pipelineId: Number,
    itemName: String
  },
  data: () => ({
    formData: {
      name: '',
      pipeline_id: 1
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  computed: mapGetters(['customFields']),
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.pipeline_id = this.pipelineId
        if (this.isEditing) {
          this.loadForm(this.itemId)
        }
      }
    }
  },
  methods: {
    loadForm(id) {
      this.getFields(id)
    },
    submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return
      var title = ''
      if (this.isEditing) {
        this.formData.id = this.itemId
        this.$store.dispatch('updCustomField', this.formData)
        title = 'Registo alterado com sucesso!'
      } else {
        this.$store.dispatch('addCustomField', this.formData)
        title = 'Registo incluído com sucesso!'
      }

      this.handleCancel()

      this.$swal({
        position: 'top-end',
        icon: 'success',
        title: title,
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      })

    },
    async getFields(itemId) {
      await this.$store.dispatch(
        'fetchCustomFields',
        `pipeline_id=${this.pipelineId}`
      )
      const { created_at, updated_at, ...content } = this.customFields.find(
        field => field.id == itemId
      )
      this.formData = { ...content, id: itemId }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>