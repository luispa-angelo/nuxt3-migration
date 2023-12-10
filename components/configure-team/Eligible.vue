<template>
  <v-dialog v-model="dialog" persistent max-width="650px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-if="!isEditing"
        color="primary"
        v-bind="attrs"
        v-on="on"
      >
        {{ title }}
      </v-btn>
      <v-btn v-else v-bind="attrs" v-on="on" text>
        Editar
      </v-btn>
    </template>
    <v-card>
      <DialogHeader title="Permissões de grupo" @onCancel="handleCancel()" />
      <v-card-text class="pt-5">
        <v-form ref="form">
          <v-select
            attach
            label="Solicitante"
            outlined
            dense
            :items="teams"
            item-text="name"
            item-value="id"
            v-model="formData.submitter_team_id"
            :error="$v.formData.submitter_team_id.$error"
            :error-messages="$v.formData.submitter_team_id.$error ? 'Esse campo é obrigatório' : ''"
          ></v-select>
          <v-select
            attach
            label="Atendente"
            outlined
            dense
            :items="teams"
            item-text="name"
            item-value="id"
            v-model="formData.attendant_team_id"
            :error="$v.formData.attendant_team_id.$error"
            :error-messages="$v.formData.attendant_team_id.$error ? 'Esse campo é obrigatório' : ''"
          ></v-select>
          <Autocomplete
            outlined
            dense
            label="Tipo de solicitação"
            endpoint="/csc/request-type"
            item-text="name"
            item-value="id"
            @valueSelected="(value) => {formData.type_id = value}"
            :error="$v.formData.type_id.$error"
            :error-messages="$v.formData.type_id.$error ? 'Esse campo é obrigatório' : ''"
          ></Autocomplete>
        </v-form>
      </v-card-text>
      <DialogAction @submit="submitForm()" @cancel="handleCancel()"/>
    </v-card>
  </v-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String,
  },
  data: () => ({
    dialog: false,
    formData: {
      submitter_team_id: null,
      attendant_team_id: null,
      type_id: null
    }
  }),
  validations: {
    formData: {
      submitter_team_id: { required },
      attendant_team_id: { required },
      type_id: { required }
    },
  },
  computed: {
    ...mapGetters(['teams', 'eligibleTeams']),
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        if (this.isEditing) {
          this.loadForm(this.itemId)
        }
      }
    }
  },
  methods: {
    async loadForm(id) {
      if (id) {
        this.getTeam(id)
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updEligibleTeam', this.formData)
      } else {
        await this.$store.dispatch('addEligibleTeam', this.formData)
      }
      
      await this.$store.dispatch('fetchEligibleTeams')

      this.handleCancel()
    },
    async getTeam(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem('/ecosystem/team', `id=${itemId}`)
      this.formData = { ...content, id: itemId }
    },
    async handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.dialog = false
    }
  }
}
</script>