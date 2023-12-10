<template>
  <div>
    <v-dialog v-model="dialog" max-width="1360" persistent scrollable>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <v-btn
            small
            fab
            icon
            data-test="btnProposalViewOpen"
            color="primary"
            class="px-0"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon color="primary">mdi-eye-outline</v-icon>
          </v-btn>
        </div>
      </template>
      <v-card>
        <DialogHeader :title="`Proposta #${invoice.id}`" @onCancel="close" />
        <v-card-text class="pt-5 pb-0 v-card-text">
          <span>
            {{`Visualize os produtos e serviços da Proposta${invoice.status === 'pending_approval' ? ', inclusive os pendentes de aprovação. Após a liberação do desconto, a proposta ficará disponível para compartilhamento.' : ''}`}}
          </span>
          <OpportunityProductSummary :products-by-companies="invoiceProductsByCompanies" />
        </v-card-text>
        <DialogAction hide-cancel submit-text="Concluir" @submit="close" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  props: {
    invoice: {
      type: Object,
      default: () => ({
        id: null,
        products: []
      })
    }
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    invoiceProductsByCompanies: function() {
      if (this.invoice.products){
        return this.generateProductsByCompanies(this.invoice.products)
      }
      return []
    }
  },
  methods: {
    close() {
      this.dialog = false
    },
    generateProductsByCompanies(invoiceProducts) {
      const productsByCompanies = []
      const companies = [...new Set(invoiceProducts.filter((product) => product.customer_id).map((product) => product.customer_id))]
      companies.forEach((customer_id) => {
        const products = invoiceProducts
          .filter((product) => product.customer_id === customer_id)
          .map((product) => ({
            ...product,
            valueModifier: this.getValueModifier(product.extra)
          }))
        const customer = products[0].customer || { name: 'Não informado', indentifier: 'Não informado' }
        productsByCompanies.push({
          customer_id,
          name: customer.name,
          identifier: customer.identifier,
          identifier_type: customer.identifier_type,
          products,
        })
      })
      return productsByCompanies
    },
  }
}
</script>

<style scoped>

</style>