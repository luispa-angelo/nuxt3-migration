<template>
  <v-menu offset-y offset-x left v-model="isOpened" :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-btn 
        fab
        x-small
        color="secondary"
        elevation="1"
        v-bind="attrs"
        v-on="on"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
              Filtrar
            </div>
            `,
          placement: 'bottom-center'
        }"
      >
        <v-icon class="material-icons-round">tune</v-icon>
      </v-btn>
    </template>
    <v-card width="500px" elevation="4">
      <v-card-text class="pt-6 pb-0">
        <div class="d-flex justify-space-between">
          <v-text-field
            outlined
            dense
            label="Data Início"
            type="date"
            color="primary"
            class="mt-2 mx-2"
            v-model="inicialDate"
          ></v-text-field>
          <v-text-field
            outlined
            dense
            label="Data Final"
            type="date"
            color="primary"
            class="mt-2 mx-2"
            v-model="finalDate"
          ></v-text-field>
        </div>
        <div class="control-vertical-space d-flex justify-space-between mb-4">
          <v-container fluid class="mx-2 small-text">
            <span class="font-weight-bold small-text">Tipos de tarefa:</span>
            <v-checkbox
              v-for="(type, i) in taskMediaTypeFilters"
              dense
              hide-details
              class="small-text"
              v-model="taskMediaTypeFilters[i].active"
              :key="type.value"
              :label="type.name"
            ></v-checkbox>
          </v-container>
          <v-container fluid class="mx-2 small-text">
            <span class="font-weight-bold small-text">Prioridades:</span>
            <v-checkbox
              v-for="(type, i) in taskPriorityFilters"
              dense
              hide-details
              v-model="taskPriorityFilters[i].active"
              :disabled="type.disabled"
              :key="type.value"
              :label="type.name"
            ></v-checkbox>
          </v-container>
          <v-container fluid class="mx-2 small-text">
            <span class="font-weight-bold small-text">Outros:</span>
            <!-- <v-checkbox
              dense
              hide-details
              label="Criadas por mim"
              v-model="othersFilters['createdBy']"
            ></v-checkbox> -->
            <v-checkbox
              dense
              hide-details
              label="Atribuídas a mim"
              v-model="othersFilters['assignedTo']"
            ></v-checkbox>
            <!-- <v-checkbox
              dense
              hide-details
              label="Em atraso"
              v-model="othersFilters['delayed']"
            ></v-checkbox> -->
          </v-container>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex flex-row-reverse my-0 px-4">
        <v-btn color="primary" class="px-4 mr-2 mb-2" @click="applyFilters">Filtrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    isOpened: false,
    inicialDate: '',
    finalDate: '',
    contactFilter: null,
    taskMediaTypeFilters: [],
    taskPriorityFilters: [],
    othersFilters: {
      'createdBy': false,
      'assignedTo': false,
      'delayed': false
    }
  }),
  computed: {
    ...mapGetters({ meta: 'meta', userInfo: 'userInfo' })

  },
  watch: {
    // isOpened(newValue) {
    //   if (newValue) {
    //     this.getTaskMediaTypes()
    //   }
    // },
    inicialDate(newValue) {
      if (newValue !== '' && this.finalDate === '') {
        this.finalDate = this.$moment(newValue).add(1, 'days').format('YYYY-MM-DD')
      }
    },
    finalDate(newValue) {
      if (newValue !== '' && this.inicialDate === '') {
        this.inicialDate = this.$moment(newValue).subtract(1, 'days').format('YYYY-MM-DD')
      }
    },
    'meta.taskPriority': function(newValue) {
      this.setTaskPriorityFilters(newValue)
    }
  },
  mounted() {
    this.setTaskMediaTypesFilters()
    this.setTaskPriorityFilters(this.meta.taskPriority)
  },
  methods: {
    applyFilters() {
      const taskMediaTypeFilters = this.generateFilters(this.taskMediaTypeFilters, 'type.media_type.name')
      const taskPriorityFilters = this.generateFilters(this.taskPriorityFilters, 'priority')
      const filters = []
      if (this.inicialDate != '' && this.finalDate != '') {
        const inicialDate = this.$moment.utc(this.$moment(this.inicialDate).startOf('day')).format('YYYY-MM-DDTHH:mm:ss')
        const finalDate = this.$moment.utc(this.$moment(this.finalDate).endOf('day')).format('YYYY-MM-DDTHH:mm:ss')
        filters.push(`scheduled_to=between(${inicialDate},${finalDate})`)
      }
      taskMediaTypeFilters && filters.push(taskMediaTypeFilters)
      taskPriorityFilters && filters.push(taskPriorityFilters)
      // this.othersFilters['createdBy'] && filters.push(``)
      // if (this.othersFilters['delayed']) {
      //   const scheduledTo = this.$moment(`${this.task.scheduled_to}Z`)
      // }
      this.othersFilters['assignedTo'] && filters.push(`assigned_to_id=${this.userInfo.id}`)
      this.$emit('applyFilters', filters.join('&'))
      this.isOpened = false
    },
    async setTaskMediaTypesFilters() {
      try {
        const { data } = await this.getList('/ecosystem/media-type', 'base=in(mail,mobile,other)', null, { throwError: true })
        this.taskMediaTypeFilters = data.map(({ name }) => ({
          name,
          value: name,
          active: true,
        }))
      } catch (error) {
        console.log(error)
      }
    },
    setTaskPriorityFilters(priorities) {
      this.taskPriorityFilters = priorities.map(({ name, value }) => ({
        name,
        value,
        active: true,
      }))
    },
    generateFilters(filters, field) {
      const unmarkedFilters = filters.filter((filter) => !filter.active)
      if (unmarkedFilters.length > 0) {
        return `${field}=not_in(${unmarkedFilters.map((filter) => filter.value).join()})`
      }
      return null
    }
  }
}
</script>

<style scoped>
  .control-vertical-space {
    margin-top: -15px;
  }
  .small-text {
    font-size: 12px;
  }
</style>