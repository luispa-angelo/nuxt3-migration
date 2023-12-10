<template>
	<v-card class="fill-height d-flex flex-column" height="832">
    <v-card-title class="d-flex justify-space-between align-center">
      Timeline
      <div class="d-flex justify-space-between align-center">
      <v-menu offset-y offset-x :close-on-content-click="false">
        <template v-slot:activator="{ on, attrs }">
          <v-btn 
            fab
            v-bind="attrs"
            v-on="on"
            color="primary"
            v-tooltip="{
              content: `
                          <div class='v-btn-tooltip'>
                                Outros <br>
                                Filtros
                          </div>
                          `,
              placement: 'bottom-center'
            }"
          >
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </template>
        <v-card width="300px" class="mt-3 mr-3" elevation="4">
          <v-card-text class="pt-8">
            <v-select
              attach
              label="Tipo de Atividade"
              outlined
              dense
              :items="typeFilterList"
              item-text="name"
              item-value="value"
              v-model="typeFilter"
            ></v-select>
            <v-select
              attach
              label="Oportunidade"
              outlined
              dense
              :items="opportunityFilterList"
              v-model="opportunityFilter"
            ></v-select>
          </v-card-text>
        </v-card>
      </v-menu>
        <TaskForm
          by-details
          ref="myForm"
          class="ml-3"
          :isDisabled="!hasOpportunity()"
          :opportunities-list="opportunitiesTimeline"
        />
      </div>
    </v-card-title>
    <v-divider></v-divider>
    <v-card-text style="overflow-y: auto;">
      <v-row class="mt-0">
        <v-col>
          <div v-if="!activityList.length" class="text-center mb-3">
            Nenhuma atividade.
          </div>
          <v-timeline v-else dense class="ajust-timeline-margin mt-3" style="margin-left: -40px">
            <v-timeline-item
              v-for="activity in activityList"
              :key="`${activity.id}${activity.opportunity_id}${activity.date}`"
              small
              color="primary"
            >
              <div class="d-flex justify-space-between align-center">
                <div>
                  <NuxtLink :to="redirectPage(activity.opportunity_id)" class="opportunity-link subtitle-2 mb-1">{{ `Oportunidade: ${activity.opportunity_id}` }}</NuxtLink>
                  <v-spacer></v-spacer>
                  <p v-if="activity.type == 'task'" class="subtitle-2 mb-0">{{ `${activity.id} - ${activity.name}` }}</p>
                  <p v-else class="subtitle-2 mb-0">{{ activity.name }}</p>
                  <div class="text-caption">
                    {{ formatDate(activity.date) }}
                  </div>
                </div>
                <div v-if="activity.type=='task'">
                  <TaskModal
                    timelineButton
                    hasButton
                    :item-id='activity.id'
                  />
                </div>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-col>
      </v-row>
    </v-card-text>
	</v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['opportunityDetails'],
  computed: {
    ...mapGetters({
      opportunitys: 'Opportunity/opportunitys',
      opportunity: 'Opportunity/opportunity',
      assignedTasks: 'Task/assignedTasks',
      meta: 'meta'
    })
  },
  data: () => ({
    dialog: {
      mail: false,
      call: false,
      chat: false,
      default: false
    },
    dialogId: null,
    filterChoice: 0,
    renderOpportunity: false,
    opp: null,
    search: '',
    opportunitiesTimeline: [],
    activityList: [],
    tasks: [],
    eventsLog: [],
    typeFilter: null,
    opportunityFilter: 'Todas',
    opportunityFilterList: [],
    typeFilterList: [
      {
        name: 'Todos',
        value: null
      },
      {
        name: 'Tarefa',
        value: 'task'
      },
      {
        name: 'Responsável',
        value: 'ownership'
      },
      {
        name: 'Estágio',
        value: 'stage'
      },
    ],
    activityObject: {
      name: 'Tarefa - não iniciado',
      type: 'task,ownership,stage',
      date: 'data',
      opportunity_id: 0
    },
    redirectTo: 'business-opportunity-item-id'
  }),
  async mounted() {
    this.opportunityDetails ? (this.opportunitiesTimeline.push(this.opportunity)) : (this.opportunitiesTimeline = this.opportunitys)
  },
  watch: {
    base(newValue) {
      if (newValue) {
        switch (newValue) {
        case 'mail':
          this.dialog.mail = true
          break
        case 'call':
          this.dialog.call = true
          break
        default:
          this.dialog.default = true
          break
        }
      }
    },
    async opportunity(newValue) {
      this.opportunitiesTimeline = []
      this.opportunitiesTimeline.push(newValue)
    },
    async opportunitys(newValue) {
      this.opportunitiesTimeline = newValue
    },
    opportunitiesTimeline(newValue) {
      this.opportunityFilterList = [ 'Todas', ...newValue.map((opp) => opp.id)]
      this.generateActivityList(newValue)
    },
    search(newValue) {
      this.textFilter(newValue)
    },
    typeFilter(newValue) {
      this.activityList = this.eventsLog.sort((a, b) => b.date - a.date)
      if (newValue) {
        this.activityList = this.activityList.filter((activity) => activity.type == newValue)
      }
    },
    opportunityFilter(newValue) {
      this.activityList = this.eventsLog.sort((a, b) => b.date - a.date)
      if (newValue != 'Todas') {
        this.activityList = this.activityList.filter((activity) => activity.opportunity_id == newValue)
      }
    }
  },
  methods: {
    openDialog(task){
      if(task?.type?.extra) {
        var { modal } = JSON.parse(task.type.extra)
        if (task.type_id) {
          switch (modal) {
            case 'mail':
              this.dialog.mail = true
              break
            case 'chat':
              this.dialog.chat = true
              break
            case 'call':
              this.dialog.call = true
              break
            default:
              this.dialog.default = true
              break
          }
        }
      }
      else {
        this.dialog.default = true
      }
    },
    generateTasks(tasks) {
      if (tasks?.length > 0) {
        let tasksList = tasks.filter(task => task.type && task.type.name)
        tasksList = tasksList.map(task => ({
          id: task.id,
          name: `${task.type.name} - ${this.getEnum(task.state, this.meta.taskState)}`,
          type: 'task',
          modalType: this.handleModalTaks(task),
          date: task.updated_at,
          opportunity_id: task.opportunity_id
        }))
        this.eventsLog = [ ...this.eventsLog, ...tasksList]
      }
    },
    generateOwnershipLog(logs) {
      if (logs.length > 0) {
        let eventsLog = logs.filter(event => event.owner && event.owner.name)
        eventsLog = eventsLog.map(event => ({
          id: event.id,
          name: `Novo responsável: ${event.owner.name}`,
          type: event.type,
          date: event.created_at,
          opportunity_id: event.opportunity_id
        }))
        this.eventsLog = [ ...this.eventsLog, ...eventsLog]
      }
    },
    generateStageLog(logs) {
      if (logs.length > 0) {
        let eventsLog = logs.filter(event => event.owner && event.owner.name)
        eventsLog = eventsLog.map(event => ({
          id: event.id,
          name: `Novo estágio: ${event.stage.name}`,
          type: event.type,
          date: event.created_at,
          opportunity_id: event.opportunity_id
        }))
        this.eventsLog = [ ...this.eventsLog, ...eventsLog]
      }
    },
    generateActivityList(opportunities) {
      this.eventsLog = []
      opportunities.forEach((opp) => {
        const { tasks, op_log } = opp
        tasks && this.generateTasks(tasks)
        if (op_log) {
          this.generateOwnershipLog(op_log.filter((log) => log.type == 'ownership'))
          this.generateStageLog(op_log.filter((log) => log.type == 'stage'))
        }
      })
      this.activityList = this.eventsLog.sort((a, b) => new Date(b.date) - new Date(a.date))
    },
    applyFilter(filterId) {
      this.generateActivityList(this.tasks)
      if (filterId !== 1) {
        this.activityList = this.activityList.filter(
          activity => activity.type_id == filterId
        )
      }
    },
    textFilter(text) {
      this.generateActivityList(this.opportunitiesTimeline)
      if (text.length > 0) {
        this.activityList = this.activityList.filter(event => {
          const fullText = `${event.name} ${event.date} ${event.opportunity_id}`
          return fullText.toLowerCase().includes(text.toLowerCase())
        })
      }
    },
    hasOpportunity() {
      if (this.opportunitiesTimeline.length == 0) {
        return false
      }
      return true
    },
    handleModalTaks(task) {
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
      // const { type } = task
      // if (type?.media_type) {
      //   const { extra, base } = type.media_type
      //   if (extra) {
      //     const { isWhats } = JSON.parse(extra)
      //     if (isWhats) {
      //       return 'chat'
      //     }
      //   }
      //   switch (base) {
      //   case 'mail':
      //     return 'mail'
      //   case 'mobile':
      //     return 'call'
      //   case 'landline':
      //     return 'call'
      //   default:
      //     return 'default'
      //   }
      // }
      // return 'default'
    },
    redirectPage(id) {
      const { params, query } = this.$route
      return { name: `${this.redirectTo}`, params: { ...params, id }, query }
    }
  }
}
</script>

<style scoped>
.timeline-container {
  overflow-y: auto;
  overflow-x: hidden;
  height: calc(100vh - 93px);
}
.ajust-timeline-margin {
	margin-top: -18px;
}
.opportunity-link {
  color: #9e9e9e;
}
.opportunity-link:hover {
  color: #00e2f4;
}
</style>
