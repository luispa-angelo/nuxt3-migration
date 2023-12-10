<template>
  <div>
    <v-dialog v-model="dialog" max-width="700">
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
          v-bind="attrs"
          v-on="on"
        >
          Enviar proposta
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Proposta comercial" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-form ref="form">
            <Autocomplete
              clearable
              outlined
              dense
              label="Template"
              endpoint="/cash/template"
              :query="`includes=media_type&media_type.base=invoice`"
              item-value="id"
              item-text="name"
              @valueSelected="(value) => { formData.template_id = value }"
              :error="$v.formData.template_id.$error"
            ></Autocomplete>
            <v-text-field
              label="Nome da empresa"
              outlined
              dense
              readonly
              v-model="visualData.legalName"
            ></v-text-field>
            <v-text-field
              label="Contato"
              outlined
              dense
              readonly
              v-model="visualData.contact_name"
            ></v-text-field>
            <v-text-field
              label="CNPJ"
              outlined
              dense
              readonly
              v-model="visualData.identifier"
              v-mask="this.mask_cnpj"
            ></v-text-field>
            <v-text-field
              label="Responsável comercial"
              outlined
              dense
              readonly
              v-model="visualData.assigned_to"
            ></v-text-field>
          </v-form>
          <v-expansion-panels v-model="openPanels" multiple>
            <OpportunityProduct :opportunity-id="opportunity.id" :company-id="companyId" removeShadow />
          </v-expansion-panels>
        </v-card-text>
        <DialogAction @submit="submitForm" @cancel="cancel" />
      </v-card>
    </v-dialog>
    <v-dialog v-model="dialogClipboard" max-width="400">
      <v-card>
        <DialogHeader title="Proposta cadastrada!" @onCancel="cancel" />
        <v-card-text class="text-center pt-5">
          <v-text-field
            ref="clipboard"
            dense
            outlined
            readonly
            v-model="clipboard"
          ></v-text-field>
          <a @click="closeModals" :href="clipboard" target="_blank" class="mr-3">Abrir arquivo</a>
          <v-btn @click="copyToClipboard" color="primary">Copiar link</v-btn>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    isEditing: Boolean,
    opportunity: Object,
  },
  data: () => ({
    dialog: false,
    dialogClipboard: false,
    clipboard: null,
    openPanels: [0],
    companyId: null,
    visualData: {
      legalName: null,
      contact_name: null,
      identifier: null,
      assigned_to: null
    },
    formData: {
      opportunity_id: null,
      template_id: null,
      verify: false,
    },
  }),
  validations: {
    formData: {
      opportunity_id: { required },
      template_id: { required },
    },
  },
  watch: {
    dialog(newValue) {
      if(newValue && this.opportunity) {
        this.getData()
      }
    }
  },
  methods: {
    getData() {
      this.companyId = this.opportunity.company.id

      this.formData.opportunity_id = this.opportunity.id
        
      this.visualData = {
        legalName: this.opportunity.company.legalName,
        contact_name: this.opportunity.contact.name,
        identifier: this.opportunity.company.identifier,
        assigned_to: this.opportunity.assigned_to.name,
      }
    },
    copyToClipboard() {
      let clipboard = this.$refs.clipboard.$el.querySelector('input')
      clipboard.select()
      document.execCommand('copy')
      this.dialogClipboard = false
      this.cancel()
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      console.log('form', this.formData)
      const { temporarily_url } = await this.createItem('/cash/create-invoice', this.formData)
      this.clipboard = temporarily_url
      this.dialogClipboard = true
      this.$emit('update')
    },
    closeModals() {
      this.dialog = !this.dialog
      this.dialogClipboard = false
    },
    cancel() {
      this.$v.$reset()
      this.$refs.form.reset()
      this.submitting = false
      this.dialog = !this.dialog
      this.dialogClipboard = false
    }
  }
}
</script>