<template>
  <v-list v-if="loadedProducts" class="py-1">
    <div class="px-0 mx-1 mb-1 text-center" style="border-bottom: 1px solid var(--v-stroke-base);">Valor da oportunidade</div>
    <v-list-item v-for="item in productTypeList" :key="item.productType" class="mx-2 px-0" style="min-height: 24px;">
      {{`${item.productType}: R$ ${maskMoney('pt-br', item.value)}`}}
    </v-list-item>
  </v-list>
  <v-progress-circular
    v-else
    size="16"
    indeterminate
    color="primary"
  ></v-progress-circular>
</template>

<script>
export default {
  props: {
    opportunityId: {
      type: [String, Number],
    },
    invoiceId: {
      type: String,
    },
  },
  data: () => ({
    loadedProducts: false,
    productTypeList: [],
  }),
  computed: {
    queryParams: function() {
      const params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includesInactive', 'true')
      params.append('includes', 'stats.last_invoice_move.products.product')
      params.append(
        'load_only',
        'id,' +
        'stats.last_invoice_move_id,stats.last_invoice_move.products.value,stats.last_invoice_move.products.amount,stats.last_invoice_move.products.product.type'
      )
      params.append('id', this.opportunityId)
      return params.toString()
    }
  },
  mounted() {
    this.getProducts()
  },
  methods: {
    async getProducts() {
      const typeList = []
      const opportunity = await this.getItem('/cash/opportunity', this.queryParams)
      const groupedProducts = this.groupOpportunityProducts(opportunity)
      for (const [key, value] of Object.entries(groupedProducts)) {
        typeList.push({ productType: key, value: value })
      }
      this.productTypeList = typeList
      this.loadedProducts = true

    },
    groupOpportunityProducts(opportunity) {
      if (opportunity.stats?.last_invoice_move_id) {
        const { last_invoice_move } = opportunity.stats
        const groupedProducts = last_invoice_move.products.reduce((acc, current) => {
          const { product: { type }, value, amount } = current
          if (acc[type]) {
            acc[type] += value * amount
          } else {
            acc[type] = value * amount
          }
          return acc
        }, {})
        return groupedProducts
      }
      return {}
    },
  },
}
</script>

