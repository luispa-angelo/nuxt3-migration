<template>
  <div>
    <v-row>
      <v-col
        cols="2"
        class="d-flex align-center"
      >
      <RouterBreadCrump has-title page-name="Tarefas" />
      </v-col>
      <v-col
        cols="10"
        class="d-flex justify-end align-center"
      >
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              class="mr-2"
              v-bind="attrs"
              v-on="on"
            >
              Criar tarefa
              <v-icon large right class="material-icons-round">
                arrow_drop_down
              </v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="(taskType, index) in taskTypesBtn"
              class="px-0"
              :key="index"
            >
              <v-btn text class="w-100 d-flex justify-start" @click="handleCreateTask(taskType.type)">
                <div v-if="taskType.type === 'internal'" class="mx-2 d-inline">
                  <InternalTaskIcon v-if="taskType.type === 'internal'" width="13" height="13" class="ml-2" fill="var(--v-default-text-base)" />
                </div>
                <div v-else-if="taskType.type === 'meeting'" class="mr-2 d-inline">
                  <MeetingTaskIcon  width="26" height="13" fill="var(--v-default-text-base)" />
                </div>
                <v-icon v-else small class="material-icons-outlined mx-2">
                  {{taskType.icon}}
                </v-icon>
                <span class="font-body-medium">{{taskType.name}}</span>
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
        <Calendar />
        <ToggleGroupButtons v-model="toggleVisualization" :buttons="toggleButtons" placement="left"/>
        <TaskModal
          :open-dialog="taskDialog"
          :prop-channel="taskPropChannel"
          :icon-button="taskIconButton"
          @closeDialog="() => { taskDialog = false }"
        />
      </v-col>
    </v-row>
    <v-row class="fill-height">
      <v-col xl="12" lg="12" md="12" sm="12"  class="fill-height">
        <TaskPipeline v-if="!toggleVisualization" :task-view="taskView" />
        <v-card v-else class="shape lighten-1">
          <v-card-text style="padding: 0;">
            <TaskList :task-view="taskView" :search="search" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    toggleVisualization: false,
    focus: '',
    type: 'month',
    typeToLabel: {
      month: 'Mês',
      week: 'Semana',
    },
    calendarDrawer: false,
    date: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .substr(0, 10),
    search: '',
    filterEvent: [],
    taskList: [],
    taskCalendar: [],
    taskView: 'task',
    taskViewList: [
      { name: 'Todas as Tarefas', value: 'task'},
      { name: 'Minhas Tarefas', value: 'my-tasks'}
    ],
    events: [],
    amount: 0,
    pageName: 'Kanban',
    taskTypesBtn: [
      { type: 'call', icon: 'phone', name: 'Ligação' },
      { type: 'mail', icon: 'mail_outline', name: 'E-mail' },
      { type: 'chat', icon: 'mdi-whatsapp', name: 'WhatsApp' },
      { type: 'meeting', icon: '', name: 'Reunião' },
      { type: 'default', icon: 'pending', name: 'Outros' },
      { type: 'internal', icon: '', name: 'Interna' },
    ],
    taskDialog: false,
    taskPropChannel: null,
    taskIconButton: null,
    toggleButtons: [
      {icon: 'view_week', description: 'Exibir como Coluna' },  
      {icon: 'view_list', description: 'Exibir como Lista' }
    ]
  }),
  computed: mapGetters({ assignedTasks: 'Task/assignedTasks', assignedTasks_api: 'Task/assignedTasks_api'}),
  mounted() {
    this.getVisualization()
  },
  watch: {
    assignedTasks(newValue) {

      const now = new Date()
      this.taskList = newValue.filter(task => {
        const taskDate = new Date(task.scheduled_to)
        return taskDate >= now
      })

      const events = []
      this.taskCalendar = newValue.map(task =>
        events.push({
          start: task.scheduled_to,
          end: task.scheduled_to
        })
      )
      this.events = events
    },
    assignedTasks_api(newValue) {
      newValue.total && (this.amount = newValue.total)
    },
    toggleVisualization(newValue) {
      !newValue ? (this.pageName = 'Kanban de Tarefas') : (this.pageName = 'Lista de Tarefas')
      this.taskView = 'task'
      this.setVisualization(newValue)
    }
  },
  methods: {
    viewDay ({ date }) {
      this.focus = date
      this.type = 'day'
    },
    getEventColor (event) {
      return event.color
    },
    setToday () {
      this.focus = ''
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    formatDate(date) {
      var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear()

      if (month.length < 2) 
        month = '0' + month
      if (day.length < 2) 
        day = '0' + day

      return `${year}-${month}-${day}`
    },
    getVisualization() {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      if (pageSettings) {
        if (pageSettings['task-list-visualization']) {
          this.toggleVisualization = pageSettings['task-list-visualization']
        }
      }
    },
    setVisualization(toggleVisualization) {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      localStorage.setItem('page_settings', JSON.stringify({
        ...pageSettings,
        ['task-list-visualization']: toggleVisualization
      }))
    },
    handleCreateTask(type) {
      if (type === 'internal') {
        this.taskPropChannel = null
        this.taskIconButton = type
      } else {
        this.taskIconButton = null
        this.taskPropChannel = type
      }
      this.taskDialog = true
    }
  },
}
</script>

<style scoped>
  .v-event {
    width: 50% !important;
    margin-top: 5px !important;
  }
  .v-calendar-weekly__day {
    min-height: 100px !important;
  }
</style>
