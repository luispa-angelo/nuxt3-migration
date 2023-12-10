<template>
  <v-card
    flat
    style="border: none !important;"
  >
    <v-card-text class="pl-1">
      <v-row>
        <v-col cols="10" xl="10" lg="10">
          <div v-if="!toggleVisualization" class="d-flex justify-space-between ml-7">
            <div>
              <v-chip
                v-for="state, index in taskStateFilters"
                class="mr-2 mb-2"
                color="primary"
                :outlined="!state.active"
                :key="index"
                @click="setTaskStateFilter(index)"
              >
                {{state.name}}
              </v-chip>
            </div>
          </div>
        </v-col>
        <v-col cols="2" xl="2" lg="2" class="d-flex align-center justify-end">
          <div class="mr-2">
            <OpportunityTaskTimelineFilters @applyFilters="handleFilters" />
          </div>
          <div class="mr-2">
            <ToggleGroupButtons v-model="toggleVisualization" :buttons="toggleButtons"/>
          </div>
        </v-col>
      </v-row>
      <v-row class="py-0">
        <OpportunityTaskTimeline
          v-show="!toggleVisualization"
          :tasks="tasks"
          :has-filters="hasFiltersApplied"
          @onScroll="handleScroll"
        />
        <OpportunityTaskList
          v-if="toggleVisualization"
          :opportunity-id="opportunityId"
        />
        <!-- <OpportunityTaskTimeline :tasks="completedTasks" timeline-label="Concluídas" /> -->
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    opportunityId: { type: [Number, String] }
  },
  data: () => ({
    url: 'cash/task',
    defaultQuery: 'order=scheduled_to_desc&includesInactive=true&translateEnums=true&includes=type.media_type,contact,media,assigned_to',
    tasks: [],
    completedTasks: [],
    activeTasks: [],
    taskStateFilters: [],
    filters: null,
    hasNextTasks: false,
    page: 0,
    isLoading: false,
    toggleVisualization: 0,
    toggleButtons: [
      { icon: 'mdi-timeline-text-outline', description: 'Linha do tempo' },
      { icon: 'view_list', description: 'Lista' }
    ]
  }),
  computed: {
    ...mapGetters({
      meta: 'meta',
      taskRefresh: 'Task/refreshData',
    }),
    query: function() {
      const query = [this.defaultQuery, `opportunity_id=${this.opportunityId}`, this.filters, this.activeStateFilters]
      return query.filter((value) => value).join('&')
    },
    activeStateFilters: function() {
      let customQuery = null
      const activeFilters = this.taskStateFilters.filter((filter) => filter.active && !filter.custom)
      const activeCustomFilters = this.taskStateFilters.filter((filter) => filter.active && filter.custom)   
      const stateQuery =  activeFilters.length > 0 ? `state=in(${activeFilters.map((filter) => filter.value).join()})` : null
      if (activeCustomFilters.length > 0) {
        if (!activeFilters.some((filter) => filter.value === 'created')) {
          activeFilters.push({ value: 'created' })
        }
        customQuery = `state=in(${activeFilters.map((filter) => filter.value).join()})&${activeCustomFilters.map((filter) => filter.value).join(',')}`
      } else {
        customQuery =  stateQuery
      }
      if (!stateQuery && !customQuery) {
        return null
      }
      return customQuery
    },
    hasFiltersApplied: function() {
      if (this.filters || this.activeStateFilters) {
        return true
      }
      return false
    }
  },
  watch: {
    query() {
      this.page = 0
      this.getData()
    },
    taskRefresh(newValue) {
      if (newValue && !this.toggleVisualization) {
        this.getData()
        this.$store.dispatch('Task/refresh', false)
      }
    },
    toggleVisualization(newValue) {
      if (!newValue) {
        this.getData()
      }
    },
    page(newValue) {
      if (newValue) {
        this.getNextPageData(newValue)
      }
    },
    'meta.taskState': function() {
      this.generateTaskStateFilter()
    }
  },
  mounted() {
    this.initialSettings()
  },
  methods: {
    initialSettings() {
      this.generateTaskStateFilter()
      this.getData()
    },
    async getData() {
      if (!this.toggleVisualization) {
        this.page = 0
        const { data, hasNext } = await this.getList(this.url, `${this.query}`)
        this.tasks = data
        this.hasNextTasks = hasNext
      }
    },
    async getNextPageData(page) {
      const { data, hasNext } = await this.getList(this.url, `${this.query}&page=${page}`)
      this.tasks = [...this.tasks, ...data]
      this.hasNextTasks = hasNext
    },
    setTaskStateFilter(selectedIndex) {
      this.taskStateFilters.forEach((state, index) => {
        if (index !== selectedIndex) {
          this.taskStateFilters[index].active = false
        }
      })
      if (this.taskStateFilters[selectedIndex].name === 'Atrasada') {
        this.taskStateFilters[selectedIndex].value = `scheduled_to=lt(${this.$moment.utc(new Date()).format('YYYY-MM-DDTHH:mm:ss')})`
      }
      this.taskStateFilters[selectedIndex].active = !this.taskStateFilters[selectedIndex].active
    },
    handleFilters(filters) {
      this.filters = filters
    },
    async handleScroll(target) {
      const { scrollTop, clientHeight, scrollHeight } = target
      const roundScrollTop = Math.round(scrollTop)
      if ((roundScrollTop + clientHeight) >= scrollHeight) {
        if (this.hasNextTasks) {
          this.page += 1
        }
      }
    },
    generateTaskStateFilter() {
      const customStates = [
        {
          name: 'Próximos passos',
          value: '',
          active: false,
          custom: true
        },
        {
          name: 'Atrasada',
          value: '',
          active: false,
          custom: true
        },
      ]
      const taskStateFilters = this.meta.taskState.filter((state) => state.value !== 'postponed').map((state) => ({
        ...state,
        active: false,
        custom: false
      }))
      this.taskStateFilters = [...customStates, ...taskStateFilters]
    }
  }
}
</script>

<style>

</style>