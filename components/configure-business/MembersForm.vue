<template>
  <div>
    <v-form ref="form">
      <Autocomplete
        label="Time"
        outlined
        endpoint="/ecosystem/any-team"
        :initial-value="formData.team_id"
        :validate="$v.formData.team_id"
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
    itemName: String,
    businessId: Number
  },
  data: () => ({
    endpoint: '/business/business-team',
    formData: {
      business_id: null,
      team_id: null
    },
  }),
  validations: {
    formData: {
      team_id: { required },
    },
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  computed: {
    ...mapGetters(['meta']),
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
      this.formData.business_id = this.businessId
      this.$v.$touch()
      if (this.$v.$error) return
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
      this.formData.team_id = null
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
