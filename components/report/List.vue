<template>
  <div>
    <DataTableWrapper
      v-on="$listeners"
      ref="dataTableWrapper"
      :url="url"
      :default-query="defaultQuery"
      :list="listItems"
      :initial-headers="initialHeaders"
      :main-entity="mainEntity"
      :usedEntities="usedEntities"
      :redirect-to="redirectTo"
      :mutation="mutation"
      :delete-action="deleteAction"
      :list-details="listDetails"
      :refresh-data="refreshData"
      :fetchList="fetchList"
      :refreshAction="refresh"
      :showHeaderConfig="headerConfig"
      @onItemSelected="getSelectedReports"
    >
      <template v-slot:actionsSlot="actionsProps">
        <v-list-item>
          <v-list-item-title>
            <v-btn 
              text
              :disabled="actionsProps.item.state != reportCompletedShow"
              @click="getReportFile(actionsProps.itemId)">
              Baixar arquivo
            </v-btn>
          </v-list-item-title>
        </v-list-item>
        <v-list-item>
          <v-list-item-title>
            <DeleteItem
              :url="url"
              :item-id="actionsProps.itemId"
              :item-name="actionsProps.item.title"
              :multiple-selected="multipleSelected"
              :delete-action="deleteAction"
              :refreshAction="refresh"
              @clear-selected="handleReset"
            />
          </v-list-item-title>
        </v-list-item>
      </template>
    </DataTableWrapper>
  </div>
</template>

<script>
const REPORT_COMPLETED_SHOW = "Disponível para download"
import { mapGetters, mapActions } from 'vuex'

export default {
  layout: 'default',
  props: {
    search: String,
  },
  data: () => ({
    url: '/analytics/report',
    defaultQuery:
        'order=id_desc' +
        '&translateEnums=true',
    listItems: [],
    multipleSelected: [],
    initialHeaders: [
      { text: 'Id', value: 'id', entity: 'id', width: '8%', filterable: true, filterType: null, filterValue: null, pos: 0 },
      { text: 'Título', value: 'title', entity: 'title', filterable: true, filterType: null, filterValue: null, pos: 1 },
      { text: 'Tipo de Relatório', value: 'type', entity: 'type', filterable: true, filterType: null, filterValue: null, pos: 2 },
      { text: 'Data de Solicitação', value: 'created_at', entity: 'created_at', filterable: true, filterType: 'like', filterValue: null, pos: 3 },
      { text: 'Expira em', value: 'expire', entity: 'expire', filterable: true, filterType: 'like', filterValue: null, pos: 4 },
      { text: 'Status', value: 'state', entity: 'reportState', meta: 'reportState', filterable: true, filterType: null, filterValue: null, pos: 5 },
    ],
    headerConfig: 'hide',
    mainEntity: 'report',
    usedEntities: { 
      report: '',
      reportState: [],
    },
    reportCompletedShow: REPORT_COMPLETED_SHOW,
    mutation: 'Report/SET_LIST_DETAILS',
    redirectTo: null,
    deleteAction: 'Report/deleteItem',

  }),
  computed: {
    ...mapGetters({
      list: 'Report/list',
      listDetails: 'Report/listDetails',
      refreshData: 'Report/refreshData',
      meta: 'meta'
    })
  },
  async mounted() {
  },
  watch: {
    list(newValue) {
      this.listItems = this.formatData(newValue)
    }
  },
  methods: {
    ...mapActions({ fetchList: 'Report/fetchList', refresh: 'Report/refresh' }),
    formatData(data) {
      const dataArray = data.map(report => {
        const modalType = 'default'
        var expire = this.handleExpire(report)
        var created_at = this.$moment(report.created_at).format('DD/MM/YYYY')
        return { ...report, created_at, modalType, expire }
      })
      return dataArray
    },
    getSelectedReports(seleted) {
      this.multipleSelected = seleted
    },
    async getReportFile(reportId) {
      const reportUrl = await this.$axios.get(
        `/analytics/get-report/${reportId}`
      ).catch(function (error) {
        console.log(error.response)
      })
      if (reportUrl.data) {
        window.open(reportUrl.data, '_blank')
      }
    },
    handleExpire(report) {
      var expireHours = report.expire.split(':')[0]
      var expireText = expireHours > 1 ? ' horas' : ' hora'
      if (expireHours < 1) {
        var expire = 'menos de 1 hora'
      } else {
        var expire =  expireHours +  expireText
      }
      return expire
    },
    handleReset() {
      this.$refs.dataTableWrapper.onResetSelectedItems()
    }
  }
}
</script>
