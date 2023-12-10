<template>
  <div>
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="isEditing"
          text
          v-bind="attrs"
          v-on="on"
        >
          Editar
        </v-btn>
        <v-btn
          v-else
          color="secondary"
          x-small
          fab
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="primary">mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Adicionar concorrentes" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-form ref="form">
            <Autocomplete
              label="Concorrentes"
              outlined
              clearable
              multiple
              endpoint="/cash/competitor"
              query="includes=tenant&order=name"
              item-value="id"
              item-text="name"
              :initial-value="selectedCompetitors"
              @valueSelected="(value) => {listCompetitors = value}"
            ></Autocomplete>
          </v-form>
        </v-card-text>
        <DialogAction @submit="handleSubmit" @cancel="cancel" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  props: {
    isEditing: Boolean,
    opportunity: Object,
  },
  data: () => ({
    dialog: false,
    selectedCompetitors: [],
    listCompetitors: null,
    formData: {
      id: null,
      competitors: null,
    },
  }),
  computed: {
    itemId: function() {
      return this.$route.params.id
    }
  },
  watch: {
    dialog(newValue) {
      if(newValue) {
        this.loadForm()
      }else {
        this.cancel()
      }
    }
  },
  methods: {
    async loadForm() {
      this.selectedCompetitors = []
      this.opportunity.competitors.forEach(item => {
        this.selectedCompetitors.push(item.competitor_id)
      })
    },
    async handleSubmit() {      
      if(this.listCompetitors) {
        this.formData.id = this.itemId
        this.formData.competitors = this.listCompetitors.map(item => ({
          id: item
        }))
        await this.updateData('/cash/opportunity', this.formData)
        await this.$root.$emit('updateCompetitorRequest')
        this.$emit('update')
      }
      this.cancel()
    },
    cancel() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>