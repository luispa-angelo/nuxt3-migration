<template>
  <div>
    <PageHeadline :page-name="pageName" :page-group="pageGroup">
      <Sheet
        :isEditing="false"
        @submit="$refs.myForm.submitForm()"
        @cancel="$refs.myForm.handleCancel()"
        title="Criar Empresa"
      >
        <template v-slot="{ sheet, closed }">
          <CompanyForm ref="myForm" :sheet="sheet" @closeForm="closed" />
        </template>
      </Sheet>
      <CompanyImporter companies-upload />
      <CompanyTransfer companies-transfer :companies-to-transfer="selectedCompanies" @clearSelected="handleReset" />
    </PageHeadline>
        <v-row>
          <v-col v-for="indicator in indicators" :key="indicator.title">
            <IndicatorSecondary :title="indicator.title" :value="indicator.total" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <DataTableWrapper
              ref="dataTableWrapper"
              :url="url"
              :default-query="query"
              :list="listItems"
              :initial-headers="initialHeaders"
              :main-entity="mainEntity"
              :usedEntities="usedEntities"
              :redirect-to="redirectTo"
              :mutation="mutation"
              :header-config="headerConfig"
              :delete-action="deleteAction"
              :list-details="listDetails"
              :refresh-data="refreshData"
              :fetchList="fetchList"
              :refreshAction="refresh"
              :item-key="itemKey"
              @onRowClick="redirectPage"
              @onItemSelected="handleCompaniesSelected"
            >
              <template v-slot:actionsSlot="actionsProps">
                <v-list-item>
                  <v-list-item-title>
                    <Sheet
                      isEditing
                      :title="`Editar ${actionsProps.item.partnership =='partners' ? 'Parceiro' : 'Empresa'}`"
                      @submit="$refs[`config-${actionsProps.item.local_company_id}`].submitForm()"
                      @cancel="$refs[`config-${actionsProps.item.local_company_id}`].handleCancel()"
                    >
                      <template v-slot="{ sheet, closed }">
                        <CompanyForm
                          isEditing
                          :sheet="sheet"
                          :item-id="actionsProps.item.local_company_id"
                          :item="actionsProps.item"
                          :ref="`config-${actionsProps.item.local_company_id}`"
                          @closeForm="closed"
                        />
                      </template>
                    </Sheet>
                  </v-list-item-title>
                </v-list-item>
                <v-list-item>
                  <v-list-item-title>
                    <DeleteItem
                      url="/customer/company"
                      :item-id="actionsProps.item.local_company_id"
                      :item-name="actionsProps.item.name"
                      :delete-action="deleteAction"
                      :refreshAction="refresh"
                    />
                  </v-list-item-title>
                </v-list-item>
              </template>
            </DataTableWrapper>
          </v-col>
        </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    url: '/bureau/company-by-business',
    // defaultQuery:
    //   'order=id_desc' +
    //   '&translateEnums=true' +
    //   '&includes=memberships.team.parent,contacts,contacts.medias,cnaes.cnae.cnae_class,opportunities.team,subscriptions',
    defaultQuery: null,
    listItems: [],
    initialHeaders: [
      // { text: 'Razão Social', value: 'legalName', entity: 'company', width: '20%', filterable: true, filterType: null, filterValue: null, pos: 0 },
      // { text: 'CNPJ', value: 'identifier', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 1 },
      // { text: 'Status', value: 'state', entity: 'company', meta: 'customerState', filterable: true, filterType: null, filterValue: null, pos: 2 },
      // { text: 'Reserva', value: 'reservation_date', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 3 },
      // { text: 'Parceria', value: 'partnership', entity: 'company', meta: 'customerPartnership', filterable: true, filterType: null, filterValue: null, pos: 4, class: 'text-truncate' },
      { text: 'CNPJ', value: 'cnpj', entity: 'bureau-company', filterable: true, filterType: null, filterValue: null, pos: 0 },
      { text: 'Nome', value: 'name', entity: 'bureau-company', width: '20%', filterable: true, filterType: null, filterValue: null, pos: 1 },
      { text: 'Status', value: 'status', entity: 'bureau-company', filterable: true, filterType: null, filterValue: null, pos: 2 },
      { text: 'Disponível', value: 'available', entity: 'bureau-company', filterable: true, filterType: null, filterValue: null, pos: 3 },
      { text: 'CNAE Primário', value: 'primary_cnae', entity: 'bureau-company', filterable: true, filterType: null, filterValue: null, pos: 4 },
      { text: 'CNAE Secundário', value: 'secondary_cnae', entity: 'bureau-company', filterable: true, filterType: null, filterValue: null, pos: 5 },
    ],
    mainEntity: 'bureau-company',
    usedEntities: { ['bureau-company']: '' },
    mutation: 'BureauCompany/SET_LIST_DETAILS',
    redirectTo: 'business-companies-item-identifier',
    deleteAction: 'Company/deleteItem',
    itemKey: 'cnpj',
    businessItemId: null,
    businessCategoryId: null,
    selectedCompanies: [],
    indicators: []
  }),
  computed: {
    ...mapGetters({
      list: 'BureauCompany/list',
      listDetails: 'BureauCompany/listDetails',
      refreshData: 'BureauCompany/refreshData',
      businessCategories: 'businessCategories',
      businessItems: 'businessItems'
    }),
    query: function() {
      if (this.defaultQuery) {
        return `${this.defaultQuery}&businessItem_id=${this.businessItemId}`
      }
      return `businessItem_id=${this.businessItemId}`
    },
    pageGroup: function() {
      const category = this.businessCategories.find((category) => category.id == this.businessCategoryId)
      return category?.name
    },
    pageName: function() {
      const item = this.businessItems.find((item) => item.id == this.businessItemId)
      return item?.name
    },
    headerConfig: function() {
      if (this.pageGroup && this.pageName) {
        return `${this.pageGroup.replace(/\s+/g, '')}-${this.pageName.replace(/\s+/g, '')}-Headers`
      }
      return 'Default-Headers'
    },
  },
  created() {
    this.businessItemId = this.$route.params['item']
    this.businessCategoryId = this.$route.query['category']
  },
  watch: {
    list(newValue) {
      this.listItems = this.formatData(newValue)
    },
  },
  mounted() {
    this.getIndicator()
  },
  methods: {
    ...mapActions({ fetchList: 'BureauCompany/fetchList', refresh: 'BureauCompany/refresh' }),
    formatData(data) {
      if (data) {
        const formattedArray = data.map(company => {
          company.cnpj = this.maskCnpj(company.cnpj)
          return company
        })
        return formattedArray
      }
      return []
    },
    redirectPage(item) {
      const { cnpj, local_company_id } = item
      const { params, query } = this.$route
      const identifier = cnpj.replace(/[^A-Z0-9]/ig, '')
      this.$router.push({
        name: `${this.redirectTo}`,
        params: { ...params, identifier },
        query: { ...query, company_id: local_company_id }
      })
    },
    handleCompaniesSelected(companies) {
      this.selectedCompanies = companies.map((company) => company)
    },
    async getIndicator() {
      this.indicators = await this.getList('/figures/retrieve', `businessItem_id=${this.businessItemId}&figures=PartnerNew,PartnerWithMonthTask,PartnerRisk,PartnerWithoutFutureTask`)
    },
    handleReset() {
      this.$refs.dataTableWrapper.onResetSelectedItems()
    }
  }
}
</script>

