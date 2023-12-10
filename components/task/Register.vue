<template>
  <v-dialog v-model="dialog" scrollable max-width="1280" tabindex="1">
    <template v-if="hasButton" v-slot:activator="{ on, attrs }">
      <v-btn v-if="listButton" v-bind="attrs" v-on="on" text> Abrir </v-btn>
      <v-btn v-else v-bind="attrs" v-on="on" fab color="secondary" class="mx-2">
        <v-icon v-if="timelineButton">mdi-chevron-right</v-icon>
        <v-icon v-else>mdi-calendar-edit</v-icon>
      </v-btn>
    </template>
    <v-card height="90vh">
      <v-app-bar color="shape lighten-1" elevation="1" absolute>
        <v-row>
          <v-col class="d-flex align-center py-6 px-5">
            <h6 class="pl-2">
              {{ taskId ? `Tarefa ${mediaType} #${task.id}` : 'Registro geral' }}
            </h6>
            <v-chip class="ml-2" v-if="formData.state" color="primary" outlined>{{ getEnum(formData.state, meta.taskState) }}</v-chip>
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
          <v-col xl="9" lg="9" class="py-0 fill-height">
            <TabComponent :tab-items="tabItems" class="elevation-0 fill-height"> 
              <template v-slot:task> 
                <v-row class="mt-0">
                  <v-col xl="4" lg="4" class="pt-0">
                    <v-text-field
                      label="Empresa"
                      :value="customer.name"
                      outlined
                      dense
                      disabled
                      class="reduce-height"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row class="mt-0">
                  <v-col xl="4" lg="4" md="4" sm="12" cols="12" class="pt-0">
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
                      :items="contact.allMedias"
                      v-model="formData.media_id"
                      :disabled="disableTask"
                      item-text="value"
                      item-value="id"
                      outlined
                      dense
                      clearable
                    ></v-select>
                  </v-col>
                </v-row>
                <section class="pb-10">
                  <VueEditor
                    v-model="formData.content"
                    :editor-toolbar="customToolbar"
                    style="height: 320px;"
                  />
                </section>
                <section class="editor-action-bar d-flex justify-space-between align-center px-5">
                  <v-menu top :offset-x="true" :close-on-content-click="false">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        color="secondary"
                        fab
                        v-bind="attrs"
                        v-on="on"
                        :disabled="finishedTask"
                      >
                        <v-icon size="20">mdi-file-document</v-icon>
                      </v-btn>
                    </template>
                    <v-card width="250">
                      <v-card-title class="pb-0">
                        <v-text-field
                          label="Pesquisar templates"
                          dense
                          append-icon="mdi-magnify"
                          class="v-field-no-border"
                          disabled
                        ></v-text-field>
                      </v-card-title>
                      <v-card-text class="v-menu-card-text px-0">
                        <v-list dense two-line>
                          <v-list-item
                            v-for="template in templates"
                            :key="template.id"
                            @click="addTemplateContent(template)"
                          >
                            <v-list-item-content>
                              <v-list-item-title class="font-body-medium d-flex align-start">
                                {{ `${template.name}` }}
                              </v-list-item-title>
                              <v-list-item-subtitle class="font-body-medium" :inner-html.prop="template.content | truncate(60)"></v-list-item-subtitle>
                            </v-list-item-content>
                          </v-list-item>
                        </v-list>
                      </v-card-text>
                    </v-card>
                  </v-menu>
                  <v-btn color="secondary" @click="editContent()">Salvar</v-btn>
                </section>
              </template>
              <template v-slot:opportunity>
                <TaskTabOpportunity :opportunity="opportunity" :opportunity-id="opportunityId" :task-id="taskId"/>
              </template>
              <template v-slot:history>
                <TaskHistory :task="task" @reloadForm="getTaskData" />
              </template>
            </TabComponent>
          </v-col>
          <v-divider vertical></v-divider>
          <v-col xl="3" lg="3">
            <!-- <Autocomplete
              v-if="!taskId"
              outlined
              dense
              return-object
              clearable
              label="Motivo / Tipo de tarefa"
              endpoint="/cash/task-type"
              query="includes=media_type"
              :disabled="disableTask"
              :filter="noExtraTasks"
              :load="dialog"
              :initial-value="taskType"
              @valueSelected="(value) => {taskType = value}"
            ></Autocomplete> -->
            <NewAutocomplete
              ref="taskAutocomplete"
              outlined
              dense
              return-object
              clearable
              label="Motivo / Tipo de tarefa"
              endpoint="/cash/task-type"
              query="includes=media_type&limit=100"
              item-value="id"
              item-text="name"
              search-key="name"
              :disabled="disableTask"
              :filter="noExtraTasks"
              :load="dialog"
              :initial-value="taskType"
              v-model="taskType"
            />
            <!-- <v-autocomplete
              v-else
              label="Motivo / Tipo de tarefa"
              outlined
              dense
              return-object
              item-value="id"
              item-text="name"
              :items="listTaskType"
              v-model="taskType"
              :disabled="disableTask"
            ></v-autocomplete> -->
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
              label="Resultado da tarefa"
              item-text="value"
              v-model="output"
              :items="outputList"
              v-if="taskId"
              :disabled="finishedTask"
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
              placeholder="Digite aqui..."
              v-model="formData.description"
              outlined
              dense
              rows="4"
              no-resize
              :disabled="!taskId"
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
          <v-btn v-if="taskId" color="secondary" @click="submitForm()">Editar tarefa</v-btn>
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
export default {
  props: {
    opportunityId: { type: [Number, String], default: null },
    taskId: { type: [Number, String], default: null },
    title: String,
    listButton: Boolean,
    hasButton: Boolean,
    timelineButton: Boolean,
    openDialog: Boolean,
  },
  data: () => ({
    dialog: false,
    hasTemplate: true,
    displayCard: false,
    listTaskType: [],
    medias: [],
    userContacts: [],
    enhancementContacts: [],
    selected: '',
    taskType: null,
    templates: [],
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
      name: null
    },
    productsList: [],
    logs: [],
    eventsLog: [],
    dateLabel: null,
    generalInfo: {},
    company: {},
    contact: {
      phones: [],
      emails: [],
      allMedias: []
    },
    products: [],
    redirectOppTo: 'business-opportunity-item-id',
    mediaType: null,
    customToolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ 'align': ''},{ 'align': 'justify'}, { 'align': 'right' }],
      ['link', 'image'],
    ],
  }),
  validations: {
    output: { required },
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      opportunityProducts: 'Opportunity/opportunityProducts',
      coworkers: 'coworkers',
      meta: 'meta',
    }),
    schedule: function() {
      // if(!this.date && !this.date) {
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
    disableTask: function() {
      if (this.task.state !== 'created') {
        return true
      }
      return false
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
        this.formData.content = newValue.content
      } else {
        this.formData.template_id = null
      }
    },
    taskType(newValue) {
      if (newValue) {
        this.outputList = JSON.parse(newValue.outputs)
        this.formData.type_id = newValue.id
        this.formData.time = newValue.time
        this.getTemplates(newValue)
      }
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

      if(this.formData.state == 'created' || this.formData.state == 'postponed' || this.formData.state == 'wait') {
        this.formData.state = 'active'
      }

      await this.$store.dispatch('Task/updAssignedTask', this.formData)
    },
    async editContent() {
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      this.formData.id = this.taskId
      
      if(this.formData.state == 'created' || this.formData.state == 'postponed' || this.formData.state == 'wait') {
        this.formData.state = 'active'
      }

      await this.$store.dispatch('Task/updAssignedTask', this.formData)
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
        this.contact.allMedias = contact.medias
          .filter((media) => media.value != null && media.value.length > 0)
      }
      this.contact.name = contact.name
    },
    async getTemplates(taskType) {
      const templates = await this.getList(
        '/cash/template',
        `includes=media_type&media_type.id=${taskType.media_type.id}`
      )
      if (templates) this.templates = templates.data
    },
    addTemplateContent(template) {
      this.formData.content ? this.formData.content += (template.content) : this.formData.content = (template.content) 
    },
    async loadData() {
      this.formData.team_id = this.userTeam
      console.log('this.formData.team_id', this.formData.team_id)
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
      await this.$store.dispatch('fetchCoworkers', `team_id=${this.userTeam}`)
    },
    async getOpportunityData(id) {
      this.partner = this.opportunity.partner
      const created = new Date(this.opportunity.created_at)
      this.dateLabel = created.toLocaleDateString()
      this.opportunity = await this.getItem(
        '/cash/opportunity',
        'also=tasks,op_log' +
        `&includes=stage,products.product,customer,partner,competitors.competitor,tenant,contact.medias.media_type&id=${id}`
      )
      console.log('this.opportunity', this.opportunity)
      this.customer.name = this.opportunity.customer.name
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
    async getTaskData() {
      this.task = await this.getItem(
        'cash/task',
        `includes=contact.medias.media_type,assigned_to,logs,type.media_type,opportunity.customer,logs,template,uploads&id=${this.taskId}`
      )
      if (!this.opportunityId) {
        this.getOpportunityData(this.task.opportunity_id)
      }
      this.mediaType = this.task.type.media_type.name
      
      const { created_at, updated_at, type, assigned_to, contact, logs, opportunity, template, media_id, ...content } = this.task
      this.formData = { ...content }
      if (this.formData.content &&this.formData.content.includes('{}')) {
        this.formData.content = ''
      }
      !this.emailTracking && (this.template = template)
      
      this.taskType = type

      const data = await this.getItem('/cash/task-type', 'includes=media_type')
      this.listTaskType.push(data)

      this.output = JSON.parse(content.output)
      if (content.scheduled_to) {
        this.date = this.$moment(`${content.scheduled_to}Z`).format('YYYY-MM-DD')
        this.hours = this.$moment(`${content.scheduled_to}Z`).format('HH:mm')
        // this.date = new Date(`${content.scheduled_to}Z`).toISOString().split('T')[0]
        // this.hours = new Date(`${content.scheduled_to}Z`).toLocaleTimeString('pt-BR', {
        //   hour: '2-digit',
        //   minute: '2-digit',
        // })
      }
      this.contact = {
        name: contact?.name,
        position: contact?.position,
      }
      contact && this.getContactMedias(contact)
      this.formData.contact_id = contact?.id
      this.formData.media_id = media_id
    },
    linkToOpp(id) {
      const { params, query } = this.$route
      this.$router.push({ name: `${this.redirectOppTo}`, params: { ...params, id }, query: { ...query, complement: this.routeComplement } })
    },
    handleCancel() {
      this.formData.reason = null
      this.emailContent.subject = null
      this.formData.priority = null
      this.date = ''
      this.hours = ''
      this.timesSnooze = null
      this.output = null
      Object.assign(this.$data, this.$options.data.apply(this))
      this.$emit('closeDialog')
      this.dialog = false
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    noExtraTasks(element) {
      let extraType = null
      if (!element.media_type && element.extra == null) {
        return false
      }
      try {
        extraType = JSON.parse(element?.extra)
        if (!extraType?.modal) {
          return element
        }
      } catch (error) {
        return element
      }
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
      this.handleCancel()
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
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
  .editor-action-bar {
    height: 50px;
    margin-top: -52px;
  }
  .v-menu-card-text {
    margin-top: -14px;
  }
  .v-list-item {
    min-height: 45px;
  }
</style>