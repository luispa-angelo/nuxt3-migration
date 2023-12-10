<template>
  <div>
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn v-if="isEditing" text v-bind="attrs" v-on="on"> Editar </v-btn>
        <v-btn v-else color="secondary" x-small fab v-bind="attrs" v-on="on">
          <v-icon color="primary" small>mdi-pencil</v-icon>
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Editar contato" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-form ref="form">
            <Autocomplete
              outlined
              clearable
              label="Alterar Contato"
              item-text="contact[name]"
              item-value="contact[id]"
              endpoint="/customer/company-contact"
              :query="`includes=contact&company_id=${companyId}`"
              @valueSelected="
                (value) => {
                  formData.contact_id = value
                }
              "
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
    companyId: Number,
  },
  data: () => ({
    dialog: false,
    formData: {
      id: null,
      contact_id: null,
    },
  }),
  computed: {
    itemId: function () {
      return this.$route.params.id
    },
  },
  methods: {
    async handleSubmit() {
      this.formData.id = this.itemId
      await this.updateData('/cash/opportunity', this.formData)
      await this.getItem(
        '/cash/opportunity',
        `includes=contact.medias&id=${this.itemId}`
      )
      this.$emit('update')
      this.cancel()
    },
    cancel() {
      this.$refs.form.reset()
      this.dialog = false
    },
  },
}
</script>
