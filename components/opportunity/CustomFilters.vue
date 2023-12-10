<template>
  <div>
    <v-row class="d-flex flex-wrap justify-space-between align-center px-0">
      <v-col cols="10" xl="10" lg="10" class="d-flex flex-wrap align-center px-0">
        <v-text-field
          outlined
          dense
          hide-details
          clearable
          data-test="selectPipelineFilterIdentifier"
          class="mx-1 autocomplete-filter"
          append-icon="mdi-magnify"
          label="CNPJ ou Razão Social"
          v-model="customFilters['identifier'].value"
          @change="handleCustomFilters"
        ></v-text-field>
        <v-autocomplete
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          data-test="selectPipelineFilterUser"
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
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          data-test="selectPipelineFilterStatus"
          class="mx-1 autocomplete-filter"
          label="Status"
          item-text="name"
          item-value="value"
          v-model="customFilters['status'].value"
          :items="meta.opportunityStatus"
          @change="handleCustomFilters"
        >
          <template v-slot:selection="{ item, parent, index }">
            <AutocompleteSelectionSlot
              :maxLength="18"
              :parent="parent"
              :item="item"
              :counter="customFilters['status'].value ? customFilters['status'].value.length : 0"
              :index="index"
            />
          </template>
        </v-autocomplete>
        <v-autocomplete
          return-object
          outlined
          dense
          hide-details
          clearable
          multiple
          data-test="selectPipelineFilterTeam"
          class="mx-1 autocomplete-filter"
          label="Time"
          item-text="name"
          item-value="id"
          v-model="customFilters['teams'].value"
          :items="teams"
          @change="handleTeamChange"
        >
          <template v-slot:selection="{ item, parent, index }">
            <AutocompleteSelectionSlot
              :maxLength="18"
              :parent="parent"
              :item="item"
              :counter="customFilters['teams'].value ? customFilters['teams'].value.length : 0"
              :index="index"
            />
          </template>
        </v-autocomplete>
      </v-col>
      <v-col cols="2" xl="2" lg="2" class="d-flex justify-end align-center px-0">
        <v-btn data-test="btnCustomFiltersResetFilters" color="shape lighten-1" class="primary--text mx-1" :disabled="!hasFilterApplied" @click="resetFilters">
          Limpar filtros
        </v-btn>
        <v-btn
          fab
          data-test="btnCustomFiltersShowFilters"
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
                class="my-1"
                v-tooltip="
                  generateFilterTooltip(filterKey)
                    ? { content: `<div class='v-btn-tooltip'>${generateFilterTooltip(filterKey)}</div>` , placement: 'auto' }
                    : null
                "
                :data-test="`removePipelineFilter${filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}`"
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
              <v-col class="pb-2">
                <span class="body-1 font-weight-bold">Mais filtros</span>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4" class="pt-1">
                <v-autocomplete
                  return-object
                  dense
                  clearable
                  data-test="selectPipelineFilterCreatedAt"
                  no-data-text=""
                  class="pt-0"
                  label="Criada em"
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
                <v-autocomplete
                  return-object
                  dense
                  clearable
                  data-test="selectPipelineFilterUpdatedAt"
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
                  return-object
                  dense
                  clearable
                  data-test="selectPipelineFilterPrevision"
                  no-data-text=""
                  class="pt-0"
                  label="Previsão de fechamento"
                  item-text="name"
                  item-value="value"
                  v-model="customFilters['prevision'].value"
                  :no-filter="!!customFilters['prevision'].customValue"
                  :menu-props="{ offsetY: false, auto: true }"
                  :items="generateItemsList(dateRange, customFilters['prevision'].customValue, customFilters['prevision'].customValueItem)"
                  @input="handleCustomFilters"
                >
                  <template v-slot:prepend-item>
                    <AutocompletePrependItemSlot
                      v-bind:dateChip.sync="customFilters['prevision'].customValue"
                      :custom-value-item="customFilters['prevision'].customValueItem"
                      @onDateChosen="(value) => {customFilters['prevision'].customValueItem = value}"
                      @onChipChange="(value) => {customFilters['prevision'].value = value}"
                    />
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="4" class="pt-1">
                <NewAutocomplete
                  dense
                  clearable
                  return-object
                  custom-selection
                  multiple
                  data-test="selectPipelineFilterOrigin"
                  ref="originAutocomplete"
                  label="Origem"
                  endpoint="/cash/opportunity-origin"
                  item-text="name"
                  v-model="customFilters['origin'].value"
                  @change="handleCustomFilters"
                />
                <NewAutocomplete
                  dense
                  clearable
                  return-object
                  custom-selection
                  multiple
                  data-test="selectPipelineFilterProduct"
                  ref="productAutocomplete"
                  label="Produtos"
                  endpoint="/ecosystem/product"
                  query="load_only=id,name,family"
                  :item-text="(product) => product.name + ' - ' + product.family"
                  v-model="customFilters['products'].value"
                  @change="handleCustomFilters"
                />
                <v-autocomplete
                  return-object
                  dense
                  clearable
                  multiple
                  data-test="selectPipelineFilterCompanySize"
                  class="pt-0"
                  label="Porte da Empresa"
                  item-text="name"
                  item-value="value"
                  v-model="customFilters['companySize'].value"
                  :items="meta.companySize"
                  :menu-props="{ offsetY: false }"
                  @change="handleCustomFilters"
                >
                  <template v-slot:selection="{ item, parent, index }">
                    <AutocompleteSelectionSlot
                      :maxLength="48"
                      :parent="parent"
                      :item="item"
                      :counter="customFilters['companySize'].value ? customFilters['companySize'].value.length : 0"
                      :index="index"
                    />
                  </template>
                </v-autocomplete>
              </v-col>
              <v-col cols="4" class="pt-1">
                <v-text-field
                  dense
                  clearable
                  data-test="selectPipelineFilterPartner"
                  append-icon="mdi-magnify"
                  placeholder="Parceiro da Oportunidade"
                  v-model="customFilters['partner'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
                <v-text-field
                  dense
                  clearable
                  data-test="inputPipelineFilterContact"
                  append-icon="mdi-magnify"
                  placeholder="Nome do contato"
                  v-model="customFilters['contact'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
                <v-text-field
                  dense
                  clearable
                  data-test="inputPipelineFilterOpportunityId"
                  append-icon="mdi-magnify"
                  placeholder="ID da Oportunidade"
                  v-model="customFilters['opportunityId'].value"
                  @change="handleCustomFilters"
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="6">
                <div>
                  <div class="d-flex justify-space-between">
                    <div class="d-flex flex-column mb-4">
                      <span>Valor da oportunidade</span>
                      <span class="body-3">Refere-se a soma dos valores dos produtos da oportunidade</span>
                    </div>
                    <v-btn
                      text 
                      small
                      data-test="btnPipelineFilterClearValue"
                      class="primary--text"
                      :disabled="customFilters['value'].value[0] === 0 && customFilters['value'].value[1] === 0"
                      @click="() => {
                        customFilters['value'].value = [0,0]
                        handleCustomFilters()
                      }"
                    >
                      limpar
                    </v-btn>
                  </div>
                  <v-range-slider
                    dense
                    hide-details
                    persistent-hint
                    thumb-label
                    data-test="sliderPipelineFilterValue"
                    thumb-size="0"
                    hint="Im a hint"
                    class="value-range-slider"
                    color="primary"
                    track-color="stroke"
                    v-model="customFilters['value'].value"
                    :max="maxValue"
                    :min="minValue"
                    @change="handleCustomFilters"
                  >
                  <template v-slot:thumb-label="{ value }">
                    <div class='v-btn-tooltip mb-10'>
                      <span class="body-3">R${{maskMoney('pt-br', value)}}</span>
                    </div>
                  </template>
                  <template v-slot:prepend>
                    <span class="font-weight-bold body-1">
                      {{`R$ ${maskMoney('pt-br', customFilters['value'].value[0])} - R$ ${maskMoney('pt-br', customFilters['value'].value[1])}`}}
                    </span>
                  </template>
                  <template v-slot:append>
                    <div style="margin-top: -15px;" class="d-flex justify-space-between mb-2 mx-2 body-1 grey--text text--lighten-3">
                      <span>{{maskMoney('pt-br', minValue)}}</span>
                      <span>{{maskMoney('pt-br', maxValue)}}</span>
                    </div>
                    <div class="d-flex justify-space-between align-center">

                      <v-text-field
                        hide-details
                        outlined
                        dense
                        data-test="inputPipelineFilterMinValue"
                        prefix="R$"
                        type="number"
                        class="w-75 mx-2"
                        label="Valor mínimo"
                        :value="customFilters['value'].value[0]"
                        :max="maxValue"
                        :min="minValue"
                        :rules="numberRule"
                        @change="handleValueChange($event, 'min')"
                      ></v-text-field>
                      <span class="mx-2 align-self-center"> - </span>
                      <v-text-field
                        hide-details
                        outlined
                        dense
                        data-test="inputPipelineFilterMaxValue"
                        prefix="R$"
                        type="number"
                        class="w-75 mx-2"
                        label="Valor máximo"
                        :value="customFilters['value'].value[1]"
                        :max="maxValue"
                        :min="minValue"
                        :rules="numberRule"
                        @change="handleValueChange($event, 'max')"
                      ></v-text-field>
                    </div>
                  </template>
                  </v-range-slider>
                </div>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col cols="6">
                <div class="d-flex flex-column">
                  <span>Oportunidades</span>
                  <v-radio-group
                    row
                    hide-details
                    data-test="radioPipelineFilterHasTasks"
                    class="my-2"
                    v-model="customFilters['hasTasks'].value"
                    @change="handleCustomFilters"
                  >
                    <v-radio
                      data-test="radioPipelineFilterHasTasks0"
                      label="Todas"
                      :value="null"
                    ></v-radio>
                    <v-radio
                      data-test="radioPipelineFilterHasTasks1"
                      value="Com tarefa futura"
                    >
                    <template v-slot:label>
                      <div>
                        <span>Com tarefa futura</span>
                        <v-icon 
                          small
                          class="material-icons-outlined"
                          v-tooltip="{
                            content: `<div class='v-btn-tooltip'>Oportunidades com tarefas ‘Não iniciadas’, com agendamento futuro</div>`,
                            placement: 'bottom-center'
                          }"
                        >
                          info
                        </v-icon>
                      </div>
                    </template>
                    </v-radio>
                    <v-radio
                      data-test="radioPipelineFilterHasTasks2"
                      value="Sem tarefa futura"
                    >
                      <template v-slot:label>
                        <div>
                          <span>Sem tarefa futura</span>
                          <v-icon 
                            small
                            class="material-icons-outlined"
                            v-tooltip="{
                              content: `<div class='v-btn-tooltip'>Oportunidades sem tarefas ‘Não iniciadas’, com agendamento futuro</div>`,
                              placement: 'bottom-start'
                            }"
                          >
                            info
                          </v-icon>
                        </div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </div>
                <v-divider></v-divider>
                <div class="d-flex flex-column mt-1">
                  <div class="d-flex justify-space-between">
                    <span>Temperatura</span>
                    <v-btn
                      text 
                      small
                      data-test="btnPipelineFilterClearTemperature"
                      class="primary--text"
                      :disabled="customFilters['temperature'].value.length === 0"
                      @click="() => {
                        customFilters['temperature'].value = []
                        handleCustomFilters()
                      }"
                    >
                      limpar
                    </v-btn>
                  </div>
                  <v-chip-group
                    multiple
                    active-class="white--text"
                    v-model="customFilters['temperature'].value"
                    @change="handleCustomFilters"
                  >
                    <v-chip
                      v-for="temp in opportunityTemperature"
                      class="primary primary--text temperature-chip"
                      :data-test="`chipPipelineFilterTemperature${temp}`"
                      :small="$vuetify.breakpoint.name !== 'xl'"
                      :outlined="!customFilters['temperature'].value.some(t => t === temp)"
                      :key="temp"
                      :value="temp"
                    >
                      {{ temp }}°
                    </v-chip>
                  </v-chip-group>
                </div>
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
    numberRule: [v => (!isNaN(parseFloat(v)) && v >= 0) || 'O valor tem que ser superior ou igual a 0'],
    queryFilters: [],
    filters: {},
    customFilters: {
      'identifier': {
        name: 'CNPJ ou Razão Social',
        value: null,
        field: 'company.identifier',
        alternativeField: 'company.name',
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
      'status': {
        name: 'Status',
        value: [],
        field: 'status',
        alternativeField: null,
        type: 'multiple',
        key: 'value',
        showChip: false,
      },
      'teams': {
        name: 'Time',
        value: [],
        field: 'team_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: false,
      },
      'origin': {
        name: 'Origem',
        value: [],
        field: 'origin_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: true,
      },
      'products': {
        name: 'Produtos',
        value: [],
        field: 'stats.last_invoice_move.products.product_id',
        alternativeField: null,
        type: 'multiple',
        key: 'id',
        showChip: true,
      },
      'companySize': {
        name: 'Porte da Empresa',
        value: [],
        field: 'company.size',
        alternativeField: null,
        type: 'multiple',
        key: 'value',
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
      'prevision': {
        name: 'Previsão de fechamento',
        value: null,
        customValue: 0,
        customValueItem: null,
        field: 'prevision',
        alternativeField: null,
        type: 'date',
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
      'partner': {
        name: 'Parceiro da Oportunidade',
        value: null,
        field: 'partner.identifier',
        alternativeField: 'partner.name',
        type: 'like',
        showChip: true,
    
      },
      'opportunityId': {
        name: 'ID da Oportunidade',
        value: null,
        field: 'id',
        alternativeField: null,
        type: 'exact',
        showChip: true,
      },
      'temperature': {
        name: 'Temperatura',
        value: [],
        field: 'temperature',
        alternativeField: null,
        type: 'multiple',
        key: 'value',
        showChip: true,
      },
      'hasTasks': {
        name: 'Oportunidades',
        value: null,
        field: null,
        alternativeField: null,
        type: 'custom',
        key: 'value',
        showChip: true,
      },
      'value': {
        name: 'Valor da Oportunidade',
        value: [0, 0],
        field: 'value',
        alternativeField: null,
        type: 'range',
        showChip: true,
      },
    },
    opportunityTemperature: [ 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100 ],
    teams: [],
    users: [],
    mediaTypeList: [],
    typeList: [],
    showFilters: false,
    initialDate: null,
    finalDate: null,
    customDate: null,
    maxValue: 0,
    minValue: 0,
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
        if (this.checkFilterValue(filter)) {
          return true
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
    this.getMaxValue()
    this.setDefaultUser()
    this.handleCustomFilters()
  },
  methods: {
    resetFilters() {
      for (let filterKey in this.customFilters) {
        this.handleFilterValueReset(filterKey)
      }
      this.handleCustomFilters()
    },
    async getTeams() {
      const { data } = await this.getList(
        '/ecosystem/any-team',
        'order=level,id&includes=parent.parent&load_only=name,parent.name,parent.parent.name&strict=true&limit=1000'
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
      const taskPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
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
          if (filterKey === 'identifier' || filterKey === 'partner') {
            if (!this.StringIsJustNumbers(value)) {
              value = this.onlyNumbers(value)
            } else {
              field = filter.alternativeField
            }
          }
          switch (filter.type) {
          case 'multiple': {
            if (value?.length > 0) {
              if (filterKey === 'temperature') {
                const valuesKey = value
                if (valuesKey.some(value => value === 0)) {
                  filterArray.push(`or=(${field}=null,${field}=in(${valuesKey.join(',')}))`)
                } else {
                  const filterString = `${field}=in(${valuesKey.join(',')})`
                  filterArray.push(filterString)
                }
              } else {
                const valuesKey = value.map((value) => value[filter.key])
                const filterString = `${field}=in(${valuesKey.join(',')})`
                filterArray.push(filterString)
              }
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
          case 'custom': {
            const now = this.$moment.utc(new Date()).format('YYYY-MM-DDTHH:mm:ss')
            if (value === 'Com tarefa futura') {
              const filterString = `stats.last_scheduled_task_at=gt(${now})`
              filterArray.push(filterString)
            } else if (value === 'Sem tarefa futura') {
              const filterString = `or=(stats.last_scheduled_task_at=lt(${now}),stats.last_scheduled_task_at=null)`
              filterArray.push(filterString)
            }
            break
          }
          case 'range': {
            if (value?.length > 0) {
              const minValue = value[0]
              const maxValue = value[1]
              if (!minValue && maxValue) {
                const filterString = `or=(${field}=null,${field}=le(${maxValue}))`
                filterArray.push(filterString)
              } else if (minValue && maxValue) {
                const filterString = `${field}=between(${value.join(',')})`
                filterArray.push(filterString)
              }
            }
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
      const opportunityPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
      if (opportunityPipeline?.filters) {
        const { filters } = opportunityPipeline
        for (const [filter, filterData] of Object.entries(filters)) {
          if (filterData.value) {
            this.customFilters[filter].value = filterData.value
            filterData.customValue && (this.customFilters[filter].customValue = filterData.customValue)
            filterData.customValueItem && (this.customFilters[filter].customValueItem = filterData.customValueItem)
          }
        }
      }
    },
    async setFilterPreference(customFilters) {
      const filters = {}
      for (const [filter, filterData] of Object.entries(customFilters)) {
        filters[filter] = { value: filterData.value }
        filterData.customValue && (filters[filter].customValue = filterData.customValue)
        filterData.customValueItem && (filters[filter].customValueItem = filterData.customValueItem)
      }
      const opportunityPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          [`opportunity_pipeline_${this.pipelineId}`]: {
            ...opportunityPipeline,
            filters,
          }
        }
      }
      await this.updateData('/ecosystem/set-user-profile-preferences', payload, { fireSuccessAlert: false })
      await this.$getMyProfile()
    },
    handleRemoveFilter(filterKey){
      this.handleFilterValueReset(filterKey)
      if (filterKey === 'teams') {
        this.handleTeamChange(this.customFilters[filterKey].value)
      } else {
        this.handleCustomFilters()
      }
    },
    generateFilterChip(filterKey){
      const filter = this.customFilters[filterKey]
      const values = []
      switch (filter.type) {
      case 'multiple':
        filter.value.forEach((value, index) => {
          if (index === 0 || index === 1) {
            if (filterKey === 'temperature') {
              values.push(`${value}°`)
            } else {
              values.push(value.name)
            }
          }
          if (index === 2) {
            values.push(`(+${filter.value.length - 2})`)
          }
        })
        return values.join(', ')
      case 'date':
        return filter.value.name
      case 'boolean':
        return filter.value ? 'Sim' : 'Não'
      case 'range':
        return `R$ ${this.maskMoney('pt-br', filter.value[0])} - R$ ${this.maskMoney('pt-br', filter.value[1])}`
      default:
        return filter.value
      }
    },
    checkFilterChip(filter) {
      if (filter.showChip) {
        return this.checkFilterValue(filter)
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
    handleFilterValueReset(filterKey) {
      const filter = this.customFilters[filterKey]
      if (filter.type === 'multiple') {
        this.customFilters[filterKey].value = []
      } else if (filter.type === 'range') {
        this.customFilters[filterKey].value = [0, 0]
      } else {
        this.customFilters[filterKey].value = null
      }
    },
    async getMaxValue() {
      const opportunity = await this.getItem('/cash/opportunity', 'load_only=value&order=value_desc&limit=1')
      if (opportunity?.value) {
        this.maxValue = opportunity.value
      }
    },
    checkFilterValue(filter) {
      if (filter.type === 'multiple') {
        return filter.value.length > 0
      } else if (filter.type === 'range') {
        return filter.value[0] || filter.value[1]
      } else {
        return !!filter.value
      }
    },
    generateFilterTooltip(filterKey){
      const filter = this.customFilters[filterKey]
      switch (filter.type) {
      case 'multiple':
        if (filter.value.length > 2) {
          const valueNames = filter.value.map(value => value.name)
          return valueNames.join(', ')
        }
        return null
      default:
        return null
      }
    },
    handleValueChange(event, type) {
      if (type === 'max') {
        if (this.customFilters['value'].value[0] > event) {
          this.$set(this.customFilters['value'].value, 0, event)
        }
        this.$set(this.customFilters['value'].value, 1, event)
      } else {
        if (this.customFilters['value'].value[1] < event) {
          this.$set(this.customFilters['value'].value, 1, event)
        }
        this.$set(this.customFilters['value'].value, 0, event)
      }
      this.handleCustomFilters()
    },
  }
}
</script>

<style lang="scss">
.autocomplete-filter {
  width: 20%;
}
.value-range-slider {
  flex-direction: column;
}
.value-range-slider .v-input__append-outer {
  flex-direction: column;
  width: -webkit-fill-available;
  margin-left: 0px;
}
.temperature-chip:focus::before, .temperature-chip:hover::before, .temperature-chip::before {
  opacity: 0 !important;
}
</style>
