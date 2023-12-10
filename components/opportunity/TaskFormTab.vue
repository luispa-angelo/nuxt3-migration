<template>
  <v-card flat style="border: none !important;">
    <v-card-text>
      <v-form ref="form">
        <v-row class="d-flex justify-center mb-4">
          <v-col>
            <v-chip
              v-for="type in taskMediaTypes"
              class="mr-2 mb-2"
              color="primary"
              :outlined="mediaType ? type.id !== mediaType.id : true"
              :key="type.id"
              @click="setTaskMediaType(type)"
            >
              {{ type.name }}
            </v-chip>
          </v-col>
        </v-row>
        <v-row v-if="mediaType">
          <v-col>
            <v-row class="py-0">
              <v-col class="py-1">
                <v-text-field
                  outlined
                  dense
                  label="Data"
                  type="date"
                  v-model="taskSchedule.date"
                  :error="$v.taskSchedule.date.$error"
                  :error-messages="
                    $v.taskSchedule.date.$error
                      ? 'Esse campo é obrigatório'
                      : ''
                  "
                  @change="checkDatetime"
                ></v-text-field>
              </v-col>
              <v-col class="py-1">
                <v-text-field
                  outlined
                  dense
                  label="Início"
                  type="time"
                  v-model="taskSchedule.hours"
                  :error="$v.taskSchedule.hours.$error || !scheduleIsAvailable"
                  :error-messages="
                    $v.taskSchedule.hours.$error
                      ? 'Esse campo é obrigatório'
                      : !scheduleIsAvailable
                      ? 'Horário indisponível'
                      : ''
                  "
                  @change="checkDatetime"
                ></v-text-field>
              </v-col>
              <v-col class="py-1">
                <v-select
                  attach
                  outlined
                  dense
                  label="Duração da tarefa (min)"
                  item-text="text"
                  item-value="value"
                  :items="taskTimeList"
                  v-model="formData.time"
                  :error="$v.formData.time.$error"
                  :error-messages="
                    $v.formData.time.$error ? 'Esse campo é obrigatório' : ''
                  "
                  @change="scheduling && verifySlots()"
                ></v-select>
                <!-- <v-text-field
                  outlined
                  dense
                  label="Duração da tarefa (min)"
                  placeholder="Digite aqui..."
                  type="number"
                  v-model="formData.time"
                  :error="$v.formData.time.$error"
                  :error-messages="
                    $v.formData.time.$error ? 'Esse campo é obrigatório' : ''
                  "
                  @change="scheduling && verifySlots()"
                ></v-text-field> -->
              </v-col>
            </v-row>
            <v-row class="py-0">
              <v-col v-if="scheduling" class="py-1">
                <v-select
                  attach
                  outlined
                  dense
                  label="Lembrete"
                  item-text="text"
                  item-value="value"
                  v-model="reminderTo"
                  :items="reminderOptions"
                ></v-select>
              </v-col>
              <v-col class="py-1">
                <v-select
                  attach
                  outlined
                  dense
                  label="Prioridade"
                  item-text="name"
                  item-value="value"
                  v-model="formData.priority"
                  :items="meta.taskPriority"
                  :error="$v.formData.priority.$error"
                  :error-messages="
                    $v.formData.priority.$error
                      ? 'Esse campo é obrigatório'
                      : ''
                  "
                ></v-select>
              </v-col>
            </v-row>
            <v-row v-if="!isForwardBase" class="py-0">
              <v-col class="py-1">
                <NewAutocomplete
                  outlined
                  dense
                  clearable
                  label="Time"
                  endpoint="/ecosystem/any-team"
                  item-value="id"
                  v-model="formData.team_id"
                  :query="'order=level,id&strict=true'"
                  :item-text="(item) => (item && item.name ? item.name : '')"
                  :post-process="showTeamHierarchy"
                ></NewAutocomplete>
              </v-col>
              <v-col class="py-1">
                <NewAutocomplete
                  outlined
                  dense
                  clearable
                  label="Atribuído"
                  endpoint="/ecosystem/capability"
                  item-value="user_id"
                  item-text="user.name"
                  v-model="formData.assigned_to_id"
                  :query="`includes=user,team&team_id=${formData.team_id}`"
                  :cache-items="false"
                  @onValueNotFound="
                    (value) => (formData.assigned_to_id = value)
                  "
                  @change="scheduling && verifySlots()"
                ></NewAutocomplete>
              </v-col>
            </v-row>
            <v-row class="py-0">
              <v-col class="py-1">
                <v-select
                  attach
                  outlined
                  dense
                  return-object
                  label="Finalidade"
                  item-text="name"
                  v-model="taskType"
                  :items="taskTypeList"
                  :error="$v.formData.type_id.$error"
                  :error-messages="
                    $v.formData.type_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-select>
              </v-col>
              <v-col v-if="!scheduling" class="py-1">
                <v-select
                  attach
                  outlined
                  dense
                  return-object
                  label="Resultado"
                  item-text="value"
                  v-model="output"
                  :items="outputsList"
                  :error="$v.formData.output.$error"
                  :error-messages="
                    $v.formData.output.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-select>
              </v-col>
            </v-row>
            <v-row class="py-0">
              <v-col class="py-1">
                <NewCombobox
                  outlined
                  dense
                  enable-creation
                  ref="contactCombobox"
                  label="Contato"
                  endpoint="/customer/contact"
                  item-text="name"
                  v-model="contact"
                  :query="`includes=companies&companies.company_id=in(${companies})`"
                  :validate="$v.formData.contact_id"
                >
                  <template v-slot:creationSlot="props">
                    <v-btn
                      text
                      block
                      :disabled="
                        disableCreationBtn(props.search, props.list, contact)
                      "
                      @click="handleAddContact(props.search)"
                    >
                      <v-icon class="mr-2 material-icons-round">person</v-icon>
                      <span>Cadastrar contato</span>
                    </v-btn>
                  </template>
                </NewCombobox>
              </v-col>
              <v-col class="py-1">
                <NewCombobox
                  outlined
                  dense
                  enable-creation
                  ref="contactMediaCombobox"
                  endpoint="customer/all-medias-contact"
                  item-text="value"
                  search-key="value"
                  v-model="contactMedia"
                  :custom-mask="mediaFieldMask"
                  :disabled="!formData.contact_id"
                  :label="mediaFieldLabel"
                  :rules="mediaFieldRules"
                  :messages="mediaFieldMessages"
                  :query="`contact_id=in(${formData.contact_id})&base=in(${
                    this.mediaBase !== 'other' ? this.mediaBase : 'mobile,mail,landline,phone'
                  })&company_id=in(${opportunity.customer_id})`"
                  :validate="$v.formData.media_id"
                >
                  <template v-slot:creationSlot="props">
                    <v-btn
                      text
                      block
                      :disabled="
                        disableCreationBtn(
                          props.search,
                          props.list,
                          contact,
                          'value'
                        )
                      "
                      @click="handleAddContactMedia(props.search)"
                    >
                      <v-icon class="mr-2 material-icons-round"
                        >contact_emergency</v-icon
                      >
                      <span>Cadastrar Mídia</span>
                    </v-btn>
                  </template>
                </NewCombobox>
              </v-col>
            </v-row>
            <v-row class="py-0">
              <v-col class="py-1">
                <section v-if="!scheduling">
                  <VueEditor
                    placeholder="Descreva o que aconteceu na tarefa..."
                    v-model="formData.content"
                    :editor-toolbar="vueEditorToolbar"
                    style="height: 200px"
                  />
                </section>
                <section
                  v-if="!scheduling"
                  class="d-flex justify-space-between align-center w-100 adjust-action-buttons mb-2"
                >
                  <TaskTemplateMenu
                    :task-type="taskType"
                    @selectedTemplate="handleTemplate"
                  />
                </section>
                <v-textarea
                  outlined
                  hide-details
                  placeholder="Instruções para execução da tarefa..."
                  v-model="formData.description"
                ></v-textarea>
                <div
                  class="pa-4 mt-4 v-file-input-bordered label-float"
                  v-cloak
                  @drop.prevent="addDropFile"
                  @dragover.prevent
                >
                  <label class="floating-input">Arquivos Anexados</label>
                  <div class="d-flex justify-center align-center my-2">
                    <v-file-input
                      hide-details
                      multiple
                      hide-input
                      id="file-input"
                      class="py-0 my-0 flex-grow-0"
                      ref="fileInput"
                      placeholder="Clique aqui para selecionar o arquivo ou arraste nesta área"
                      prepend-icon="mdi-login"
                      v-model="files"
                      @change="handleFileInput"
                    >
                    </v-file-input>
                    <label class="file-input-label" for="file-input"
                      >Clique aqui para selecionar o arquivo ou arraste nesta
                      área</label
                    >
                  </div>
                  <div class="d-flex flex-wrap">
                    <v-alert
                      v-for="(file, index) in fileList"
                      dismissible
                      class="py-1 mb-2 mr-4 file-alert align-self-start"
                      v-model="fileList[index].active"
                      :color="fileList[index].valid ? 'shape' : 'error'"
                      :key="index"
                    >
                      {{ `${file.file.name} (${formatBytes(file.file.size)})` }}
                      <template v-slot:close="{ toggle }">
                        <v-btn fab icon @click="removeFile(toggle)">
                          <v-icon class="material-icons-round">close</v-icon>
                        </v-btn>
                      </template>
                    </v-alert>
                  </div>
                </div>
                <span class="ml-2 font-body-medium">Limite de 20 MB por arquivo</span>
              </v-col>
            </v-row>
            <v-row class="py-0">
              <v-col class="d-flex justify-end py-1">
                <v-btn
                  elevation="1"
                  class="px-6 mr-4"
                  color="secondary"
                  :disabled="isSendingRequest"
                  @click="handleFormReset"
                  >Cancelar</v-btn
                >
                <v-btn
                  elevation="1"
                  class="px-6"
                  color="primary"
                  :loading="isSendingRequest"
                  @click="handleSubmitForm"
                  >Salvar</v-btn
                >
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-row v-else>
          <v-col class="text-center">
            <img class="mt-10" src="~/static/task-form.png" alt="" />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
    <OpportunityTaskSwapForm
      :prop-dialog="swapDialog"
      :scheduling="scheduling"
      @changeToTab="changeToTab"
    />

    <ContactMediaDialog
      :prop-dialog="mediaDialog"
      :contact-id="formData.contact_id"
      :companyContactId="companyContactId"
      :media-value="mediaValue"
      :media-base="mediaBase"
      @onMediaCreated="handleMediaCreate"
    />

    <TaskScheduleHelper
      :prop-dialog="scheduleDialog"
      :slot-suggestions="slotSuggestions"
      :user-id="formData.assigned_to_id"
      @onTimeChosen="handleTimeChosen"
    />
    <TaskFileSizeAlert
      :prop-dialog="fileSizeDialog"
      :files="invalidFiles"
      @onClose="
        () => {
          this.fileSizeDialog = false
        }
      "
    />
  </v-card>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'

const initialState = () => ({
  formData: {
    assigned_to_id: null,
    team_id: null,
    opportunity_id: null,
    contact_id: null,
    type_id: null,
    time: '0',
    description: '',
    content: '',
    priority: 'medium',
    state: null,
    reminder_to: null,
    scheduled_to: null,
    media_id: null,
    output: null,
  },
  taskSchedule: {
    date: null,
    hours: null,
  },
  taskMediaTypes: [],
  mediaType: null,
  taskTypeList: [],
  taskType: null,
  reminderTo: null,
  output: null,
  contact: null,
  contactMedia: null,
  reminderOptions: [
    { text: 'Nenhum', value: null },
    { text: '5 minutos antes', value: 5 },
    { text: '10 minutos antes', value: 10 },
    { text: '15 minutos antes', value: 15 },
    { text: '20 minutos antes', value: 20 },
    { text: '30 minutos antes', value: 30 },
    { text: '1 hora antes', value: 60 },
  ],
  swapDialog: false,
  mediaValue: null,
  mediaDialog: null,
  file: null,
  files: [],
  fileList: [],
  invalidFile: false,
  isSendingRequest: false,
  scheduleDialog: false,
  scheduleIsAvailable: true,
  slotSuggestions: [],
  fileSizeDialog: false,
  invalidFiles: [],
  scheduleVerifyInterval: null,
  vueEditorToolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: '' }, { align: 'justify' }, { align: 'right' }],
  ],
  taskTimeList: [
    { text: '1 minuto', value: 1 },
    { text: '5 minutos', value: 5 },
    { text: '10 minutos', value: 10 },
    { text: '15 minutos', value: 15 },
    { text: '20 minutos', value: 20 },
    { text: '30 minutos ', value: 30 },
    { text: '1 hora ', value: 60 },
  ],
})

export default {
  props: {
    opportunityId: { type: [Number, String], default: null },
    scheduling: { type: Boolean, default: false },
    payloadData: Object,
  },
  data() {
    return initialState()
  },
  validations: {
    formData: {
      time: { required },
      type_id: { required },
      contact_id: {
        required: requiredIf(function () {
          return this.requiredContact
        }),
      },
      media_id: {
        required: requiredIf(function () {
          return this.requiredContact
        }),
      },
      priority: { required },
      output: {
        required: requiredIf(function () {
          return !this.scheduling
        }),
      },
    },
    taskSchedule: {
      date: {
        required: requiredIf(function () {
          return !this.isForwardBase
        }),
      },
      hours: {
        required: requiredIf(function () {
          return !this.isForwardBase
        }),
      },
    },
  },
  computed: {
    ...mapGetters({
      opportunity: 'Opportunity/opportunity',
      meta: 'meta',
      userInfo: 'userInfo',
      userTeam: 'userTeam',
    }),
    scheduleTo: function () {
      if (!this.taskSchedule.date && !this.taskSchedule.hours) {
        return null
      }
      const validDate = this.$moment(
        new Date(`${this.taskSchedule.date}T${this.taskSchedule.hours}`)
      ).isValid()
      if (!validDate) {
        return null
      }
      const datetime = this.$moment
        .utc(new Date(`${this.taskSchedule.date}T${this.taskSchedule.hours}`))
        .format('YYYY-MM-DDTHH:mm:ss')
      return datetime
    },
    mediaBase: function () {
      switch (this.mediaType?.base) {
      case 'mobile':
        return 'mobile'
      case 'phone':
        return 'mobile'
      case 'landline':
        return 'mobile'
      case 'mail':
        return 'mail'
      default:
        return 'other'
      }
    },
    mediaFieldLabel: function () {
      switch (this.mediaBase) {
      case 'mobile':
        return 'Telefone do contato'
      case 'mail':
        return 'E-mail do contato'
      default:
        return 'Canal do Contato'
      }
    },
    mediaFieldRules: function () {
      switch (this.mediaBase) {
      case 'mobile':
        return this.phoneRules
      case 'mail':
        return this.mediaObjectEmailRules
      default:
        return []
      }
    },
    mediaFieldMessages: function () {
      switch (this.mediaBase) {
      case 'mobile':
        return this.phoneValidationMessages      
      default:
        return []
      }
    },
    mediaFieldMask: function () {
      switch (this.mediaBase) {
      case 'mobile':
        return this.maskPhone
      default:
        return () => {}
      }
    },
    outputsList: function () {
      const { outputs } = this.taskType || {}
      if (outputs) {
        return JSON.parse(outputs)
      }
      return []
    },
    companies: function () {
      if (this.opportunityId == this.opportunity.id) {
        return this.opportunity.customer_id
      }
      return ''
    },
    successAlertTitle: function () {
      if (this.scheduling) {
        return 'Tarefa agendada com sucesso!'
      }
      return 'Tarefa registrada com sucesso!'
    },
    isForwardBase: function () {
      if (this.mediaType?.base === 'forward') {
        return true
      }
      return false
    },
    requiredContact: function () {
      const extra = this.taskType?.extra
      if (extra) {
        try {
          const parsedExtra = JSON.parse(extra)
          if (parsedExtra.internal) {
            return false
          }
        } catch (error) {
          return true
        }
      }
      return true
    },
    companyContactId() {
      return this.contact?.companies?.find(
        (company) => company.company_id === this.opportunity?.customer_id
      )?.id
    },
  },
  watch: {
    async scheduleTo(newValue) {
      this.formData.scheduled_to = newValue
      if (newValue) {
        this.updateReminderTo(this.reminderTo, newValue)
      }
    },
    reminderTo(newValue) {
      this.updateReminderTo(newValue, this.scheduleTo)
    },
    mediaType(newValue) {
      this.initialSettings()
      this.resetContactMedia()
      if (newValue) {
        this.setTaskTypeList(newValue.id)
        if (this.scheduling) {
          this.setScheduleVerifyInterval()
        }
      }
    },
    taskType(newValue) {
      this.formData.output = null
      if (newValue) {
        this.formData.type_id = newValue.id
        this.setTaskTime(newValue)
      } else {
        this.formData.type_id = newValue
        this.formData.time = null
      }
    },
    output(newValue) {
      if (newValue) {
        this.formData.output = JSON.stringify(newValue)
      } else {
        this.formData.output = newValue
      }
    },
    contact(newValue) {
      this.resetContactMedia()
      if (newValue) {
        this.formData.contact_id = newValue.id
      } else {
        this.formData.contact_id = newValue
      }
    },
    contactMedia(newValue) {
      if (newValue) {
        this.formData.media_id = newValue.id
      } else {
        this.formData.media_id = newValue
      }
    },
    isForwardBase(newValue) {
      if (newValue) {
        this.scheduleIsAvailable = true
        this.$v.taskSchedule.$reset()
      }
    },
    'formData.time': function () {
      if (this.taskType) {
        this.verifySlots()
      }
    },
    // payloadData(newValue) {
    //   if (newValue) {
    //     this.handlePayloadData(newValue)
    //   }
    //   // this.formData = formData
    // }
  },
  mounted() {
    this.initialSettings()
  },
  methods: {
    initialSettings() {
      this.getTaskMediaTypes()
      this.setInicialDatetime()
      this.formData.opportunity_id = this.opportunityId
      this.formData.team_id = this.opportunity.team_id
      this.formData.assigned_to_id = this.userInfo.id
      this.formData.time = 1
      if (this.scheduling) {
        this.reminderTo = 10
        this.formData.state = 'created'
      } else {
        this.formData.state = 'done'
      }
      if (this.payloadData) {
        // this.handlePayloadData(this.payloadData)
      }
    },
    async getTaskMediaTypes() {
      try {
        const { data } = await this.getList(
          '/cash/task-type',
          'includes=media_type&obsolete=false&limit=1000'
        )
        const medias = data.map((type) => type.media_type_id)
        const availableMedias = [...new Set(medias)]
        const mediaQuery = availableMedias.join()
        const hasForward = this.scheduling ? '' : '&base=not_in(forward)'
        const { data: validMediaTypes } = await this.getList(
          '/ecosystem/media-type',
          `id=in(${mediaQuery})&order=name&${hasForward}`,
          null,
          { throwError: true }
        )
        this.taskMediaTypes = validMediaTypes
      } catch (error) {
        console.log(error)
      }
    },
    setInicialDatetime() {
      const now = new Date()
      this.taskSchedule.date = this.$moment(now).format('YYYY-MM-DD')
      this.taskSchedule.hours = this.$moment(now).format('HH:mm')
    },
    setTaskMediaType(mediaType) {
      this.mediaType = mediaType
    },
    async setTaskTypeList(mediaTypeId) {
      this.taskType = null
      this.output = null
      const { data } = await this.getList(
        '/cash/task-type',
        `media_type_id=${mediaTypeId}&obsolete=false`
      )
      this.taskTypeList = data
    },
    async handleAddContact(nameValue) {
      try {
        const response = await this.createItem(
          'customer/contact',
          { name: nameValue, company_id: this.companies },
          { throwError: true }
        )
        const contact = await this.getItem(
          '/customer/contact',
          `id=${response.id}`
        )
        this.contact = contact
        // this.$refs.contactCombobox.refreshList()
      } catch (error) {
        console.log(error)
      }
    },
    handleAddContactMedia(nameValue) {
      // if (!this.$refs.form.validate()) return
      this.mediaValue = nameValue
      this.mediaDialog = true
    },
    async handleSubmitForm() {
      this.$v.formData.$touch()
      this.$v.taskSchedule.$touch()
      if (this.$v.formData.$error || this.$v.taskSchedule.$error) return
      this.isSendingRequest = true
      if (this.isForwardBase) {
        this.formData['bypass_schedule'] = true
      } else {
        this.formData['bypass_schedule'] = false
      }
      try {
        const payload = new FormData()
        const formDataPayload = { ...this.formData }
        if (!this.scheduling) {
          formDataPayload.task_behavior = 'register'
        }
        payload.append('data', JSON.stringify(formDataPayload))
        this.fileList.forEach((file) => {
          if (file.valid) {
            payload.append('file', file.file)
          }
        })
        await this.createItem('/cash/task-with-files', payload, {
          fireSuccessAlert: false,
          throwError: true,
        })
        this.handleSuccess()
        this.handleFormReset()
        this.isSendingRequest = false
      } catch (error) {
        console.log(error)
        this.isSendingRequest = false
      }
    },
    handleFormReset() {
      this.resetScheduleVerifyInterval()
      Object.assign(this.$data, initialState())
      this.$v.$reset()
    },
    handleMediaCreate(contactMedia) {
      this.contactMedia = contactMedia
      this.mediaDialog = false
      this.$refs.contactMediaCombobox.refreshList()
    },
    checkSchedulingTask() {
      const now = new Date()
      if (this.scheduling) {
        if (
          this.$moment(`${this.formData.scheduled_to}Z`).isBefore(now, 'minute')
        ) {
          this.swapDialog = true
          return false
        }
        return true
      } else {
        if (
          this.$moment(`${this.formData.scheduled_to}Z`).isAfter(now, 'minute')
        ) {
          this.swapDialog = true
        }
      }
      return false
    },
    changeToTab(tab) {
      if (tab) {
        const changeFormPayload = {
          tab,
          data: {
            formData: {
              assigned_to_id: this.formData.assigned_to_id,
              team_id: this.formData.team_id,
              priority: this.formData.priority,
              description: this.formData.description,
            },
            scheduleTo: this.scheduleTo,
            taskSchedule: this.taskSchedule,
            mediaType: this.mediaType,
            taskType: this.taskType,
            contact: this.contact,
            contactMedia: this.contactMedia,
            fileList: this.fileList,
          },
        }
        this.resetScheduleVerifyInterval()
        Object.assign(this.$data, initialState())
        this.$emit('changeTo', changeFormPayload)
      } else {
        this.setInicialDatetime()
      }
      this.swapDialog = false
    },
    removeFile(toggle) {
      toggle()
      this.$nextTick(() => {
        const list = this.fileList
        this.fileList = list.filter((item) => item.active)
      })
    },
    handleFileInput(files) {
      const fileList = files.map((file) => ({
        file,
        active: true,
        valid: file.size < 20000000 ? true : false,
      }))
      if (fileList.some((file) => !file.valid)) {
        this.invalidFiles = fileList.filter((file) => !file.valid)
        this.fileSizeDialog = true
      }
      this.fileList = [
        ...this.fileList,
        ...fileList.filter((file) => file.valid),
      ]
      this.files = []
    },
    async verifySlots() {
      if (
        this.formData.assigned_to_id &&
        this.formData.scheduled_to &&
        !this.isForwardBase &&
        this.scheduling
      ) {
        const intervalStart = this.$moment(this.formData.scheduled_to).format(
          'YYYY-MM-DD'
        )
        const intervalEnd = this.$moment(this.formData.scheduled_to)
          .add(1, 'w')
          .format('YYYY-MM-DD')
        const taskStart = this.$moment(this.formData.scheduled_to).format(
          'YYYY-MM-DDTHH:mm:ss'
        )
        const taskEnd = this.$moment(this.formData.scheduled_to)
          .add(this.formData.time, 'm')
          .format('YYYY-MM-DDTHH:mm:ss')
        const userSlots = await this.getList(
          '/cash/users-slots',
          `user_id=${this.formData.assigned_to_id}&start=${intervalStart}&end=${intervalEnd}`
        )
        const taskDaySlots = userSlots[intervalStart]
        const isAvailable = taskDaySlots.some((slot) => {
          if (
            this.$moment(taskStart).isBefore(slot.end, 'minute') &&
            this.$moment(taskStart).isAfter(slot.start, 'minute') &&
            this.$moment(taskEnd).isBefore(slot.end, 'minute')
          ) {
            return true
          }
          return false
        })
        this.scheduleIsAvailable = isAvailable
        if (!isAvailable) {
          const availableSlots = []
          for (const day in userSlots) {
            if (availableSlots.length > 0) {
              const now = this.$moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')
              const futureSlots = availableSlots.filter((slot) =>
                this.$moment(`${slot.startTime}Z`).isAfter(now, 'minute')
              )
              futureSlots.sort((a, b) => a.diffToTask - b.diffToTask)
              const suggestions = futureSlots.slice(0, 4)
              this.slotSuggestions = suggestions.map(
                (suggestion) => suggestion.startTime
              )
              this.scheduleDialog = true
              return
            }
            const taskTime = this.formData.time < 15 ? 15 : this.formData.time
            userSlots[day].forEach((slot) => {
              let availableSlotStart = this.$moment(slot.start)
                .add(1, 'm')
                .format('YYYY-MM-DDTHH:mm:ss')
              let availableSlotEnd = this.$moment(slot.start)
                .add(taskTime, 'm')
                .format('YYYY-MM-DDTHH:mm:ss')
              while (
                this.$moment(availableSlotEnd).isBefore(slot.end, 'minute')
              ) {
                availableSlots.push({
                  startTime: availableSlotStart,
                  diffToTask: Math.abs(
                    this.$moment(taskStart).diff(
                      this.$moment(availableSlotStart)
                    )
                  ),
                })
                availableSlotStart = this.$moment(availableSlotStart)
                  .add(taskTime, 'm')
                  .format('YYYY-MM-DDTHH:mm:ss')
                availableSlotEnd = this.$moment(availableSlotStart)
                  .add(taskTime, 'm')
                  .format('YYYY-MM-DDTHH:mm:ss')
              }
            })
          }
        }
      }
    },
    handleTimeChosen(time) {
      if (time) {
        this.taskSchedule.hours = time
      }
      this.scheduleDialog = false
      this.$nextTick(async () => {
        const isAvailable = await this.checkAvailability()
        this.scheduleIsAvailable = isAvailable
      })
    },
    async handlePayloadData(payload) {
      this.handleFormReset()
      const {
        taskSchedule,
        mediaType,
        taskType,
        contact,
        contactMedia,
        formData,
        fileList,
      } = payload
      this.mediaType = mediaType
      this.contact = contact
      this.formData.priority = formData.priority
      this.formData.description = formData.description
      if (!this.isForwardBase) {
        this.formData.team_id = formData.team_id
      }
      this.$nextTick(() => {
        this.taskSchedule = taskSchedule
        this.taskType = taskType
        this.contactMedia = contactMedia
        this.fileList = fileList
        if (!this.isForwardBase) {
          this.formData.assigned_to_id = formData.assigned_to_id
        }
        if (this.scheduling) {
          this.$nextTick(async () => {
            const isAvailable = await this.checkAvailability()
            this.scheduleIsAvailable = isAvailable
          })
        }
      })
    },
    handleSuccess() {
      this.$store.dispatch('Task/refresh', true)
      this.$store.dispatch('Opportunity/refresh', true)
      this.$swal({
        position: 'bottom-end',
        icon: 'success',
        title: this.successAlertTitle,
        text: 'Para visualizar a tarefa acesse a aba Todas as tarefas.',
        toast: true,
        showConfirmButton: false,
        showCloseButton: true,
        timer: 10000,
        timerProgressBar: true,
        width: '540px',
      })
    },
    checkDatetime() {
      if (this.checkSchedulingTask()) {
        this.verifySlots()
      }
    },
    async checkAvailability() {
      if (this.isForwardBase) {
        return true
      }
      const intervalStart = this.$moment(this.formData.scheduled_to).format(
        'YYYY-MM-DD'
      )
      const intervalEnd = this.$moment(this.formData.scheduled_to)
        .add(1, 'w')
        .format('YYYY-MM-DD')
      const taskStart = this.$moment(this.formData.scheduled_to).format(
        'YYYY-MM-DDTHH:mm:ss'
      )
      const taskEnd = this.$moment(this.formData.scheduled_to)
        .add(this.formData.time, 'm')
        .format('YYYY-MM-DDTHH:mm:ss')
      const userSlots = await this.getList(
        '/cash/users-slots',
        `user_id=${this.formData.assigned_to_id}&start=${intervalStart}&end=${intervalEnd}`
      )
      const taskDaySlots = userSlots[intervalStart]
      const isAvailable = taskDaySlots.some((slot) => {
        if (
          this.$moment(taskStart).isBefore(slot.end, 'minute') &&
          this.$moment(taskStart).isAfter(slot.start, 'minute') &&
          this.$moment(taskEnd).isBefore(slot.end, 'minute')
        ) {
          return true
        }
        return false
      })
      return isAvailable
    },
    addDropFile(event) {
      this.handleFileInput(Object.values(event.dataTransfer.files))
    },
    handleTemplate(template) {
      this.formData.content = template.content
    },
    setScheduleVerifyInterval() {
      this.resetScheduleVerifyInterval()
      if (!this.scheduleVerifyInterval) {
        this.scheduleVerifyInterval = setInterval(() => {
          const now = new Date()
          if (this.$moment(`${this.scheduleTo}Z`).isBefore(now, 'minute')) {
            this.setInicialDatetime()
          }
        }, 30000)
      }
    },
    resetScheduleVerifyInterval() {
      if (this.scheduleVerifyInterval) {
        clearInterval(this.scheduleVerifyInterval)
        this.scheduleVerifyInterval = null
      }
    },
    disableCreationBtn(searchValue, items, selectedValue, field = 'name') {
      if (!searchValue) {
        return true
      }
      if (!items.some((item) => item[field] === searchValue)) {
        return false
      }
      if (selectedValue) {
        return true
      }
    },
    resetContactMedia() {
      this.contactMedia = null
      if (this.$refs['contactMediaCombobox']) {
        this.$refs['contactMediaCombobox'].resetField()
      }
    },
    updateReminderTo(reminderTo, scheduleTo) {
      if (reminderTo) {
        this.formData.reminder_to = this.$moment(new Date(scheduleTo))
          .subtract(reminderTo, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      } else {
        this.formData.reminder_to = null
      }
    },
    setTaskTime(taskType) {
      const time = taskType.time ? taskType.time : 1
      this.formData.time = time
      if (!this.taskTimeList.find((time) => time.value == time)) {
        this.taskTimeList.push({ text: `${time} minutos`, value: time })
        this.taskTimeList = this.taskTimeList.sort((a, b) => a.value - b.value)
      }
    },
  },
}
</script>

<style>
.adjust-action-buttons {
  margin-top: 20px;
}
.v-file-input-bordered {
  border: dashed 1px #d2d6da;
  border-radius: 8px;
  position: relative;
}
.floating-input {
  background-color: white;
  font-size: 12px;
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  margin-top: -12px;
  margin-left: 8px;
}
.file-input-label {
  cursor: pointer !important;
}
.file-alert {
  width: 45%;
}
</style>
