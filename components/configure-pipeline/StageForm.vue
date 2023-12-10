<template>
  <v-form ref="form">
    <v-text-field
      label="Nome do estagio"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.name"
      :error="$v.formData.name.$error"
      :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
    ></v-text-field>
    <v-select
      attach
      label="Peso do estagio"
      v-model="formData.triggers_state"
      :items="stateList"
      item-value="value"
      item-text="name"
      required
      outlined
      dense
    ></v-select>
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
    itemName: String,
  },
  data: () => ({
    formData: {
      name: '',
      pipeline_id: 1,
      index: 0,
      triggers_state: ''
    },
    stateList: [
      { name: 0, value: 0 },
      { name: 10, value: 1 },
      { name: 20, value: 2 },
      { name: 30, value: 3 },
      { name: 40, value: 4 },
      { name: 50, value: 5 },
      { name: 60, value: 6 },
      { name: 70, value: 7 },
      { name: 80, value: 8 },
      { name: 90, value: 9 },
      { name: 100, value: 10 },
    ]
  }),
  validations: {
    formData: {
      name: { required }
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
    loadForm(id) {
      id && this.getStage(id)
    },
    async submitForm() {
      this.formData.pipeline_id = this.pipelineId

      this.$v.formData.$touch()
      if(this.$v.formData.$error) return
      if(this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updStage', this.formData)
      }else {
        const stageIndex = this.stages.map((stage) => stage.index)
        if (stageIndex.length == 0) {
          this.formData.index = 0
        } else {
          this.formData.index = Math.max(...stageIndex) + 1
        }
        await this.$store.dispatch('addStage', this.formData)
      }
      this.$store.dispatch('fetchStages',`order=index&pipeline_id=${this.pipelineId}`)
      
      this.handleCancel()

    },
    async getStage(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem('/cash/stage', `id=${itemId}`)
      this.formData = { ...content, id: itemId }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>