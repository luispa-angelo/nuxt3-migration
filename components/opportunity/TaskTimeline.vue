<template>
  <v-container class="mt-1 v-timeline-scroll" @scroll="handleScroll($event)">
    <v-timeline
      v-if="hasTasks(tasks)"
      dense
      align-top
    >
      <v-timeline-item
        v-if="timelineLabel"
        hide-dot
        class="text-center mb-4"
      >
        <v-chip outlined>{{timelineLabel}}</v-chip>
      </v-timeline-item>
      <v-timeline-item
        v-for="task in tasks"
        :key="task.id"
        fill-dot
        right
        :icon="tasksIcons[handleTaskType(task)] ? tasksIcons[handleTaskType(task)].icon : 'description'"
        :color="tasksIcons[handleTaskType(task)] ? tasksIcons[handleTaskType(task)].color : 'primary'"
        :icon-color="tasksIcons[handleTaskType(task)] ? tasksIcons[handleTaskType(task)].iconColor : null"
      >
        <template v-slot:icon>
          <InternalTaskIcon v-if="handleTaskType(task) === 'internal'" width="19" height="19" class="ml-1" :fill="tasksIcons[handleTaskType(task)].iconColor" />
          <MeetingTaskIcon v-else-if="handleTaskType(task) === 'meeting'" class="mr-1" width="30" height="16" :fill="tasksIcons[handleTaskType(task)].iconColor" />
          <v-icon v-else class="material-icons-outlined" :color="tasksIcons[handleTaskType(task)].iconColor">
            {{tasksIcons[handleTaskType(task)].icon}}
          </v-icon>
        </template>
        <OpportunityTaskTimelineItem ref="timelineItem" :task="task" />
      </v-timeline-item>
    </v-timeline>
    <v-row v-else>
      <v-col class="text-center">
        <img class="mt-10" src="~/static/timeline-empty.png" alt="">
        <p v-if="hasFilters">A oportunidade não possui tarefas para o filtro selecionado</p>
        <p v-else>
          <span class="font-weight-bold">A oportunidade ainda não possui tarefas</span>
          <br>
          Utilize as abas acima para para registrar, realizar ou agendar tarefas
        </p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    hasFilters: { type: Boolean, default: false },
    timelineLabel: { type: String, default: '' },
    tasks: {
      type: Array,
      default: function() {
        return []
      }},
  },
  data: () => ({
    tasksIcons: {
      'mail': { icon: 'mail_outline', color: 'email-icon-bg', iconColor: 'email-icon-text'},
      'call': { icon: 'phone', color: 'phone-icon-bg', iconColor: 'phone-icon-text'},
      'chat': { icon: 'mdi-whatsapp', color: 'chat-icon-bg', iconColor: 'chat-icon-text'},
      'meeting': { icon: '', color: 'meeting-icon-bg', iconColor: 'meeting-icon-text'},
      'internal': { icon: '', color: 'internal-icon-bg', iconColor: 'internal-icon-text'},
      'default': { icon: 'pending', color: 'default-icon-bg', iconColor: 'default-icon-text'},
    },
    scrolling: false,
    isOpen: false
  }),
  computed: {
    completedTasks: function() {
      if (this.hasTasks(this.tasks)) {
        return this.tasks.filter((task) => task.state === 'Concluída')
      }
      return []
    },
    activeTasks: function() {
      if (this.hasTasks(this.tasks)) {
        return this.tasks.filter((task) => task.state !== 'Concluída')
      }
      return []
    },
    todayTasks: function() {
      if (this.hasTasks(this.tasks)) {
        return this.tasks.filter((task) => {
          const now = new Date()
          const taskDate = new Date(task.scheduled_to)
          if (now.toDateString() == taskDate.toDateString()) {
            return true
          }
        })
      }
      return []
    },
  },
  methods: {
    hasTasks(tasks) {
      if (tasks.length > 0) {
        return true
      }
      return false
    },
    handleScroll({ target }) {
      this.$refs['timelineItem'].forEach((item, index) => { this.$refs['timelineItem'][index].handleCloseMenu()})
      if (this.isOpen) {
        this.scrolling = !this.scrolling
      }
      this.$emit('onScroll', target)
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
    handleTimelineItemMenu(isOpen) {
      this.isOpen = isOpen
    }
  },
}
</script>

<style scoped>
  .v-timeline-scroll {
    overflow-y: auto;
    height: 485px;
  }
  .v-timeline-scroll-disabled {
    overflow-y: hidden;
    height: 485px;
  }
  * {
    scrollbar-width: auto;
    scrollbar-color: #9e9e9e #c2c2c2;
  }
  *::-webkit-scrollbar {
    width: 5px;
  }
  *::-webkit-scrollbar-track {
    background: #c2c2c2;
    border-radius: 6px;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
    border-radius: 6px;
    border: 3px solid #9e9e9e;
  }
  .v-timeline-item__body > .v-card:not(.v-card--flat):after {
    border: none !important;
  }
  .v-timeline::before {
    top: 55px;
    height: calc(100% - 220px)
  }
</style>