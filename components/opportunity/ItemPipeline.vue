<template>
  <draggable
    data-test="draggableOpportunityPipelineItem"
    class="list-group"
    group="ItemPipeline"
    v-model="opportunities"
    :disabled="disableDraggable"
    @start="onDragStart"
    @end="onDragEnd"
  >
    <div v-for="(opportunity, index) in opportunities" :key="opportunity.id">
      <v-alert
        class="list-group-item mb-2 pb-3 px-0 pt-1"
        elevation="0"
        :class="opportunity.isActive ? 'active-opportunity-card' : 'inactive-opportunity-card'"
        v-tooltip="!opportunity.isActive && { content: `<div class='v-btn-tooltip'>${opportunity.status}</div>`, placement: 'bottom' }"
      >
        <div class="body-3" @click.stop="redirectPage(opportunity.id)">
          <div class="d-flex justify-space-between mb-3 mx-1">
            <div v-if="opportunity.company" class="body-3 py-1 px-0">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    class="font-weight-bold mb-1"
                    v-bind="attrs"
                    v-on="on"
                    v-if="opportunity.company && opportunity.company.name"
                  >
                    {{ `${opportunity.company.name}` | truncate(mq_truncate) }}
                  </span>
                </template>
                <span>{{ `${opportunity.id} - ${opportunity.company.name}` }}</span>
              </v-tooltip>
              <div class="mt-1 d-flex align-center">
                <span class="grey--text text--lighten-4">
                  {{ opportunity.company.identifier | VMask(mask_cnpj) }}
                </span>
                <v-icon
                  small
                  data-test="btnPipelineItemIdentifierCopy"
                  color="primary"
                  class="ml-1 material-icons-round"
                  v-tooltip="{
                    content: `
                      <div class='v-btn-tooltip'>
                        Copiar
                      </div>
                      `,
                    placement: 'bottom-center'
                  }"
                  @click.stop="copyToClipboard(opportunity.company.identifier)"
                >
                  copy
                </v-icon>
              </div>
            </div>
            <div
              v-if="opportunity.aggregates.length > 0"
              class="py-1 mt-2 mr-2 ml-2 d-flex align-center mr-auto"
              v-tooltip="{ content: generateCompaniesList(opportunity), placement: 'top' }"
            >
              <v-badge
                class="body-3"
                color="primary"
                :content="opportunity.aggregates.length < 10 ? opportunity.aggregates.length : '+9'"
              >
              </v-badge>
            </div>
            <div class="pa-0 d-flex align-start">
              <v-btn
                fab
                x-small
                text
                data-test="btnPipelineItemSideView"
                @click.stop.native="openSideView(opportunity.id)"
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                    Visualização rápida
                    </div>
                    `,
                  placement: 'left'
                }"
                icon
              >
                <PreviewIcon class="self-align-end" :width="20" :height="20" />
              </v-btn>
            </div>
          </div>
          <v-row v-if="cardOptions['lastTask']" class="mx-1">
            <v-col class="py-1 px-0">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon 
                    small 
                    class="material-icons-outlined sub-text--text"
                    v-bind="attrs"
                    v-on="on"
                  >
                    task
                  </v-icon>
                </template>
                <span>Última tarefa concluída</span>
              </v-tooltip>
              <span v-if="opportunity.lastTask" class="default-text--text">
                <span
                  data-test="btnPipelineItemLastTask"
                  class="primary--text pointer-click" 
                  @click.stop="openDialog(opportunity.lastTask.id)"
                >{{`${opportunity.lastTask.type}`}}
                </span>
                {{` em ${opportunity.lastTask.scheduled_to} por ${opportunity.lastTask.assigned_to}` | truncate(generateTaskLineTruncate(opportunity.lastTask.type))}}
              </span>
              <span v-else class="sub-text--text">Sem tarefa concluída</span>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['nextTask']" class="mx-1">
            <v-col class="py-1 px-0">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon 
                    small 
                    class="material-icons-outlined sub-text--text"
                    v-bind="attrs"
                    v-on="on"
                  >
                    calendar_month
                  </v-icon>
                </template>
                <span>Próxima tarefa futura</span>
              </v-tooltip>
              <span v-if="opportunity.nextTask" class="default-text--text">
                <span
                  data-test="btnPipelineItemNextTask"
                  class="primary--text pointer-click" 
                  @click.stop="openDialog(opportunity.nextTask.id)"
                >{{`${opportunity.nextTask.type}`}}
                </span>
                {{` para ${opportunity.nextTask.scheduled_to} por ${opportunity.nextTask.assigned_to}` | truncate(generateTaskLineTruncate(opportunity.nextTask.type))}}
              </span>
              <span v-else class="sub-text--text">Sem tarefa futura não iniciada</span>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['partner']" class="mx-1">
            <v-col class="py-1 px-0">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-icon 
                    small 
                    class="material-icons-outlined sub-text--text"
                    v-bind="attrs"
                    v-on="on"
                  >
                    handshake
                  </v-icon>
                </template>
                <span>Parceiro</span>
              </v-tooltip>
              <span v-if="opportunity.partner" class="default-text--text">
                {{opportunity.partner.name | truncate(label_truncate)}}
              </span>
              <span v-else class="sub-text--text">Não informado</span>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['assignedTo']" class="mx-1">
            <v-col class="py-1 px-0">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <i 
                    small 
                    class="material-symbols-outlined v-icon sub-text--text"
                    style="font-size: 16px;"
                    v-bind="attrs"
                    v-on="on"
                  >
                    assignment_ind  
                  </i>
                </template>
                <span>Atribuído(a) a</span>
              </v-tooltip>
              <span v-if="opportunity.assigned_to" class="default-text--text">
                {{opportunity.assigned_to.name | truncate(label_truncate)}}
              </span>
              <span v-else class="sub-text--text">Sem atribuição</span>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['team']" class="mx-1">
            <v-col class="py-1 px-0">
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <i 
                    small 
                    class="material-symbols-rounded v-icon sub-text--text"
                    style="font-size: 16px;"
                    v-bind="attrs"
                    v-on="on"
                  >
                    groups
                  </i>
                </template>
                <span>Time</span>
              </v-tooltip>
              <span v-if="opportunity.team" class="default-text--text">
                {{opportunity.team.name | truncate(label_truncate)}}
              </span>
              <span v-else class="sub-text--text">Não informado</span>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['timeInStage']" class="mx-1">
            <v-col class="py-1 px-0 d-flex justify-space-between">
              <div>
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <i 
                      small 
                      class="material-symbols-rounded v-icon sub-text--text"
                      style="font-size: 16px;"
                      v-bind="attrs"
                      v-on="on"
                    >
                      hourglass_empty
                    </i>
                  </template>
                  <span>Tempo na etapa</span>
                </v-tooltip>
                <span class="sub-text--text">
                  {{
                    opportunity.stats ?
                    secondsToDhm($moment().diff(`${opportunity.stats.last_stage_updated_at}Z`, 'seconds')) :
                    secondsToDhm($moment().diff(`${opportunity.created_at}Z`, 'seconds'))
                  }}
                </span>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['expiration'] || cardOptions['origin']" class="mx-0">
            <v-col class="py-1 px-1 d-flex justify-space-between">
              <div v-if="cardOptions['origin']">
                <div>
                  <v-tooltip top>
                    <template v-slot:activator="{ on, attrs }">
                      <i 
                        small 
                        class="material-symbols-rounded v-icon sub-text--text"
                        style="font-size: 16px;"
                        v-bind="attrs"
                        v-on="on"
                      >
                        start
                      </i>
                    </template>
                    <span>Origem</span>
                  </v-tooltip>
                  <span v-if="opportunity.origin" color="default-text--text">{{opportunity.origin.name}}</span>
                  <span v-else class="sub-text--text">Não informado</span>
                </div>
              </div>
              <div v-if="cardOptions['expiration']">
                <span class="sub-text--text">Reserva</span>
                <span v-if="opportunity.expiration" color="default-text--text">{{$moment(`${opportunity.expiration}Z`).format('DD/MM/YY')}}</span>
                <span v-else class="sub-text--text">{{'Não informado' | truncate(cardOptions['origin'] ? 7 : 15)}}</span>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['prevision'] || cardOptions['createdAt']" class="mx-0">
            <v-col class="py-1 px-1 d-flex justify-space-between">
              <div v-if="cardOptions['createdAt']">
                <span class="sub-text--text">Início</span>
                <span color="default-text--text">{{$moment(`${opportunity.created_at}Z`).format('DD/MM/YY')}}</span>
              </div>
              <div v-if="cardOptions['prevision']">
                <span class="sub-text--text">Previsão</span>
                <span v-if="opportunity.prevision" color="default-text--text">{{$moment(`${opportunity.prevision}Z`).format('DD/MM/YY')}}</span>
                <span v-else class="sub-text--text">{{'Não informado' | truncate(cardOptions['createdAt'] ? 7 : 15)}}</span>
              </div>
            </v-col>
          </v-row>
          <v-row v-if="cardOptions['temp'] || cardOptions['status'] || cardOptions['value']" class="mx-0">
            <v-col
              v-if="cardOptions['temp']"
              class="d-flex align-center justify-center px-1 py-1 text-center card-cell-border"
              v-tooltip="{ content: `<div class='v-btn-tooltip'>Temperatura</div>` }"
            >
              <span v-if="opportunity.temperature" class="default-text--text">{{`${opportunity.temperature}º`}}</span>
              <span v-else class="sub-text--text">0º</span>
            </v-col>
            <v-col
              v-if="cardOptions['status']"
              class="px-1 py-1 text-center card-cell-border"
              v-tooltip="{ content: `<div class='v-btn-tooltip'>Status</div>` }"
            >
              <v-chip
                v-if="opportunity.status"
                label 
                small 
                class="white--text font-weight-medium" 
                :color="statusColor[opportunity.status] ? statusColor[opportunity.status] : 'primary'"
              >
                {{opportunity.status.slice(0,10)}}
              </v-chip>
            </v-col>
            <v-col
              v-if="cardOptions['value']"
              class="d-flex align-center justify-center px-1 py-1 text-center card-cell-border"
              >
              <v-tooltip
                v-if="opportunity.value"
                bottom
                content-class="v-menu-tooltip"
                min-width="135"
              >
                <template v-slot:activator="{ on, attrs }">
                  <span
                    class="default-text--text"
                    v-bind="attrs"
                    v-on="on"         
                  >
                    {{`R$ ${maskMoney('pt-br', opportunity.value)}`}}
                  </span>
                </template>
                <OpportunityProductTooltip :opportunity-id="opportunity.id" />
              </v-tooltip>
              <span v-else class="sub-text--text">R$ 0,00</span>
            </v-col>
          </v-row>
        </div>
      </v-alert>
      <p
        v-if="opportunities.length === total && index === opportunities.length - 1"
        class="text-center mt-10 pt-10 pb-3 px-4 grey--text text--lighten-4"
      >
        Todas as oportunidades desta fase foram exibidas.
      </p>
    </div>
    <TaskModal
      :item-id="dialogId"
      :open-dialog="taskDialog"
      @closeDialog="() => { taskDialog = false }"
    />
  </draggable>
</template>

<script>
import { mapGetters } from 'vuex'
import draggable from 'vuedraggable'

export default {
  props: ['stageId', 'stageIndex', 'draggingIndex', 'opportunityList', 'pipelineId', 'total'],
  components: {
    draggable
  },
  data: () => ({
    opportunities: [],
    opp: {},
    redirectTo: 'business-opportunity-item-id',
    statusColor: {
      'Ativa': 'blue',
      'Perdida': 'red darken-2',
      'Ganha': 'green darken-2',
      'Cancelada': 'orange',
      'Aguardando aprovação do contato': 'purple darken-2',
    },
    taskDialog: false,
    dialogId: null,
    loadingProducts: false,
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      pipelineCardOptions: 'Opportunity/pipelineCardOptions',
    }),
    mq_truncate() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 40
      case 'sm':
        return 40
      case 'md':
        return 15
      case 'lg':
        return 15
      case 'xl':
        return 30
      default:
        return 15
      }
    },
    label_truncate() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 10
      case 'sm':
        return 10
      case 'md':
        return 22
      case 'lg':
        return 22
      case 'xl':
        return 42
      default:
        return 22
      }
    },
    opportunitiesIdList() {
      return this.opportunities.map((opportunities) => opportunities.id)
    },
    disableDraggable() {
      if (this.userInfo.admin) {
        return false
      }
      if (this.draggingIndex) {
        return this.stageIndex < this.draggingIndex
      }
      return false
    },
    cardOptions() {
      const options = {}
      if (this.pipelineCardOptions) {
        this.pipelineCardOptions.forEach((option) => {
          options[option] = true
        })
      }
      return options
    }
  },
  mounted() {
    this.opportunities = this.opportunityList
  },
  watch: {
    opportunityList(newValue) {
      this.opportunities = newValue
    },
    opportunities() {
      this.opp = this.opportunities.find(opp => opp.stage_id !== this.stageId)
      if (this.opp) {
        const payload = {
          id: this.opp.id,
          stage_id: this.stageId
        }
        this.updateOpportunity(payload)
      }
    }
  },
  methods: {
    async updateOpportunity(payload) {
      await this.$store.dispatch('Opportunity/updOpportunity', payload)
      this.$emit('onDraggingEnd')
    },
    redirectPage(id) {
      const { params, query } = this.$route
      this.$router.push({ name: `${this.redirectTo}`, params: { id, ...params }, query })
    },
    openDialog(taskId){
      this.taskDialog = false
      this.dialogId = taskId
      this.taskDialog = true
    },
    openSideView(taskId){
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', false)
      this.$store.dispatch('Opportunity/setPipelineItemId', taskId)
      this.$store.dispatch('Opportunity/setPipelineSideViewItems', this.opportunitiesIdList)
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', true)
    },
    generateCompaniesList(opportunity) {
      const { aggregates } = opportunity
      const companiesAggregates = aggregates.map((aggregate) => aggregate.company)
      const companies = [opportunity.company, ...companiesAggregates]
      return `<v-list class="v-menu-tooltip">
        <span class="w-100 px-0 mx-1" style="border-bottom: 1px solid var(--v-stroke-base); padding: 4px;">Empresas (${companies.length})</span>
        ${companies.filter((company) => company).map((company) => `<v-list-item class="mx-2">${company.name}</v-list-item>`).join('')}
      </v-list>`
    },
    generateProductsList(opportunity) {
      const { groupedProducts } = opportunity
      const typeList = []
      for (const [key, value] of Object.entries(groupedProducts)) {
        typeList.push(`<v-list-item class="mx-2">${key}: R$ ${this.maskMoney('pt-br', value)}</v-list-item>`)
      }
      return `<v-list class="v-menu-tooltip">
        <div class="w-100 px-0 mx-1" style="border-bottom: 1px solid var(--v-stroke-base); padding: 4px;">Valor da oportunidade</div>
        ${typeList.join('')}
      </v-list>`
    },
    onDragStart() {
      this.$emit('onDraggingItem', this.stageIndex)
    },
    onDragEnd() {
      this.$emit('onDraggingItem', null)
    },
    generateTaskLineTruncate(taskType) {
      if (taskType) {
        return this.label_truncate - taskType.length
      }
      return this.label_truncate
    }
  }
}
</script>

<style scoped lang="scss">
.list-group {
  height: 100%;
}
.list-group-item {
  cursor: grab;
  position: relative;
  z-index: 0;
  & a {
    color: inherit;
    text-decoration: none;
  }
  & h2 {
    font-size: 12px;
    font-weight: 500;
  }
  & p {
    font-size: 10px;
    font-weight: 500;
  }
  & small {
    font-size: 8px;
    font-weight: 400;
  }
}
.list-group-item-avatar {
  width: 28.98px;
  height: 30.21;
}
.active-opportunity-card {
  border: 1px solid var(--v-stroke-base) !important;
  border-radius: 4px;
}
.inactive-opportunity-card {
  border: 1px solid var(--v-stroke-base) !important;
  background-color: var(--v-white-darken1) !important;
  border-radius: 4px;
}
.card-cell-border
{
  border: 1px solid var(--v-stroke-base);
  border-bottom: 0px;
}
</style>
