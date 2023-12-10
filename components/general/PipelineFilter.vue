<template>
  <v-row class="d-flex flex-wrap justify-space-between align-center">
    <v-col xl="9" lg="8" class="d-flex flex-wrap align-center">
      <div
        class="w-25 my-1"
        v-for="key, index in visibleFiltersKeys"
        :key="index"
      >
        <v-autocomplete
          attach
          v-if="filters[key].type != 'text'"
          solo
          dense
          hide-details
          clearable
          :data-test="`selectPipelineFilterValue${index}`"
          class="mx-1"
          v-model="filters[key].values"
          :multiple="filters[key].multiple"
          :item-text="filters[key].text"
          :item-value="filters[key].value"
          :label="filters[key].name"
          :items="filters[key].items"
          @change="setFilter"
        ></v-autocomplete>
        <v-text-field
          v-else
          solo
          dense
          hide-details
          clearable
          :data-test="`inputPipelineFilterValue${index}`"
          class="mx-1"
          prepend-inner-icon="mdi-magnify"
          v-model="filters[key].values"
          :placeholder="filters[key].name"
          @change="() => {
            if (filters[key].values !== null) {
              setFilter()
            }
          }"
          @click:clear="() => {
            filters[key].values = null
            setFilter()
          }"
        ></v-text-field>
      </div>
    </v-col>
    <v-col xl="3" lg="4" class="d-flex justify-end align-center">

      <v-menu offset-y offset-x origin="bottom-left" :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            data-test="btnPipelineFilterOpen"
            color="shape lighten-1"
            class="primary--text mx-1"
            v-bind="attrs"
            v-on="on"
          >
            <v-icon color="primary" class="mr-2">
              mdi-tune
            </v-icon>
            Mais Filtros
          </v-btn>
        </template>
        <v-card width="250px" elevation="0">
          <v-card-title class="d-flex flex-column align-start mb-0">
            <span class="font-weight-bold">Mais filtros</span>
            <v-divider></v-divider>
            <span class="font-body-medium font-weight-bold">Selecione os campos</span>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="key, index in filterKeys"
                :key="index"
              >
                <v-checkbox
                  dense
                  :data-test="`checkBoxPipelineFilterValue${index}`"
                  v-model="filters[key].visible"
                  :label="filters[key].name"
                  @change="handleCheckbox($event, key)"
                ></v-checkbox>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="px-4 d-flex justify-start">
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-btn data-test="btnPipelineFilterReset" color="shape lighten-1" class="primary--text mx-1" @click="resetFilters">
        Redefinir Filtros
      </v-btn>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    pipelineType: String,
    pipelineId: String
  },
  data: () => ({
    queryFilters: [],
    filters: {},
    opportunityFilters: {
      name: {
        name: 'Razão Social',
        multiple: false,
        field: 'company.name',
        values: null,
        visible: true,
        items: [],
        text: null,
        value: null,
        type: 'text',
      },
      identifier: {
        name: 'CNPJ',
        multiple: false,
        field: 'company.identifier',
        values: null,
        visible: true,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      users: {
        name: 'Responsável',
        multiple: true,
        field: 'assigned_to_id',
        values: [],
        visible: true,
        items: [],
        text: 'name',
        value: 'id',
        type: 'select',
      },
      status: {
        name: 'Status',
        multiple: true,
        field: 'status',
        values: [],
        visible: true,
        items: [],
        text: 'name',
        value: 'value',
        type: 'select',
      },
      team: {
        name: 'Time',
        multiple: true,
        field: 'team_id',
        values: [],
        visible: true,
        items: [],
        text: 'name',
        value: 'id',
        type: 'select',
      },
      prevision: {
        name: 'Previsão de fechamento',
        multiple: false,
        field: 'prevision',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
      temperature: {
        name: 'Temperatura',
        multiple: true,
        field: 'temperature',
        values: [],
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'select',
      },
      origin: {
        name: 'Origem',
        multiple: true,
        field: 'origin.name',
        values: [],
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'select',
      },
      product: {
        name: 'Produtos',
        multiple: true,
        field: 'invoices.products.product_id',
        values: [],
        visible: false,
        items: [],
        text: 'name',
        value: 'id',
        type: 'select',
      },
      opportunityId: {
        name: 'ID da oportunidade',
        multiple: false,
        field: 'id',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      contact: {
        name: 'Nome do contato',
        multiple: false,
        field: 'contact.name',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      size: {
        name: 'Porte da empresa',
        multiple: true,
        field: 'company.size',
        values: [],
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'select',
      },
      partner: {
        name: 'Parceiro da oportunidade',
        multiple: false,
        field: 'partner.name',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      created: {
        name: 'Criada em',
        multiple: false,
        field: 'created_at',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
      updated: {
        name: 'Atualizada em',
        multiple: false,
        field: 'updated_at',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
    },
    taskFilters: {
      name: {
        name: 'Razão Social',
        multiple: false,
        field: 'opportunity.company.name',
        values: null,
        visible: true,
        items: [],
        text: null,
        value: null,
        type: 'text',
      },
      identifier: {
        name: 'CNPJ',
        multiple: false,
        field: 'opportunity.company.identifier',
        values: null,
        visible: true,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      users: {
        name: 'Responsável',
        multiple: true,
        field: 'assigned_to_id',
        values: [],
        visible: true,
        items: [],
        text: 'name',
        value: 'id',
        type: 'select',
      },
      type: {
        name: 'Tipo de tarefa',
        multiple: false,
        field: 'type.name',
        values: null,
        visible: true,
        items: [],
        text: 'name',
        value: 'id',
        type: 'text',
      },
      team: {
        name: 'Time',
        multiple: true,
        field: 'team_id',
        values: [],
        visible: true,
        items: [],
        text: 'name',
        value: 'id',
        type: 'select',
      },
      reason: {
        name: 'Motivo',
        multiple: false,
        field: 'reason',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'id',
        type: 'text',
      },
      scheduled: {
        name: 'Data de vencimento',
        multiple: false,
        field: 'scheduled_to',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
      taskId: {
        name: 'ID da tarefa',
        multiple: false,
        field: 'id',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'id',
        type: 'text',
      },
      opportunityId: {
        name: 'ID da oportunidade',
        multiple: false,
        field: 'opportunity.id',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'id',
        type: 'text',
      },
      contact: {
        name: 'Nome do contato',
        multiple: false,
        field: 'contact.name',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'text',
      },
      created: {
        name: 'Criada em',
        multiple: false,
        field: 'created_at',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
      updated: {
        name: 'Atualizada em',
        multiple: false,
        field: 'updated_at',
        values: null,
        visible: false,
        items: [],
        text: 'name',
        value: 'value',
        type: 'date',
      },
    },
    products: [],
    teams: [],
    origins: [],
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      coworkers: 'coworkers',
      meta: 'meta',
    }),
    filterKeys: function() {
      return Object.keys(this.filters)
    },
    visibleFiltersKeys: function() {
      const keys = []
      Object.entries(this.filters).forEach(([key, value]) => {
        if (value.visible) {
          keys.push(key)
        }
      })
      return keys
    }
  },
  watch: {
    queryFilters(newValue) {
      this.$emit('onFilterChange', newValue)
    },
  },
  mounted() {
    this.setupFilters()
  },
  methods: {
    async setupFilters() {
      const storedFilters = this.getStoredFilters(this.pipelineType, this.pipelineId)
      await this.getCoworkers()
      switch (this.pipelineType) {
      case 'opportunity':
        this.products = await this.getProducts()
        this.teams = await this.getTeams()
        this.origins = await this.getOrigins()
        if (storedFilters) {
          const filters = { ...this.opportunityFilters, ...storedFilters }
          this.updateOpportunityFilterItems(filters)
          this.filters = filters
        } else {
          this.updateOpportunityFilterItems(this.opportunityFilters)
          this.filters = this.opportunityFilters
          this.setDefaultUser()
        }
        break
      case 'task':
        this.teams = await this.getTeams()
        if (storedFilters) {
          const filters = { ...this.opportunityFilters, ...storedFilters }
          this.updateTaskFilterItems(filters)
          this.filters = filters
        } else {
          this.updateTaskFilterItems(this.taskFilters)
          this.filters = this.taskFilters
          this.setDefaultUser()
        }
        break
      default:
        break
      }
      this.generateQueries(this.filters)
    },
    generateQueries(filters) {
      const queries = []
      for (let filter in filters) {
        if (filters[filter].visible) {
          if (filters[filter].multiple) {
            if (filters[filter].values.length > 0) {
              const values = filters[filter].values.join()
              if (filters[filter].field === 'temperature') {
                if (filters[filter].values.some(value => value === 0)) {
                  queries.push(`or=(${filters[filter].field}=null,${filters[filter].field}=in(${values}))`)
                } else {
                  queries.push(`${filters[filter].field}=in(${values})`)
                }
              } else {
                queries.push(`${filters[filter].field}=in(${values})`)
              }
            }
          } else {
            if (filters[filter].values) {
              const values = filters[filter].values
              if (filters[filter].type == 'date') {
                queries.push(this.setDateRangeList(values, filters[filter].field, true))
              } else {
                if (filters[filter].name === 'CNPJ') {
                  const justNumbers = values.replace(/\D/g, '')
                  queries.push(`${filters[filter].field}=like(${justNumbers})`)
                } else if (filters[filter].field === 'id') {
                  queries.push(`${filters[filter].field}=${values}`)
                } else {
                  queries.push(`${filters[filter].field}=like(${values})`)
                }
              }
            }
          }
        }
      }
      this.queryFilters = queries
      this.storeFilters(this.pipelineType, this.pipelineId, filters)
    },
    setFilter() {
      this.generateQueries(this.filters)
    },
    updateOpportunityFilterItems(obj) {
      obj.users.items = this.coworkers
      obj.status.items = this.meta.opportunityStatus
      obj.temperature.items = [
        { name: '0º', value: 0},
        { name: '10º', value: 10},
        { name: '20º', value: 20},
        { name: '30º', value: 30},
        { name: '40º', value: 40},
        { name: '50º', value: 50},
        { name: '60º', value: 60},
        { name: '70º', value: 70},
        { name: '80º', value: 80},
        { name: '90º', value: 90},
        { name: '100º', value: 100},
      ]
      obj.size.items = this.meta.companySize
      obj.product.items = this.products
      obj.created.items = this.dateRange
      obj.updated.items = this.dateRange
      obj.prevision.items = this.dateRange
      obj.team.items = this.teams
      obj.origin.items = this.origins
    },
    updateTaskFilterItems(obj) {
      obj.users.items = this.coworkers
      obj.created.items = this.dateRange
      obj.updated.items = this.dateRange
      obj.scheduled.items = this.dateRange
      obj.team.items = this.teams
    },
    resetFilters() {
      this.filterKeys.forEach((key) => {
        if (this.filters[key].type == 'select') {
          this.filters[key].values = []
        } else {
          this.filters[key].values = null
        }
      })
      this.generateQueries(this.filters)
    },
    async getCoworkers() {
      await this.$store.dispatch('fetchCoworkers')
    },
    async getProducts() {
      const { data } = await this.getList('/ecosystem/product?limit=1000')
      const products = data.map((product) => ({
        name: product.name + ' - ' + product.family,
        id: product.id
      }))
      return products
    },
    async getTeams() {
      const { data } = await this.getList('/ecosystem/any-team', 'order=level,id&includes=parent.parent&strict=true&limit=400')
      const teams = data.map((team) => ({
        name: `${team.parent?.parent ? team.parent.parent.name + ' - ' : ''} ${team.parent ? team.parent.name + ' - ' : ''} ${team.name}`,
        id: team.id
      }))
      return teams
    },
    async getOrigins() {
      const { data } = await this.getList('/cash/opportunity-origin')
      const origins = data.map((origin) => ({
        name: origin.name,
        id: origin.id
      }))
      return origins
    },
    handleCheckbox(value, key) {
      if (!value) {
        if (this.filters[key].type == 'select') {
          this.filters[key].values = []
        } else {
          this.filters[key].values = null
        }
        this.generateQueries(this.filters)
      }
    },
    setDefaultUser() {
      this.taskFilters['users'].values.push(this.userInfo.id)
      this.opportunityFilters['users'].values.push(this.userInfo.id)
    },
    storeFilters(type, id, filters) {
      const storageKey = `${type}-pipeline-filters`
      const pipelineFilters = JSON.parse(localStorage.getItem(storageKey))
      if (id) {
        if (pipelineFilters) {
          localStorage.setItem(storageKey, JSON.stringify({
            ...pipelineFilters,
            [id]: filters
          }))
        } else {
          localStorage.setItem(storageKey, JSON.stringify({ [id]: filters }))
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify(filters))
      }
    },
    getStoredFilters(type, id) {
      const storageKey = `${type}-pipeline-filters`
      const pipelineFilters = JSON.parse(localStorage.getItem(storageKey))
      if (pipelineFilters) {
        if (id) {
          return pipelineFilters[id]
        } else {
          return pipelineFilters
        }
      }
      return null
    }
  }
}
</script>

<style>

</style>
