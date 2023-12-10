<template>
  <div>
    <v-tabs
      icons-and-text
      hide-slider
      height="36"
      active-class="v-tab-secondary-active"
      class="mb-2 text-capitalize"
      v-model="tab"
    >
      <v-tab
        v-for="view in opportunityViews"
        active-class="v-tab-secondary-active"
        class="d-flex flex-row v-tab-secondary mx-1 text-none"
        :data-test="`tab${view.value}`"
        :key="view.value"
      >
        <template v-slot:default>
          <v-icon class="material-icons-outlined my-0 mr-2">
            {{ view.icon }}
          </v-icon>
          {{ view.title }}
        </template>
      </v-tab>
    </v-tabs>
    <v-tabs-items v-model="tab">
      <div class="pa-1">
        <div class="d-flex justify-space-between mb-2">
          <div class="d-flex flex-column">
            <span v-if="tab" class="font-weight-bold body-1">
              {{
                `A empresa possui ${
                  totalOpportunities < 10 ? `0${totalOpportunities ? totalOpportunities : ''}` : totalOpportunities
                } oportunidades com status “Ganha”`
              }}
              <i
                class="material-symbols-rounded v-icon grey--text text--lighten-3"
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                      Apenas oportunidades com produtos ativados para a empresa
                    </div>
                    `,
                  placement: 'auto'
                }"
              >
              info
              </i>
            </span>
            <span v-else class="font-weight-bold body-1">
              {{
                `A empresa possui ${
                  activeOpportunities < 10 ? `0${activeOpportunities ? activeOpportunities : ''}` : activeOpportunities
                } oportunidade(s) com status “Ativa”`
              }}
            </span>
            <span>Utilize as ordenações para personalizar os modos de exibição.</span>
          </div>
          <div>
            <OpportunityModal v-if="hasCompanyId" modal-btn-color="secondary" :company="company"/>
          </div>
        </div>
        <div>
          <v-data-table
            hide-default-header
            locale="pt"
            data-test="TableOpportunity"
            :items-per-page="5"
            :loading="isLoadingData"
            :headers="tableHeaders"
            :items="opportunities"
            :item-class="() => 'opportunity-data-table-row pointer-click'"
            :sort-by.sync="sortBy"
            :sort-desc.sync="sortDesc"
            @click:row="redirectPage"
            @pagination="handlePagination"
          >
          <template v-slot:header="{ props: { headers } }">
            <thead>
              <tr>
                <th 
                  v-for="item in headers" 
                  :key="item.value"
                  class="column"
                >
                  <div class="d-flex align-center">
                    <span>{{ item.text }}</span>
                    <v-btn
                      v-if="item.sortable"
                      text
                      fab
                      x-small
                      v-tooltip="{
                        content: `
                          <div class='v-btn-tooltip'>
                            Ordenar
                          </div>
                          `,
                        placement: 'top'
                      }"
                      @click="customSort(item.value)"
                    >
                      <SortArrows
                        :asc-color="(item.value === sortBy && !sortDesc) ? 'primary' : 'sub-text'"
                        :desc-color="(item.value === sortBy && sortDesc) ? 'primary' : 'sub-text'"
                        :size="14"
                      />
                    </v-btn>
                  </div>
                </th>
              </tr>  
            </thead>
          </template>
            <template v-slot:[`header.total`]="{}">
              <span>
                  Total
                  <i
                    class="material-symbols-rounded v-icon"
                    v-tooltip="{
                      content: `
                        <div class='v-btn-tooltip'>
                          Valores incluem descontos
                        </div>
                        `,
                      placement: 'right'
                    }"
                    style="font-size: 14px;"
                  >
                  info
                  </i>
                </span>
            </template>
            <template v-slot:[`item.status`]="{ item }">
              <v-chip
                small
                class="white--text"
                :color="statusColor[item.status] ? statusColor[item.status] : 'primary'"
              >
                {{ item.status ? item.status.slice(0, 9) : 'não informado' }}
              </v-chip>
            </template>
            <template v-slot:[`item.stageName`]="{ item }">
              <div class="d-flex flex-row">
                <div v-for="step, index in item.pipelineSteps" :key="index" :class="step"></div>
              </div>
              <span>{{ item.stageName }}</span>
            </template>
            <template v-slot:[`item.prevision`]="{ item }">
              <span v-if="item.prevision">
                {{ item.prevision }}
              </span>
              <span v-else class="grey--text text--lighten-4">Não informada</span>
            </template>
            <template v-slot:[`item.lastTask`]="{ item }">
              <span v-if="item.lastTask">
                <span class="primary--text pointer-click" @click.stop="openTask(item.lastTask)">{{ item.lastTask.type }}</span>
                {{ `em ${item.lastTask.scheduled_to}` }}
              </span>
              <span v-else class="grey--text text--lighten-4">Não há tarefa</span>
            </template>
            <template v-slot:[`item.nextTask`]="{ item }">
              <span v-if="item.nextTask">
                <span class="primary--text pointer-click" @click.stop="openTask(item.nextTask)">{{ item.nextTask.type }}</span>
                {{ `em ${item.nextTask.scheduled_to}` }}
              </span>
              <span v-else class="grey--text text--lighten-4">Não há tarefa</span>
            </template>
            <template v-slot:[`item.products`]="{ item }">
              <ul class="pl-0" style="list-style: none;">
                <li v-for="product, index in item.products" :key="index">
                  <span>{{ product }}</span>
                </li>
              </ul>
            </template>
            <template v-slot:[`item.amount`]="{ item }">
              <ul class="pl-0" style="list-style: none;">
                <li v-for="amount, index in item.amount" :key="index">
                  <span>{{ `${amount < 10 ? `0${amount}` : amount}` }}</span>
                </li>
              </ul>
            </template>
            <template v-slot:[`item.discount`]="{ item }">
              <ul class="pl-0" style="list-style: none;">
                <li v-for="discount, index in item.discount" :key="index">
                  <span>{{ discount ? `${discount}%` : 'N/A' }}</span>
                </li>
              </ul>
            </template>
            <template v-slot:[`item.total`]="{ item }">
              <ul class="pl-0" style="list-style: none;">
                <li v-for="total, index in item.total" :key="index">
                  <span>{{ `R$ ${maskMoney('pt-br', total)}` }}</span>
                </li>
              </ul>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                fab
                x-small
                text
                data-test="btnOpportunityTabItemSideView"
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                    Visualização rápida
                    </div>
                    `,
                  placement: 'left'
                }"
                icon
                @click.stop="openOpportunitySideView(item.id)"
              >
                <PreviewIcon class="self-align-end" :width="20" :height="20" />
              </v-btn>
            </template>
            <template v-slot:[`footer.page-text`]="props">
              {{ totalOpportunities > 0 ? `${props.pageStart}-${props.pageStop} de ${totalOpportunities}` : '' }}
            </template>
            <template #no-data>
              <div v-if="tab" class="text-center py-10">
                <i class="v-icon material-symbols-rounded blue--text text--lighten-5" style="font-size: 62px;">
                  inventory_2
                </i>
                <p class="font-weight-bold mb-0">Sem produtos ativados</p>
                <p>Não foram encontrados produtos ativados para a empresa</p>
              </div>
              <div v-else class="text-center py-10">
                <i class="v-icon material-symbols-rounded blue--text text--lighten-5" style="font-size: 62px;">
                  business_center
                </i>
                <p class="font-weight-bold mb-0">Sem oportunidades</p>
                <p>Não foram encontradas oportunidades para a empresa</p>
              </div>
            </template>
          </v-data-table>
        </div>
      </div>
    </v-tabs-items>
    <TaskModal
      :item-id='selectedTaskId'
      :open-dialog="taskDialog"
      @closeDialog="() => { taskDialog = false }"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    company: {
      type: Object
    },
    hasCompanyId: {
      type: Boolean
    },
  },
  data: () => ({
    tab: 0,
    opportunityViews: [
      { title: 'Oportunidades', icon: 'business_center', value: 'opportunity'},
      { title: 'Produtos', icon: 'inventory_2', value: 'product'},
    ],
    opportunityStatusHeaders: [
      { text: 'ID', value: 'id', class: 'px-2', sortable: true },
      { text: 'Negócio', value: 'business', class: 'px-2', sortable: false },
      { text: 'Funil', value: 'pipeline', class: 'px-2', sortable: false },
      { text: 'Status', value: 'status', class: 'px-2', sortable: false },
      { text: 'Time', value: 'team', class: 'px-2', sortable: true },
      { text: 'Responsável', value: 'assignedTo', class: 'px-2', sortable: true },
      { text: 'Fase atual', value: 'stageName', class: 'px-2', sortable: true },
      { text: 'Início', value: 'createdAt', class: 'px-2', sortable: true },
      { text: 'Previsão', value: 'prevision', class: 'px-2', sortable: true },
      { text: 'Última tarefa', value: 'lastTask', class: 'px-2', sortable: false },
      { text: 'Próxima tarefa', value: 'nextTask', class: 'px-2', sortable: false },
      { name: '', value: 'actions', class: 'px-0', sortable: false, width: '1%' },
    ],
    opportunityProductHeaders: [
      { text: 'ID', value: 'id', class: 'px-2', sortable: true },
      { text: 'Negócio', value: 'business', class: 'px-2', sortable: false },
      { text: 'Funil', value: 'pipeline', class: 'px-2', sortable: false },
      { text: 'Time', value: 'team', class: 'px-2', sortable: true },
      { text: 'Múltiplos CNPJs', value: 'hasAggregates', class: 'px-2', sortable: false },
      { text: 'Produtos', value: 'products', class: 'px-2', sortable: false },
      { text: 'Qtd.', value: 'amount', class: 'px-2', sortable: false },
      { text: 'Desc.', value: 'discount', class: 'px-2', sortable: false },
      { text: 'Total', value: 'total', class: 'px-2', sortable: false },
      { text: 'Ativação', value: 'activationDate', class: 'px-2', sortable: true },
      { name: '', value: 'actions', class: 'px-0', sortable: false, width: '1%' },
    ],
    opportunities: [],
    totalOpportunities: 0,
    redirectTo: 'business-opportunity-item-id',
    selectedTaskId: null,
    taskDialog: false,
    selectedOpportunityId: null,
    opportunitySideViewDrawer: false,
    opportunitySideViewItems: [],
    sortBy: 'id',
    sortDesc: false,
    isLoadingData: false,
    statusColor: {
      'Ativa': 'primary',
      'Ganha': 'green darken-2',
      'Perdida': 'red darken-2',
      'Cancelada': 'orange',
      'Aguardando aprovação do contato': 'purple darken-2',
    },
    activeOpportunities: 0,
    page: 0,
    hasNext: false,
  }),
  computed: {
    ...mapGetters({
      opportunityRefresh: 'Opportunity/refreshData',
    }),
    companyId() {
      return this.company?.id
    },
    statusParams: function() {
      const params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includesInactive', 'true')
      params.append(
        'includes',
        'customers,team,assigned_to,stats.last_task_done.type,tasks.type,' +
        'stage.pipeline.business_item.business_category.business,' +
        'stage.pipeline.stages'
      )
      params.append(
        'load_only',
        'created_at,prevision,status,' +
        'assigned_to.name,' +
        'team.name,' +
        'stage.name,' +
        'stage.pipeline.stages.index,' +
        'stage.pipeline.name,' +
        'stage.pipeline.business_item.business_category.business.name,' +
        'tasks.state,tasks.scheduled_to,tasks.updated_at,tasks.type.name,' +
        'stats.last_task_done_id,stats.last_task_done_at,stats.last_scheduled_task_at' +
        'stats.last_task_done.type.name,stats.last_task_done.updated_at,'
      )
      params.append('customers.id', this.companyId)
      params.append('limit', '10')
      return params.toString()
    },
    productParams: function() {
      const params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includesInactive', 'true')
      params.append('includes', 'customers,team,stats.last_invoice_move.products.product,aggregates,subscriptions,stage.pipeline.business_item.business_category.business')
      params.append(
        'load_only',
        'value,' +
        'team.name,' +
        'subscriptions.created_at,' +
        'stage.pipeline.name,' +
        'stage.pipeline.business_item.business_category.business.name,' +
        'stats.last_invoice_move.products.value,stats.last_invoice_move.products.amount,stats.last_invoice_move.products.discount,stats.last_invoice_move.products.customer_id,' +
        'stats.last_invoice_move.products.product.name'
      )
      params.append('status', 'won')
      params.append('stats.last_invoice_move.products.customer_id', this.companyId)
      params.append('customers.id', this.companyId)
      params.append('limit', '20')
      return params.toString()
    },
    querySort: function() {
      if (!this.sortBy) {
        return ''
      }
      const sorterParam = new URLSearchParams()
      const fieldSort = {
        id: 'id',
        business: 'stage.pipeline.business_item.business_category.business.name',
        pipeline: 'stage.pipeline.name',
        status: 'status',
        team: 'team.name',
        assignedTo: 'assigned_to.name',
        stageName: 'stage.name',
        createdAt: 'created_at',
        prevision: 'prevision',
        lastTask: 'stats.last_task_done_at',
        nextTask: 'stats.last_scheduled_task_at',
      }
      const sort = `${fieldSort[this.sortBy]}${this.sortDesc ? '_desc' : ''}`
      sorterParam.append('order', sort)
      return sorterParam.toString()
    },
    pageQuery: function() {
      if (this.page === 0) {
        return ''
      }
      const params = new URLSearchParams()
      params.append('page', this.page)
      return params.toString()
    },
    finalQuery: function() {
      const params = this.tab ? this.productParams : this.statusParams
      const sort = this.querySort
      const page = this.pageQuery
      return `${params}&${sort}&${page}`
    },
    tableHeaders: function() {
      if (this.tab) {
        return this.opportunityProductHeaders
      }
      return this.opportunityStatusHeaders
    },
    opportunitiesIdList: function() {
      return this.opportunities.map((opportunity) => opportunity.id)
    },
  },
  watch: {
    finalQuery(newValue) {
      if (newValue) {
        this.getOpportunities()
      }
    },
    tab() {
      this.page = 0
      this.totalOpportunities = 0
      this.opportunities = []
    },
    sortDesc() {
      this.page = 0
    },
    sortBy() {
      this.page = 0
    },
    opportunityRefresh(newValue) {
      if (newValue) {
        this.page = 0
        this.getOpportunities()
        this.refreshOpportunityData(false)
      }
    },
  },
  methods: {
    ...mapActions({
      refreshOpportunityData: 'Opportunity/refresh',
    }),
    redirectPage(opportunity) {
      const id = opportunity.id
      const pipelineId = opportunity.stage?.pipeline?.id
      const businessItem = opportunity.stage?.pipeline?.business_item?.length > 0 ? opportunity.stage.pipeline.business_item[0] : null
      const businessCategory = businessItem?.business_category.id
      this.$router.push({
        name: this.redirectTo,
        params: { item: businessItem.id, id },
        query: { category: businessCategory, 'pipeline-id': pipelineId }
      })
    },
    async getOpportunities() {
      this.isLoadingData = true
      await this.getActiveOpportunitiesCount()
      const { data, total, hasNext } = await this.getList('/cash/opportunity', this.finalQuery)
      if (this.page > 0) {
        this.opportunities = [...this.opportunities, ...this.formatOpportunities(data)]
      } else {
        this.opportunities = this.formatOpportunities(data)
      }
      this.totalOpportunities = total
      this.hasNext = hasNext
      this.isLoadingData = false
    },
    formatOpportunities(opportunities) {
      return opportunities.map((opportunity) => {
        const companyProducts = opportunity.stats?.last_invoice_move?.products?.filter((product) => product.customer_id === this.companyId)
        const activationDate = opportunity.subscriptions?.length > 0 ? this.$moment(`${opportunity.subscriptions[0].created_at}Z`).format('DD/MM/YYYY') : null
        const prevision = opportunity.prevision ? this.$moment(`${opportunity.prevision}Z`).format('DD/MM/YYYY') : null
        return {
          ...opportunity,
          prevision,
          activationDate,
          team: opportunity.team ? opportunity.team.name : null,
          assignedTo: opportunity.assigned_to ? opportunity.assigned_to.name : null,
          createdAt: this.$moment(`${opportunity.created_at}Z`).format('DD/MM/YYYY'),
          stageName: opportunity.stage ? opportunity.stage.name : null,
          pipeline: opportunity.stage?.pipeline ? opportunity.stage.pipeline.name : null,
          hasAggregates: opportunity.aggregates?.length > 0 ? 'Sim' : 'Não',
          products: companyProducts ? companyProducts.map((product) => product.product.name) : [],
          amount: companyProducts ? companyProducts.map((product) => product.amount) : [],
          discount: companyProducts ? companyProducts.map((product) => product.discount) : [],
          total: companyProducts ? companyProducts.map((product) => product.value) : [],
          business: this.getBusinessName(opportunity),
          nextTask: this.getNearestFutureTask(opportunity),
          lastTask: this.getLastTaskDone(opportunity),
          pipelineSteps: this.getPipelineSteps(opportunity),
        }
      })
    },
    getLastTaskDone(opportunity) {
      if (opportunity.stats.last_task_done_id) {
        const lastTask = opportunity.stats.last_task_done
        return lastTask ? {
          id: lastTask.id,
          scheduled_to: this.$moment(`${lastTask.updated_at}Z`).format('DD/MM/YY'),
          type: lastTask.type ? lastTask.type.name : null,
          assigned_to: lastTask.assigned_to ? lastTask.assigned_to.name : null,
        } : null
      } else {
        return null
      }
    },
    getNearestFutureTask(opportunity) {
      const { tasks = [] } = opportunity
      const futureTasks = tasks.filter((task) => {
        return task.state === 'Não iniciada' && this.$moment(`${task.scheduled_to}Z`).isAfter(this.$moment(new Date()))
      })
      const nearestFutureTask = futureTasks.reduce((acc, current) => {
        return this.$moment(`${acc.scheduled_to}Z`).isAfter(this.$moment(`${current.scheduled_to}Z`)) ? current : acc
      }, futureTasks[0])
      return nearestFutureTask ? {
        id: nearestFutureTask.id,
        scheduled_to: this.$moment(`${nearestFutureTask.scheduled_to}Z`).format('DD/MM/YY'),
        type: nearestFutureTask.type ? nearestFutureTask.type.name : null,
        assigned_to: nearestFutureTask.assigned_to ? nearestFutureTask.assigned_to.name : null,
      } : null
    },
    openTask(task) {
      this.selectedTaskId = task.id
      this.taskDialog = true
    },
    openOpportunitySideView(opportunityId) {
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', false)
      this.$store.dispatch('Opportunity/setPipelineItemId', opportunityId)
      this.$store.dispatch('Opportunity/setPipelineSideViewItems', this.opportunitiesIdList)
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', true)
    },
    getBusinessName(opportunity) {
      if (opportunity.stage?.pipeline?.business_item?.length > 0) {
        const businessItem = opportunity.stage.pipeline.business_item[0]
        return businessItem.business_category.business.name
      } else {
        return 'Não informado'
      }
    },
    getPipelineSteps(opportunity) {
      const opportunityStage = opportunity?.stage?.id
      if (opportunity.stage?.pipeline?.stages?.length > 0) {
        const stages = opportunity.stage.pipeline.stages.sort(
          (stage, nextStage) => stage.id - nextStage.id || stage.index - nextStage.index
        )
        const steps = stages.map((stage) => {
          return stage.id <= opportunityStage ? 'stage-step-filled' : 'stage-step'
        })
        return steps
      } else {
        return []
      }
    },
    async getActiveOpportunitiesCount() {
      const params = new URLSearchParams()
      params.append('includes', 'customers')
      params.append('load_only', 'id')
      params.append('status', 'active')
      params.append('customers.id', this.companyId)
      const { total } = await this.getList('/cash/opportunity', params)
      this.activeOpportunities = total
    },
    handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && page * itemsPerPage >= itemsLength) {
        if (this.hasNext) {
          this.page += 1
        }
      }
    },
    customSort(column) {
      if(this.sortBy === column) {
        this.sortDesc = !this.sortDesc
      } else {
        this.sortBy = column
        this.sortDesc = false
      }
    }
  }
}
</script>

<style lang="scss">
.opportunity-data-table-row {
  font-size: 14px !important;
}
.opportunity-data-table-row > td {
  padding-right: 8px !important;
  padding-left: 8px !important;
  font-size: 14px !important;
}
.stage-step {
  width: 20px;
  height: 12px;
  border: 0.5px solid var(--v-stroke-base);
}
.stage-step-filled {
  width: 20px;
  height: 12px;
  border: 0.5px solid var(--v-stroke-base);
  background-color: var(--v-primary-base);
}

</style>