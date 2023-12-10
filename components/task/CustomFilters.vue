<template>
  <div>
    <v-row class="d-flex flex-wrap justify-space-between align-center px-0">
      <v-col xl="10" lg="10" class="d-flex flex-wrap align-center px-0">
        <v-text-field
          outlined
          dense
          hide-details
          clearable
          class="mx-1 autocomplete-filter"
          append-icon="mdi-magnify"
          label="CNPJ ou Razão Social"
          v-model="customFilters['identifier'].value"
          @change="handleCustomFilters"
        ></v-text-field>
        <v-autocomplete
          attach
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          class="mx-1 autocomplete-filter"
          label="Atribuído(a) a"
          item-text="name"
          item-value="id"
          v-model="customFilters['users'].value"
          :items="users"
          @change="handleCustomFilters"
        >
          <template v-slot:selection="{ item, parent, index }">
            <AutocompleteSelectionSlot
              :maxLength="18"
              :parent="parent"
              :item="item"
              :counter="customFilters['users'].value ? customFilters['users'].value.length : 0"
              :index="index"
            />
          </template>
        </v-autocomplete>
        <v-autocomplete
          attach
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          class="mx-1 autocomplete-filter"
          label="Tipo de tarefa"
          item-text="name"
          item-value="id"
          v-model="customFilters['mediaType'].value"
          :items="mediaTypeList"
          @change="handleMediaTypeChange"
        >
          <template v-slot:selection="{ item, parent, index }">
            <AutocompleteSelectionSlot
              :maxLength="18"
              :parent="parent"
              :item="item"
              :counter="customFilters['mediaType'].value ? customFilters['mediaType'].value.length : 0"
              :index="index"
            />
          </template>
        </v-autocomplete>
        <v-autocomplete
          attach
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          class="mx-1 autocomplete-filter"
          label="Finalidade da tarefa"
          item-text="name"
          item-value="id"
          v-model="customFilters['type'].value"
          :items="typeList"
          @change="handleCustomFilters"
        >
          <template v-slot:selection="{ item, parent, index }">
            <AutocompleteSelectionSlot
              :maxLength="18"
              :parent="parent"
              :item="item"
              :counter="customFilters['type'].value ? customFilters['type'].value.length : 0"
              :index="index"
            />
          </template>
        </v-autocomplete>
      </v-col>
      <v-col xl="2" lg="2" class="d-flex justify-end align-center px-0">
        <v-btn color="shape lighten-1" class="primary--text mx-1" :disabled="!hasFilterApplied" @click="resetFilters">
          Limpar filtros
        </v-btn>
        <v-btn
          fab
          color="shape lighten-1"
          class="primary--text mx-1"
          @click="showFilters = !showFilters"
        >
          <v-icon v-if="showFilters" class="primary--text">
            close
          </v-icon>
          <v-icon v-else class="primary--text" v-tooltip="{ content: `<div class='v-btn-tooltip'>Mais filtros</div>` , placement: 'auto' }">
            mdi-tune
          </v-icon>
        </v-btn>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="px-1">
        <section v-if="showHiddenFilters">
          <span>Filtros aplicados:</span>
          <div v-for="(filter, filterKey) in customFilters" :key="filterKey" class="d-inline">
            <template v-if="checkFilterChip(filter)">
              <span>&nbsp;{{filter.name}}:&nbsp;</span>
              <v-chip
                label
                close
                small
                close-icon="close"
                color="blue lighten-5"
                @click:close="handleRemoveFilter(filterKey)"
              >
                {{generateFilterChip(filterKey)}}
              </v-chip>
            </template>
          </div>
        </section>
        <v-card v-if="showFilters">
          <v-card-text class="default-text--text">
            <v-row>
              <v-col class="pb-0">
                <span class="font-body-medium font-weight-bold">Mais filtros</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4" class="pt-1">
                <v-switch
                  dense
                  inset
                  label="Ver apenas as atrasadas"
                  class="mb-0"
                  style="margin-top: 2px;"
                  v-model="customFilters['delayed'].value"
                  @change="handleCustomFilters"
                ></v-switch>
                <v-autocomplete
                  attach
                  return-object
                  dense
                  clearable
                  no-data-text=""
                  class="pt-0"
                  label="Data de agendamento"
                  item-text="name"
                  item-value="value"
                  v-model="customFilters['scheduledTo'].value"
                  :no-filter="!!customFilters['scheduledTo'].customValue"
                  :items="generateItemsList(dateRange, customFilters['scheduledTo'].customValue, customFilters['scheduledTo'].customValueItem)"
                  @input="handleCustomFilters"
                >
                  <template v-slot:prepend-item>
                    <AutocompletePrependItemSlot
                      v-bind:dateChip.sync="customFilters['scheduledTo'].customValue"
                      :custom-value-item="customFilters['scheduledTo'].customValueItem"
                      @onDateChosen="(value) => {customFilters['scheduledTo'].customValueItem = value}"
                      @onChipChange="(value) => {customFilters['scheduledTo'].value = value}"
                    />
                  </template>
                </v-autocomplete>
                <v-autocomplete
                  attach
                  return-object
                  dense
                  clearable
                  no-data-text=""
                  class="pt-0"
                  label="Data de criação"
                  item-text="name"
                  item-value="value"
                  v-model="customFilters['createdAt'].value"
                  :no-filter="!!customFilters['createdAt'].customValue"
                  :items="generateItemsList(pastDateRanges, customFilters['createdAt'].customValue, customFilters['createdAt'].customValueItem)"
                  @input="handleCustomFilters"
                >
                  <template v-slot:prepend-item>
                    <AutocompletePrependItemSlot
                      v-bind:dateChip.sync="customFilters['createdAt'].customValue"
                      :custom-value-item="customFilters['createdAt'].customValueItem"
                      @onDateChosen="(value) => {customFilters['createdAt'].customValueItem = value}"
                      @onChipChange="(value) => {customFilters['createdAt'].value = value}"
                    />
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="4" class="pt-1">
                <v-autocomplete
                  attach
                  return-object
                  dense
                  clearable
                  no-data-text=""
                  class="pt-0"
                  label="Atualizada em"
                  item-text="name"
                  item-value="value"
                  v-model="customFilters['updatedAt'].value"
                  :no-filter="!!customFilters['updatedAt'].customValue"
                  :items="generateItemsList(pastDateRanges, customFilters['updatedAt'].customValue, customFilters['updatedAt'].customValueItem)"
                  @input="handleCustomFilters"
                >
                  <template v-slot:prepend-item>
                    <AutocompletePrependItemSlot
                      v-bind:dateChip.sync="customFilters['updatedAt'].customValue"
                      :custom-value-item="customFilters['updatedAt'].customValueItem"
                      @onDateChosen="(value) => {customFilters['updatedAt'].customValueItem = value}"
                      @onChipChange="(value) => {customFilters['updatedAt'].value = value}"
                    />
                  </template>
                </v-autocomplete>
                <v-autocomplete
                  attach
                  return-object
                  dense
                  clearable
                  multiple
                  class="pt-0"
                  label="Time"
                  item-text="name"
                  item-value="id"
                  v-model="customFilters['teams'].value"
                  :items="teams"
                  @change="handleTeamChange"
                >
                  <template v-slot:selection="{ item, parent, index }">
                    <AutocompleteSelectionSlot
                      :maxLength="48"
                      :parent="parent"
                      :item="item"
                      :counter="customFilters['teams'].value ? customFilters['teams'].value.length : 0"
                      :index="index"
                    />
                  </template>
                </v-autocomplete>
                <v-text-field
                  dense
                  clearable
                  append-icon="mdi-magnify"
                  placeholder="Nome do contato"
                  v-model="customFilters['contact'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="pt-1">
                <v-text-field
                  dense
                  clearable
                  append-icon="mdi-magnify"
                  placeholder="ID da tarefa"
                  v-model="customFilters['taskId'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
                <v-text-field
                  dense
                  clearable
                  append-icon="mdi-magnify"
                  placeholder="ID da Oportunidade"
                  v-model="customFilters['opportunityId'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
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
    customFilters: {
      'identifier': {
        name: 'CNPJ ou Razão Social',
        value: null,
        field: 'opportunity.company.identifier',
        alternativeField: 'opportunity.company.name',
        type: 'like',
        showChip: false,
      },
      'users': {
        name: 'Atribuído(a) a',
        value: [],
        field: 'assigned_to_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: false,
      },
      'mediaType': {
        name: 'Tipo de tarefa',
        value: [],
        field: 'type.media_type_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: false,
      },
      'type': {
        name: 'Finalidade da tarefa',
        value: [],
        field: 'type_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: false,
      },
      'delayed': {
        name: 'Atrasadas',
        value: false,
        field: null,
        alternativeField: null,
        type: 'boolean',
        key: null,
        showChip: true,
      },
      'scheduledTo': {
        name: 'Data de agendamento',
        value: null,
        customValue: 0,
        customValueItem: null,
        field: 'scheduled_to',
        alternativeField: null,
        type: 'date',
        showChip: true,
      },
      'createdAt': {
        name: 'Data de criação',
        value: null,
        customValue: 0,
        customValueItem: null,
        field: 'created_at',
        alternativeField: null,
        type: 'date',
        showChip: true,
      },
      'updatedAt': {
        name: 'Atualizada em',
        value: null,
        customValue: 0,
        customValueItem: null,
        field: 'updated_at',
        alternativeField: null,
        type: 'date',
        showChip: true,
      },
      'teams': {
        name: 'Time',
        value: [],
        field: 'team_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: true,
      },
      'contact': {
        name: 'Nome do contato',
        value: null,
        field: 'contact.name',
        alternativeField: null,
        type: 'like',
        showChip: true,
      },
      'taskId': {
        name: 'ID da tarefa',
        value: null,
        field: 'id',
        alternativeField: null,
        type: 'exact',
        showChip: true,
    
      },
      'opportunityId': {
        name: 'ID da Oportunidade',
        value: null,
        field: 'opportunity_id',
        alternativeField: null,
        type: 'exact',
        showChip: true,
      },
    },
    teams: [],
    users: [],
    mediaTypeList: [],
    typeList: [],
    showFilters: false,
    initialDate: null,
    finalDate: null,
    customDate: null,
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      preferences: 'Profile/preferences',
      preference: 'Profile/preference',
      meta: 'meta',
    }),
    showHiddenFilters: function() {
      const filters = this.customFilters
      let show = false
      if (this.showFilters) {
        return false
      }
      for (let filterKey in filters) {
        if (this.checkFilterChip(filters[filterKey])) {
          show = true
        }
      }
      return show
    },
    pastDateRanges: function() {
      return this.dateRange.filter((date) => !date.future)
    },
    hasFilterApplied: function() {
      const filters = this.customFilters
      for (let filterKey in filters) {
        const filter = filters[filterKey]
        if (filter.type === 'multiple') {
          if (filter.value.length > 0) {
            return true
          }
        } else {
          if (filter.value) {
            return true
          }
        }
      }
      return false
    },
  },
  watch: {
    queryFilters(newValue) {
      this.setFilterPreference(this.customFilters)
      this.$emit('onFilterChange', newValue)
    },
    initialDate(newValue) {
      if (newValue !== '' && this.finalDate === '') {
        this.finalDate = this.$moment(newValue).add(1, 'days').format('YYYY-MM-DD')
      }
    },
    finalDate(newValue) {
      if (newValue !== '' && this.inicialDate === '') {
        this.inicialDate = this.$moment(newValue).subtract(1, 'days').format('YYYY-MM-DD')
      }
    },
    showFilters(newValue) {
      this.$emit('onFilterOpen', newValue)
    },
  },
  created() {
    this.getFilterPreference()
  },
  async mounted() {
    this.teams = await this.getTeams()
    this.mediaTypeList = await this.getAllTaskMediaTypes()
    this.typeList = await this.getTaskTypeList()
    await this.getUsersByTeams(this.customFilters['teams'].value)
    this.setDefaultUser()
    this.handleCustomFilters()
    // this.getFilterPreference()
  },
  methods: {
    resetFilters() {
      for (let filterKey in this.customFilters) {
        const filter = this.customFilters[filterKey]
        if (filter.type === 'multiple') {
          this.customFilters[filterKey].value = []
        } else {
          this.customFilters[filterKey].value = null
        }
        this.handleCustomFilters()
      }
    },
    async getTeams() {
      const { data } = await this.getList(
        '/ecosystem/any-team',
        'order=level,id&includes=parent.parent&load_only=name&strict=true&limit=1000'
      )
      const teams = data.map((team) => ({
        name: `${team.parent?.parent ? team.parent.parent.name + ' - ' : ''} ${team.parent ? team.parent.name + ' - ' : ''} ${team.name}`,
        id: team.id
      }))
      return teams
    },
    async getUsersByTeams(teams) {
      if (teams.length > 0) {
        const teamIds = teams.map((team) => team.id)
        const { data } = await this.getList(
          '/ecosystem/capability',
          `includes=user&load_only=id,user.id,user.name&team_id=in(${teamIds.join(',')})&order=user.name`
        )
        const users = data.map((capability) => ({
          name: capability?.user?.name,
          id: capability?.user?.id,
        }))
        this.users = users
      } else {
        const { data } = await this.getList('/ecosystem/my-coworkers', 'load_only=name&order=name')
        this.users = data
      }
    },
    setDefaultUser() {
      const taskPipeline = this.preference('task_pipeline')
      if (!taskPipeline?.filters) {
        const myUser = this.users.find((user) => user.id === this.userInfo.id)
        if (myUser) {
          this.customFilters['users'].value.push(myUser)
        }
      }
    },
    handleCustomFilters() {
      const filters = this.customFilters
      const filterArray = []
      for (let filterKey in filters) {
        const filter = filters[filterKey]
        let value = filter.value
        let field = filter.field
        if (value) {
          if (filterKey === 'identifier') {
            if (!this.StringIsJustNumbers(value)) {
              value = this.onlyNumbers(value)
            } else {
              field = filter.alternativeField
            }
          }
          switch (filter.type) {
          case 'multiple': {
            if (value?.length > 0) {
              const valuesKey = value.map((value) => value[filter.key])
              const filterString = `${field}=in(${valuesKey.join(',')})`
              filterArray.push(filterString)
            }
            break
          }
          case 'exact': {
            const filterString = `${field}=${value}`
            filterArray.push(filterString)
            break
          }
          case 'like': {
            const filterString = `${field}=like(${value})`
            filterArray.push(filterString)
            break
          }
          case 'date': {
            const filterString = this.setDateRangeList(value.value, field, true)
            filterArray.push(filterString)
            break
          }
          case 'boolean': {
            const filterString = `state=created&scheduled_to=lt(${this.$moment.utc(new Date()).format('YYYY-MM-DDTHH:mm:ss')})`
            filterArray.push(filterString)
            break
          }
          default:
            break
          }
        }
      }
      this.queryFilters = filterArray
    },
    getFilterPreference() {
      const taskPipeline = this.preference('task_pipeline')
      if (taskPipeline?.filters) {
        const { filters } = taskPipeline
        this.customFilters = { ...this.customFilters, ...filters}
      }
    },
    async setFilterPreference(customFilters) {
      const taskPipeline = this.preference('task_pipeline') 
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          'task_pipeline': {
            ...taskPipeline,
            filters: customFilters,
          }
        }
      }
      await this.updateData('/ecosystem/set-user-profile-preferences', payload, { fireSuccessAlert: false })
      await this.$getMyProfile()
    },
    handleRemoveFilter(filterKey){
      const filter = this.customFilters[filterKey]
      if (filter.type === 'multiple') {
        this.customFilters[filterKey].value = []
      } else {
        this.customFilters[filterKey].value = null
      }
      if (filterKey === 'teams') {
        this.handleTeamChange(this.customFilters[filterKey].value)
      } else if (filterKey === 'mediaType') {
        this.handleMediaTypeChange(this.customFilters[filterKey].value)
      } else {
        this.handleCustomFilters()
      }
    },
    generateFilterChip(filterKey){
      const filter = this.customFilters[filterKey]
      if (filter.type === 'multiple') {
        const values = []
        filter.value.forEach((value, index) => {
          if (index === 0 || index === 1) {
            values.push(value.name)
          }
          if (index === 2) {
            values.push(`(+${filter.value.length - 2})`)
          }
        })
        return values.join(', ')
      } else if(filter.type === 'date') {
        return filter.value.name
      }else if(filter.type === 'boolean') {
        return filter.value ? 'Sim' : 'Não'
      } else {
        return filter.value
      }
    },
    checkFilterChip(filter) {
      if (filter.showChip) {
        if (filter.type === 'multiple') {
          if (filter.value.length > 0) {
            return true
          }
        } else {
          if (filter.value) {
            return true
          }
        }
      }
      return false
    },
    generateItemsList(items, chipValue, customItem) {
      if (chipValue) {
        if (customItem) {
          return [customItem]
        }
        return []
      }
      return items
    },
    handleTeamChange(teams) {
      this.customFilters['users'].value = []
      this.getUsersByTeams(teams)
      this.handleCustomFilters()
    },
    async handleMediaTypeChange(mediaTypes) {
      if (mediaTypes.length > 0) {
        const mediaTypeIds = mediaTypes.map((mediaType) => mediaType.id)
        const mediaTypeQuery = `in(${mediaTypeIds.join(',')})`
        this.typeList = await this.getTaskTypeList(mediaTypeQuery)
      } else {
        this.typeList = await this.getTaskTypeList()
      }
      this.customFilters['type'].value = []
      this.handleCustomFilters()
    },
  }
}
</script>

<style>
 .autocomplete-filter {
  width: 20%;
 }
</style>
