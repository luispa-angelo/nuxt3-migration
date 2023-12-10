<template>
  <div>
    <v-row>
      <v-col xl="12">
        <DataTableWrapper
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
        >
          <template v-slot:actionsSlot="actionsProps">
            <v-list-item>
              <v-list-item-title>
                <TaskModal
                  listButton
                  has-button
                  :item-id='actionsProps.itemId'
                />
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <DeleteItem
                  :url="url"
                  :item-id="actionsProps.itemId"
                  :item-name="actionsProps.itemName"
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
  props: {
    opportunityId: Number
  },
  data: () => ({
    url: '/cash/task',
    defaultQuery:
        'order=id_desc&' +
        '&translateEnums=true' +
        '&includes=assigned_to,type.media_type,opportunity.company,team',
    listItems: [],
    initialHeaders: [
      { text: 'Id', value: 'id', entity: 'task', filterable: true, filterType: null, filterValue: null, pos: 0 },
      { text: 'Razão Social', value: 'opportunity.company.legalName', entity: 'company', width: '20%', filterable: true, filterType: null, filterValue: null, pos: 1 },
      { text: 'Responsável', value: 'assigned_to.name', entity: 'assigned_to', filterable: true, filterType: null, filterValue: null, pos: 2 },
      { text: 'Estado', value: 'state', entity: 'task', meta: 'taskState', filterable: true, filterType: null, filterValue: null, pos: 3 },
      { text: 'Tarefa', value: 'type.name', entity: 'task-type', filterable: true, filterType: null, filterValue: null, pos: 4 },
      { text: 'Time', value: 'team.name', entity: 'team', filterable: true, filterType: null, filterValue: null, pos: 5, class: 'text-truncate' },
    ],
    headerConfig: 'Opportunity-TaskList-Headers',
    mainEntity: 'task',
    usedEntities: {
      task: '',
      ['task-type']: 'type',
      ['media-type']: 'type.media_type',
      opportunity: 'opportunity',
      company: 'opportunity.company',
      team: 'team',
      assigned_to: 'assigned_to',
    },
    mutation: 'Task/SET_LIST_DETAILS',
    redirectTo: null,
    deleteAction: 'Task/deleteItem',
  }),
  computed: {
    ...mapGetters({
      list: 'Task/list',
      listDetails: 'Task/listDetails',
      refreshData: 'Task/refreshData',
      meta: 'meta'
    }),
    query: function() {
      if (this.defaultQuery) {
        return `${this.defaultQuery}&opportunity_id=${this.opportunityId}`
      }
      return `businessItem_id=${this.businessItemId}`
    },
  },
  watch: {
    list(newValue) {
      if(newValue) {
        this.listItems = this.formatData(newValue)
      }
    },
  },
  methods: {
    ...mapActions({ fetchList: 'Task/fetchList', refresh: 'Task/refresh' }),
    formatData(data) {
      const dataArray = data.map(task => {
        const modalType = this.handleModalTask(task)
        return { ...task, modalType }
      })
      return dataArray
    },
    handleModalTask(task) {
      const { type } = task
      
      if (type?.extra) {
        const { modal } = JSON.parse(type.extra)
        switch (modal) {
        case 'mail':
          return 'mail'
        case 'call':
          return 'call'
        case 'chat':
          return 'chat'
        default:
          return 'default'
        }
      }
      return 'default'
    },
  }
}
</script>
