<template>
  <div>
    <v-tabs
      grow
      icons-and-text
      hide-slider
      height="36"
      active-class="v-tab-secondary-active"
      class="mb-2 text-capitalize"
      v-model="tab"
    >
      <v-tab
        v-for="taskTab in taskTabs"
        active-class="v-tab-secondary-active"
        class="d-flex flex-row v-tab-secondary mx-1 text-none"
        :key="taskTab.value"
      >
        <template v-slot:default>
          <v-icon v-if="taskTab.icon != 'approval_delegation'" class="material-icons-outlined my-0 mr-2">
            {{ taskTab.icon }}
          </v-icon>
          <ApprovalDelegationIcon
            v-else
            width="24"
            height="24"
            :fill="tab === 4 ? 'primary' : 'default-text'"
            class="mr-2"
          />
          {{ taskTab.title }}
        </template>
      </v-tab>
    </v-tabs>

      <v-tabs-items v-model="tab">
        <v-tab-item
          href="#tab-1"
        >
          <OpportunityTasks ref="tasks" :opportunity-id="opportunityId" />
        </v-tab-item>
        <v-tab-item
          href="#tab-2"
        >
          <OpportunityTaskFormTab
            ref="register"
            :payload-data="this.payloadData"
            :opportunity-id="opportunityId"
            @changeTo="changeToTab"
          />
        </v-tab-item>
        <v-tab-item
          href="#tab-3"
        >
          <OpportunityTaskExecute ref="execute" :opportunity-id="opportunityId" />
        </v-tab-item>
        <v-tab-item
          href="#tab-4"
        >
          <OpportunityTaskFormTab
            scheduling
            ref="schedule"
            :payload-data="this.payloadData"
            :opportunity-id="opportunityId"
            @changeTo="changeToTab"
          />
        </v-tab-item>
        <v-tab-item
          href="#tab-4"
        >
          <OpportunityTaskRequestSupport
            ref="support"
            :opportunity-id="opportunityId"
          />
        </v-tab-item>
      </v-tabs-items>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    opportunityId: { type: [Number, String] }
  },
  data: () => ({
    tab: 0,
    payloadData: null,
    taskTabs: [
      { title: 'Todas as tarefas', icon: 'history', value: 'tasks'},
      { title: 'Registrar tarefa', icon: 'edit_note', value: 'register'},
      { title: 'Realizar tarefa', icon: 'assignment', value: 'execute'},
      { title: 'Agendar tarefa', icon: 'calendar_month', value: 'schedule'}
    ]
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    })
  },
  watch: {
    tab(newValue) {
      switch (newValue) {
      case 0:
        this.$refs['tasks'].getData()
        break
      case 2:
        this.$refs['execute'] && this.$refs['execute'].initialSettings()
        break
      default:
        break
      }
    }
  },
  async mounted() {
    var result = false
    const myTeams = this.getMyTeams()
    if(myTeams) {
      const { data } = await this.getList('/csc/get-eligible-team', `includes=type&team_id=${myTeams}`)
      data.forEach(el => {
        if(el?.type?.type == 'support') {
          result = true
        }
      })
      if(result) {
        this.taskTabs.push({ title: 'Solicitar apoio', icon: 'approval_delegation', value: 'support'})
      }
    }
  },
  methods: {
    getMyTeams() {
      let teams = []
      try {
        let uinfo = JSON.parse(localStorage.userInfo)
        if (uinfo.capabilities) {
          for (let cap of uinfo.capabilities) {
            teams.push(cap?.team_id)
          }
        }
      }
      catch(e) {
        console.log('Error parsing user info')
        console.log(e)
      }
      return teams
    },
    changeToTab(payload) {
      this.payloadData = payload.data
      this.tab = payload.tab
      switch (payload.tab) {
      case 3:
        this.$refs['schedule'].handlePayloadData(this.payloadData)
        break
      case 1:
        this.$refs['register'].handlePayloadData(this.payloadData)
        break
      default:
        break
      }
    },
    onTabChange() {
    }
  }
}
</script>

<style scoped>
  .icon-approval-delegation {
    width: 25px;
    margin-top: 1px;
  }
</style>
