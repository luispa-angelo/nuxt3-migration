<template>
  <v-dialog v-model="dialog" scrollable max-width="1280" tabindex="1">
    <template v-if="hasButton" v-slot:activator="{ on, attrs }">
      <v-btn v-if="listButton" v-bind="attrs" v-on="on" text> Abrir </v-btn>
      <v-btn v-else v-bind="attrs" v-on="on" fab :color="timelineButton ? 'secondary' : 'primary'" class="mx-2">
        <v-icon v-if="timelineButton">mdi-chevron-right</v-icon>
        <v-icon v-else>mdi-email</v-icon>
      </v-btn>
    </template>
    <template v-else-if="taskButton" v-slot:activator="{ on, attrs }">
      <v-btn x-large v-bind="attrs" v-on="on" color="secondary" class="mx-2 pa-8">
        <v-icon class="material-icons-round mr-2">mail_outline</v-icon>
        Enviar E-mail
      </v-btn>
    </template>
    <v-card height="90vh">
      <v-app-bar color="shape lighten-1" elevation="1" absolute>
        <v-row>
          <v-col class="d-flex align-center py-6 px-5">
            <h6 class="pl-2">
              {{ taskId ? `Tarefa ${mediaType} #${task.id}` : 'Enviar e-mail' }}
            </h6>
            <v-chip class="ml-2" v-if="task.state" color="primary" outlined>{{ getEnum(task.state, meta.taskState) }}</v-chip>
          </v-col>
          <v-col class="d-flex justify-end align-center py-6 px-5">
            <v-btn fab color="secondary" @click="handleCancel">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-app-bar>

      <v-card-text class="px-4 py-1 fill-height fix-padding-bar">
        <v-row class="fill-height">
          <v-col cols="9" class="py-0 fill-height">
            <TabComponent :tab-items="tabItems" class="elevation-0 fill-height"> 
              <template v-slot:task>

                <v-tabs
                  icons-and-text
                  hide-slider
                  height="32"
                  active-class="v-tab-secondary-active"
                  class="mb-2 text-capitalize tabs-border"
                  v-model="taskTab"
                >
                  <v-tab
                    v-for="taskTab in taskTabs"
                    active-class="v-tab-secondary-active"
                    class="d-flex flex-row v-tab-secondary mx-1"
                    :key="taskTab.value"
                  >
                    <v-icon class="material-icons-round my-0 mr-2">{{taskTab.icon}}</v-icon>
                    <span class="text-none font-body-medium">{{taskTab.title}}</span>
                  </v-tab>
                </v-tabs>

                  <v-tabs-items v-model="taskTab">
                    <v-tab-item
                      eager
                      href="#tab-1"
                    >
                      <section class="ma-2">
                        <v-row>
                          <v-col cols="4">
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

                          <v-col cols="4">
                            <v-text-field
                              label="Assunto"
                              v-model="emailContent.subject"
                              :disabled="emailTracking"
                              outlined
                              dense
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-expansion-panels accordion class="mt-3 mb-3 mb-2">
                          <section
                            v-for="(email, index) in emailHistory"
                            :key="index"
                            class="w-100"
                          >
                            <v-expansion-panel
                              v-if="email.contact"
                              class="mb-2"
                              style="border-radius: 10px"
                            >
                              <v-expansion-panel-header
                                class="w-100 d-flex justify-space-between align-center"
                              >
                                <div class="d-flex align-center">
                                  <v-avatar color="shape" class="ml-3" size="29">
                                    {{ `${email.contact[0]}` }}
                                  </v-avatar>
                                  <p class="mb-0 mx-4">{{ `${email.contact}` }}</p>
                                </div>
                                <div class="d-flex flex-row justify-end align-center">
                                  <p class="text-right mb-0 mr-5 caption stroke--text text--darken-3">
                                    {{ `${email.created_at}` }}
                                  </p>
                                  <v-chip
                                    small
                                    :color="
                                      email.description == 'Envio de e-mail' ? '#72B21E' : '#F58319'
                                    "
                                    text-color="#fff"
                                    class="caption d-flex align-center"
                                    >{{
                                      email.description == "Envio de e-mail"
                                        ? "Enviado"
                                        : "Recebido"
                                    }}</v-chip
                                  >
                                  <v-icon
                                    size="20"
                                    color="primary"
                                    class="mx-2"
                                    @click="replyEmail = true"
                                    >mdi-reply</v-icon
                                  >
                                </div>
                              </v-expansion-panel-header>
                              <v-divider class="mx-2"></v-divider>
                              <v-expansion-panel-content>
                                <div
                                  class="d-flex flex-row ml-2"
                                  v-if="!email.isEmailReceived"
                                >
                                  <p>Destinatários:&nbsp;</p>
                                  <p class="stroke--text text--darken-3">{{ `${email.to}` }}</p>
                                </div>
                                <blockquote
                                  class="d-flex flex-column ml-1 mail-body"
                                  v-if="!email.isEmailReceived"
                                  v-html="email.body"
                                ></blockquote>
                                <blockquote
                                  class="d-flex flex-column ml-1 mail-body"
                                  v-else
                                >
                                  <div v-html="email.body"></div>
                                </blockquote>
                                <div class="attachments" v-if="email.attachments">
                                  <v-chip
                                    v-for="attachment in email.attachments"
                                    :key="attachment[0]"
                                    small
                                    text-color="#fff"
                                    color="primary "
                                    class="clickable"
                                    @click="downloadAttachment(attachment[0])"
                                    >{{attachment[1]}}</v-chip>
                                </div>
                              </v-expansion-panel-content>
                            </v-expansion-panel>
                          </section>
                        </v-expansion-panels>
                        <div class="pb-5" v-if="!replyEmail">
                        </div>
                        <div class="pb-1" v-else>
                          <v-divider class="mt-3 mb-3"></v-divider>
                          <v-form ref="mail-form">
                            <v-card elevation="0">
                              <v-card-text>
                                <v-row>
                                  <v-col cols="12" class="">
                                    <Combobox
                                      label="Destinatários"
                                      item-text="value"
                                      item-value="value"
                                      small-chips
                                      clearable
                                      deletable-chips
                                      multiple
                                      hide-details
                                      class="mt-3"
                                      item-color="secondary"
                                      :disabled="emailTracking || finishedTask"
                                      :initial-value="emailContent.contacts"
                                      :items="medias"
                                      :load="dialog"
                                      @valueSelected="
                                        (value) => {
                                          emailContent.contacts = value;
                                        }
                                      "
                                    ></Combobox>
                                  </v-col>
                                </v-row>
                              </v-card-text>
                              <v-card-text class="pt-0">
                                <div class="email-body" heigth="800px">
                                  <VueEditor v-model="emailContent.body" />
                                </div>
                              </v-card-text>
                              <v-card-actions
                                class="d-flex justify-space-between align-center pt-0 mb-1 px-4"
                              >
                                <v-btn-toggle>
                                  <v-menu offset-y :close-on-content-click="false">
                                    <template v-slot:activator="{ on, attrs }">
                                      <v-btn
                                        @click="handleSignature"
                                        :disabled="finishedTask"
                                        fab
                                        icon
                                        small
                                        color=""
                                        v-bind="attrs"
                                        v-on="on"
                                      >
                                        <v-icon>mdi-draw-pen</v-icon>
                                      </v-btn>
                                    </template>
                                    <v-card width="200px" elevation="4">
                                      <v-card-actions class="d-flex flex-column">
                                        <v-btn text @click="applyEmailSignature" :disabled="!signature" block>
                                          Aplicar assinatura
                                        </v-btn>
                                        <ManageVueEditor
                                          title="Editar assinatura"
                                          :text-button="true"
                                          :is-editing="signature ? true : false"
                                          :text-content="signature"
                                          @getContent="createSignature"
                                        ></ManageVueEditor>
                                      </v-card-actions>
                                    </v-card>
                                  </v-menu>
                                  <v-btn :disabled="finishedTask" fab icon small color="" @click="discardEmail">
                                    <v-icon>mdi-delete</v-icon>
                                  </v-btn>
                                </v-btn-toggle>

                                <v-divider style="border-color: #fff"></v-divider>

                                <v-col cols="3">
                                  <Autocomplete
                                    v-if="taskType"
                                    :disabled="finishedTask"
                                    return-object
                                    clearable
                                    outlined
                                    background-color="primary"
                                    label="Template"
                                    dark
                                    class="mt-7 select-icon"
                                    endpoint="/cash/template"
                                    :query="`includes=media_type&media_type.base=${taskType.media_type.base}`"
                                    :load="taskType"
                                    :initial-value="template"
                                    @valueSelected="
                                      (value) => {
                                        template = value;
                                      }
                                    "
                                  ></Autocomplete>
                                </v-col>

                                <v-btn
                                  @click="handleEmail"
                                  :disabled="finishedTask || !taskType || !emailContent.contacts || emailContent.contacts.length == 0"
                                  color="primary"
                                  class="ml-3"
                                  style="height: 40px"
                                >
                                  Enviar
                                </v-btn>

                                <v-btn
                                  @click="replyEmail = false"
                                  :disabled="finishedTask || !emailTracking"
                                  color="secondary"
                                  class="ml-3"
                                  style="height: 40px"
                                >
                                  Cancelar
                                </v-btn>
                              </v-card-actions>
                            </v-card>
                          </v-form>
                        </div>

                      </section>

                    </v-tab-item>
                    <v-tab-item
                      eager
                      href="#tab-2"
                    >
                      <section class="pb-10 ma-2">
                        <span class="font-body-medium">Descreva o que aconteceu no email...</span>
                        <VueEditor
                          placeholder="Digite aqui"
                          v-model="formData.content"
                          :editor-toolbar="customToolbar"
                          style="height: 320px;"
                        />
                      </section>
                    </v-tab-item>
                   
                  </v-tabs-items>

                
              </template>
              <template v-slot:history>
                <TaskHistory :task="task" @reloadForm="getTaskData" @newHistory="createHistory" />
              </template>
              <template v-slot:opportunity>
                <TaskTabOpportunity :opportunity="opportunity" :opportunity-id="opportunityId" :task-id="taskId"/>
              </template>
            </TabComponent>
          </v-col>

          <v-divider vertical></v-divider>

          <v-col cols="3">
            <NewAutocomplete
              ref="taskAutocomplete"
              outlined
              dense
              return-object
              clearable
              label="Motivo / Tipo de tarefa"
              endpoint="/cash/task-type"
              query="includes=media_type"
              item-value="id"
              item-text="name"
              :disabled="emailTracking"
              :filter="emailTasks"
              :load="dialog"
              :initial-value="taskType"
              v-model="taskType"
            />
            <v-text-field
              label="Responsável"
              v-model="task.assigned_to.name"
              v-if="emailTracking"
              outlined
              dense
              disabled
            ></v-text-field>
            <v-select
              attach
              label="Prioridade"
              :items="priorityList"
              v-model="formData.priority"
              :disabled="finishedTask"
              item-text="text"
              item-value="value"
              outlined
              dense
            ></v-select>
            <v-text-field
              label="Data de vencimento"
              type="date"
              v-model="date"
              :disabled="finishedTask"
              outlined
              dense
            ></v-text-field>
            <v-text-field
              label="Horário"
              type="time"
              v-model="hours"
              :disabled="finishedTask"
              outlined
              dense
            ></v-text-field>
            <v-select
              attach
              label="Resultado da tarefa"
              item-text="value"
              v-model="output"
              :items="outputList"
              v-if="taskId"
              outlined
              dense
              return-object
              clearable
              :error="$v.output.$error"
              :error-messages="
                $v.output.$error ? 'Esse campo é obrigatório' : ''
              "
            ></v-select>
            <v-textarea
              label="Descrição/Observação"
              outlined
              dense
              rows="4"
              no-resize
              :disabled="!taskId"
              v-model="formData.description"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="d-flex justify-space-between">
        <v-col>
          <v-btn @click="handleCancel()">Cancelar</v-btn>
        </v-col>
        <v-col class="d-flex justify-end">
          <!-- <v-icon v-if="taskId" color="primary" @click="handleDelete(taskId)" :disabled="finishedTask" class="mr-3">mdi-delete</v-icon> -->
          <v-btn v-if="taskId" color="secondary" @click="submitForm()" :disabled="!taskId">Editar tarefa</v-btn>
          <v-btn
            v-if="taskId"
            @click="finishTask"
            color="primary"
            class="ml-2"
            :disabled="finishedTask"
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

const initialState = () => {
  return {
    dialog: false,
    hasTemplate: true,
    displayCard: false,
    medias: [],
    mediasObjects: [],
    userContacts: [],
    enhancementContacts: [],
    selected: '',
    taskType: null,
    template: null,
    task: {},
    output: null,
    outputList: [],
    replyEmail: true,
    emailHistory: [],
    emailTracking: false,
    signature: null,
    emailContent: {
      contacts: [],
      subject: '',
      body: '',
    },
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
      priority: null,
      media_id: null,
      runtime: null,
    },
    tabItems: [
      { name: 'Tarefa', value: 'task', disabled: false },
      { name: 'Oportunidade', value: 'opportunity', disabled: false },
      { name: 'Histórico', value: 'history', disabled: false },
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
    customer: {},
    productsList: [],
    logs: [],
    eventsLog: [],
    dateLabel: null,
    generalInfo: {},
    company: {},
    contact: {},
    products: [],
    redirectOppTo: 'business-opportunity-item-id',
    mediaType: null,
    taskTab: 0,
    customToolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ 'align': ''},{ 'align': 'justify'}, { 'align': 'right' }],
      ['link'],
    ],
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
  data () {
    return initialState()
  },
  validations: {
    output: { required },
    taskType: { required }
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta',
    }),
    schedule: function() {
      // if(!this.date && !this.time) {
      //   return null
      // } 
      // const d = new Date(`${this.date} ${this.hours}`)
      // const datetime = `${[d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()].join('-')} ${[d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()].join(':')}`
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
    finishedTask: function() {
      if (this.output && this.task.state == 'done') {
        return true
      }
      return false
    },
    taskTabs: function() {
      if (this.taskId) {
        return [
          { title: 'Realizar tarefa', icon: 'assignment', value: 'execute'},
          { title: 'Registrar tarefa', icon: 'edit_note', value: 'register'},
        ]
      }
      return [
        { title: 'Realizar tarefa', icon: 'assignment', value: 'execute'},
      ]
    }
  },
  async mounted() {},
  watch: {
    openDialog(newValue) {
      this.dialog = newValue
    },
    dialog(newValue) {
      if (newValue) {
        this.loadData()
      } else {
        this.$emit('closeDialog')
      }
    },
    template(newValue) {
      if (newValue) {
        this.formData.template_id = newValue.id
        this.emailContent.body ? this.emailContent.body +=newValue.content : this.emailContent.body = (newValue.content) 
      } else {
        this.formData.template_id = null
      }
    },
    taskType(newValue) {
      if (newValue) {
        this.outputList = JSON.parse(newValue.outputs)
        this.formData.type_id = newValue.id
        this.formData.time = newValue.time
      }
    },
    emailHistory(newValue) {
      newValue.length > 0 && (this.emailTracking = true)
    },
    emailTracking(newValue) {
      if (newValue) {
        this.replyEmail = false
        this.template = null
      }
    },
  },
  methods: {
    async submitForm() {
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.id = this.taskId
      this.formData.runtime = this.packEmailData()
      await this.$store.dispatch('Task/updAssignedTask', this.formData)
      await this.handleRefresh()
    },
    getContacts(contacts) {
      this.userContacts = contacts.filter((contact) => contact.origin != 'enhancement')
      this.enhancementContacts = contacts.filter(
        (contact) => contact.origin == 'enhancement'
      )
    },
    getContactMedias(contact) {
      if (contact.medias.length > 0) {
        this.mediasObjects = contact.medias
        this.medias = contact.medias
          .filter((media) => media.media_type.base == 'mail')
          .map((media) => media.value)
      }
      this.contact.name = contact.name
    },
    async loadData() {
      this.formData.team_id = this.userTeam
      this.formData.assigned_to_id = this.userInfo.id
      this.hasTemplate = true
      this.replyEmail = true
      if (this.opportunityId) {
        this.formData.opportunity_id = this.opportunityId
        this.getOpportunityData(this.opportunityId)
      }
      if (this.taskId) {
        this.getTaskData()
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
    },
    async getOpportunityData(id) {
      this.partner = this.opportunity.partner
      const created = new Date(this.opportunity.created_at)
      this.dateLabel = created.toLocaleDateString()
      this.opportunity = await this.getItem(
        '/cash/opportunity',
        'also=tasks,op_log,competitors.competitor' +
        `&includes=stage,products.product,customer,partner,tenant,contact.medias.media_type&id=${id}`
      )
      if (!this.opportunity.contact) {
        this.$swal({
          icon: 'warning',
          title: 'Sem contato associado', 
          text:
            'Para enviar um e-mail, cadastre um contato para esta empresa e associe-o à oportunidade.',
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
    async createHistory() {
      this.$v.taskType.$touch()
      if (this.$v.taskType.$error) return false
      const mediaInContactMedias = this.mediasObjects.find(media => media.value == this.emailContent.contacts)
      const emailMedias = this.mediasObjects.filter(media => media.media_type.base == 'mail')
      if(this.isQuickTask) {
        this.formData.bypass_schedule = true
      }
      if (mediaInContactMedias) {
        this.formData.media_id = mediaInContactMedias.id
      } else if (emailMedias.length) {
        this.formData.media_id = emailMedias[0].id
      }

      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.content = JSON.stringify(this.emailContent)
      this.formData.state = 'active'
      await this.createItem('/cash/task', this.formData)
      await this.handleRefresh()
    },
    async getTaskData() {
      this.task = await this.getItem(
        'cash/task',
        `includes=contact.medias.media_type,assigned_to,logs,type.media_type,opportunity.customer,logs,template,uploads&id=${this.taskId}`
      )
      if (!this.opportunityId) {
        this.getOpportunityData(this.task.opportunity_id)
      }
      this.mediaType = this.task.type.media_type.name
      
      const { created_at, updated_at, type, assigned_to, contact, logs, opportunity, template, media_id,...content } = this.task
      console.log('email task', this.task)
      this.formData = { ...content }
      !this.emailTracking && (this.template = template)

      this.emailHistory = this.generateEmailHistory(logs)
      this.taskType = type
      if (media_id !== null) this.formData.media_id = media_id
      this.output = JSON.parse(content.output)
      this.date = this.$moment(`${content.scheduled_to}Z`).format('YYYY-MM-DD')
      this.hours = this.$moment(`${content.scheduled_to}Z`).format('HH:mm')
      this.contact = {
        name: contact.name,
        position: contact.position,
      }
      this.getContactMedias(this.task.contact)
      this.formData.contact_id = contact.id

      if (this.task.runtime) {
        this.emailContent = JSON.parse(this.task.runtime)
      }
    },
    linkToOpp(id) {
      const { params, query } = this.$route
      this.$router.push({ name: `${this.redirectOppTo}`, params: { ...params, id }, query: { ...query, complement: this.routeComplement } })
    },
    handleCancel() {
      this.replyEmail && this.$refs['mail-form'].reset()
      this.formData.reason = null
      this.emailContent.subject = null
      this.formData.priority = null
      this.date = ''
      this.hours = ''
      this.timesSnooze = null
      this.output = null
      this.discardEmail()
      this.$v.$reset()
      // this.$refs.taskAutocomplete.clearCachedItems()
      Object.assign(this.$data, initialState())
      this.$emit('closeDialog')
      this.dialog = false
    },
    emailTasks(element) {
      if (!element.media_type) {
        return false
      }
      const extraType = element.extra && JSON.parse(element.extra)
      if (extraType !== null && extraType.modal == 'mail') {
        return element
      }
    },
    generateEmailHistory(emails) {
      console.log('emails', emails)
      emails.length > 0 && this.getEmailInfos(emails[0])
      const history = emails.map((email) => {
        const { content, description, created_at, id } = email
        const contentJson = JSON.parse(content)
        const item = {
          id,
          body: '',
          contact: '',
          subject: '',
          to: '',
          description: '',
          created_at: this.$moment(`${created_at}Z`).format('llll'),
          created_at_history: this.$moment(`${created_at}Z`).format('ll'),
        }
        if (description == 'Envio de e-mail') {
          item.description = 'Envio de e-mail'
          item.body = contentJson.body
          item.subject = contentJson.subject
          item.contact = this.task.assigned_to.name
          item.to = this.emailContent.contacts
          item.isEmailReceived = false
          item.attachments = contentJson.attachments
        } else {
          item.body = this.removeEmailChain(contentJson.body) //contentJson.body.replace(/>/g, ' ')
          item.subject = contentJson.subject
          item.contact = contentJson.from
          item.isEmailReceived = true
          item.attachments = contentJson.attachments
        }
        return item
      })
      return history
    },
    getEmailInfos(email) {
      this.emailContent.contacts = []
      const content = JSON.parse(email.content)
      this.emailContent.subject = content.subject
      this.emailContent.contacts.push(content.contact)
    },
    async startEmail() {
      const mediaInContactMedias = this.mediasObjects.find(media => media.value == this.emailContent.contacts)
      const emailMedias = this.mediasObjects.filter(media => media.media_type.base == 'mail')
      if(this.isQuickTask) {
        this.formData.bypass_schedule = true
      }
      if (mediaInContactMedias) {
        this.formData.media_id = mediaInContactMedias.id
      } else if (emailMedias.length) {
        this.formData.media_id = emailMedias[0].id
      }

      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.runtime = JSON.stringify(this.emailContent)
      this.formData.state = 'active'
      await this.createItem('/cash/task', this.formData)
      await this.handleRefresh()
      this.handleCancel()
    },
    packEmailData() {
      const reSubject = 'Re: '
      let subject = `${this.emailTracking ? reSubject : ''}${
        this.emailContent.subject
      }`

      return JSON.stringify({ ...this.emailContent, subject })
    },
    async sendEmail() {
      const payload = {}
      payload.id = this.taskId
      payload.runtime = this.packEmailData()
      payload.state = 'active'
      await this.updateData('/cash/task', payload)
      this.dialog = false
      await this.handleRefresh()
      this.handleCancel()
    },
    handleEmail() {
      this.taskId ? this.sendEmail() : this.startEmail()
    },
    discardEmail() {
      this.emailContent.body = ''
      this.emailTracking && (this.replyEmail = false)
    },
    async finishTask() {
      this.$v.output.$touch()
      if (this.$v.output.$error) return
      const payload = {
        id: this.taskId,
        output: JSON.stringify(this.output),
        state: 'done',
      }
      await this.updateData('/cash/task', payload)
      await this.handleRefresh()
      this.handleCancel()
    },
    applyEmailSignature() {
      const { extra } = this.userInfo
      if (extra) {
        const extraObject = JSON.parse(extra)
        if (extraObject.signature) {
          this.emailContent.body = `${this.emailContent.body} ${extraObject.signature}`
        }
      }
    },
    async createSignature(signature) {
      const { extra, id } = this.userInfo
      const signaturePayload = { id, extra: '' }
      if (extra) {
        signaturePayload.extra = JSON.stringify({ ...JSON.parse(extra), signature })
      } else {
        signaturePayload.extra = JSON.stringify({ signature })
      }
      await this.$store.dispatch('User/updUser', signaturePayload)
      this.signature = signature
      this.updateLocalStorage(signaturePayload.extra)
    },
    async handleSignature() {
      const { extra } = this.userInfo
      if (extra) {
        const extraObject = JSON.parse(extra)
        if (extraObject.signature) {
          this.signature = extraObject.signature
        }
      }
    },
    updateLocalStorage(extra) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const updateExtra = { ...userInfo, extra }
      localStorage.setItem('userInfo', JSON.stringify(updateExtra))
      this.$store.commit('SET_USERINFO', updateExtra)
    },
    handleRefresh() {
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    removeEmailChain(body) {
      if(body) {
        const weekDays = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab']
        for (const day of weekDays) {
          const index = body.indexOf(`Em ${day}.`)
          if (index > 0) {
            return body.substring(0, index)
          }
        }
        const index = body.indexOf('On ')
        if (index > 0) {
          return body.substring(0, index)
        }
        return body
      }
    },
    async downloadAttachment(fileUid) {
      const params = new URLSearchParams({
        task_id: this.taskId,
        uid: fileUid
      })
      await this.$axios.get('/cash/task-upload-by-uid?' + params.toString())
        .then((data) => {
          window.open(data.data.url)
        })

    }
  },
}
</script>

<style scoped>
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
/* .mail-body {
  white-space: pre;
} */
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
.clickable {
  cursor: pointer;
}
.tabs-border {
  border-bottom: solid 1px #F5F5F5;
}
</style>