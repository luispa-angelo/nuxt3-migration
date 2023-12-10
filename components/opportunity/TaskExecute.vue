<template>
  <v-card flat style="border: none !important;">
    <v-card-text>
      <v-row class="d-flex justify-center">
        <v-col class="text-center">
          <p class="text-center">Selecione o tipo de tarefa para realizar o contato pelo CRM.</p>
          <div class="d-flex justify-space-around">
            <TaskModal
              task-button
              prop-channel="call"
              :opportunity="opportunity"
            />
            <TaskModal
              task-button
              prop-channel="mail"
              :opportunity="opportunity"
            />
            <TaskModal
              task-button
              prop-channel="chat"
              :opportunity="opportunity"
            />
          </div>
        </v-col>
      </v-row>
      <v-row>
        <OpportunityTaskTimeline :tasks="tasks" timeline-label="Tarefas do dia" />
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    opportunityId: { type: [Number, String], default: null }
  },
  data: () => ({
    url: 'cash/task',
    defaultQuery: 'translateEnums=true&includes=type.media_type,contact,media,assigned_to',
    tasks: [],
    taskStateFilters: []
  }),
  computed: {
    ...mapGetters({
      meta: 'meta',
      assignedTasks_api: 'Task/assignedTasks_api',
      opportunity: 'Opportunity/opportunity',
    }),
    query: function() {
      const now = new Date()
      const startOfDay = this.$moment(now).startOf('day').format('YYYY-MM-DDTHH:mm:ss')
      const endOfDay = this.$moment(now).endOf('day').format('YYYY-MM-DDTHH:mm:ss')
      return `${this.defaultQuery}&opportunity_id=${this.opportunityId}&scheduled_to=between(${startOfDay},${endOfDay})&state=created&type.media_type.base=in(mobile,landline,mail)`
    },
    oppId: function() {
      return Number(this.opportunityId)
    }
  },
  watch: {
    query() {
      this.getData()
    },
    assignedTasks_api(newValue) {
      if (newValue.dataUpdate) {
        this.initialSettings()
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: false })
      }
    },
  },
  mounted() {
    this.initialSettings()
  },
  methods: {
    initialSettings() {
      this.taskStateFilters = this.meta.taskState.map((state) => ({
        ...state,
        active: false
      }))
      this.getData()
    },
    async getData() {
      const { data } = await this.getList(this.url, this.query)
      this.tasks = data
    },
    setTaskStateFilter(index) {
      this.taskStateFilters[index].active = !this.taskStateFilters[index].active
    }
  }
}
</script>

<style>

</style>