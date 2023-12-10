<template>
  <div>
    <draggable
      class="list-group"
      group="ItemPipeline"
      v-model="tasks"
      @start="drag = true"
      @end="drag = false"
      :disabled="true"
    >
      <div v-for="(task, index) in tasks" :key="task.id">
        <v-alert
          class="pipeline-item-shadow list-group-item pointer-click ma-2 pa-0 pt-1"
          :class="task.delayed ? 'delayed-task-card' : 'task-card'"
          v-tooltip="task.delayed ? { content: `<div class='v-btn-tooltip'>Atrasada</div>`, placement: 'left-start' } : null"
          @click="openDialog(task)"
        >
          <div class="mb-1 pl-2">
            <div class="d-inline" v-tooltip="task.type.media_type ? { content: `<div class='v-btn-tooltip'>${task.type.media_type.name}</div>`, placement: 'auto' } : null">
              <div v-if="task.taskType === 'internal'" class="d-inline">
                <InternalTaskIcon width="20" height="20" class="ml-1 v-icon" style="font-size: 20px;" :fill="tasksIcons[task.taskType].iconColor" />
              </div>
              <div v-else-if="task.taskType === 'meeting'" class="d-inline">
                <MeetingTaskIcon class="mr-1 v-icon" width="28" height="16" style="font-size: 20px;" :fill="tasksIcons[task.taskType].iconColor" />
              </div>
              <v-icon v-else size="20" class="material-icons-outlined" :color="tasksIcons[task.taskType].iconColor">
                {{tasksIcons[task.taskType].icon}}
              </v-icon>
            </div>
            <span v-if="task.type" class="font-body-medium font-weight-bold">{{task.type.name}}</span>
            <span v-else class="body-3 default-text--text">Não informado</span>
          </div>
          <div class="mb-1 pl-2">
            <span class="body-3 sub-text--text">Oportunidade</span>
            <a
              v-if="task.opportunity && task.opportunity.company"
              href=""
              class="body-3 primary--text no-text-decoration"
              v-tooltip="
                task.opportunity.company.name.length > mq_truncate ? { content: `<div class='v-btn-tooltip'>${task.opportunity.company.name}</div>` } : null
              "
              @click.prevent.stop="redirectToOpportunity(task.opportunity_id)"
            >
              {{task.opportunity.company.name | truncate(mq_truncate)}}
            </a>
            <span v-else class="body-3 default-text--text">Não informado</span>
          </div>
          
          <div class="mb-1 pl-2">
            <span class="body-3 sub-text--text">Atribuído(a) a</span>
            <span
              v-if="task.assigned_to"
              class="body-3"
              v-tooltip="
                task.assigned_to.name.length > mq_truncate ? { content: `<div class='v-btn-tooltip'>${task.assigned_to.name}</div>` } : null
              "
            >
              {{task.assigned_to.name | truncate(mq_truncate)}}
            </span>
            <span v-else class="body-3 default-text--text">Não informado</span>
          </div>
          <div class="mb-1 pl-2">
            <span class="body-3 sub-text--text">A contatar</span>
            <a
            v-if="task.contact" 
            href=""
            class="body-3 primary--text no-text-decoration"
            v-tooltip="
              task.contact.name.length > mq_truncate ? { content: `<div class='v-btn-tooltip'>${task.contact.name}</div>` } : null
            "
            @click.prevent.stop="redirectToContact(task.contact_id)"
            >
              {{task.contact.name | truncate(mq_truncate)}}
            </a>
            <span v-else class="body-3 default-text--text">Não informado</span>
          </div>
          <div v-if="task.finishedTask" class="mb-1 pl-2">
            <span class="body-3 sub-text--text">Resultado da tarefa</span>
            <span
              v-if="task.taskOutput"
              class="body-3"
              v-tooltip="
                task.taskOutput.length > mq_truncate ? { content: `<div class='v-btn-tooltip'>${task.taskOutput}</div>` } : null
              "
            >
              {{task.taskOutput | truncate(mq_truncate)}}
            </span>
            <span v-else class="body-3 default-text--text">Não informado</span>
          </div>
          <div class="d-flex justify-space-between">
            <div class="flex-grow-1 px-2 py-2 left-field-border">
              <v-chip
                v-if="task.scheduled_to"
                label
                small
                class="px-2"
                :color="task.delayed ? 'rgb(234, 49, 47, 0.1)' : 'primary lighten-5'"
                :class="task.delayed ? 'error-tag--text' : 'primary--text'"
              >
                <span class="body-3 font-weight-medium">Agendada:&nbsp;</span>
                <span
                  class="body-3 font-weight-medium"
                >
                  {{formatDatetime(task)}}
                </span>
              </v-chip>
              <v-chip
                v-else
                label
                small
                class="px-2"
                color="white darken-1"
              >
                <span class="body-3 font-weight-medium">Agendamento não informado</span>
              </v-chip>
            </div>
            <div class="px-2 py-2 right-field-border">
              <v-chip v-if="task.priority" label small outlined class="px-2" :color="taskPriority[task.priority]">
                <span :class="`body-3 ${taskPriority[task.priority]}--text font-weight-medium`">{{getEnum(task.priority, meta.taskPriority)}}</span>
              </v-chip>
              <v-chip v-else label small outlined class="px-2" color="stroke darken-3">
                <span
                  :class="`body-3 stroke--text text--darken-3 font-weight-medium`"
                  v-tooltip="
                    'Não informada'.length > priority_truncate ? { content: `<div class='v-btn-tooltip'>Não informada</div>` } : null
                  "
                >
                  {{'Não informada' | truncate(priority_truncate)}}
                </span>
              </v-chip>
            </div>
          </div>
        </v-alert>
        <p
          v-if="tasks.length === total && index === tasks.length - 1"
          class="text-center mt-10 pt-10 pb-3 px-4 grey--text text--lighten-4"
        >
          Todas as tarefas desta fase foram exibidas.
        </p>
      </div>
    </draggable>
    <TaskModal
      :item-id='dialogId'
      :open-dialog="taskDialog"
      @closeDialog="() => { taskDialog = false }"
    />
  </div>
</template>

<script>
import draggable from 'vuedraggable'
import { mapGetters } from 'vuex'

export default {
  props: ['stageValue', 'taskList', 'total'],
  components: {
    draggable
  },
  data: () => ({
    base: null,
    dialog: {
      mail: false,
      call: false,
      chat: false,
      default: false
    },
    taskDialog: false,
    dialogId: null,
    taskOpportunityId: null,
    tasks: [],
    task: {},
    opportunityId: null,
    tasksIcons: {
      'mail': { icon: 'mail_outline', color: 'email-icon-bg', iconColor: 'email-icon-text'},
      'call': { icon: 'phone', color: 'phone-icon-bg', iconColor: 'phone-icon-text'},
      'chat': { icon: 'mdi-whatsapp', color: 'chat-icon-bg', iconColor: 'chat-icon-text'},
      'meeting': { icon: '', color: 'meeting-icon-bg', iconColor: 'meeting-icon-text'},
      'internal': { icon: '', color: 'internal-icon-bg', iconColor: 'internal-icon-text'},
      'default': { icon: 'pending', color: 'default-icon-bg', iconColor: 'default-icon-text'},
    },
    taskPriority: {
      'low': 'blue',
      'medium': 'orange',
      'high': 'red',
    },
  }),
  computed: {
    ...mapGetters({ assignedTasks: 'Task/assignedTasks', meta: 'meta' }),
    mq_truncate: function() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 10
      case 'sm':
        return 10
      case 'md':
        return 20
      case 'lg':
        return 20
      case 'xl':
        return 40
      default:
        return 20
      }
    },
    priority_truncate: function() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 5
      case 'sm':
        return 5
      case 'md':
        return 5
      case 'lg':
        return 5
      case 'xl':
        return 40
      default:
        return 5
      }
    },
  },
  mounted() {
    this.tasks = this.formatData(this.taskList)
  },
  watch: {
    taskList(newValue) {
      this.tasks = this.formatData(newValue)
    },
    tasks(newValue) {
      this.task = newValue.find(task => task.state !== this.stageValue)
      if (this.task) {
        const payload = {
          id: this.task.id,
          state: this.stageValue
        }
        this.updateTask(payload)
      }
    },
    base(newValue) {
      if (newValue) {
        switch (newValue) {
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
  },
  methods: {
    opportunityNameOrId(task) {
      return task?.opportunity?.company?.name || task.id
    },
    async updateTask(payload) {
      try {
        await this.$store.dispatch('Task/updAssignedTask', payload)
      } catch (err) {
        console.log(err)
      }
    },
    openDialog(task){
      this.dialogId = task.id
      this.taskDialog = true
    },
    formatData(data) {
      const dataArray = data.map(task => {
        const taskType = this.handleTaskType(task)
        const delayed = this.taskIsDelayed(task)
        const finishedTask = (task.state === 'done')
        let taskOutput = null
        try {
          const output = JSON.parse(task.output)
          taskOutput = output.value
        } catch (error) {
          taskOutput = null
        }
        return { ...task, taskType, delayed, finishedTask, taskOutput }
      })
      return dataArray
    },
    handleTaskType(task) {
      const { type } = task

      if (!type?.extra) return 'default'

      const { modal, internal } = JSON.parse(type?.extra)

      if (internal) return 'internal'

      const modalToType = {
        mail: 'mail',
        call: 'call',
        chat: 'chat',
        meeting: 'meeting',
      }
      return modalToType[modal] || 'default'
    },
    taskIsDelayed(task) {
      if (task.state !== 'created') {
        return false
      }
      const scheduledTo = this.$moment(`${task.scheduled_to}Z`)
      const isDelayed = !this.$moment(scheduledTo).isAfter(new Date(), 'minute')
      return isDelayed
    },
    formatDatetime(task) {
      const now = new Date()
      const scheduledTo = this.$moment(`${task.scheduled_to}Z`)
      if (scheduledTo.isSame(now, 'day') && !task.delayed) {
        if (scheduledTo.minute()) {
          return scheduledTo.format('[Hoje às] HH[h]mm')
        }
        return scheduledTo.format('[Hoje às] HH[h]')
      }
      if (scheduledTo.minute()) {
        return scheduledTo.format('DD/MM/YYYY [às] HH[h]mm')
      }
      return scheduledTo.format('DD/MM/YYYY [às] HH[h]')
    },
    redirectToOpportunity(opportunityId) {
      const { params, query } = this.$route
      this.$router.push({ name: 'business-opportunity-item-id', params: { id: opportunityId, item: 'item', ...params }, query })
    },
    redirectToContact(contactId) {
      const { params, query } = this.$route
      this.$router.push({ name: 'contact-index-id', params: { id: contactId, ...params }, query })
    },
  }
}
</script>

<style scoped lang="scss">
.list-group {
  height: 100%;
}
.task-card {
  border: 1px solid var(--v-stroke-lighten5);
  border-radius: 4px;
}
.delayed-task-card {
  border: 1px solid var(--v-error-base) !important;
  border-radius: 4px;
}
.task-card:hover, .delayed-task-card:hover {
  background-color: var(--v-shape-lighten2);
}
.list-group-item {
  background: var(--v-shape-lighten1);
  position: relative;
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
.left-field-border {
  border-top: 1px solid var(--v-stroke-lighten5);
  border-right: 1px solid var(--v-stroke-lighten5);
}
.right-field-border {
  border-top: 1px solid var(--v-stroke-lighten5);
}
</style>
