<template>
  <div class="text-center">
    <v-bottom-sheet v-model="sheet" inset scrollable persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          color="secondary"
          class="mx-2"
          style="padding: 18px"
          v-bind="attrs"
          v-on="on"
        >
          <i class="material-symbols-rounded v-icon">edit_calendar</i>
        </v-btn>
      </template>
      <v-card height="90vh">
        <v-app-bar color="shape lighten-1" absolute elevation="1">
          <v-row>
            <v-col class="d-flex align-center py-6">
              <h6 class="bordered-title pl-4">
                Calendário
              </h6>
            </v-col>
            <v-col class="d-flex justify-end align-center py-6">
              <v-btn fab small text @click="closeSheet">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-app-bar>
        <v-card-text class="fix-padding-bar">
          <v-sheet height="50" class="d-flex justify-space-between align-center mb-3 px-0">
            <div class="d-flex align-center flex-nowrap">
              <v-btn
                small
                @click="setToday"
                class="mr-3"
              >
                Hoje
              </v-btn>
              <v-btn
                fab
                text
                small
                @click="prev"
                class="mr-1"
              >
                <v-icon>
                  mdi-chevron-left
                </v-icon>
              </v-btn>
              <v-btn
                fab
                text
                small
                @click="next"
              >
                <v-icon>
                  mdi-chevron-right
                </v-icon>
              </v-btn>
              <v-toolbar-title v-if="$refs.calendar" class="ml-3">
                {{ $refs.calendar.title }}
              </v-toolbar-title>
            </div>
            <div>
              <v-menu bottom right>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    <span>{{ typeToLabel[type] }}</span>
                    <v-icon right>
                      mdi-menu-down
                    </v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="type = 'month'">
                    <v-list-item-title>Mês</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="type = 'week'">
                    <v-list-item-title>Semana</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </v-sheet>
          <v-row class="row-ajust-height">
            <v-col xl="3" lg="4" md="4">
              <v-date-picker
                v-model="focus"
                full-width
                class="rounded-0 mb-3"
                color="blue"
                elevation="1"
                locale="pt-br"
                no-title
                :events="pickerEvents"
                event-color="blue lighten-2"
                ref="picker"
                @click:date="selectDay($event)"
              ></v-date-picker>
              <v-autocomplete
                attach
                label="Verifique os horários..."
                outlined
                dense
                append-icon="mdi-magnify"
                v-model="search"
                :items="users"
                item-text="name"
                item-value="id"
                multiple
                chips
                small-chips
                deletable-chips
              >
                <template v-slot:selection="data">
                  <v-chip
                    :color="findDefaultColor(data.item.id)"
                    
                    outlined
                    close
                    @click:close="removeFromSearch(data.item.id)"
                  >
                      {{ data.item.name }}
                  </v-chip>
                </template>
              </v-autocomplete>
            </v-col>
            <v-col xl="9" lg="8" md="8">
              <v-sheet elevation="1" class="fill-height" style="position: relative;">
                <v-calendar
                  class="container-calendar"
                  ref="calendar"
                  color="blue lighten-2"
                  locale="pt-br"
                  v-model="focus"
                  :type="type"
                  :events="events"
                  :event-margin-bottom="5"
                  :event-color="getEventColor"
                  :first-interval="shiftStart"
                  :interval-count="shiftDuration"
                  @change="getData($event)"
                  @click:more="viewWeek"
                  @click:date="makeAppointment"
                  @click:day="makeAppointment"
                  @click:time="makeAppointment"
                >
                  <template v-slot:event="{event}" >
                    <div
                      v-if="event.type=='slack'"
                      class="text-center px-2"
                      v-tooltip="{
                        content: `
                          <div class='v-btn-tooltip'>
                              <p class='mb-5'>${event.name}</p>
                              <p class='mb-5'>Indisponível de:</p>
                              <p class='mb-5'>${$moment(event.start).format('DD/MM/YYYY')} - ${$moment(event.end).format('DD/MM/YYYY')}</p>
                          </div>
                          `,
                        placement: 'bottom-center'
                      }"
                    >
                      <p class="mb-0">
                        Indisponível
                      </p>
                    </div>
                    <div 
                      v-if="event.type=='task'"
                      class="text-center pb-2 px-2"
                      v-tooltip="{
                        content: `
                          <div class='v-btn-tooltip text-left' style='color: white !important;'>
                              <p class='mb-5'>${event.owner}</p>
                              <p class='mb-5'>${event.team}</p>
                              <p class='mb-5'>${event.opportunityId ? 'Oportunidade ' + event.opportunityId : ''}</p>
                              <p class='mb-5'>${$moment(event.start).format('HH:mm')} - ${$moment(event.end).format('HH:mm')}</p>
                          </div>
                          `,
                        placement: 'bottom-center'
                      }"
                    >
                      <!-- <a :href="`/opportunity/${event.opportunityId}`" class="calendar-link"> -->
                        {{ event.name }}
                      <!-- </a> -->
                    </div>
                  </template>
                </v-calendar>
                <v-dialog v-model="dialog" persistent hide-overlay max-width="650px">
                  <v-card>
                    <v-toolbar
                      class="d-flex justify-end px-1"
                      color="blue-grey lighten-5"
                      dark
                      flat
                      dense
                    >
                      <v-btn
                        fab
                        x-small
                        color="blue-grey lighten-5"
                        elevation="0"
                        @click="closeDialog"
                      >
                        <v-icon color="grey darken-3">mdi-close</v-icon>
                      </v-btn>
                    </v-toolbar>
                    <v-card-text class="py-10">
                      <section class="d-flex justify-start align-center">
                        <v-menu
                          v-model="datePicker"
                          :close-on-content-click="false"
                          max-width="290"
                        >
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              :value="dateFormatted"
                              clearable
                              label="Data selecionada"
                              readonly
                              dense
                              v-bind="attrs"
                              v-on="on"
                              @click:clear="selectedDate = null"
                              prepend-icon="mdi-clock-outline"
                              class="mr-3"
                              style="flex-basis: 90%"
                            ></v-text-field>
                          </template>
                          <v-date-picker
                            v-model="selectedDate"
                            @change="datePicker = false"
                            no-title
                          ></v-date-picker>
                        </v-menu>
                        <v-select
                          attach
                          type="time"
                          label="Inicio"
                          v-model="startHour"
                          :items="hourIntervals"
                          :item-text="hourIntervals"
                          :item-value="hourIntervals"
                          dense
                        ></v-select>
                        <p class="mb-0 mx-2" style="margin-top: -8px">-</p>
                        <v-select
                          attach
                          type="time"
                          label="Final"
                          v-model="endHour"
                          :items="hourIntervals"
                          dense
                        ></v-select>
                      </section>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    dialog: false,
    hourIntervals: [],
    datePicker: false,
    startHour: null,
    endHour: null,
    selectedDate: null,
    counter: 1,
    userId: [],
    isFilter: null,
    search: [],
    start: null,
    end: null,
    pickerEvents: [],
    listTask: [],
    listSlack: [],
    events: [],
    defaultColor: [],
    shiftStart: null,
    shiftDuration: null,
    sheet: false,
    focus: '',
    type: 'week',
    typeToLabel: {
      month: 'Mês',
      week: 'Semana',
      day: 'Dia',
    },
    colors: ['purple lighten-2', 'pink lighten-2', 'teal lighten-2', 'indigo lighten-2', 'green lighten-2', 'light-blue lighten-2', 'light-green lighten-2', 'amber lighten-2', 'brown lighten-2'],
    picker: new Date().toISOString().substr(0, 7),
  }),
  computed: {
    ...mapGetters({
      users: 'User/users',
      assignedTasks: 'assignedTasks',
      userInfo: 'userInfo'
    }),
    dateFormatted() {
      return this.selectedDate ? this.$moment(this.selectedDate).format('dddd, DD [de] MMMM') : ''
    }
  },
  watch: {
    sheet(newValue) {
      if(newValue) {
        this.fetchData()
        this.search.push(this.userInfo.id)
      }else{
        this.search = []
        this.defaultColor = []
        this.pickerEvents
        this.listTask = []
        this.listSlack = []
        this.events = []
      }
    },
    search(newValue) {
      if(newValue) {
        this.getData()
        this.defaultColor.push({
          id: newValue[newValue.length - 1],
          color: this.colors[this.rnd(0, this.colors.length - 1)]
        })
      }
    },
    selectedDate(newValue) {
      if(newValue){
        this.focus = newValue
        this.checkHours(newValue)
      }
    }
  },
  methods: {
    closeDialog() {
      this.dialog = false
    },
    async checkHours(date) {
      const filter = this.search.toString()
      const { data } = await this.$axios.get(`cash/users-slots?user_id=in(${filter})&start=${date}&end=${date}`)
      const [ result ] = Object.values(data)
      result.forEach(el => {
        const startTime = this.parseIn(el.start)
        const endTime = this.parseIn(el.end)
        this.getTimeIntervals(startTime, endTime)
      })
    },
    parseIn(date) {
      const d = new Date()
      d.setHours(date.substring(11,13))
      d.setMinutes(date.substring(14,16))
      return d
    },
    getTimeIntervals(start, end) {
      while(start < end){
        this.hourIntervals.push(start.toTimeString().substring(0,5))
        start.setMinutes(start.getMinutes() + 15)
      }
    },
    makeAppointment({ date }) {
      this.dialog = true
      this.selectedDate = date
    },
    viewWeek ({ date }) {
      this.focus = date
      this.type = 'week'
    },
    selectDay(date) {
      this.setToday(date)
    },
    findDefaultColor(id) {
      const { color } = this.defaultColor.find(el => el.id === id)
      return color
    },
    removeFromSearch(id) {
      const index = this.search.indexOf(id)
      if (index > -1) {
        this.search.splice(index, 1)
      }
    },
    async fetchData() {
      await this.$store.dispatch('User/fetchUsers')
    },
    async getData(event) {
      this.events = []
      if(event){
        this.start = event.start.date
        this.end = event.end.date
      }
      for (const id of this.search) {
        if(id == this.userInfo.id) {
          const { data: { data: { tasks, slacks, shift, user } } } = await this.$axios.get(`cash/user-schedule?start=${this.start}&end=${this.end}&limit=400`)
          this.pushData(tasks, slacks, shift, user, id)
        }else{
          const { data: { data: { tasks, slacks, shift, user } } } = await this.$axios.get(`cash/user-schedule?user_id=${id}&start=${this.start}&end=${this.end}&limit=400`)
          this.pushData(tasks, slacks, shift, user, id)
        }
      }
    },
    async pushData(tasks, slacks, shift, user, id) {
      this.listTask = []
      for(const task of tasks) {
        this.pickerEvents.push(
          this.$moment(task.scheduled_to).format('YYYY-MM-DD')
        )
      }
      const { name, teams } = user.find(item => item.user_id == id)
      if(id == this.userInfo.id) {
        this.listTask = tasks.map(task => ({
          type: 'task',
          owner: name,
          team: teams[0],
          opportunityId: task.opportunity_id,
          name: `Tarefa ${task.id}`,
          start: this.$moment(`${task.scheduled_to}Z`).format('YYYY-MM-DD HH:mm'),
          end: this.$moment(`${task.scheduled_to}Z`).add(task.time, 'minutes').format('YYYY-MM-DD HH:mm'),
          color: this.findDefaultColor(id),
        }))
        this.listSlack = slacks.map(slack => ({
          type: 'slack',
          name: name,
          start: this.$moment(slack.start).format('YYYY-MM-DD'),
          end: this.$moment(slack.end).format('YYYY-MM-DD'),
          color: this.findDefaultColor(id),
        }))
      }else {
        this.listTask = tasks.map(task => ({
          type: 'task',
          owner: name,
          team: teams[0],
          name: 'Ocupado',
          start: this.$moment(`${task.scheduled_to}Z`).format('YYYY-MM-DD HH:mm'),
          end: this.$moment(`${task.scheduled_to}Z`).add(task.time, 'minutes').format('YYYY-MM-DD HH:mm'),
          color: this.findDefaultColor(id),
        }))
        this.listSlack = slacks.map(slack => ({
          type: 'slack',
          name: name,
          start: this.$moment(slack.start).format('YYYY-MM-DD'),
          end: this.$moment(slack.end).format('YYYY-MM-DD'),
          color: this.findDefaultColor(id),
        }))
      }
      
      this.events.push(...this.listTask, ...this.listSlack)
      this.addShift(shift[shift.length - 1].weekdays[0])
    },
    addShift(shift) {
      const start = shift.start
      const end = shift.end
      const timeStart = new Date('01/01/2001 ' + start).getHours()
      const timeEnd = new Date('01/01/2001 ' + end).getHours()
      let hourDiff = timeEnd - timeStart
      this.shiftStart = start.substr(0, 2) - 1
      this.shiftDuration = hourDiff + 2
    },
    async getTaskType(id) {
      const data = await this.getItem('/cash/task', `includes=type&id=${id}`)
      const type = data.type.name
      return type
    },
    setToday (date) {
      if(date) {
        this.focus = date
      }else{
        this.focus = ''
      }
    },
    prev () {
      this.$refs.calendar.prev()
    },
    next () {
      this.$refs.calendar.next()
    },
    getEventColor (event) {
      return event.color
    },
    rnd (a, b) {
      return Math.floor((b - a + 1) * Math.random()) + a
    },
    closeSheet() {
      this.sheet = false
    }
  }
}
</script>

<style scoped>
  * {
    scrollbar-width: auto;
    scrollbar-color: #4f4f4f #0b0b0b;
  }
  *::-webkit-scrollbar {
    width: 10px;
  }
  *::-webkit-scrollbar-track {
    background: #0b0b0b;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #4f4f4f;
    border-radius: 10px;
    border: 3px solid #0b0b0b;
  }
  .v-select.v-input--dense .v-chip {
      margin: 5px !important;
  }
  .row-ajust-height {
    height: calc(100% - 44px);
  }
  .fix-padding-bar {
    margin-top: 4.6em !important;
    padding-top: 1.5em !important;
  }
  .container-calendar {
    max-height: 670px;
  }
  .v-toolbar__content {
    width: 100% !important;
    height: 48px !important;
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
  }
  .calendar-link {
    text-decoration: none;
    color: white;
  }
  .calendar-link:hover {
    text-decoration: underline;
  }
</style>