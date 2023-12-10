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
        label="Grupo de permissão"
        item-value="id"
        item-text="name"
        outlined
        dense
        v-model="formData.permission_group_id"
        :items="permissionsGroups"
				:error="$v.formData.permission_group_id.$error"
        :error-messages="
          $v.formData.permission_group_id.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-select>
			<v-select
        attach
        label="Permissão de time"
				item-text="text"
        item-value="value"
        outlined
        dense
        v-model="formData.team_access"
				:items="teamAccess"
				:error="$v.formData.team_access.$error"
        :error-messages="
          $v.formData.team_access.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-select>
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
    search: '',
    permissionsGroups: [],
		teamAccess: [
			{ text: 'Sob sua responsabilidade/colaboração', value: 'no' },
				{ text: 'Sob responsabilidade de membros de sua equipe', value: 'yes' }
		],
    formData: {
      name: '',
      permission_group_id: null,
			team_access: null
    }
  }),
  validations: {
    formData: {
      name: { required },
      permission_group_id: { required },
			team_access: { required }
    }
  },
  computed: mapGetters(['roles', 'rolePermissions']),
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.loadForm(this.itemId)
      }
    }
  },
  methods: {
    async loadForm(id) {
      await this.getContent()
      id && await this.getRole(id)

    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updRole', this.formData)
      } else {
        await this.$store.dispatch('addRole', this.formData)
      }

      this.$store.dispatch('fetchRoles','includes=permission_group')

      this.handleCancel()
    },
    async getRole(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem('/ecosystem/role', `id=${itemId}`)
      this.formData = { ...content, id: itemId }
    },
    async getContent() {
      const { data } = await this.getList('/ecosystem/permission-group')
      this.permissionsGroups = data
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>
