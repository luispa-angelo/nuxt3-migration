<template>
  <div class="d-flex flex-wrap">
    <PageHeadline page-name="Solicitações" page-group="CSC" />
    <v-card class="w-100 h-100 my-5">
      <v-card-title class="d-flex justify-space-between align-center pa-2 mx-2">
        <div class="d-flex flex-row align-center">
          <v-text-field label="Solicitação" v-model="filters.id" @keyup.enter="loadData()"></v-text-field>
          <v-autocomplete
            attach
            label="Tipo de Solicitação"
            dense
            hide-details
            clearable
            :items="requestTypes"
            item-text="name"
            item-value="id"
            v-model="filters.type_id"
            class="mx-1 filter-input"            
            @keyup.enter="loadData()"
          ></v-autocomplete>
          <v-autocomplete
            attach
            label="Status"
            dense
            hide-details
            clearable
            class="mx-1 filter-input"
            :items="requestStatus"
            item-text="name"
            item-value="value"
            v-model="filters.status"
            @keyup.enter="loadData()"
          ></v-autocomplete>
          <v-autocomplete
            attach
            label="Solicitante"
            dense
            hide-details
            clearable
            class="mx-1 filter-input"
            item-text="name"
            item-value="id"
            :items="users"
            :search-input.sync="searchUsers"
            v-model="filters.submitter_id"
            @keyup.enter="loadData()"
          ></v-autocomplete>
          <v-autocomplete
            attach
            label="Responsável"
            dense
            hide-details
            clearable
            class="mx-1 filter-input"
            item-text="name"
            item-value="id"
            :items="attendants"
            :search-input.sync="searchAttendants"
            v-model="filters.attendant_id"
            @keyup.enter="loadData()"
          ></v-autocomplete>
          <v-text-field
            dense
            clearable
            hide-details
            label="Data"
            type="date"
            calss="filter-input"
            v-model="filters.created_at"
            @keyup.enter="loadData()"
          ></v-text-field>
          <v-btn color="primary" style="margin-left:2em" class="filter-input" @click="loadData()">
            Buscar
          </v-btn>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-data-table
          class="data-table"
          no-data-text="Não há notificações disponíveis"
          item-key="id"
          :loading="isLoading"
          :headers="headers"
          :items="requestItems"
          :footer-props="footerProps"
          :sort-by.sync="sort"
          :sort-desc.sync="sortDesc"
          @click:row="handleRequest"
          @pagination="handlePagination"
        >
        </v-data-table>
      </v-card-text>
      <InboxCscForm
        task-type="csc"
        :csc-id="selectedRequest"
        :open-dialog="dialog.csc"
        @closeDialog="() => { dialog.csc = false }"
      />
    </v-card>
  </div>
</template>

<script>

export default {
  data: () => ({
    isLoading: false,
    selectedRequest: null,
    footerProps: {
      'items-per-page-options': [5, 10, 15]
    },
    dialog: {
      csc: false,
    },
    headers:[
      { text: '#', value: 'id' },
      { text: 'Data', value: 'created_at' },
      { text: 'Tipo', value: 'type.name' },
      { text: 'Status', value: 'status' },
      { text: 'Time Solicitante', value: 'submitter_team.name' },
      { text: 'Solicitante', value: 'submitter.name' },
      { text: 'Atendente', value: 'attendant.name' },
    ],
    filters: {},
    requestTypes: [],
    requestItems: [],
    requestStatus: [],
    rawRequestItems: [],
    attendants: [],
    searchAttendants: null,
    users: [],
    searchUsers: null,
    sort: null,
    sortDesc: false,
  }),
  computed: {
   
  },
  watch: {
    searchUsers(u) {
      this.getList('/ecosystem/user', `name=like(${u})`)
        .then(data => {this.users = data.data})
    },
    searchAttendants(u) {
      this.getList('/ecosystem/user', `name=like(${u})`)
        .then(data => {this.attendants = data.data})
    },
    sort() {
      this.loadData()
    },
    sortDesc() {
      this.loadData()
    }
  },
  async mounted() {
    this.isLoading = true
    
    this.getList('/csc/meta/CSCRequestStatus')
      .then(data => { this.requestStatus = data.data })
    this.getList('/csc/request-type')
      .then(data => { this.requestTypes = data.data })
    
    this.isLoading = false
  },
  methods: {
    async loadData(page=0) {
      if (this.isLoading) 
        return

      this.isLoading = true
      let params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includes', 'submitter,attendant,submitter_team,type')
      if (this.sort) {
        let sp = this.sort
        if (this.sortDesc) {
          sp+= '_desc'
        }
        params.append('order', sp)
      }
      else {
        params.append('order', 'id')
      }
      if (page) { 
        params.append('page', page)
      } 
      else {
        this.requestItems = []
      }

      for (let filter in this.filters) {
        let el = this.filters[filter]
        if (el)  {
          if (filter == 'created_at') {
            params.append(filter, `ge(${el})`)
            
            let s = new Date(el)
            s.setDate(s.getDate()+1)
            s = s.toISOString().split('T')[0]
            params.append(filter, `lt(${s})`)
          }
          else {
            params.append(filter, el)
          }
        }
      }

      this.rawRequestItems = await this.getList('/csc/request', params.toString())
      this.rawRequestItems.page = page || 0
      this.requestItems = this.requestItems.concat(this.rawRequestItems.data)
      for (let el of this.requestItems) {
        el.created_at = el?.created_at?.replace(/T.*/, '')
      }
      this.isLoading = false
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.rawRequestItems.hasNext) {
          console.log('here')
          await this.loadData(this.rawRequestItems.page + 1)
        }
      }
    },
    async handleRequest(request) {
      this.selectedRequest = request.id
      this.dialog.csc = true
    }
  }
}
</script>

<style scoped lang="scss">
  .data-table {
    cursor: pointer !important;
  }

  .filter-input {
    width: 10%;
  }
</style>
