<template>
  <v-form ref="form">
    <v-select
      attach
      label="Membro do Pipeline"
      v-model="formData.teamMember"
      :items="teamMembersList"
      item-value="id"
      item-text="name"
      required
      outlined
       :error="$v.formData.teamMember.$error"
      :error-messages="$v.formData.teamMember.$error ? 'Esse campo é obrigatório' : ''"
    ></v-select>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    itemId: Number,
    pipelineId: Number,
  },
  data: () => ({
    teamMembersList: [],
    formData: {
      teamMember: '',
      pipeline_id: 1,
    }
  }),
  validations: {
    formData: {
      teamMember: { required }
    }
  },
  computed: mapGetters(['stages', 'meta']),
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if(newValue) {
        this.formData.pipeline_id = this.pipelineId
        if(this.isEditing) {
          this.loadForm(this.itemId)
        }
      }
    },
  },
  methods: {
    loadForm() {
      this.teamMembers()
    },
    async submitForm() {
      this.formData.pipeline_id = this.pipelineId

      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        await this.updateData('/cash/pipeline-member', {
          'id': this.itemId,
          'pipeline_id': this.pipelineId,
          'team_id': this.formData.teamMember
        })
      } else {
        await this.createItem('/cash/pipeline-member', {
          'pipeline_id': this.pipelineId,
          'team_id': this.formData.teamMember
        })
      }

      await this.$store.dispatch('fetchPipelineMembers', `pipeline_id=${this.pipelineId}&includes=team`)  
      this.handleCancel()

    },
    async teamMembers() { 
      const teamMember = await this.getList('/ecosystem/any-team')
      this.teamMembersList = teamMember.data
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>