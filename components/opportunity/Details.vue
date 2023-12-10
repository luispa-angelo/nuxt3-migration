<template>
  <v-row>
    <v-col>
      <TabComponent
        ref="opportunityTabs"
        :tab-items="tabItems"
        @onTabChange="handleTabChange"
        class="opportunityTabsContent"
      >
        <template v-slot:tab-append>
          <OpportunityLog :opportunity-id="opportunity.id" />
        </template>
        <template v-slot:task>
          <OpportunityTaskTab :opportunity-id="itemId" />
        </template>
        <template v-slot:companyData>
          <div v-if="company.id">
            <CompanyForm isEditing readingMode :item-id="company.id" />
          </div>
          <div v-else class="d-flex justify-center align-center">
            <v-progress-linear
              v-if="hasCompany"
              indeterminate
            ></v-progress-linear>
            <span v-else>Não foi possível acessar informações da empresa.</span>
          </div>
        </template>
        <template v-slot:comercial>
          <OpportunityComercialData
            :opportunity-activated="blockOpportunity"
            :opportunity="opportunity"
          />
        </template>
        <template v-slot:proposal>
          <OpportunityProposal
            ref="opportunityProposal"
            :item-id="itemId"
            :opportunity="opportunity"
            :aggregate-companies="aggregateCompanies"
            :opportunity-activated="blockOpportunity"
            @onInvoicesChange="handleInvoiceChange"
          />
        </template>
        <template v-slot:activation>
          <OpportunityActivationTab
            ref="opportunityActivationTab"
            :item-id="itemId"
            :opportunity="opportunity"
            :aggregate-companies="aggregateCompanies"
            :opportunity-activated="blockOpportunity"
            @goToProposalTab="
              (value) => $refs.opportunityTabs.changeToTab(value)
            "
            @onInvoiceActivate="handleInvoiceChange"
          />
        </template>
      </TabComponent>
    </v-col>
  </v-row>
</template>

<script>
const blockStatusList = [
  'won',
  'waiting_customer_approval',
  'lost',
  'cancelled',
]
export default {
  props: {
    itemId: [String, Number],
    opportunity: {
      type: Object,
      default: () => {}
    },
    aggregateCompanies: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      tabItems: [
        { name: 'Tarefas', value: 'task' },
        { name: 'Dados da Empresa', value: 'companyData' },
        { name: 'Comercial', value: 'comercial' },
        { name: 'Proposta', value: 'proposal' },
        { name: 'Ativação', value: 'activation' },
      ],
    }
  },
  computed: {
    blockOpportunity() {
      const blockStatus = blockStatusList.some(
        (status) => status === this.opportunity.status
      )
      if (blockStatus || this.opportunity.activation) {
        return true
      }
      return false
    },
    company() {
      if (this.opportunity.company) {
        return this.opportunity.company
      }
      return {}
    },
    hasCompany() {
      return Object.keys(this.company).length > 0
    },
  },
  methods: {
    handleTabChange(value) {
      switch (value) {
      case 4:
        this.$refs.opportunityActivationTab.refreshData(value)
        break
      case 3:
        this.$refs.opportunityProposal.refreshData(value)
        break
      default:
        break
      }
    },
    handleInvoiceChange(invoices) {
      this.$emit('InvoicesHasChange', invoices)
    },
  },
}
</script>

<style scoped lang="scss">
 .opportunityTabsContent {
  ::v-deep .v-window {
    overflow: visible !important;    
  }
  
}
</style>
