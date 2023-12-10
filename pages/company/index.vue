<template>
  <div>
    <PageHeadline title="Empresas" :amount="`${amount} Empresas`">
      <div class="w-50">
        <v-text-field
          placeholder="Busca rápida"
          class="fix-vertical-align mx-2"
          outlined
          dense
          append-icon="mdi-magnify"
          v-model="search"
        ></v-text-field>
      </div>
      <Sheet
        :isEditing="false"
        @submit="$refs.myForm.submitForm()"
        @cancel="$refs.myForm.handleCancel()"
        title="Criar Empresa"
      >
        <template v-slot="{ sheet, closed }">
          <CompanyForm :sheet="sheet" @closeForm="closed" ref="myForm" />
        </template>
      </Sheet>
      <ExportTemplate name="company" entity="Company" />
      <FileImport path="/customer/company" />
    </PageHeadline>
    <v-row>
      <v-col>
        <v-row>
          <v-col>
            <v-sheet class="py-5 px-4" color="shape lighten-1" rounded>
              <v-btn-toggle
                v-model="myFilter"
                tile
                color="secondary"
                mandatory
                group
              >
                <v-btn :value="false" class="rounded mx-1">
                  Todas as empresas
                </v-btn>
                <v-btn :value="true" class="rounded mx-1">
                  Minhas empresas
                </v-btn>
              </v-btn-toggle>
            </v-sheet>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <GenericTable
              isMultiple
              :isLoading="isLoading"
              :search="search"
              :headers="headers"
              :items="companiesList"
              :total-items="companies_api.total"
              redirect-to="company-id"
              delete-action="deleteCompany"
              action-options
              v-slot:default="slotProps"
              @pagination="handlePagination"
            >
              <Sheet
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                title="Editar Empresa"
              >
                <template v-slot="{ sheet, closed }">
                  <CompanyForm
                    isEditing
                    :sheet="sheet"
                    @closeForm="closed"
                    :item-id="slotProps.itemId"
                    :ref="`config-${slotProps.itemId}`"
                  />
                </template>
              </Sheet>
            </GenericTable>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    apiConfig: {
      query:
        'order=id_desc&' + 
        'includes=association_r.left_side,memberships.team.parent,cnaes.cnae.cnae_class,opportunities.team,opportunities.partner,subscriptions',
      action: 'fetchCompanies',
      initialAction: 'fetchInitialCompanies'
    },
    isLoading: true,
    user: {},
    search: '',
    myFilter: false,
    amount: 0,
    companiesList: [],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Razão Social', value: 'name', width: '20%' },
      { text: 'CNPJ', value: 'identifier' },
      { text: 'CNAE', value: 'cnae_code'},
      { text: 'Setor Agrupado', value: 'sector' },
      { text: 'Parceiro Associado', value: 'partner' },
      { text: 'Canal Responsavel', value: 'channel' },
      { text: 'Status da Empresa', value: 'state' }
    ]
  }),
  async mounted() {
    this.isLoading = true
    this.getInitialData()
  },
  computed: mapGetters(['companies', 'userInfo', 'userTeam', 'meta', 'companies_api']),
  watch: {
    companies(newValue) {
      this.companiesList = this.formatData(newValue)
      this.isLoading = false
    },
    async myFilter(newValue) {
      let team = 0
      this.userTeam && (team = this.userTeam)
      if (newValue) {
        this.apiConfig.query = `order=id_desc&includes=association_r.left_side,memberships.team.parent,cnaes.cnae.cnae_class,opportunities.team,opportunities.partner,subscriptions&team_id=${team}`
        this.apiConfig.action = 'fetchMyCompanies'
        await this.$store.dispatch('resetCompanies')
      } else {
        this.apiConfig.query = 'order=id_desc&includes=association_r.left_side,memberships.team.parent,cnaes.cnae.cnae_class,opportunities.team,opportunities.partner,subscriptions'
        this.apiConfig.action = 'fetchCompanies'
        await this.$store.dispatch('resetCompanies')
      }
      this.getData()
    },
    user(newValue) {
      this.$store.dispatch('setUser', newValue)
    },
    companies_api(newValue) {
      newValue.total && (this.amount = newValue.total)
      if (newValue.dataUpdate) {
        this.getInitialData()
        this.$store.commit('COMPANIES_API', { dataUpdate: false })
      }
    },
  },
  methods: {
    async getInitialData() {
      this.isLoading = true
      const { query, initialAction } = this.apiConfig
      await this.$store.dispatch(initialAction, `${query}`)
    },
    async getData() {
      this.isLoading = true
      const { query, action } = this.apiConfig
      await this.$store.dispatch(action, `${query}&page=${this.companies_api.page}`)
    },
    handlePagination(lastPage) {
      if (lastPage && this.companies_api.hasNext) {
        const page = this.companies_api.page + 1
        this.$store.commit('COMPANIES_API', { page })
        this.getData()
      }
    },
    formatData(data) {
      const dataArray = data.map(company => {
        let cnae_code = ''
        let channel = null
        let partner = null
        let sector = null
        const { association_r, cnaes, memberships, identifier, subscriptions, state, ...content } = company
        const newState = this.getEnum(state, this.meta.customerState)
        const newIdentifier = this.maskCnpj(identifier)
        cnaes?.length > 0 && (cnae_code = cnaes[0].cnae_code)
        memberships?.length > 0 && (channel = memberships[0].team.parent?.name)
        association_r?.length > 0 && (partner = association_r[0]?.left_side?.name)
        cnaes?.length > 0 && (sector = cnaes[0].cnae?.description?.substring(0,95))
        return {
          ...content,
          cnae_code,
          channel,
          partner,
          sector,
          state: newState,
          identifier: newIdentifier
        }
      })
      return dataArray
    }
  }
}
</script>