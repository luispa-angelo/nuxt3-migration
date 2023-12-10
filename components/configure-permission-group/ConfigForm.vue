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
      <v-text-field
        label="Level"
        type="number"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.level"
        :error="$v.formData.level.$error"
        :error-messages="
          $v.formData.level.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
    </v-form>
    <div v-if="isEditing">
      <Dialog
        :isEditing="false"
        @submit="$refs.myForm.submitForm()"
        @cancel="$refs.myForm.handleCancel()"
        :role-id="itemId"
        title="Adicionar permissão"
      >
        <template v-slot="{ dialog }">
          <RolePermission
            :isEditing="false"
            :dialog="dialog"
            :permission-group-id="itemId"
            ref="myForm"
          />
        </template>
      </Dialog>
      <GenericTable
        :search="search"
        :items="rolePermissions"
        :headers="permissionHeaders"
        delete-action="deleteRolePermission"
        action-options
        empty-slot
      >
      </GenericTable>
    </div>
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
    endpoint: '/ecosystem/permission-group',
    formData: {
      name: '',
      level: ''
    },
    permissionHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Método', value: 'permission.method' },
      { text: 'Rota', value: 'permission.path' }
    ]
  }),
  validations: {
    formData: {
      name: { required },
      level: { required }
    }
  },
  computed: mapGetters(['rolePermissions']),
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
      const { id, name, level } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { id, name, level }
      await this.$store.dispatch('fetchRolePermissionsQuery',`includes=permission&permission_group_id=${itemId}`)
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
