<template>
  <main>
    <PageHeadline :fill-width="true">
      <v-row>
        <v-col xl="10" lg="10">
          <v-form ref="baseFilter" class="d-flex">
            <v-text-field 
              label="CNPJ ou Razão Social"
              outlined
              dense
              hide-details
              v-model="filters.identifier_name"
              @keyup.enter="loadData()"
              class="mx-2"
            ></v-text-field>
            <NewAutocomplete
              label="Solicitante"
              outlined
              dense
              clearable
              hide-details
              multiple
              endpoint="/ecosystem/user"
              item-value="id"
              item-text="name"
              v-model="filters.submitter_id"
              @change="loadData()"
              class="v-autocomplete-control mx-2"
            />
            <v-autocomplete
              attach
              label="Status"
              outlined
              dense
              hide-details
              clearable
              multiple
              :items="requestStatus"
              item-text="name"
              item-value="value"
              v-model="filters.status"
              @change="loadData()"
              @input="searchInput=null"
              :search-input.sync="searchInput"
              class="v-autocomplete-control mx-2"
            ></v-autocomplete>
            <NewAutocomplete
              label="Responsável"
              outlined
              dense
              clearable
              hide-details
              multiple
              endpoint="/ecosystem/user"
              item-value="id"
              item-text="name"
              v-model="filters.attendant_id"
              @change="loadData()"
              class="v-autocomplete-control mx-2"
            />
          </v-form>
        </v-col>
        <v-col xl="2" lg="2" class="d-flex justify-end">
          <v-btn
            @click="clearFilter"
            :disabled="disableBtn && typeSelected.length == 0 && resultSelected.length == 0"
            color="secondary"
            class="mr-2"
          >
            Limpar filtros
          </v-btn>
          <v-btn
            @click="moreFilter = !moreFilter"
            fab
            color="secondary"
            v-tooltip="{
              content: `
                <div class='v-btn-tooltip'>
                  Mais filtros
                </div>
                `,
              placement: 'left'
            }"
          >
            <v-icon class="material-symbols-rounded" color="primary">
              {{ moreFilter ? 'close' : 'tune' }}
            </v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </PageHeadline>
    <TableFilter :active="moreFilter">
      <template>
        <v-form ref="moreFilter">
          <v-row>
            <v-col>
              <p class="mb-0">Tipo de Solicitação</p>
              <div class="d-flex align-center flex-wrap">
                <v-checkbox
                  v-for="item in requestTypes"
                  :key="item.id"
                  :label="item.name"
                  dense
                  hide-details
                  class="mr-2"
                  :value="item.id"
                  v-model="typeSelected"
                ></v-checkbox>
              </div>
              <v-divider class="mt-2 mb-5"></v-divider>
              <v-row>
                <v-col>
                  <NewAutocomplete
                    label="Time do Solicitante"
                    dense
                    clearable
                    hide-details
                    multiple
                    endpoint="/ecosystem/any-team"
                    item-value="id"
                    item-text="name"
                    return-object
                    v-model="moreFilters.submitter_team_id"
                    @change="loadData()"
                    class="v-autocomplete-control"
                  />
                </v-col>
                <v-col>
                  <v-text-field
                    label="Data de criação"
                    dense
                    clearable
                    hide-details
                    type="date"
                    v-model="moreFilters.created_at"
                    @input="loadData()"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
            <v-col>
              <p class="mb-0">Resultado</p>
              <div class="d-flex align-center flex-wrap">
                <v-checkbox
                  v-for="item in resultTypes"
                  :key="item.value"
                  :label="item.name"
                  dense
                  hide-details
                  class="mr-2"
                  :value="item"
                  v-model="resultSelected"
                ></v-checkbox>
              </div>
              <v-divider class="mt-2 mb-5"></v-divider>
              <v-row>
                <v-col>
                  <v-text-field
                    label="Data do agendamento"
                    dense
                    clearable
                    hide-details
                    type="date"
                    v-model="moreFilters.appointment_date"
                    @input="loadData()"
                  ></v-text-field>
                </v-col>
                <v-col>
                  <v-text-field
                    label="Horário do agendamento"
                    dense
                    clearable
                    hide-details
                    type="time"
                    v-model="moreFilters.appointment_time"
                    @input="loadData()"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </template>
    </TableFilter>
    <v-row v-if="showMoreFilters" class="mt-0">
      <v-col class="d-flex justify-start align-center flex-wrap mt-0 mb-1 pt-0">
        <div
          v-for="(value, name, index) in moreFilters"
          :key="index"
          class="d-flex align-center mb-2 mr-3"
        >
          <p v-if="value && index == 0" class="mr-3 mb-0">Filtros aplicados:</p>
          <label v-if="value" class="sub-text--text mr-1 mb-0">{{ getFilterName(name) }}:</label>
          <v-chip
            v-if="value"
            label
            close
            close-icon="close"
            @click:close="removeFilter(name)"
          >
            <div v-if="Array.isArray(value)">
              <span v-for="(item, index) in value" :key="index">
                <span v-if="index <= 1">
                  {{
                    name == 'type_id' ? getTypeName(item) :
                    name == 'result' ? getResultName(item) :
                    item.name
                  }}<span v-if="index + 1 < value.length">, </span>
                </span>
                <span v-if="index == value.length - 1">
                  <span v-if="index >= 2">(+{{ value.length - 2 }})</span>
                </span>
              </span>
            </div>
            <div v-else>
              {{ name == 'appointment_time' ? value : $moment(value).format('DD/MM/YYYY') }}
            </div>
          </v-chip>
        </div>
      </v-col>
    </v-row>
    <v-sheet>
      <v-data-table
        class="data-table"
        no-data-text="Não há solicitações disponíveis"
        no-results-text="Não há solicitações disponíveis"
        item-key="id"
        :loading="isLoading"
        :headers="headers"
        :items="list"
        :footer-props="footerProps"
        :sort-by.sync="sort"
        @click:row="handleRequest"
        @pagination="handlePagination"
      >
        <template v-slot:[`item.type.name`]="{ item }">
          <p v-if="item.type" class="mb-0">{{ item.type.name }}</p>
          <small v-if="item.type && item.type.type == 'Apoio'" class="sub-text--text">
            {{ $moment(item.scheduled_to).format('DD/MM/YYYY HH:mm') }}
          </small>
          <small v-else class="sub-text--text">{{ item.companys }}</small>
        </template>
        <template v-slot:[`item.submitter.name`]="{ item }">
          <p v-if="item.submitter" class="mb-0">{{ item.submitter.name }}</p>
          <small v-if="item.submitter_team" class="sub-text--text">{{ item.submitter_team.name }}</small>
        </template>
        <template v-slot:[`item.attendant.name`]="{ item }">
          {{ item.attendant ? item.attendant.name : '--' }}
        </template>
        <template v-slot:[`item.status`]="{ item }">
          <v-chip
            small
            outlined
            :color="item.status == 'Pendente' ? 'warning' : item.status == 'Concluído' ? '' : item.status == 'Cancelado' ? 'error' : 'primary'"
          >
            {{ item.status }}
          </v-chip>
        </template>
        <template v-slot:[`item.created_at`]="{ item }">{{ $moment(item.created_at).format('DD/MM/YYYY') }}</template>
        <template v-slot:[`item.updated_at`]="{ item }">{{ $moment(item.updated_at).format('DD/MM/YYYY') }}</template>
        <template v-slot:[`item.result`]="{ item }">
          <v-chip
            v-if="item.result"
            small
            outlined
            :color="
              item.result == 'Rejeitado' ? 'error' :
              item.result == 'Aprovado' ? 'success' : ''"
          >
            <span v-if="item.type && item.type.type == 'Apoio' && item.result == 'Aprovado'">Realizado</span>
            <span v-else-if="item.type && item.type.type == 'Apoio' && item.result == 'Rejeitado'">Não Realizado</span>
            <span v-else>{{ item.result }}</span>
          </v-chip>
          <span v-else>--</span>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-menu
            left
            :offset-x="true"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list dense>
              <v-list-item>
                <v-btn @click="handleRequest(item)" block text>Abrir</v-btn>
              </v-list-item>
              <RequestCancel
                v-if="item.type && showRequestCancel(item)"
                :request-type="item.type.type"
                :item-id="item.id"
                @reloadData="loadData"
              />
            </v-list>
          </v-menu>
        </template>
        <template v-slot:[`footer.page-text`]="props">
          {{ `${props.pageStart} - ${props.pageStop}` }}
        </template>
      </v-data-table>
    </v-sheet>
    <InboxCscForm
      :csc-id="selectedRequest"
      :open-dialog="dialog.csc"
      @filter-attendant="filterAttendant"
      @reloadData="loadData"
      @closeDialog="() => { dialog.csc = false }"
    />
    <v-dialog v-model="dialog.warning" persistent max-width="600">
      <v-card>
        <DialogHeader title="Novo recurso de minimizar" :elevation="0" @onCancel="closeWarning" />
        <v-card-text class="text-center pb-0">
          <p class="text-left">
            Agora você pode minimizar até 4 solicitações. Para isso, basta clicar no ícone “Minimizar” ao lado do botão “Fechar”. 
          </p>
          <img src="~/static/minimize.png">
        </v-card-text>
        <DialogAction
          :show-divider="false"
          :hide-submit="true"
          cancel-text="Fechar"
          cancel-color="primary"
          @cancel="closeWarning"
        />
      </v-card>
    </v-dialog>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    searchInput: null,
    isLoading: false,
    moreFilter: false,
    moreFilterList: [],
    disableBtn: true,
    typeSelected: [],
    resultSelected: [],
    filters: {},
    moreFilters: {},
    showMoreFilters: false,
    dialog: {
      csc: false,
      warning: false
    },
    headers:[
      { text: 'ID', value: 'id' },
      { text: 'Tipo de solicitação', value: 'type.name' },
      { text: 'Solicitante', value: 'submitter.name' },
      { text: 'Status', value: 'status' },
      { text: 'Responsável', value: 'attendant.name' },
      { text: 'Data de criação', value: 'created_at' },
      { text: 'Última atividade', value: 'updated_at' },
      { text: 'Resultado', value: 'result' },
      { text: '', value: 'actions', align: 'center', sortable: false, }
    ],
    resultTypes: [
      { name: 'Aprovado / Realizado', value: 'approved', type: 'any' },
      { name: 'Rejeitado / Não realizado', value: 'rejected', type: 'any' }
    ],
    footerProps: {
      'items-per-page-options': [5, 10, 15]
    },
    selectedRequest: null,
    requestTypes: [],
    requestItems: [],
    requestStatus: [],
    rawRequestItems: [],
    resultQuery: [],
    attendants: [],
    searchAttendants: null,
    users: [],
    searchUsers: null,
    sort: 'updated_at_desc',
    sortDesc: false
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam'
    }),
    receivedId() {
      const id = this.$route.query.request_id
      if(id) {
        return id
      }
      return null
    },
    list() {
      if(this.requestItems) {
        const list = this.requestItems.map((item) => {
          const data = JSON.parse(item.data)
          
          if(item.result == 'Aprovado') {
            var compareDate = this.$moment(item.updated_at).diff(item.created_at, 'hour')
          }

          if(data.companys) {
            var companys = data.companys

            if(companys.length <= 1) {
              companys = companys[0].identifier
            }else {
              companys = `${companys[0].identifier} (...)`
            }

            return {
              ...item,
              duration: compareDate ? `${compareDate} horas` : '--',
              created_at: this.$moment(item.created_at).format('YYYY-MM-DD'),
              updated_at: this.$moment(item.updated_at).format('YYYY-MM-DD'),
              companys
            }
          }else if(data.products) {
            return {
              ...item,
              duration: compareDate ? `${compareDate} horas` : '--',
              created_at: this.$moment(item.created_at).format('YYYY-MM-DD'),
              updated_at: this.$moment(item.updated_at).format('YYYY-MM-DD')
            }
          }else {
            return {
              ...item,
              duration: compareDate ? `${compareDate} horas` : '--',
              scheduled_to: this.$moment(item.scheduled_to).format('YYYY-MM-DD HH:mm:ss'),
              created_at: this.$moment(item.created_at).format('YYYY-MM-DD'),
              updated_at: this.$moment(item.updated_at).format('YYYY-MM-DD'),
              data
            }
          }
        })
        return list
      }
      return []
    }
  },
  watch: {
    filters: {
      handler(){
        for(var key in this.filters) {
          if(this.filters[key] === '' || this.filters[key] === null || this.filters[key].length == 0) {
            this.disableBtn = true
          }else {
            this.disableBtn = false
          }
        }
      },
      deep: true
    },
    moreFilters: {
      handler(){
        for(var key in this.moreFilters) {
          if(this.moreFilters[key] === '' || this.moreFilters[key] === null || this.moreFilters[key].length == 0) {
            this.disableBtn = true
            if(this.typeSelected.length == 0 && this.resultSelected.length == 0) {
              this.showMoreFilters = false
            }else {
              this.showMoreFilters = true
            }
          }else {
            this.disableBtn = false
            this.showMoreFilters = true         
          }
        }
      },
      deep: true
    },
    async searchUsers(u) {
      await this.getList('/ecosystem/user', `name=like(${u})`)
        .then(data => {this.users = data.data})
    },
    async searchAttendants(u) {
      await this.getList('/ecosystem/user', `name=like(${u})`)
        .then(data => {this.attendants = data.data})
    },
    sort() {
      this.loadData()
    },
    async sortDesc() {
      await this.loadData()
    },
    async typeSelected(newValue) {
      if(newValue) {
        let isEmptyMore = this.checkPropertiesMoreFilters()
        if(newValue.length == 0 && isEmptyMore && this.resultSelected.length == 0) {
          this.showMoreFilters = false
        }else {
          this.showMoreFilters = true
        }

        if(newValue.length >= 1) {
          this.moreFilters.type_id = []        
          this.moreFilters.type_id = [ ...newValue ]
          await this.loadData()
        }else {
          this.moreFilters.type_id = undefined
          await this.loadData()
        }
      }
    },
    async resultSelected(newValue) {
      if(newValue) {
        let isEmptyMore = this.checkPropertiesMoreFilters()
        if(newValue.length == 0 && isEmptyMore && this.typeSelected.length == 0) {
          this.showMoreFilters = false
        }else {
          this.showMoreFilters = true
        }
        
        if(newValue.length >= 1) {
          this.moreFilters.result = []
          newValue.forEach(item => {
            const value = item.value
            this.moreFilters.result.push(value)
          })
          await this.loadData()
        }else {
          this.moreFilters.result = undefined
          await this.loadData()
        }
      }
    }
  },
  async mounted() {
    this.isLoading = true

    this.$root.$on('openDialogTray', (id) => {
      this.selectedRequest = id
      this.dialog.csc = true
    })

    await this.getList('/csc/meta/CSCRequestStatus').then(data => { this.requestStatus = data.data })
    await this.getList('/csc/request-type').then(data => { this.requestTypes = data.data })
    this.isLoading = false
    await this.loadData()
    this.preLoadDialog()
    if(this.$route.query.submitter_id) {
      let obj = [parseInt(this.$route.query.submitter_id)] 
      await this.filterAttendant(obj, true) 
    }
    const warning = localStorage.getItem('cscWarning')
    if(warning == null || warning == 'false') {
      this.dialog.warning = true
    }
  },
  methods: {
    preLoadDialog() {
      const id = parseInt(this.receivedId)
      if(typeof id == "number" && id > 0) {
        const request = { id: id }
        this.handleRequest(request)
      }
    },
    closeWarning() {
      localStorage.setItem('cscWarning', true)
      this.dialog.warning = false
    },
    removeFilter(value) {
      this.moreFilters = Object.keys(this.moreFilters).filter(key => key !== value).reduce((obj, key) => {
        obj[key] = this.moreFilters[key]
        return obj
      }, {}
      )
      
      if(value == 'type_id') {
        this.typeSelected = []
      }else if(value == 'result') {
        this.resultSelected = []
      }

      const lastFilter = this.checkPropertiesMoreFilters()
      if(!lastFilter){
        this.showMoreFilters = false
        this.disableBtn = true
      }else{
        this.showMoreFilters = true
      }
      this.loadData()
    },
    getTypeName(value) {
      const { name } = this.requestTypes.find(type => type.id == value)
      return name
    },
    getResultName(value) {
      const { name } = this.resultTypes.find(result => result.value == value)
      return name
    },
    getFilterName(key) {
      if(key == 'submitter_team_id') {
        return 'Time do Solicitante'
      }else if(key == 'created_at') {
        return 'Data de criação'
      }else if(key == 'appointment_date') {
        return 'Data do agendamento'
      }else if(key == 'appointment_time') {
        return 'Horário do agendamento'
      }else if(key == 'type_id') {
        return 'Tipo de Solicitação'
      }else if(key == 'result') {
        return 'Resultado'
      }
    },
    showRequestCancel(item) {
      const { submitter_id, type } = item
      if(type.type == 'Apoio' && submitter_id == this.userInfo.id) {
        return true
      }else {
        return false
      }
    },
    checkPropertiesMoreFilters() {
      for (let key in this.moreFilters) {
        if (this.moreFilters[key] !== null && this.moreFilters[key] != ''){
          return true
        }else {
          return false
        }
      }
    },
    clearFilter() {
      this.$refs.baseFilter.reset()
      this.filters = {}
      this.moreFilters = {}
      this.typeSelected = []
      this.resultSelected = []
      this.disableBtn = true
    },
    filterAttendant(userId, clear = false) {
      this.filters = {}
      this.filters.submitter_id = userId
      this.dialog.csc = false
      this.loadData()
      clear && this.$router.replace({ query: {} })
    },
    async loadData(page=0) {
      if (this.isLoading) 
        return

      this.isLoading = true

      if(this.requestStatus) {
        const filter1 = this.requestStatus.filter(function(el){ 
          return el.value !== 'created'
        })
        const filter2 = filter1.filter(function(el){ 
          return el.value !== 'cancelled'
        })
        this.requestStatus = filter2
      }

      let params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includes', 'submitter,attendant,submitter_team,type,logs')
      params.append('status', 'ne(cancelled)')
      if (this.sort) {
        let sp = this.sort
        if (this.sortDesc) {
          sp+= '_desc'
        }
        params.append('order', sp)
      }
      if (page) {
        params.append('page', page)
      }
      else {
        this.requestItems = []
      }

      for (let filter in this.filters) {
        let el = this.filters[filter]
        if(el) {
          if(filter == 'identifier_name') {
            let clean = el.replace(/\.|-|\//g, '')
            let formatted
            if (clean.length == 11) {
              // eslint-disable-next-line no-useless-escape
              formatted = clean.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})/, '$1\.?$2\.?$3-?$4')
            }
            else {
              // eslint-disable-next-line no-useless-escape
              formatted = clean.replace(/^(\d{2})/, '$1\.?')
              // eslint-disable-next-line no-useless-escape
              formatted = formatted.replace(/^(\d{2}.*?\d{3})/, '$1\.?')
              formatted = formatted.replace(/^(\d{2}.*?\d{3}.*?\d{3})/, '$1/?')
              formatted = formatted.replace(/^(\d{2}.*?\d{3}.*?\d{3}.*?\d{4})/, '$1-?')

              if (clean.length <= 11) {                
                // eslint-disable-next-line no-useless-escape
                let cpf = clean.replace(/^(\d{3})/, '$1\.?')
                // eslint-disable-next-line no-useless-escape
                cpf = cpf.replace(/^(\d{3}.*?\d{3})/, '$1\.?')
                cpf = cpf.replace(/^(\d{3}.*?\d{3}.*?\d{3})/, '$1-?')
                formatted += '|' + cpf
              }
            }
            
            params.append('data', `regexp(${formatted})`)
          }else if(filter == 'status') {
            if(el.length === 0) {
              params.delete(filter)
              params.append('status', 'ne(cancelled)')
            }else {
              params.append(filter, `in(${el})`)
            }
          }else if(filter == 'submitter_id') {
            if(el.length === 0) {
              params.delete(filter)
            }else {
              params.append(filter, `in(${el})`)
            }
          }else if(filter == 'attendant_id') {
            if(el.length === 0) {
              params.delete(filter)
            }else {
              params.append(filter, `in(${el})`)
            }
          }
        }
      }

      for (let filter in this.moreFilters) {
        let el = this.moreFilters[filter]
        if(el) {
          if(filter == 'created_at') {
            params.append(filter, `ge(${el})`)
            
            let s = new Date(el)
            s.setDate(s.getDate()+1)
            s = s.toISOString().split('T')[0]
            params.append(filter, `lt(${s})`)
          }else if(filter == 'appointment_date' || filter == 'appointment_time') {
            params.append('scheduled_to', `like(${el})`)
          }else if(filter == 'type_id') {
            if(el.length === 0) {
              params.delete(filter)
            }else {
              params.append(filter, `in(${el})`)
            }
          }else if(filter == 'submitter_team_id') {
            let list = []
            el.forEach(item => {
              const id = item.id
              list.push(id)
            })
            if(list.length === 0) {
              params.delete(filter)
              delete this.moreFilters['submitter_team_id']
            }else {
              params.append(filter, `in(${list})`)
            }
          }else if(filter == 'result') {
            this.resultQuery = []
            if(el.length === 0) {
              params.delete(filter)
            }else {
              for (const item of this.resultSelected) {
                if(item.value == 'approved' || item.value == 'accomplished') {
                  if(!this.resultQuery.find(el => el == 'approved')) {
                    this.resultQuery.push('approved')
                  }
                }
                if(item.value == 'rejected' || item.value == 'unrealized') {
                  if(!this.resultQuery.find(el => el == 'rejected')) {
                    this.resultQuery.push('rejected')
                  }
                }
              }
              params.append(filter, `in(${this.resultQuery})`)
            }
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

<style scoped>
  .data-table {
    cursor: pointer !important;
  }
  .v-autocomplete-control {
    max-width: 315px;
  }
</style>