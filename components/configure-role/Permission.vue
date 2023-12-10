<template>
  <v-form ref="form">
    <Autocomplete
      label="Permissão"
      outlined
      endpoint="/ecosystem/permission"
      item-value="id"
      :item-text="item => item.method +' - '+ item.path"
      :initial-value="formData.permission_id"
      :load="dialog"
      :validate="$v.formData.permission_id"
      @valueSelected="(value) => {formData.permission_id = value}"
    ></Autocomplete>
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
    permissionGroupId: Number,
    itemName: String
  },
  data: () => ({
    formData: {
      permission_group_id: null,
      permission_id: null
    },
    permissionsList: []
  }),
  validations: {
    formData: {
      permission_id: { required },
      permission_group_id: { required }
    }
  },
  computed: mapGetters(['RolePermissions', 'permissions']),
  mounted() {
    this.formData.permission_group_id = this.permissionGroupId
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.permission_group_id = this.permissionGroupId
        if (this.isEditing) {
          this.getRolePermissions(this.itemId)
        }
      }
    },
    permissions(newValue) {
      this.permissionsList = newValue.map(permission => ({
        name: `${permission.method} | ${permission.path}`,
        value: permission.id
      }))
    }
  },
  methods: {
    async submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return
      if (this.isEditing) {
        await this.$store.dispatch('updRolePermission', this.formData)
      } else {
        await this.$store.dispatch('addRolePermission', this.formData)
      }
      await this.$store.dispatch('fetchRolePermissionsQuery',`includes=permission&permission_group_id=${this.permissionGroupId}`)
      this.handleCancel()

    },
    async getRolePermissions(itemId) {
      await this.$store.dispatch(
        'fetchRolePermissionsQuery',
        `includes=permission&permission_group_id=${this.permissionGroupId}`
      )
      const { created_at, updated_at, ...content } = this.RolePermissions.find(
        rp => rp.permission_group_id == itemId
      )
      this.formData = { ...content }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>