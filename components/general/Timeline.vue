<template>
	<v-sheet class="pt-5 px-6" color="shape lighten-1" rounded>
		<v-row>
			<v-col xl="6" lg="4" md="12" sm="12" cols="12" class="d-flex flex-column justify-center ajust-timeline-margin pt-10 pt-sm-10 pt-md-4 pb-0">
				<h6 class="bordered-title pl-4">Timeline</h6>
			</v-col>
			<v-col xl="6" lg="8" md="12" sm="12" cols="12" class="d-flex pt-5 pb-0">
				<v-text-field
					placeholder="Busca rápida"
					class="mx-2"
					outlined
					dense
					append-icon="mdi-magnify"
					v-model="search"
				></v-text-field>
        <v-menu offset-y rounded :close-on-content-click="false">
					<template v-slot:activator="{ on, attrs }">
						<v-btn 
							fab
							small
							v-bind="attrs"
							v-on="on"
							class="mx-1"
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
			</v-col>
		</v-row>
		<v-row class="mt-0">
			<v-col>
				<v-divider></v-divider>
				<div class="d-flex justify-space-between align-center mt-5 mb-2">
					<p class="subtitle-2">Atividades Relacionadas</p>
					<Sheet
						v-if="!opportunityDetails"
						:isEditing="false"
            :isDisabled="!hasOpportunity()"
						@submit="$refs.myForm.submitForm()"
						@load="$refs.myForm.loadForm()"
						title="Atribuir Tarefa"
					>
						<template v-slot="{ sheet, closed }">
							<TaskForm by-details :opportunities-list="opportunitiesTimeline" :sheet="sheet" @closeForm="closed" ref="myForm" />
						</template>
					</Sheet>
				</div>
				<div v-if="!activityList.length" class="text-center mb-3">
					Nenhuma atividade.
				</div>
				<v-timeline v-else dense class="ajust-timeline-margin mt-3" style="margin-left: -40px">
					<v-timeline-item
						v-for="activity in activityList"
						:key="activity.id + Math.random() + activity.opportunity_id"
						small
						color="orange"
					>
            <div class="d-flex justify-space-between align-center">
              <div>
                <NuxtLink :to="`/opportunity/${activity.opportunity_id}`" class="opportunity-link subtitle-2 mb-1">{{ `Oportunidade: ${activity.opportunity_id}` }}</NuxtLink>
                <v-spacer></v-spacer>
                <p v-if="activity.type == 'task'" class="subtitle-2 mb-0">{{ `${activity.id} - ${activity.name}` }}</p>
                <p v-else class="subtitle-2 mb-0">{{ activity.name }}</p>
                <div class="text-caption">
                  {{ formatDate(activity.date) }}
                </div>
              </div>
              <div v-if="activity.type=='task'">
                <TaskQuickCall
                  v-if="activity.modalType == 'call'"
                  timelineButton
                  hasButton
                  task-type="mobile"
                  title="Efetuar ligação"
                  :task-id="activity.id"
                  :opportunity-id="activity.opportunity_id"
                />
                <TaskEmail
                  v-else-if="activity.modalType == 'mail'"
                  timelineButton
                  has-button
                  task-type="email"
                  title="Enviar e-mail"
                  :task-id="activity.id"
                  :opportunity-id="activity.opportunity_id"
                />
                <TaskQuickChat
                  v-else-if="activity.modalType == 'chat'"
                  timelineButton
                  has-button
                  open-task-type="chat"
                  title="Abrir um chat"
                  :task-id="activity.id"
                  :opportunity-id="activity.opportunity_id"
                />
                <TaskRegister
                  v-else
                />
              </div>
            </div>
					</v-timeline-item>
				</v-timeline>
			</v-col>
		</v-row>
	</v-sheet>
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
    }
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
      if (task.type_id) {
        switch (task.type.media_type.base) {
        case 'mail':
          this.dialog.mail = true
          break
        case 'mobile':
          this.dialog.call = true
          break
        default:
          this.dialog.default = true
          break
        }
      } else {
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
      if (type?.media_type) {
        const { extra, base } = type.media_type
        if (extra) {
          const { isWhats } = JSON.parse(extra)
          if (isWhats) {
            return 'chat'
          }
        }
        switch (base) {
        case 'mail':
          return 'mail'
        case 'mobile':
          return 'call'
        case 'landline':
          return 'call'
        default:
          return 'default'
        }
      }
      return 'default'
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
