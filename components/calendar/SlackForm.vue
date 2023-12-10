<template>
  <v-form ref="form">
    <p>
      {{ userId }}
    </p>
    <v-select
      attach
      label="Motivo"
      outlined
      dense
      :items="listReasons"
      item-text="name"
      item-value="id"
      v-model="formData.reason"
      :error="$v.formData.reason.$error"
      :error-messages="
        $v.formData.reason.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-select>
    <v-row>
      <v-col>
        <v-text-field
          type="datetime-local"
          label="Inicio"
          outlined
          dense
          v-model="formData.start"
          :error="$v.formData.start.$error"
          :error-messages="
            $v.formData.start.$error ? 'Esse campo é obrigatório' : ''
          "
        ></v-text-field>
      </v-col>
      <v-col>
        <v-text-field
          type="datetime-local"
          label="Fim"
          outlined
          dense
          v-model="formData.end"
          :error="$v.formData.end.$error"
          :error-messages="
            $v.formData.end.$error ? 'Esse campo é obrigatório' : ''
          "
        ></v-text-field>
      </v-col>
    </v-row>
    <v-textarea
      label="Observações"
      outlined
      dense
      v-model="formData.observations"
    ></v-textarea>
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
    userId: Number,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    listReasons: [
      {
        id: 'vacation',
        name: 'Férias'
      },
      {
        id: 'holiday',
        name: 'Feriado'
      },
      {
        id: 'personal',
        name: 'Pessoal'
      }
    ],
    formData: {
      user_id: null,
      reason: null,
      observations: null,
      start: null,
      end: null
    }
  }),
  validations: {
    formData: {
      reason: { required },
      start: { required },
      end: { required }
    }
  },
  computed: mapGetters(['slacks']),
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
      id && this.getSlack(id)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      this.formData.user_id = this.userId
      if (this.isEditing) {
        await this.$store.dispatch('updSlack', this.formData)
      }else {
        await this.$store.dispatch('addSlack', this.formData)
      }

      await this.$store.dispatch('fetchSlacks', `user_id=${this.userId}`)

      this.handleCancel()
    },
    async getSlack(itemId) {
      const slack = await this.getItem('/ecosystem/slack', `id=${itemId}`)
      const { created_at, updated_at, ...content } = slack
      this.formData = { ...content, id: itemId }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>
