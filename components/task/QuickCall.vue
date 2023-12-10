<template>
  <v-dialog v-model="dialog" tabindex="1" max-width="1300" scrollable>
    <template v-if="hasButton" v-slot:activator="{ on, attrs }">
      <v-btn v-if="listButton" v-bind="attrs" v-on="on" text> Abrir </v-btn>
      <v-btn v-else v-bind="attrs" v-on="on" fab :color="timelineButton ? 'secondary' : 'primary'" class="mx-2">
        <v-icon v-if="timelineButton">mdi-chevron-right</v-icon>
        <v-icon v-else>mdi-phone</v-icon>
      </v-btn>
    </template>
    <template v-else-if="taskButton" v-slot:activator="{ on, attrs }">
      <v-btn x-large v-bind="attrs" v-on="on" color="secondary" class="mx-2 pa-8">
        <v-icon class="material-icons-round mr-2">phone</v-icon>
        Efetuar Ligação
      </v-btn>
    </template>
    <v-card>
      <DialogHeader :title="receivedTaskId ? `Tarefa ${mediaType} #${receivedTaskId}` : 'Efetuar ligação'" @onCancel="handleCancel">
        <template v-slot:subtitle>
          <v-chip v-if="formData.state" color="primary" small outlined>{{ getEnum(formData.state, meta.taskState) }}</v-chip>
        </template>
      </DialogHeader>
      <v-card-text class="v-card-text pt-2">
        <v-row>
          <v-col xl="9" lg="9">
            <TabComponent :tab-items="tabItems" class="elevation-0 fill-height">
              <template v-slot:task>
                <v-row class="mt-0">
                  <v-col xl="4" lg="4" class="pt-0">
                    <v-text-field
                      label="Contato"
                      v-model="contact.name"
                      :value="formData.contact_id"
                      outlined
                      dense
                      disabled
                      class="reduce-height"
                    ></v-text-field>
                  </v-col>
                  <v-col xl="4" lg="4" md="4" sm="12" cols="12" class="pt-0">
                    <v-select
                      attach
                      label="Canal de contato"
                      :items="contactMedia"
                      v-model="dialNumber"
                      outlined
                      dense
                      clearable
                      item-text="value"
                      item-value="id"
                      return-object
                    ></v-select>
                  </v-col>
                  <v-col xl="4" lg="4" md="4" sm="12" cols="12" class="pt-0">
                    <v-card outlined max-height="110" elevation="0">
                      <v-row>
                        <v-col xl="8" lg="8">
                          <v-row>
                            <v-col class="d-flex justify-start align-start pl-5">
                              <div class="d-flex align-start justify-center mt-3" :class="changeColorStatus(phoneStatus)">
                                <v-icon :class="changeColorStatus(phoneStatus)" class="ajust-icon mr-1">mdi-clock</v-icon>
                                <div class="text-left">
                                  <p class="counter mb-0">{{ time }}</p>
                                  <p class="mb-0">
                                    {{ translateStatus(phoneStatus) }}
                                  </p>
                                </div>
                              </div>
                            </v-col>
                          </v-row>
                          <v-row>
                            <v-col class="d-flex justify-start align-center pb-4">
                              <v-menu max-width="180" left :offset-x="true" :close-on-content-click="false">
                                <template v-slot:activator="{ on, attrs }">
                                  <v-btn
                                    :disabled="
                                      phoneStatus === 'connected' ||
                                      phoneStatus === 'disconnected' ||
                                      phoneStatus === 'hold' ||
                                      phoneStatus === 'login error'
                                    "
                                    v-bind="attrs"
                                    v-on="on"
                                    x-small
                                    text
                                  >
                                    <v-icon size="25">mdi-view-comfy</v-icon>
                                  </v-btn>
                                </template>
                                <v-card>
                                  <v-card-text class="pt-7">
                                    <v-row>
                                      <v-col class="pt-0">
                                        <v-text-field
                                          solo
                                          dense
                                          readonly
                                          placeholder="Atendimento"
                                          v-model="dialDigit"
                                        ></v-text-field>
                                      </v-col>
                                    </v-row>
                                    <v-row class="ajust-keyboard-row">
                                      <v-col
                                        lg="12"
                                        class="d-flex justify-space-between align-center flex-wrap-reverse pt-0"
                                      >
                                        <v-btn
                                          color="secondary"
                                          v-for="number in listNumber"
                                          :key="number"
                                          @click="appendDialNumber(number)"
                                          x-small
                                          min-height="36"
                                          elevation="1"
                                          width="30%"
                                          class="mb-2"
                                        >
                                          {{ number }}
                                        </v-btn>
                                      </v-col>
                                    </v-row>
                                  </v-card-text>
                                </v-card>
                              </v-menu>
                              <v-btn disabled x-small text>
                                <v-icon size="25">mdi-account-group</v-icon>
                              </v-btn>
                              <v-btn :disabled="phoneStatus !== 'call' || provider !== 'voixtel'"
                                v-if="
                                  phoneStatus === 'unmuted' ||
                                  phoneStatus === 'connected' ||
                                  phoneStatus === 'call' ||
                                  phoneStatus === 'hold' ||
                                  phoneStatus === 'disconnected' ||
                                  phoneStatus === 'login error'
                                "
                                @click="mute()"
                                x-small
                                text
                              >
                                <v-icon size="25">mdi-microphone-off</v-icon>
                              </v-btn>
                              <v-btn
                                v-if="phoneStatus === 'muted' && provider === 'voixtel'"
                                @click="unmute()"
                                x-small
                                text
                              >
                                <v-icon size="25">mdi-microphone</v-icon>
                              </v-btn>
                              <v-btn disabled x-small text>
                                <v-icon size="25">mdi-phone-forward</v-icon>
                              </v-btn>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col xl="4" lg="4" class="d-flex justify-center align-center">
                          <section v-if="phoneStatus === 'call' || phoneStatus === 'muted' || phoneStatus === 'unmuted'">
                            <v-btn max-width="45" min-width="45" text height="30.5" class="mb-4" @click="hold">
                              <v-icon color="amber">mdi-phone-paused</v-icon>
                            </v-btn>
                            <v-btn max-width="45" min-width="45" text height="30.5" @click="drop">
                              <v-icon color="red">mdi-phone-hangup</v-icon>
                            </v-btn>
                          </section>
                          <v-btn
                            max-width="45"
                            min-width="45"
                            text
                            v-else-if="
                              phoneStatus === 'connected' ||
                              phoneStatus === 'disconnected' ||
                              phoneStatus === 'login error'
                            "
                            :disabled="
                              phoneStatus === 'disconnected' ||
                              phoneStatus === 'login error' ||
                              disabled === true
                            "
                            @click="dial"
                          >
                            <v-icon color="success" large>
                              {{ phoneStatus === "connected" ? "mdi-phone" : "mdi-phone-off" }}
                            </v-icon>
                          </v-btn>
                          <v-btn
                            max-width="45"
                            min-width="45"
                            text
                            v-else-if="phoneStatus === 'hold'"
                            @click="unhold()"
                          >
                            <v-icon color="success">mdi-phone-return</v-icon>
                          </v-btn>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
                <TaskQuickCallTemplate
                  @selectedTemplate="getTemplate"
                  @updateContent="updateContentData"
                  :body="bodyData"
                  :dialog="dialog"
                  :task-type="taskType"
                  :template-id="formData.template_id"
                  :disabled="disableTask"
                  :phone-status="phoneStatus"
                />
              </template>
              <template v-slot:opportunity>
                <TaskTabOpportunity
                  :opportunity="opportunity"
                  :opportunity-id="opportunityId"
                  :task-id="taskId"
                />
              </template>
              <template v-slot:history>
                <TaskHistory :task="task" @reloadForm="getTaskData(receivedTaskId)" />
              </template>
            </TabComponent>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col xl="3" lg="3" class="pt-5">
            <NewAutocomplete
              ref="taskAutocomplete"
              outlined
              dense
              return-object
              clearable
              label="Motivo / Tipo de tarefa"
              item-value="id"
              item-text="name"
              endpoint="/cash/task-type"
              query="includes=media_type"
              :disabled="disableTask"
              :filter="callTasks"
              :error="$v.taskType.$error"
              v-model="taskType"
            />
            <v-select
              attach
              label="Atribuído"
              :items="coworkers"
              item-text="name"
              item-value="id"
              :disabled="disableTask"
              outlined
              dense
              v-model="formData.assigned_to_id"
            ></v-select>
            <v-select
              attach
              label="Prioridade"
              :items="priorityList"
              v-model="formData.priority"
              :disabled="disableTask"
              item-text="text"
              item-value="value"
              outlined
              dense
              :error="$v.formData.priority.$error"
            ></v-select>
            <v-text-field
              label="Data de vencimento"
              type="date"
              v-model="date"
              :disabled="disableTask"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              label="Horário"
              type="time"
              v-model="hours"
              :disabled="disableTask"
              outlined
              dense
            ></v-text-field>
            <v-select
              attach
              outlined
              dense
              clearable
              label="Lembrete"
              item-text="text"
              item-value="value"
              class="reduce-height"
              :items="timesSnooze"
              :disabled="snoozeDisabled"
              v-model="reminder"
            ></v-select>
            <v-select
              attach
              dense
              :items="outputs"
              item-value="id"
              item-text="value"
              v-model="formData.output"
              :disabled="disableTask || !taskType"
              :placeholder="outputPlaceholder"
              label="Resultado da tarefa"
              outlined
              clearable
              :error="$v.formData.output.$error"
              :error-messages="$v.formData.output.$error ? 'Esse campo é obrigatório para finalização da tarefa' : ''"
            ></v-select>
            <v-textarea
              label="Descrição/Observação"
              outlined
              dense
              rows="4"
              no-resize
              :disabled="!receivedTaskId"
              v-model="formData.description"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="d-flex justify-space-between">
        <v-col class="d-flex justify-end">
          <v-btn color="secondary" @click="submitForm()">
            {{ receivedTaskId ? 'Editar tarefa' : 'Criar tarefa' }}
          </v-btn>
          <v-btn
            @click="finishTask"
            color="primary"
            class="ml-2"
            :disabled="finishedTask || disableTask"
          >
            Finalizar tarefa
          </v-btn>
        </v-col>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import SoftPhoneApi from '~/assets/js/softphone/softphone.js'

const initialState = () => {
  return {
    dialog: false,
    hasTemplate: true,
    medias: [],
    userContacts: [],
    selected: '',
    taskType: null,
    templates: [],
    template: null,
    task: {},
    output: null,
    outputList: [],
    formData: {
      id: null,
      content: '',
      contact_id: null,
      template_id: null,
      assigned_to_id: null,
      team_id: null,
      opportunity_id: null,
      type_id: null,
      time: null,
      state: 'created',
      description: '',
      reason: '',
      scheduled_to: null,
      reminder_to: null,
      priority: null,
      output: null,
      media_id: null,
    },
    tabItems: [
      { name: 'Tarefa', value: 'task', disabled: false },
      { name: 'Oportunidade', value: 'opportunity', disabled: false },
      { name: 'Histórico', value: 'history' },
    ],
    priorityList: [
      { text: 'Alta', value: 'high' },
      { text: 'Média', value: 'medium' },
      { text: 'Baixa', value: 'low' },
    ],
    timesSnooze: [
      { text: '10 minutos antes', value: 10 },
      { text: '15 minutos antes', value: 15 },
      { text: '20 minutos antes', value: 20 },
      { text: '30 minutos antes', value: 30 },
    ],
    date: null,
    hours: null,
    opportunity: {},
    customer: {
      name: null,
    },
    dateLabel: null,
    contact: {
      phones: [],
      emails: [],
      allMedias: [],
    },
    mediaType: '',
    search: '',
    time: '00:00:00',
    timeBegan: null,
    timeStopped: null,
    stoppedDuration: 0,
    started: null,
    running: false,
    selectedTemplate: null,
    listNumber: ['*', 0, '#', 1, 2, 3, 4, 5, 6, 7, 8, 9],
    currentDate: new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    ).toISOString(),
    outputs: [],
    selectedOutput: null,
    contactMedia: [],
    outputPlaceholder: null,
    taskPlaceholder: null,
    content: null,
    contentList: [],
    sysconfig: null,
    errorMessage: null,
    phone: null,
    phoneStatus: null,
    showDialInput: false,
    dialDigit: null,
    dialNumber: null,
    callStats: null,
    transferDst: null,
    recordsData: null,
    recordKey: null,
    isLogged: null,
    disabled: false,
    check_line: null,
    provider: null,
    reminder: null,
    snoozeDisabled: true,
    endpointTaskLog: '/cash/task-log',
    bodyData: null
  }
}

export default {
  props: {
    opportunityId: { type: [Number, String], default: null },
    taskId: Number,
    title: String,
    listButton: Boolean,
    hasButton: Boolean,
    timelineButton: Boolean,
    openDialog: Boolean,
    taskButton: Boolean,
    isQuickTask: {
      type: Boolean,
      default: false
    }
  },
  // components: {
  //   VuetifyAudio: () => import('vuetify-audio'),
  // },
  data () {
    return initialState()
  },
  validations: {
    output: { required },
    taskType: { required },
    formData: {
      priority: { required },
      output: { required },
    },
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      opportunityProducts: 'Opportunity/opportunityProducts',
      coworkers: 'coworkers',
      meta: 'meta',
      assignedTasks: 'Task/assignedTasks'
    }),
    schedule: function () {
      // if (!this.date && !this.hours) {
      //   return null
      // }
      // const d = new Date(`${this.date} ${this.hours}`)
      // const datetime = `${[d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()].join(
      //   '-'
      // )} ${[d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()].join(':')}`
      // return datetime
      if (!this.date && !this.hours) {
        return null
      }
      const validDate = this.$moment(new Date(`${this.date}T${this.hours}`)).isValid()
      if (!validDate) {
        return null
      }
      const datetime =  this.$moment.utc(new Date(`${this.date}T${this.hours}`))
        .format('YYYY-MM-DDTHH:mm:ss')
      return datetime
    },
    finishedTask: function () {
      if (this.output && this.task.state == 'done') {
        return true
      }
      return false
    },
    disableTask: function () {
      if (this.receivedTaskId && this.formData.state == 'done') {
        return true
      }
      return false
    },
    // eslint-disable-next-line vue/return-in-computed-property
    mq_width() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 650
      case 'sm':
        return 650
      case 'md':
        return 1200
      case 'lg':
        return 1200
      case 'xl':
        return 1200
      }
    },
    receivedTaskId: function () {
      if (this.taskId) {
        return this.taskId
      }
      if (this.formData.id) {
        return this.formData.id
      }
      return null
    },
  },
  watch: {
    taskType(newValue) {
      if(newValue) {
        let outputs = JSON.parse(newValue.outputs)
        this.outputs = outputs.map((el) => {
          return {
            value: el.value,
            id: JSON.stringify(el),
          }
        })
        this.outputList = JSON.parse(newValue.outputs)
        this.formData.type_id = newValue.id
        this.formData.time = newValue.time
        this.getTemplates(newValue)
      }
    },
    'formData.id': async function(newValue) {
      if(newValue) {
        // this.receivedTaskId = newValue
      }
    },
    content: async function(newValue) {
      if(newValue) {
        // alert(newValue)
      }
    },
    taskId(newValue) {
      if(newValue) {
        // this.receivedTaskId = newValue
      }
    },
    async receivedTaskId(newValue) {
      if(newValue) {
        this.getTaskData(newValue)
      }
    },
    openDialog(newValue) {
      this.dialog = newValue
    },
    dialog(newValue) {
      if (newValue) {
        this.snoozeDisabled = true

        this.loadForm(newValue)
        this.loadData()
      } else {
        this.$emit('closeDialog')
      }
    },
    template(newValue) {
      if (newValue) {
        this.formData.template_id = newValue.id
        this.formData.content = newValue.content
      } else {
        this.formData.template_id = null
      }
    },
    search(newValue) {
      this.textFilter(newValue)
    },
    schedule(newValue) {
      if (newValue) {
        var time = this.$moment(this.$moment(`${newValue}Z`).format()).isAfter(
          this.$moment(new Date()).format()
        )
        if (time) {
          this.snoozeDisabled = false
        } else {
          this.snoozeDisabled = true
        }
      }
    },
  },
  methods: {
    async submitForm() {
      if(!this.receivedTaskId) {
        // this.insertBodyContent()
        // if (this.formData.content) {
        //   this.formData.content = JSON.stringify(this.formData.content)
        // }
        await this.createTask()
      }else {
        // this.insertBodyContent()
        if (this.schedule) {
          this.formData.scheduled_to = this.schedule
        }
        // if (this.formData.content) {
        //   this.formData.content = JSON.stringify(this.formData.content)
        // }

        if (this.selectedTemplate) {
          this.formData.template_id = this.selectedTemplate
        }

        if (this.reminder) {
          this.formData.reminder_to = this.$moment(new Date(this.schedule))
            .subtract(this.reminder, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss')
        }
        console.log('form submit', this.formData)
        this.formData.id = this.receivedTaskId
        await this.$store.dispatch('Task/updAssignedTask', this.formData)
        await this.handleRefresh()
      }
    },
    async editContent() {
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.id = this.receivedTaskId
      this.formData.state = 'active'
      await this.$store.dispatch('Task/updAssignedTask', this.formData)
      this.handleCancel()
      await this.handleRefresh()
    },
    convertUTCDateToLocalDate(date) {
      var newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
      var offset = date.getTimezoneOffset() / 60
      var hours = date.getHours()
      newDate.setHours(hours - offset)
      return newDate
    },
    getContactMedias(contact) {
      if (contact.medias.length > 0) {
        this.contact.allMedias = contact.medias.filter(
          (media) =>
            media.media_type.base == 'landline' || media.media_type.base == 'mobile'
        )
      }
      this.contact.name = contact.name
    },
    async getTemplates(taskType) {
      const templates = await this.getList(
        '/cash/template',
        `includes=media_type&media_type.base=${taskType.media_type.base}`
      )
      this.templates = templates.data
    },
    addTemplateContent(template) {
      this.formData.template_id = template.id
    },
    async setTaskType(newValue) {
      let outputs = JSON.parse(newValue.outputs)
      this.outputs = outputs.map((el) => {
        return {
          value: el.value,
          id: JSON.stringify(el),
        }
      })
      this.outputList = JSON.parse(newValue.outputs)
      this.formData.type_id = newValue.id
      this.formData.time = newValue.time
      this.getTemplates(newValue)
    },
    async loadData() {
      this.formData.team_id = this.userTeam
      this.hasTemplate = true
      if (this.opportunityId) {
        this.formData.opportunity_id = this.opportunityId
        this.getOpportunityData(this.opportunityId)
      }
      if (this.taskId || this.receivedTaskId) {
        var itemId = null
        if(this.taskId) {
          itemId = this.taskId
        }else if(this.receivedTaskId) {
          itemId = this.receivedTaskId
        }
        this.getTaskData(itemId)
      }

      if (!this.date && !this.hours) {
        const now = new Date()
        this.date = this.$moment(now).format('YYYY-MM-DD')
        this.hours = this.$moment(now).format('HH:mm')
        // this.date = new Date(`${scheduled_to}Z`).toISOString().split('T')[0]
        // this.hours = new Date(`${scheduled_to}Z`).toLocaleTimeString('pt-BR', {
        //   hour: '2-digit',
        //   minute: '2-digit',
        // })
      }
      await this.$store.dispatch('fetchCoworkers', `team_id=${this.userTeam}`)
    },
    async getOpportunityData(id) {
      this.partner = this.opportunity.partner
      const created = new Date(this.opportunity.created_at)
      this.dateLabel = created.toLocaleDateString()
      this.opportunity = await this.getItem(
        '/cash/opportunity',
        'also=op_log' +
          `&includes=stage,customer,partner,competitors.competitor,tenant,contact.medias.media_type&id=${id}`
      )
      this.customer.name = this.opportunity.customer.name
      if (!this.opportunity.contact) {
        this.$swal({
          icon: 'warning',
          title: 'Sem contato associado',
          text: 'Para realizar uma ligação, cadastre um contato para esta empresa e associe-o à oportunidade.',
        })
        this.dialog = false
      }

      if (!this.taskId) {
        this.contact = {
          name: this.opportunity.contact.name,
          position: this.opportunity.contact.position,
        }
        this.getContactMedias(this.opportunity.contact)
        this.formData.contact_id = this.opportunity.contact.id
      }
    },
    async getTaskData(id) {
      this.task = await this.getItem(
        'cash/task',
        `includes=contact.medias.media_type,assigned_to,logs,type.media_type,opportunity.customer,logs,template,uploads&id=${id}`
      )
      if (!this.opportunityId) {
        this.getOpportunityData(this.task.opportunity_id)
      }
      this.mediaType = this.task.type.media_type.name

      const {
        created_at,
        updated_at,
        type,
        assigned_to,
        contact,
        logs,
        opportunity,
        template,
        media_id,
        scheduled_to,
        reminder_to,
        ...content
      } = this.task
      this.formData = { ...content }
      this.taskType = type
      this.output = JSON.parse(content.output)
      this.bodyData = this.getBodyData(this.task.content)
      // this.bodyData = JSON.parse(this.task.content)?.body
      if(scheduled_to) {
        this.date = this.$moment(`${scheduled_to}Z`).format('YYYY-MM-DD')
        this.hours = this.$moment(`${scheduled_to}Z`).format('HH:mm')
        // this.date = new Date(`${scheduled_to}Z`).toISOString().split('T')[0]
        // this.hours = new Date(`${scheduled_to}Z`).toLocaleTimeString('pt-BR', {
        //   hour: '2-digit',
        //   minute: '2-digit',
        // })
      }
      var reminder = this.$moment(new Date(reminder_to))
      var schedule = this.$moment(new Date(scheduled_to))
      var duration = this.$moment.duration(schedule.diff(reminder)).asMinutes()
      this.reminder = this.timesSnooze.find((snooze) => snooze.value == duration)
      this.contact = {
        name: contact.name,
        position: contact.position,
      }
      this.getContactMedias(contact)
      this.formData.contact_id = contact.id
      this.formData.media_id = media_id
    },
    handleCancel() {
      if(this.phoneStatus == 'call' || this.phoneStatus == 'hold') {
        this.$swal({
          icon: 'warning',
          html: `
            <h6>Atenção!</h6>
            <p>
              Antes de fechar a tarefa, deve-se finalizar a ligação <strong>em andamento</strong>.
            </p>
          `,
          showConfirmButton: false,
          showCloseButton: true,
        })
      }else {
        this.formData.reason = null
        this.taskType = null
        this.formData.priority = null
        this.date = ''
        this.hours = ''
        this.timesSnooze = null
        this.output = null
        this.$v.$reset()
        // this.$refs.taskAutocomplete.clearCachedItems()
        Object.assign(this.$data, initialState())
        this.$emit('closeDialog')
        this.dialog = false
      }
    },
    async finishTask() {
      this.$v.formData.$touch()
      this.$v.taskType.$touch()
      if (this.$v.formData.$error || this.$v.taskType.$error) {
        this.$swal({
          icon: 'warning',
          title: 'Selecione os campos obrigatórios.',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }
      // this.insertBodyContent()
      if (this.selectedTemplate) {
        this.formData.template_id = this.selectedTemplate
      }

      // if (!this.formData.content.body) {
      //   this.formData.content = JSON.stringify(this.formData.content)
      // }
      console.log('form submit', this.formData)
      this.formData.state = 'done'
      await this.updateData('/cash/task', this.formData)
      await this.handleRefresh()

      this.handleCancel()
    },
    callTasks(element) {
      if (!element.media_type) {
        return false
      }
      if (element.extra) {
        const extraType = JSON.parse(element.extra)
        if (extraType !== null && extraType.modal == 'call') {
          return element
        }
      }
      return false
    },
    async loadForm(newValue) {
      if (this.receivedTaskId && newValue) {
        await this.getData(this.receivedTaskId)
      }
      if (!newValue) {
        this.phone.doLogoff()
        this.reset()
      } else {
        await this.getConfig()
      }
      await this.getData(this.receivedTaskId)
    },
    textFilter(text) {
      if (text !== '') {
        this.contentList = this.contentList.filter((item) => {
          const fullText = `${item.assigned_to_name} ${item.title} ${item.content} ${item.createdOn} ${item.content}`
          return fullText.toLowerCase().includes(text.toLowerCase())
        })
      } else {
        this.getData(this.receivedTaskId)
      }
    },
    async getAudioStream(record) {
      this.recordKey = record
      if (this.provider === 'voixtel' && (record !== null || record !== '')) {
        // wait for the record to be ready
        await new Promise((resolve) => {
          setTimeout(resolve, 1000)
        })
        await this.$axios
          .get('/call/call-recording/get-link', { params: { call_id: record } })
          .then((response) => {
            if (response.status === 200) {
              this.recordsData = response.data.data.public_link
            } else {
              this.recordsData = null
            }
          })
      } else {
        this.recordsData = record
      }
    },
    // scrollToEnd() {
    //   setTimeout(() => {
    //     const timelineScroll = document.querySelector('#timeline-scroll')
    //     timelineScroll.scrollTop =
    //       timelineScroll.scrollHeight - timelineScroll.clientHeight
    //   }, 200)
    // },
    async getConfig() {
      let opportunityId = null
      let mediaId = null
      let contactId = null
      const contacts = []
      
      if (this.opportunityId) {
        opportunityId = this.opportunityId
      }
      if (this.receivedTaskId) {
        const task = await this.getItem(
          '/cash/task',
          `includes=contact.medias.media_type&id=${this.receivedTaskId}`
        )
        opportunityId = task.opportunity_id
        if (task.contact) {
          contactId = task.contact.id
          contacts.push(task.contact)
        }
        if (task.media_id) {
          mediaId = task.media_id
        }
        this.getContactMedia(contacts, mediaId)
      } else {
        const { contact } = await this.getItem(
          '/cash/opportunity',
          `includes=contact.medias.media_type&id=${opportunityId}`
        )
  
        if (contact) {
          contactId = contact.id
          if (this.taskId) {
            let dataTak = await this.getItem('/cash/task', `id=${this.taskId}`)
            mediaId = dataTak.media_id
          }
  
          this.userContacts = contacts
          contacts.push(contact)
          this.getContactMedia(contacts, mediaId)
        } else {
          this.$swal({
            icon: 'warning',
            title: 'Sem contato associado',
            text: 'Para realizar uma ligação, cadastre um contato para esta empresa e associe-o à oportunidade.',
          })
          this.dialog = false
        }
      } 

      this.formData.contact_id = contactId
      this.formData.assigned_to_id = this.userInfo.id
      this.formData.team_id = this.userTeam
      this.formData.opportunity_id = opportunityId
			await this.$axios.get('/ecosystem/configuration',
				{
					params: {
						team_id: this.userTeam,
					}
				}).then((data) => {
				this.sysconfig = data.data
				this.loadPhone()
			})
    },
    showCredentialsError() {
      this.$swal({
        icon: 'warning',
        html: `
                  <h6>Atenção!</h6>
                  <p>
                    Credenciais do softphone não cadastradas ou incorretas.
                    <strong>Cadastre suas credenciais</strong> para continuar.
                  </p>
                `,
        showConfirmButton: false,
        showCloseButton: true,
      })
      this.handleCancel()
    },
    loadPhone() {
      let credentials = this.getPhoneCredentials()
      let config = this.sysconfig
      let self = this

      if (!credentials) {
        this.showCredentialsError()
      }

      this.provider = credentials.provider
      this.phone = new SoftPhoneApi(
        config.softPhoneApi,
        credentials.login,
        credentials.password,
        credentials.provider,
        (error) => {
          self.showError(error)
          if (!this.receivedTaskId) {
            if (!credentials.login || !credentials.password) {
              this.showCredentialsError()
            }
          }
        },
        (status) => {
          self.setStatus(status)
        },
        (stats) => {
          self.setStatistics(stats)
        },
        async (record) => {
          await self.setRecord(record)
        }
      )

      this.phone.debugging = true
      this.isLogged = true
    },
    showError(err) {
      this.errorMessage = err
    },
    setStatus(status) {
      if((this.phoneStatus === 'hold' || this.phoneStatus === 'call' || this.phoneStatus === 'dropping') && status === 'connected') {
        if (this.provider !== 'voixtel') this.phone.getRecord()
        setTimeout(() => {
          this.stop()
        }, 2000)
      }
      this.phoneStatus = status
    },
    setStatistics(stats) {
      this.callStats = stats
    },
    async setRecord(record) {
      record && await this.getAudioStream(record)
      const recordFromS3 = this.provider === 'voixtel'
      const islog = true
      const getRecord = true
      const status = 'error'
      const title = 'Ligação - Encerrada'
      await this.includeContent(islog, getRecord, status, title, recordFromS3)
    },
    getPhoneCredentials() {
      let credentials = null
      let sfInfo = null

      if ('userInfo' in localStorage) {
        credentials = JSON.parse(localStorage.userInfo)
      }

      if ('extra' in credentials) {
        let obj = JSON.parse(credentials.extra)
        if (obj && 'softPhone' in obj) {
          sfInfo = obj['softPhone']
        }
      }

      return sfInfo
    },
    async dial() {
      if (!this.receivedTaskId) {
        this.$v.formData.priority.$touch()
        this.$v.taskType.$touch()
        if (this.$v.taskType.$error || this.$v.formData.priority.$error) {
          this.$swal({
            icon: 'warning',
            title: 'Selecione os campos obrigatórios.',
            showConfirmButton: false,
            timer: 1500,
          })
          return
        }
        await this.createTask()
      }

      this.reset()
      this.phone.dial(this.dialNumber.value)

      setTimeout(() => {
        this.start()
      }, 2000)
      if (this.provider === 'voixtel') {
        this.check_line = window.setInterval(async () => {
          await this.check_line_status()
        }, 1000)
      }

      if(this.formData.state == 'created') {
        this.formData.state = 'active'
        await this.updateData('/cash/task', this.formData, { fireSuccessAlert: false })
        this.handleRefresh()
      }

      const islog = true
      const getRecord = false
      const status = 'success'
      const title = 'Ligação - Conectada'
      const media = this.dialNumber.value
      await this.includeContent(islog, getRecord, status, title, media)

      window.onbeforeunload = function () {
        return 'Are you sure you want to leave?'
      }
    },
    appendDialNumber(value) {
      if (this.dialDigit) {
        const oldValue = this.dialDigit
        this.dialDigit = '' + oldValue + value
      } else {
        this.dialDigit = value
      }

      this.phone.dialDigit(value)
    },
    drop() {
      this.phone.drop()
      window.onbeforeunload = function () {
        return null
      }
      setTimeout(() => {
        this.stop()
      }, 2000)
    },
    hold() {
      this.phone.hold()
    },
    unhold() {
      this.phone.unhold()
    },
    mute() {
      this.phone.mute()
    },
    unmute() {
      this.phone.unmute()
    },
    transfer() {
      this.phone.transfer(this.transferDst)
    },
    async check_line_status() {
      if (this.phone) {
        let l = await this.phone.check_line_status()
        if (l == 'available') {
          clearInterval(this.check_line)
          this.check_line = null
        }
      }
      else {
        clearInterval(this.check_line)
      }
    },
    getRecord() {
      setTimeout(() => {
        this.stop()
      }, 2000)
      this.phone.getRecord()
    },
    async getData(itemId) {
      let data = await this.getItem('/cash/task', `id=${itemId}&includes=type`)
      if (data) {
        const { type_id, output, created_at, updated_at, contact_id, ...content } = data
        this.formData = { ...content, id: itemId, output, type_id }
        this.formData.media_id = content.media_id
        // if(data.content) {
        // const parsedContent = JSON.parse(data.content)
        // this.bodyData = parsedContent?.body
        // }
        this.bodyData = this.getBodyData(data.content)
        // this.bodyData = JSON.parse(data.content)?.body
        if(this.formData.state === 'done') {
          this.disabled = true
          this.taskPlaceholder = data?.type?.name
          if (output) this.outputPlaceholder = JSON.parse(output).value
        }
      }
    },
    getTemplate(e) {
      this.selectedTemplate = e.id
    },
    async includeContent(log, record, status, title, recordFromS3, media) {
      const history = JSON.stringify({
        history: {
          phone_called: this.dialNumber,
          is_log: log,
          status: status,
          user_id: this.userInfo.id,
          user_name: this.userInfo.name,
          record_url: record && this.recordsData,
          record_key: recordFromS3 === true && this.recordKey,
          record_from_S3: recordFromS3,
          media: media
        }
      })
      const formData = {
        task_id: this.receivedTaskId && this.receivedTaskId,
        description: title,
        content: history
      }
      await this.createItem(this.endpointTaskLog, formData, { fireSuccessAlert: false })

      if(this.receivedTaskId) {
        await this.getTaskData(this.receivedTaskId)
      }

    },

    async updateContentData(newValue) {
      const contentData = JSON.stringify({ body: newValue, isLog: false })
      // this.contentList = contentData
      this.formData.content = contentData
    },
    // async updateContent(item) {
    //   this.contentList.push(item)
    //   this.formData.content = JSON.stringify(this.contentList)
    //   this.formData.state = 'active'

    //   if (this.formData.id) {
    //     await this.updateData('/cash/task', this.formData, { fireSuccessAlert: false })
    //   }
    // },
    async createTask() {
      this.$v.formData.priority.$touch()
      this.$v.taskType.$touch()
      if (this.$v.formData.priority.$error || this.$v.taskType.$error) {
        this.$swal({
          icon: 'warning',
          title: 'Selecione os campos obrigatórios.',
          showConfirmButton: false,
          timer: 1500,
        })
        return
      }

      if(this.isQuickTask) {
        this.formData.bypass_schedule = true
      }

      if (this.selectedTemplate) {
        this.formData.template_id = this.selectedTemplate
      }
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.media_id = this.dialNumber.id
      this.formData.state = 'active'

      if (this.reminder) {
        this.formData.reminder_to = this.$moment(new Date(this.schedule))
          .subtract(this.reminder, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      }

      const { id } = await this.createItem('/cash/task', this.formData, {
        fireSuccessAlert: false,
      })
      this.formData.id = id
      // this.receivedTaskId = id

      await this.handleRefresh()
    },
    handleRefresh() {
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    getContactMedia(contacts, mediaId) {
      this.contactMedia = []
      let selectedIndex = 0

      for (const contact of contacts) {
        if (contact.medias.length > 0) {
          contact.medias.forEach((media) => {
            if (media.media_type.base == 'mobile' || media.media_type.base == 'landline') {
              media.value = media.value.replace(/[^\w\s]/gi, '')
              media.value = media.value.replace(/\s/g, '')
              this.contactMedia.push({ value: media.value, id: media.id })

              if (media.id == mediaId)
                selectedIndex = this.contactMedia.length-1
            }
          })
        }
      }

      this.dialNumber = this.contactMedia[selectedIndex]
    },
    changeContact() {
      this.dialNumber = this.contactMedia
    },
    start() {
      if (this.running) return

      if (this.timeBegan === null) {
        this.reset()
        this.timeBegan = new Date()
      }

      if (this.timeStopped !== null) {
        this.stoppedDuration += new Date() - this.timeStopped
      }
      this.started = setInterval(this.clockRunning, 10)
      this.running = true
    },
    stop() {
      this.running = false
      this.timeStopped = new Date()
      clearInterval(this.started)
    },
    reset() {
      this.running = false
      clearInterval(this.started)
      this.stoppedDuration = 0
      this.timeBegan = null
      this.timeStopped = null
      this.outputPlaceholder = null
      this.taskPlaceholder = null
      this.time = '00:00:00'
    },
    clockRunning() {
      let currentTime = new Date(),
        timeElapsed = new Date(currentTime - this.timeBegan - this.stoppedDuration),
        hour = timeElapsed.getUTCHours(),
        min = timeElapsed.getUTCMinutes(),
        sec = timeElapsed.getUTCSeconds()

      this.time =
        this.zeroPrefix(hour, 2) +
        ':' +
        this.zeroPrefix(min, 2) +
        ':' +
        this.zeroPrefix(sec, 2) +
        ''
    },
    zeroPrefix(num, digit) {
      let zero = ''
      for (let i = 0; i < digit; i++) {
        zero += '0'
      }
      return (zero + num).slice(-digit)
    },
    timelineIcon(item) {
      if (item.isLog == true) {
        return 'mdi-phone'
      } else {
        return 'mdi-pencil'
      }
    },
    timelineIconColor(item) {
      if (item.statusLog == 'success') {
        return 'success'
      } else if (item.statusLog == 'error') {
        return 'error'
      } else {
        return 'primary'
      }
    },
    changeColorStatus(status) {
      switch (status) {
      case 'connected':
        return ''
      case 'call':
        return 'success--text'
      case 'hold':
        return 'warning--text'
      case 'unhold':
        return 'success--text'
      case 'muted':
        return 'warning--text'
      case 'unmuted':
        return 'success--text'
      case 'disconnected':
        return 'error--text'
      case 'webphone_not_connected':
        return 'error--text'
      case 'login error':
        return 'error--text'
      default:
      }
    },
    translateStatus(status) {
      switch (status) {
      case 'connected':
        return 'Conectado'
      case 'call':
        return 'Em ligação'
      case 'hold':
        return 'Em espera'
      case 'unhold':
        return 'Em ligação'
      case 'muted':
        return 'Silenciado'
      case 'unmuted':
        return 'Em Ligação'
      case 'disconnected':
        return 'Desconectado'
      case 'webphone_not_connected':
        return 'Webphone não conectado'
      case 'login error':
        return 'Erro ao logar'
      default:
      }
    },
    getBodyData(content) {
      let body = ''
      try {
        body = JSON.parse(content)?.body
      } catch (e) {
        return content
      }
      return body
    }
  },
}
</script>

<style scoped>
audio::-webkit-media-controls-panel {
  background-color: transparent;
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
.fix-padding-bar {
  margin-top: 4.6em !important;
  padding-top: 1.5em !important;
}
.mail-body >>> p {
  margin: 2px !important;
}
.mail-body {
  white-space: pre-line !important;
  word-wrap: break-word !important;
}
.v-expansion-panel-header {
  padding: 0 !important;
}
.v-expansion-panel-content__wrap {
  padding: 0 !important;
}
.v-menu-card-text {
  margin-top: -14px;
}
.v-list-item {
  min-height: 45px;
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
.timeline-container {
  height: 320px;
  overflow-y: scroll;
}
.timeline-ajust-margin-left {
  margin-left: -23px;
}
.timeline-avatar {
  margin-top: 2px;
}
.timeline-annotation {
  width: calc(100% - 24px);
  position: absolute;
  bottom: 50px;
  z-index: 5;
}
.v-expansion-panel-header__icon {
  width: 50% !important;
}
.v-card-text {
  min-height: 600px;
}
.ajust-icon {
  margin-top: -3px;
}
.counter {
  font-size: 25px;
}
.relative {
  position: relative;
}
.ajust-keyboard-row {
  margin-top: -23px;
}
.template-area {
  height: 320px;
  border-radius: 0;
  border-width: 1px;
  border-color: #000;
}
</style>
