<template>
  <v-expansion-panel class="mb-3">
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Produtos</p>
        </div>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-data-table
        :headers="headers"
        :items="list"
        show-group-by
        group-by="product"
        
      >
        <template v-slot:[`group.header`]="{items, isOpen, toggle}">
          <th colspan="2" class="font-weight-bold font-body-large stroke lighten-5">
            <v-icon @click="toggle">{{ isOpen ? 'mdi-minus' : 'mdi-plus' }}</v-icon>
            {{ items[0].product }}
          </th>
          <th colspan="2" class="font-weight-bold font-body-large stroke lighten-5">{{ items.reduce((acc, currentValue) => acc + currentValue.amount, 0) }}</th>
          <th colspan="2" class="font-weight-bold font-body-large stroke lighten-5">R$ {{ maskMoney('pt-br', items.reduce((acc, currentValue) => acc + currentValue.productValue, 0)) }}</th>
        </template>
      </v-data-table>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    companyId: {
      type: Number
    },
    products: {
      type: Array
    }
  },
  data: () => ({
    headers: [
      { text: 'ID', value: 'id', groupable: false},
      { text: 'Oportunidade', value: 'opportunity', groupable: false },
      { text: 'Quantidade', value: 'amount', groupable: false},
      { text: 'Status', value: 'state', groupable: false},
      { text: 'Valor', value: 'value', groupable: false},
      { text: 'Data Ativação', value: 'start_date', groupable: false}
    ],
    subscriptionList: [],
    list: []
  }),
  watch: {
    async companyId(newValue) {
      if(newValue) {
        this.products && await this.getData()
      }
    }
  },
  async mounted() {
    if(this.products) {
      await this.getData()
    }
  },
  methods: {
    async getSubscription() {
      const { data } = await this.getList('/ecosystem/subscription', `customer_id=${this.companyId}`)
      data.forEach(el => {
        this.subscriptionList.push(el)
      })
    },
    async getData() {
      if(this.companyId) {
        await this.getSubscription()
      }
      
      this.list = []
      if(this.products) {
        this.products.forEach(product => {
          var formatedDate = null
          const item = this.subscriptionList.find(item => item.product_id == product.product.id)
          if(item) {
            const value = `R$ ${this.maskMoney('pt-br', product.value)}`
            formatedDate = this.$moment(item.created_at).format('DD/MM/YYYY')

            this.list.push({
              id: product.id,
              product: product.product.name,
              opportunity: `Oportunidade: ${product.opportunity_id}`,
              amount: product.amount,
              state: product.state,
              productValue: product.value,
              value: value,
              start_date: formatedDate
            })
          }
        })
      }
    }
  }
}
</script>