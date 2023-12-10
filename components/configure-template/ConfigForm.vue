<template>
  <v-form ref="form">
    <v-text-field
      label="Título"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.name"
      :error="$v.formData.name.$error"
    ></v-text-field>
    <Autocomplete
      label="Time"
      outlined
      clearable
      endpoint="/ecosystem/any-team"
      @valueSelected="(value) => {formData.team_id = value}"
    ></Autocomplete>
    <v-select
      attach
      label="Tipo de documento"
      v-model="formData.media_type_id"
      :items="mediaTypes"
      item-value="id"
      item-text="name"
      outlined
      dense
    ></v-select>
    <ManageVueEditor
      ref="editor"
      :text-content="formData.content"
      isEditing
      title="Editar Conteúdo"
      @getContent="getContent($event)"
    />
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
    mediaTypes: [],
    formData: {
      name: '',
      content: '',
      media_type_id: null,
      team_id: null
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  computed: mapGetters(['templates']),

  async mounted() {
    const {
      data: { data }
    } = await this.$axios.get('ecosystem/media-type')
    this.mediaTypes = data
    this.isEditing && this.loadForm(this.itemId)
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
      this.getTemplate(id)
    },
    async submitForm() {
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updTemplate', this.formData)
      } else {
        await this.$store.dispatch('addTemplate', this.formData)
      }

      this.$emit('refresh')
      this.handleCancel()
    },

    async getTemplate(id) {
      const {
        data: {
          data: [response]
        }
      } = await this.$axios.get(`/cash/template?id=${id}`)
      this.formData = response
    },
    getContent(content) {
      this.formData.content = content
    },
    handleCancel() {
      this.$refs.form.reset()
      this.formData.content = null
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>
