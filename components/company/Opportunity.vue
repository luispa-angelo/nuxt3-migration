<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">{{ !isRelated ? 'Oportunidades' : 'Oportunidades da Carteira' }}</p>
        </div>
      </template>
      <template v-slot:actions>
        <OpportunityModal v-if="hasCompanyId && !isRelated" :company="companyInfos" />
      </template>
    </v-expansion-panel-header>
      <v-expansion-panel-content>
      <GenericTable
        :headers="headers"
        :items="!isRelated ? list : relatedList"
        @onRowClick="redirectPage"
      >
      </GenericTable>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    isRelated: {
      type: Boolean,
      default: false
    },
    hasCompanyId: {
      type: Boolean
    },
    companyId: {
      type: Number
    },
    company: {
      type: Object
    },
    opportunities: {
      type: Array
    },
    relatedOpportunities: {
      type: Array
    },
    companyHasTeam: {
      type: Boolean
    },
  },
  data: () => ({
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Produtos', value: 'products' },
      { text: 'Equipe', value: 'team' },
      { text: 'Valor total', value: 'value' },
      { text: 'Status', value: 'status' },
      { text: 'Fase', value: 'stage' }
    ],
    listProduct: [],
    redirectTo: 'business-opportunity-item-id',
  }),
  computed: {
    routeComplement: function () {
      if (this.isRelated) {
        return 'Oportunidade Relacionada'
      }
      return 'Oportunidade'
    },
    list: function() {
      var list = []
      if(this.opportunities) {
        this.opportunities.forEach(opportunity => {
          const products = opportunity.products.map(product => {
            const name = product.product['name'].split(',').join(', ')
            return name
          })
          
          if(opportunity.value) {
            var value = `R$${this.maskMoney('pt-br', opportunity.value)}`
          }
          
          list.push({
            id: opportunity.id,
            products: products,
            team: opportunity.team.name,
            value: value,
            status: opportunity.status,
            stage: opportunity.stage.name,
          })
        })
      }
      return list
    },
    relatedList: function() {
      var list = []
      if(this.relatedOpportunities) {
        this.relatedOpportunities.forEach(opportunity => {
          const products = opportunity.products.map(product => {
            const name = product.product['name'].split(',').join(', ')
            return name
          })
          
          if(opportunity.value) {
            var value = `R$${this.maskMoney('pt-br', opportunity.value)}`
          }
          
          list.push({
            id: opportunity.id,
            products: products,
            team: opportunity.team.name,
            value: value,
            status: opportunity.status,
            stage: opportunity.stage.name,
          })
        })
      }
      return list
    },
    companyInfos: function() {
      return {
        cnpj: this.company.identifier,
        name: this.company.name,
      }
    }
  },
  methods: {
    redirectPage(target) {
      const id = target.id
      const { params, query } = this.$route
      this.$router.push({ name: `${this.redirectTo}`, params: { ...params, id }, query: { ...query, complement: this.routeComplement } })
    }
  }
}
</script>