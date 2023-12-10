<template>
  <div>
    <PageHeadline page-name="Grupo de Empresas" page-group="Empresas">
      <Sheet
        :isEditing="false"
        @submit="$refs.myForm.submitForm()"
        @cancel="$refs.myForm.handleCancel()"
        title="Criar Cliente"
      >
        <template v-slot="{ sheet }">
          <CompanyForm :sheet="sheet" ref="myForm" />
        </template>
      </Sheet>
      <FileImport path="/customer/company" />
      <!-- <ExportTemplate name="partner" entity="Company" /> -->
      <v-btn color="shape lighten-1" class="mx-1">
        <v-icon color="primary" class="mr-2">
          mdi-swap-horizontal
        </v-icon>
        Transferir
      </v-btn>
    </PageHeadline>
        <v-row>
          <v-col>
            <IndicatorSecondary title="Total de Empresas" :value="50" />
          </v-col>
          <v-col>
            <IndicatorSecondary title="Novas Empresas" :value="3" />
          </v-col>
          <v-col>
            <IndicatorSecondary title="Com Tarefas no Mês" :value="17" />
          </v-col>
          <v-col>
            <IndicatorSecondary title="Em Risco" :value="2" />
          </v-col>
          <v-col>
            <IndicatorSecondary title="Sem Tarefas Futuras" :value="37" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <List
              :url="url"
              :default-query="defaultQuery"
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
              :form-control="formControl"
              :fetchList="fetchList"
              :refreshAction="refresh"
            />
          </v-col>
        </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    url: '/customer/company',
    defaultQuery:
      'order=id_desc&' +
      'translateEnums=true&' +
      'includes=memberships.team.parent,contacts,contacts.medias,cnaes.cnae.cnae_class,opportunities.team,subscriptions&',
    listItems: [],
    initialHeaders: [
      { text: 'Razão Social', value: 'legalName', entity: 'company', width: '20%', filterable: true, filterType: null, filterValue: null, pos: 0 },
      { text: 'CNPJ', value: 'identifier', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 1 },
      { text: 'Status', value: 'state', entity: 'company', meta: 'customerState', filterable: true, filterType: 'equal', filterValue: null, pos: 2 },
      { text: 'Reserva', value: 'reservation_date', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 3 },
      { text: 'Parceria', value: 'partnership', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 4, class: 'text-truncate' },
    ],
    mainEntity: 'company',
    usedEntities: 'company',
    mutation: 'Company/SET_LIST_DETAILS',
    headerConfig: 'potentialCustomerHeaders',
    redirectTo: 'company-id',
    deleteAction: 'deleteCompany',
    formControl: 'company'
  }),
  computed: {
    ...mapGetters({
      list: 'Company/list',
      listDetails: 'Company/listDetails',
      refreshData: 'Company/refreshData',
    })
  },
  watch: {
    list(newValue) {
      this.listItems = newValue
    },
  },
  methods: {
    ...mapActions({ fetchList: 'Company/fetchList', refresh: 'Company/refresh' }),
    // formatData(data) {
    //   const dataArray = data.map(company => {
    //     let channel = null
    //     let sector = null
    //     const { cnaes, memberships, subscriptions, identifier, ...content } = company
    //     const newIdentifier = this.maskCnpj(identifier)
    //     memberships?.length > 0 && (channel = memberships[0].team.name)
    //     return {...content, channel, sector, identifier: newIdentifier }
    //   })
    //   return dataArray
    // },
  }
}
</script>

