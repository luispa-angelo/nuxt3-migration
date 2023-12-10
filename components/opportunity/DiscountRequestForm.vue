<template>
  <div>
    <v-dialog v-model="dialog" max-width="1300" persistent scrollable>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <v-btn
            data-test="btnDiscountFormOpen"
            color="primary"
            class="px-0"
            v-bind="attrs"
            v-on="on"
            :disabled="disableForms"
          >
            Criar
          </v-btn>
        </div>
      </template>
      <v-card>
        <DialogHeader title="Solicitar aprovação" @onCancel="close" />
        <v-card-text class="pt-5 pb-0 v-card-text">
          <span>Antes de solicitar a aprovação, revise os produtos e serviços.  Em seguida, insira o motivo e clique em 'Solicitar aprovação'.</span>
          <OpportunityProductSummary :products-by-companies="companiesProducts" />
          <v-form ref="discount-form">
            <v-autocomplete
              attach
              outlined
              dense
              clearable
              data-test="selectDiscountFormReason"
              label="Motivo da solicitação"
              v-model="formData.discount_reason"
              :items="discountReasons"
              :error="$v.formData.discount_reason.$error"
                :error-messages="$v.formData.discount_reason.$error ? 'Esse campo é obrigatório' : ''"
            >
            </v-autocomplete>
            <v-textarea
              hide-details
              dense
              outlined
              data-test="inputDiscountFormObservation"
              label="Observação"
              v-model="formData.discount_observation"
            >
              </v-textarea>
          </v-form>
        </v-card-text>
        <DialogAction submit-text="Solicitar Aprovação" :loading-submit="isSendingRequest" @cancel="close" @submit="submitInvoice" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    editMode: Boolean,
    opportunityId: Number,
    companiesProducts: Array,
    invoiceData: Object,
    tab: String,
    disableForms: Boolean,
  },
  data: () => ({
    dialog: false,
    formData: {
      discount_reason: null,
      discount_observation: null
    },
    discountReasons: [
      { text: 'Concorrência', value: 'competition' },
      { text: 'Negociação por preço', value: 'price' },
      { text: 'Outros', value: 'other' },
    ],
    isSendingRequest: false,
  }),
  validations: {
    formData: {
      discount_reason: { required },
    },
  },
  computed: {
    ...mapGetters({
      products: 'products',
    }),
  },
  watch: {
    // dialog(newValue) {
    //   if(newValue) {
    //   }
    // },
  },
  methods: {
    async submitInvoice() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      this.isSendingRequest = true
      await this.createItem('/cash/create-invoice', {
        ...this.invoiceData,
        opportunity_id: this.opportunityId,
        ...this.formData
      })
      this.isSendingRequest = false
      this.$emit('onRequestSent')
      this.close()
    },
    clearProductForm() {
      this.$refs['discount-form'].reset()
      this.$v.$reset()
    },
    close() {
      this.$v.$reset()
      this.$refs['discount-form'].reset()
      this.dialog = false
    },
  }
}
</script>

<style scoped>

</style>