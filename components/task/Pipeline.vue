<template>
	<div>
    <TaskCustomFilters
      pipeline-type="task"
      @onFilterChange="applyFilter"
      @onFilterOpen="(value) => { filterOpen = value }"
    />
    <v-row v-if="noTasksAlert && !filterOpen">
      <v-col class="mx-0 px-1">
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
                  @click="noTasksAlert = false"
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
			v-if="taskStages.length > 0"
			class="flex-nowrap dragscroll-config"
			v-dragscroll:nochilddrag
		>
			<v-col
				v-for="stage in taskStages"
				:key="stage.value"
				data-dragscroll
        :cols="mq_column"
        class="px-1 pb-0"
			>
        <v-sheet class="pt-1 pipeline-header-border">
          <v-divider class="pb-1 mx-2 pipeline-header-divider" :class="stage.color"></v-divider>
          <section class="d-flex justify-space-between pa-2">
            <span class="font-body-medium font-weight-bold">{{stage.name}}</span>
            <div>
              <span class="body-3 sub-text--text">{{`${stage.total} tarefas`}}</span>
              <PipelineSorter
                :initial-value="stage.sort"
                :sorter="sorter"
                @onSort="(sorter) => { handleSort(sorter, stage) }"
              />
            </div>
          </section>
          <v-divider></v-divider>
        </v-sheet>
        <template>
          <v-card
            @scroll="handleScroll($event, stage.pos, stage.id)"
            class="pipeline-card-control pt-1 pipeline-border"
            elevation="0"
          >
            <TaskItem
              :task-list="stage.tasks"
              :stageValue="stage.value"
              :total="stage.total"
            />
            <v-progress-linear
              :indeterminate="isUpdatingPage  && isUpdatingStage == stage.id ? true : false"
              :color="isUpdatingPage  && isUpdatingStage == stage.id ? 'primary' : 'transparent'"
            ></v-progress-linear>
          </v-card>
        </template>
			</v-col>
		</v-row>
	</div>
</template>

<script>
import { dragscroll } from 'vue-dragscroll'
import { mapGetters } from 'vuex'
export default {
  props: {
    taskView: String
  },
  data: () => ({
    apiConfig: {
      query:
        'limit=20&' + 
        'includes=assigned_to,type.media_type,opportunity.company,team,contact&' +
        'load_only=scheduled_to,priority,state,output,contact_id,opportunity_id,' +
        'contact.name,assigned_to.name,type.name,type.extra,type.media_type.name,opportunity.company.name&' +
        'includesInactive=true',
      url: '/cash/task'
    },
    teste: [],
    taskStages: [],
    noFilteredTasks: null,
    pipelineId: 2,
    queryFilters: [],
    dataLoading: false,
    directives: {
      dragscroll
    },
    stages: [
      { name: 'Não iniciada', value: 'created', color: 'grey lighten-3', pos: 0, page: 0, sort: 'created_at_desc' },
      { name: 'Em execução', value: 'active', color: 'blue lighten-3', pos: 1, page: 0, sort: 'created_at_desc' },
      { name: 'Em espera', value: 'wait', color: 'orange', pos: 2, page: 0, sort: 'created_at_desc' },
      { name: 'Concluída', value: 'done', color: 'green', pos: 3, page: 0, sort: 'created_at_desc' },
    ],
    sorter: [
      { label: 'Data de criação', value: 'created_at', type: 'asc', icon: 'task', date: true },
      { label: 'Data de criação', value: 'created_at_desc', type: 'desc', icon: 'task', date: true },
      { label: 'Data de agendamento', value: 'scheduled_to', type: 'asc', icon: 'calendar_month', date: true },
      { label: 'Data de agendamento', value: 'scheduled_to_desc', type: 'desc', icon: 'calendar_month', date: true },
      { label: 'Prioridade', value: 'priority(low,medium,high)', type: 'asc', icon: 'priority_high' },
      { label: 'Prioridade', value: 'priority(high,medium,low)', type: 'desc', icon: 'priority_high' },
    ],
    isUpdatingStage: null,
    isUpdatingPage: false,
    noTasksAlert: false,
    filterOpen: false,
  }),
  computed: {
    ...mapGetters({ 
      assignedTasks: 'Task/list', 
      assignedTasks_api: 'Task/assignedTasks_api', 
      pipelines: 'pipelines', 
      meta: 'meta',
      preferences: 'Profile/preferences',
      preference: 'Profile/preference',
      userInfo: 'userInfo',
    }),
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
      default:
        return ''
      }
    },
  },
  created() {
    this.getPipelinePreference()
  },
  async mounted() {
    await this.$store.dispatch('fetchPipelines')
  },
  watch: {
    assignedTasks_api(newValue) {
      if (newValue.dataUpdate) {
        this.getTasks(this.stages)
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: false })
      }
    },
    taskView(newValue) {
      if (newValue == 'my-tasks') {
        this.apiConfig.url = '/cash/my-tasks'
      } else {
        this.apiConfig.url = '/cash/task'
      }
    },
    'apiConfig.url': function (newValue) {
      if (newValue) {
        this.taskStages = []
        this.getTasks(this.stages)
      }
    },
    taskStages(newValue) {
      const hasNoTasks = newValue.every(stage => stage.tasks.length === 0)
      if (hasNoTasks) {
        this.noTasksAlert = true
      } else {
        this.noTasksAlert = false
      }
      const total = newValue.reduce((sumTask, stage) => sumTask + stage.total, 0)
      this.$store.commit('Task/ASSIGNED_TASKS_API', { total })
    },
    queryFilters() {
      this.getTasks(this.stages)
    },
  },
  methods: {
    calcDate() {
      let currentDate = new Date()
      currentDate.setDate(currentDate.getDate() - 10)

      let dd = String(currentDate.getDate()).padStart(2, '0')
      let mm = String(currentDate.getMonth() + 1).padStart(2, '0')
      let yyyy = currentDate.getFullYear()

      return `${yyyy}-${mm}-${dd}`
    },
    sumTask(value) {
      return this.assignedTasks.filter(task => task.state === value).length
    },
    async getTasks(taskState) {
      this.dataLoading = true
      const filters = this.queryFilters.join('&')
      const promises = []
      for (const state of taskState) {
        promises.push(this.getTasksByStage(
          state,
          `state=${state.value}&${this.apiConfig.query}${filters ? `&${filters}` : ''}&page=${state.page}${state.sort ? `&order=${state.sort}` : ''}`)
        )
      }

      this.taskStages = await Promise.all(promises)
      this.dataLoading = false
    },
    async getTasksByStage(state, query) {
      const { name, value, pos, page, color, sort } = state
      const { data, hasNext, total } = await this.getList(this.apiConfig.url, query)

      const taskStage = { name, value, hasNext, total, pos, page, color, sort, tasks: data }

      return taskStage
    },
    async getNextTasks(state) {
      const filters = this.queryFilters.join('&')
      const { tasks, hasNext } = await this.getTasksByStage(
        state,
        `state=${state.value}&${this.apiConfig.query}${filters ? `&${filters}` : ''}&page=${state.page}${state.sort ? `&order=${state.sort}` : ''}`
      )
      return {
        tasks: [...state.tasks, ...tasks],
        hasNext
      }
    },
    async handleScroll({ target: { scrollTop, clientHeight, scrollHeight }}, pos, stageId) {
      var roundScrollTop = Math.ceil(scrollTop)
      if ((roundScrollTop + clientHeight + 10) >= scrollHeight) {
        if (this.taskStages[pos].hasNext && !this.isUpdatingPage) {
          this.isUpdatingStage = stageId
          this.isUpdatingPage = true
          this.taskStages[pos].page += 1
          const { tasks, hasNext } = await this.getNextTasks(this.taskStages[pos])
          this.taskStages[pos].tasks = tasks
          this.taskStages[pos].hasNext = hasNext
          this.isUpdatingStage = null
          this.isUpdatingPage = false
        }
      }
    },
    applyFilter(filters) {
      this.queryFilters = filters
    },
    async handleSort(sorter, state) {      
      state.page = 0
      state.sort = sorter.value
      this.setPipelinePreference(sorter, state)
      this.stages[state.pos].sort = sorter.value
      const filters = this.queryFilters.join('&')
      const { tasks = [], hasNext } = await this.getTasksByStage(
        state,
        `state=${state.value}&${this.apiConfig.query}${filters ? `&${filters}` : ''}&page=${state.page}${state.sort ? `&order=${state.sort}` : ''}`
      )
      this.taskStages[state.pos].tasks = tasks
      this.taskStages[state.pos].hasNext = hasNext
    },
    getPipelinePreference() {
      const taskPipeline = this.preference('task_pipeline')
      if (taskPipeline) {
        this.stages = this.stages.map((stage) => {
          const stageSort = taskPipeline[stage.value]?.sort
          if (stageSort) {
            stage.sort = stageSort
          }
          return stage
        })
      }
    },
    async setPipelinePreference(sorter, state) {
      const taskPipeline = this.preference('task_pipeline') 
      if (taskPipeline) {
        if (taskPipeline[state.value]) {
          taskPipeline[state.value].sort = sorter.value
        }
      }
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          'task_pipeline': {
            [state.value]: {
              sort: sorter.value
            },
            ...taskPipeline,
          }
        }
      }
      await this.updateData('/ecosystem/set-user-profile-preferences', payload, { fireSuccessAlert: false })
      await this.$getMyProfile()
    },
  }
}
</script>

<style scoped lang="scss">
.pipeline-card-control {
  @include thin-scrollbar;
  height: 67vh;
  overflow: auto;
}
.block-label {
	width: 10px;
	height: 10px;
	border-radius: 2px;
}
.subtitle-2 {
  font-size: 13px !important;
}
.dragscroll-config {
	overflow: hidden;
}
.step-pipeline {
	height: 3px;
}
.pipeline-header-border {
	border-radius: 4px 4px 0px 0px;
}
.pipeline-border {
	border-radius: 0px 0px 4px 4px;
}
.pipeline-header-divider {
  border-radius: 4px;
}
</style>
