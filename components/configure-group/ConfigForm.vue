<template>
  <v-form ref="form">
      <v-text-field
        label="Nome do grupo"
        placeholder="Digite aqui..."
        outlined
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
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
      group_id: 3,
      name: '',
    },
  }),
  validations: {
    formData: {
      name: { required },
    },
  },
  computed: mapGetters(['groups']),
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
      if (this.isEditing) {
        this.getGroup(id)
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updGroup', this.formData)
      } else {
        await this.$store.dispatch('addGroup', this.formData)
      }

      await this.$store.dispatch('fetchGroups')

      this.handleCancel()
      
    },
    async getGroup(itemId) {
      await this.$store.dispatch('User/fetchUsers')
      const { created_at, updated_at, ...content } = this.groups.find(
        (group) => group.id == itemId
      )
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