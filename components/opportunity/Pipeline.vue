<template>
  <div>
    <OpportunityCustomFilters
      class="mx-4"
      pipeline-type="opportunity"
      :pipeline-id="pipelineId"
      @onFilterChange="applyFilter"
      @onFilterOpen="(value) => { filterOpen = value }"
    />
    <v-row v-if="noOpportunitiesAlert && !filterOpen && hasFilterApplied">
      <v-col class="mx-4 px-1">
        <v-card>
          <v-card-text>
            <v-row>
              <v-col class="py-0" cols="1">
              </v-col>
              <v-col class="py-0 d-flex justify-center" cols="10">
                <img class="mx-auto mb-2" src="~/static/task-pipeline-empty.png" alt="">
              </v-col>
              <v-col class="py-0 d-flex justify-end pr-0" cols="1">
                <v-btn
                  fab
                  text
                  x-small
                  class="ml-auto flex-grow-0 flex-shrink-1"
                  @click="noOpportunitiesAlert = false"
                >
                  <v-icon small>
                    close
                  </v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="ma-0 pa-0">
      <v-progress-linear
        v-if="dataLoading"
        indeterminate
        color="primary"
        class="ma-0 pa-0"
      ></v-progress-linear>
      </v-col>
    </v-row>
    <v-row
      v-if="stagesList.length > 0"
      class="flex-nowrap dragscroll-config"
      v-dragscroll:nochilddrag
    >
      <v-col
        v-for="stage, index in stagesList"
        :key="stage.id"
        :cols="mq_column"
        data-dragscroll
        class="pipeline-column"
      >
        <v-sheet class="pt-1 pipeline-header-border">
          <v-divider class="pb-1 mx-2 pipeline-header-divider primary"></v-divider>
          <v-row class="pb-2 px-2">
            <v-col xl="11" lg="10" class="pr-0">
              <div class="d-flex flex-column flex-grow-1">
                <v-clamp autoresize class="font-body-medium font-weight-bold" :max-lines="1">{{stage.name}}</v-clamp>
                <span v-if="stage.total === 0" class="body-3 sub-text--text">{{'Sem oportunidade' | truncate(18)}}</span>
                <span v-else-if="stage.total === 1" class="body-3 sub-text--text">{{`${stage.total} oportunidade` | truncate(18)}}</span>
                <span v-else class="body-3 sub-text--text">{{`${stage.total} oportunidades` | truncate(18)}}</span>
              </div>
            </v-col>
            <v-col xl="1" lg="2" class="pl-0 pr-2 d-flex justify-end">
              <PipelineSorter
                :initial-value="stage.sort"
                :sorter="sorter"
                @onSort="(sorter) => { handleSort(sorter, stage, index) }"
              />
            </v-col>
          </v-row>
        </v-sheet>
        <v-card
          v-if="stage.opportunities"
          @scroll="handleScroll($event, index, stage.id)"
          elevation="0"
          class="pipeline-card-control pt-1 pipeline-border"
        >
          <OpportunityItemPipeline
            :opportunity-list="stage.opportunities"
            :stage-id="stage.id"
            :stage-index="index"
            :dragging-index="draggingIndex"
            :pipeline-id="pipelineId"
            :total="stage.total"
            @click="handleClick()"
            @onDraggingItem="(index) => {draggingIndex = index}"
            @onDraggingEnd="getOpportunities(stages)"
          />
        </v-card>
        <v-card v-if="pipelineFooterSummary" class="pipeline-footer-border">
          <v-progress-linear
            :indeterminate="isUpdatingPage  && isUpdatingStage == stage.id ? true : false"
            :color="isUpdatingPage  && isUpdatingStage == stage.id ? 'primary' : 'transparent'"
          ></v-progress-linear>
          <div class="d-flex pt-3 pb-4 justify-center align-center body-3">
            <span class="mr-1 sub-text--text">Valor total:</span>
            <span class="font-weight-medium sub-text--text">
              R$ {{stage.summary.sum_value ? maskMoney('pt-br', stage.summary.sum_value) : '0,00'}}
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="hasNoStage">
      <v-col class="d-flex justify-center">
      <h6>Pipeline sem estágios definidos.</h6>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { dragscroll } from 'vue-dragscroll'
import { mapGetters, mapActions } from 'vuex'

const defaultCardOptions = [
  'createdAt',
  'prevision',
  'nextTask',
  'assignedTo',
  'status',
  'temp',
  'timeInStage',
  'lastTask',
  'value',
]

export default {
  props: ['pipelineId'],
  directives: {
    dragscroll
  },
  data: () => ({
    endpoint: '/cash/opportunity',
    stages: [],
    stagesList: [],
    pipelines: [],
    selectedPipeline: null,
    opportunityLists: {},
    queryFilters: [],
    dataLoading: false,
    hasNoStage: false,
    sorter: [
      { label: 'Empresa (A-Z)', value: 'company.name', type: 'asc', icon: 'sort_by_alpha' },
      { label: 'Empresa (Z-A)', value: 'company.name_desc', type: 'desc', icon: 'sort_by_alpha' },
      { label: 'Última tarefa', value: 'stats.last_task_done_at', type: 'asc', icon: 'update' },
      { label: 'Última tarefa', value: 'stats.last_task_done_at_desc', type: 'desc', icon: 'update' },
      { label: 'Tempo na etapa', value: 'stats.last_stage_updated_at_desc', type: 'asc', icon: 'hourglass_empty' },
      { label: 'Tempo na etapa', value: 'stats.last_stage_updated_at', type: 'desc', icon: 'hourglass_empty' },
      { label: 'Criação do lead', value: 'created_at', type: 'asc', icon: 'calendar_month' },
      { label: 'Criação do lead', value: 'created_at_desc', type: 'desc', icon: 'calendar_month' },
      { label: 'Previsão do lead', value: 'prevision', type: 'asc', icon: 'timer' },
      { label: 'Previsão do lead', value: 'prevision_desc', type: 'desc', icon: 'timer' },
      { label: 'Valor da oportunidade', value: 'value', type: 'asc', icon: 'monetization_on' },
      { label: 'Valor da oportunidade', value: 'value_desc', type: 'desc', icon: 'monetization_on' },
    ],
    isUpdatingStage: null,
    isUpdatingPage: false,
    draggingIndex: null,
    filterOpen: false,
    noOpportunitiesAlert: false,
  }),
  computed: {
    ...mapGetters({
      refreshData: 'Opportunity/refreshData',
      opportunitys: 'Opportunity/opportunitys',
      opportunities_api: 'Opportunity/opportunities_api',
      userInfo: 'userInfo',
      preferences: 'Profile/preferences',
      preference: 'Profile/preference',
      meta: 'meta',
      pipelineFooterSummary: 'Opportunity/pipelineFooterSummary',
    }),
    // eslint-disable-next-line vue/return-in-computed-property
    mq_truncate() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 10
      case 'sm':
        return 10
      case 'md':
        return 10
      case 'lg':
        return 18
      case 'xl':
        return 25
      }
    },
    // eslint-disable-next-line vue/return-in-computed-property
    mq_column() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 12
      case 'sm':
        return 6
      case 'md':
        return ''
      case 'lg':
        return ''
      case 'xl':
        return ''
      }
    },
    queryParams: function() {
      const params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includesInactive', 'true')
      params.append('includes', 'company.memberships,assigned_to,team,contact,partner,origin,stats.last_invoice_move.products.product,tasks.type,tasks.assigned_to')
      params.append('also', 'aggregates.company')
      params.append(
        'load_only',
        'created_at,prevision,temperature,status,value,stage_id,team_id,' +
        'assigned_to.name,' +
        'team.name,' +
        'partner.name,' +
        'origin.name,' +
        'company.name,company.identifier,company.memberships.team_id,company.memberships.expiration,' +
        'tasks.state,tasks.scheduled_to,tasks.updated_at,tasks.type.name,tasks.assigned_to.name,' +
        'stats.last_invoice_move.products.product_id,' +
        'stats.last_invoice_move.products.value,stats.last_invoice_move.products.amount,stats.last_invoice_move.products.product.type,' +
        'stats.last_stage_updated_at,stats.last_task_done_id,stats.last_task_done_at,stats.last_scheduled_task_at,stats.last_invoice_move_id'
      )
      params.append('limit', '20')
      return params.toString()
    },
    hasFilterApplied() {
      return this.queryFilters.length > 0
    },
  },
  async created() {
    await this.getData()
    if (!this.hasNoStage) {
      await this.getPipelinePreference(this.stages)
    }
  },
  watch: {
    async refreshData(newValue) {
      if (newValue) {
        this.getOpportunities(this.stages)
        this.refreshAction(false)
      }
    },
    queryFilters() {
      this.getOpportunities(this.stages)
    },
    stagesList(newValue) {
      const hasNoOpportunities = newValue.every(stage => stage.opportunities.length === 0)
      if (hasNoOpportunities) {
        this.noOpportunitiesAlert = true
      } else {
        this.noOpportunitiesAlert = false
      }
    },
  },
  methods: {
    ...mapActions({
      refreshAction: 'Opportunity/refresh',
      setPipelineCardOptions:'Opportunity/setPipelineCardOptions',
      setPipelineFooterSummary:'Opportunity/setPipelineFooterSummary',
    }),
    handleClick(id) {
      this.$router.push(`${this.$router.history.current.fullPath}/${id}`)
    },
    totalOpportunities(opportunities) {
      let sum = 0
      const sumReducer = (acc, currentValue) => acc + currentValue.value
      const list = opportunities
      list && (sum = list.reduce(sumReducer, 0))
      return this.maskMoney('pt-br', sum)
    },
    async getStages(pipelineId) {
      const { data } = await this.getList('/cash/stage',`order=index&pipeline_id=${pipelineId}`)
      const stages = data.map((stage) => {
        return { ...stage, sort: 'created_at' }
      })
      this.stages = stages
      if(this.stages.length == 0) {
        this.hasNoStage = true
      }
      this.$store.commit('Opportunity/OPPORTUNITIES_API', { dataUpdate: false })
    },
    getOpportunities(stages) {
      this.dataLoading = true
      const filters = this.queryFilters.join('&')
      Promise.all(
        stages.map(async (stage) => {
          const queryString = `${this.queryParams}&stage_id=${stage.id}${filters ? `&${filters}` : ''}&order=${stage.sort}`
          const { data, hasNext, total } = await this.getList(this.endpoint, queryString)
          const summary = await this.getStageTotalValue(queryString)
          const opportunities = this.formatOpportunities(data)
          return { ...stage, opportunities, hasNext, page: 0, total, summary }
        })
      )
        .then((response) => {
          this.stagesList = response
          this.$emit('stagesList', this.stagesList)
          this.dataLoading = false
        })
        .catch((_error) => {
          this.dataLoading = false
        })
    },
    async getData() {
      await this.getStages(this.pipelineId)
    },
    applyFilter(filters) {
      this.queryFilters = filters
    },
    async handleScroll({ target: { scrollTop, clientHeight, scrollHeight }}, pos, stageId) {
      var roundScrollTop = Math.ceil(scrollTop)
      if ((roundScrollTop + clientHeight + 10) >= scrollHeight) {
        if (this.stagesList[pos].hasNext && !this.isUpdatingPage) {
          this.isUpdatingStage = stageId
          this.isUpdatingPage = true
          this.stagesList[pos].page += 1
          const { opportunities, hasNext } = await this.getNextOpportunities(this.stagesList[pos])
          this.stagesList[pos].opportunities = opportunities
          this.stagesList[pos].hasNext = hasNext
          this.isUpdatingStage = null
          this.isUpdatingPage = false
        }
      }
    },
    async getNextOpportunities(stage) {
      const filters = this.queryFilters.join('&')
      const { data, hasNext } = await this.getList(this.endpoint, `${this.queryParams}&limit=20&stage_id=${stage.id}${filters ? `&${filters}` : ''}&order=${stage.sort}&page=${stage.page}`)
      const opportunities = this.formatOpportunities(data)
      return {
        opportunities: [...stage.opportunities, ...opportunities],
        hasNext
      }
    },
    async getOpportunitiesByStage(stage) {
      const filters = this.queryFilters.join('&')
      const { data, hasNext } = await this.getList(this.endpoint, `${this.queryParams}&limit=20&stage_id=${stage.id}${filters ? `&${filters}` : ''}&order=${stage.sort}`)
      const opportunities = this.formatOpportunities(data)
      return { opportunities, hasNext }
    },
    formatOpportunities(opportunities) {
      return opportunities.map((opportunity) => {
        const { tasks } = opportunity
        const futureTasks = tasks.filter((task) => {
          return task.state === 'Não iniciada' && this.$moment(`${task.scheduled_to}Z`).isAfter(this.$moment(new Date()))
        })
        const nearestFutureTask = futureTasks.reduce((acc, current) => {
          return this.$moment(`${acc.scheduled_to}Z`).isAfter(this.$moment(`${current.scheduled_to}Z`)) ? current : acc
        }, futureTasks[0])
        const nextTask = nearestFutureTask ? {
          id: nearestFutureTask.id,
          scheduled_to: this.$moment(`${nearestFutureTask.scheduled_to}Z`).format('DD/MM'),
          type: nearestFutureTask.type ? nearestFutureTask.type.name : null,
          assigned_to: nearestFutureTask.assigned_to ? nearestFutureTask.assigned_to.name : null,
        } : null
        return {
          ...opportunity,
          nextTask,
          lastTask: this.getLastTaskDone(opportunity),
          isActive: this.checkActive(opportunity.status),
          groupedProducts: this.groupOpportunityProducts(opportunity),
          expiration: this.getExpirationDate(opportunity),
        }
      })
    },
    checkActive(status) {
      if (status === 'Perdida' || status === 'Cancelada') {
        return false
      } else {
        return true
      }
    },
    groupOpportunityProducts(opportunity) {
      if (opportunity.stats?.last_invoice_move_id) {
        const { last_invoice_move } = opportunity.stats
        const groupedProducts = last_invoice_move.products.reduce((acc, current) => {
          const { product: { type }, value, amount } = current
          if (acc[type]) {
            acc[type] += value * amount
          } else {
            acc[type] = value * amount
          }
          return acc
        }, {})
        return groupedProducts
      }
      return {}
    },
    async handleSort(sorter, stage, stageIndex) {      
      this.stagesList[stageIndex].page = 0
      this.stagesList[stageIndex].sort = sorter.value
      this.stages[stageIndex].sort = sorter.value
      this.setPipelinePreference(sorter, stage)
      const { opportunities, hasNext } = await this.getOpportunitiesByStage(this.stagesList[stageIndex])
      this.stagesList[stageIndex].opportunities = opportunities
      this.stagesList[stageIndex].hasNext = hasNext
    },
    getPipelinePreference(stages) {
      const oppPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
      if (oppPipeline) {
        if (oppPipeline['cardOptions']) {
          this.setPipelineCardOptions(oppPipeline['cardOptions'])
        } else {
          this.setPipelineCardOptions(defaultCardOptions)
        }
        if ('footerSummary' in oppPipeline) {
          this.setPipelineFooterSummary(oppPipeline['footerSummary'])
        } else {
          this.setPipelineFooterSummary(true)
        }
        this.stages = stages.map((stage) => {
          const stageSort = oppPipeline[stage.id]?.sort
          if (stageSort) {
            stage.sort = stageSort
          }
          return stage
        })
      } else {
        this.setPipelineCardOptions(defaultCardOptions)
        this.setPipelineFooterSummary(true)
      }
    },
    async setPipelinePreference(sorter, stage) {
      const oppPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
      if (oppPipeline) {
        if (oppPipeline[stage.id]) {
          oppPipeline[stage.id].sort = sorter.value
        }
      }
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          [`opportunity_pipeline_${this.pipelineId}`]: {
            [stage.id]: {
              sort: sorter.value
            },
            ...oppPipeline,
          }
        }
      }
      await this.updateData('/ecosystem/set-user-profile-preferences', payload, { fireSuccessAlert: false })
      await this.$getMyProfile()
    },
    getLastTaskDone(opportunity) {
      if (opportunity.stats) {
        const { tasks } = opportunity
        const lastTask = tasks.find((task) => {
          return task.id === opportunity.stats.last_task_done_id
        })
        return lastTask ? {
          id: lastTask.id,
          scheduled_to: this.$moment(`${lastTask.updated_at}Z`).format('DD/MM'),
          type: lastTask.type ? lastTask.type.name : null,
          assigned_to: lastTask.assigned_to ? lastTask.assigned_to.name : null,
        } : null
      } else {
        return null
      }
    },
    getExpirationDate(opportunity) {
      if (opportunity.company?.memberships) {
        const { memberships } = opportunity.company
        const membership = memberships.find((membership) => {
          return membership.team_id === opportunity.team_id
        })
        return membership ? membership.expiration : null
      } else {
        return null
      }
    },
    async getStageTotalValue(queryString) {
      const stageSumEndpoint = '/cash/opportunity/aggregate-value'
      const totalValue = await this.getList(stageSumEndpoint, queryString)
      return totalValue
    }
  }
}
</script>

<style scoped lang="scss">
.pipeline-card-control {
  @include thin-scrollbar;
  height: 63vh;
  overflow: auto;
}
.dragscroll-config {
  overflow: hidden;
  cursor: grab;
  min-height: 455px;
  margin-left: 2px;
  margin-right: 2px;
}
.subtitle-2 {
  font-size: 13px !important;
}
.step-pipeline {
  height: 3px;
  position: relative;
  &:before {
    content: "";
    position: absolute;
    left: 6px;
    top: 0;
    height: 1px;
    width: 30%;
    border-top: 3px solid #5e16ff;
    border-top-left-radius: 3px;
  }
}
.pipeline-header-border {
	border-radius: 4px 4px 0px 0px;
  border-bottom: 1px solid var(--v-stroke-base);
}
.pipeline-border {
	border-radius: 0px 0px 4px 4px;
}
.pipeline-header-divider {
  border-radius: 4px;
}
.pipeline-column {
  padding-left: 2px;
  padding-right: 2px;
}
.pipeline-footer-border {
	border-radius: 0px 0px 4px 4px;
  border-top: 1px solid var(--v-stroke-base);
}
</style>
