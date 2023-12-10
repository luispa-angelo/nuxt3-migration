<template>
  <section>
    <div v-if="createdTask" class="mb-2">
      <v-btn fab icon x-small elevation="2" class="mr-1" @click="cancelAction">
        <v-icon color="primary">mdi-chevron-left</v-icon>
      </v-btn>
      <span>Ligue pelo CRM</span>
    </div>
    <v-tabs
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
        <span class="text-none font-body-medium">{{ taskTab.title }}</span>
      </v-tab>
    </v-tabs>

    <v-tabs-items v-model="taskTab">
      <v-tab-item eager href="#tab-1">
        <v-row class="mt-0">
          <v-col xl="5" lg="5">
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
              :disabled="finishedTask || onGoingTask"
              @change="resetContactMedia"
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

            <NewCombobox
              :key="phoneInputKey"
              outlined
              dense
              enable-creation
              ref="contactMediaCombobox"
              endpoint="customer/all-medias-contact"
              item-text="value"
              search-key="value"
              v-model="contactMedia"
              :disabled="finishedTask"
              :custom-mask="maskPhone"
              :load-on-mount="false"
              :label="'Telefone do contato'"
              :rules="phoneRules"
              :messages="phoneValidationMessages"              
              :query="`contact_id=in(${contactId})&base=in(landline,mobile)&company_id=in(${companies})`"
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

            <ContactMediaDialog
              media-base="mobile"
              :prop-dialog="mediaDialog"
              :contact-id="contactId"
              :companyContactId="companyContactId"
              :media-value="mediaValue"
              @onMediaCreated="handleMediaCreate"
            />
          </v-col>
          <v-col xl="7" lg="7" md="7" sm="12" cols="12" class="pt-0">
            <v-card outlined elevation="0" :style="phoneCardStyle">
              <v-row>
                <v-col>
                  <v-row>
                    <v-col
                      class="d-flex flex-column align-center justify-center flex-wrap mb-2"
                    >
                      <p class="font-weight-bold">
                        {{ translateStatus(phoneStatus) }}
                      </p>
                      <p class="counter">{{ time }}</p>
                      <div class="d-flex">
                        <div
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-btn
                            fab
                            color="success"
                            :disabled="
                              phoneStatus === 'disconnected' ||
                              phoneStatus === 'login error' ||
                              disabled === true ||
                              !contactMedia ||
                              finishedTask ||
                              phoneNotConnected ||
                              !provider
                            "
                            @click="dial"
                          >
                            <v-icon class="material-icons-outlined">
                              {{
                                phoneStatus === 'connected'
                                  ? 'call'
                                  : 'mdi-phone-off'
                              }}
                            </v-icon>
                          </v-btn>
                          <span class="body-3 mt-1">Ligar</span>
                        </div>

                        <div
                          v-if="phoneStatus === 'hold'"
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-btn
                            fab
                            color="primary"
                            :disabled="finishedTask || phoneNotConnected"
                            @click="unhold"
                          >
                            <v-icon class="material-icons-round"
                              >play_arrow</v-icon
                            >
                          </v-btn>
                          <span class="body-3 mt-1">Retornar</span>
                        </div>
                        <div
                          v-else
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-btn
                            fab
                            color="primary"
                            class="material-icons-outlined"
                            :disabled="finishedTask || phoneNotConnected"
                            @click="hold"
                          >
                            <v-icon>pause</v-icon>
                          </v-btn>
                          <span class="body-3 mt-1">Espera</span>
                        </div>

                        <div
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-menu
                            max-width="180"
                            left
                            :offset-x="true"
                            :close-on-content-click="false"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                fab
                                color="primary"
                                :disabled="
                                  phoneStatus === 'connected' ||
                                  phoneStatus === 'disconnected' ||
                                  phoneStatus === 'hold' ||
                                  phoneStatus === 'login error' ||
                                  finishedTask ||
                                  phoneNotConnected ||
                                  !provider
                                "
                                v-bind="attrs"
                                v-on="on"
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
                          <span class="body-3 mt-1">Teclado</span>
                        </div>

                        <div
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-btn
                            v-if="
                              phoneStatus === 'unmuted' ||
                              phoneStatus === 'connected' ||
                              phoneStatus === 'call' ||
                              phoneStatus === 'hold' ||
                              phoneStatus === 'disconnected' ||
                              phoneStatus === 'login error' ||
                              phoneStatus === 'dropping' ||
                              phoneNotConnected
                            "
                            fab
                            color="primary"
                            :disabled="
                              phoneStatus !== 'call' ||
                              provider !== 'voixtel' ||
                              finishedTask ||
                              phoneNotConnected ||
                              !provider
                            "
                            @click="mute()"
                          >
                            <v-icon>mdi-microphone</v-icon>
                          </v-btn>
                          <v-btn
                            v-if="
                              phoneStatus === 'muted'
                            "
                            fab
                            color="primary"
                            :disabled="finishedTask || !provider"
                            @click="unmute()"
                          >
                            <v-icon>mdi-microphone-off</v-icon>
                          </v-btn>
                          <span class="body-3 mt-1">Silenciar</span>
                        </div>

                        <div
                          class="d-flex flex-column justify-center align-center mx-2"
                        >
                          <v-btn
                            fab
                            color="error"
                            :disabled="finishedTask || phoneNotConnected || !provider"
                            @click="drop"
                          >
                            <v-icon>mdi-phone-hangup</v-icon>
                          </v-btn>
                          <span class="body-3 mt-1">Encerrar</span>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <section class="mt-2">
          <span>Anotações sobre a chamada</span>
          <section class="pb-10">
            <VueEditor
              class="custom-vue-editor custom-vue-editor-toolbar custom-vue-editor-disabled"
              style="height: 22vh"
              v-model="content"
              :editor-toolbar="customToolbar"
              :disabled="finishedTask"
            />
          </section>
          <section
            v-if="taskId"
            class="bottom-editor-action-bar d-flex justify-space-between align-center px-2 pb-2 mt-2 pt-1"
          >
            <TemplateSelector
              :is-disabled="finishedTask"
              :media-type-id="mediaTypeId"
              @onTemplateChosen="
                (template) => {
                  content = templateInsertion(template, content)
                }
              "
            />
            <v-btn
              color="secondary"
              :disabled="finishedTask"
              @click="handleTaskContent"
              >Salvar</v-btn
            >
          </section>
        </section>
      </v-tab-item>
      <v-tab-item eager href="#tab-2">
        <section style="height: 60vh; overflow: auto">
          <section
            v-for="record in recordsList"
            :key="record.id"
            class="font-body-medium"
          >
            <div v-if="record.begin">
              <div>
                <v-icon
                  small
                  color="primary"
                  class="material-icons-outlined mr-1"
                  >call</v-icon
                >
                <span class="font-body-medium mb-0 primary--text"> Ligação </span>
                <span class="font-body-medium mb-0">
                  {{
                    `| Feito por: ${
                      record.begin.contentRecord
                        ? record.begin.contentRecord.user_name || '-'
                        : '-'
                    }`
                  }}
                </span>
              </div>
              <div class="d-flex">
                <div class="d-flex mr-4">
                  <v-icon small class="material-icons-outlined mr-1"
                    >person_outline</v-icon
                  >
                  <span>
                    {{
                      `Contato: ${
                        record.begin.contentRecord.phone_called
                          ? record.begin.contentRecord.phone_called.contact ||
                            '-'
                          : '-'
                      }`
                    }}
                  </span>
                </div>
                <div>
                  <span>
                    {{
                      `Mídia do contato: ${
                        record.begin.contentRecord.phone_called
                          ? record.begin.contentRecord.phone_called.value || '-'
                          : '-'
                      }`
                    }}
                  </span>
                </div>
              </div>
              <v-divider class="my-2 w-50"></v-divider>
              <div class="d-flex">
                <div class="mr-4">
                  <v-icon small class="material-icons-round" color="success"
                    >call</v-icon
                  >
                  <span>{{
                    `Conectada: ${$moment(`${record.begin.created_at}Z`).format(
                      'DD/MM/YYYY - HH:mm'
                    )}`
                  }}</span>
                </div>
                <div v-if="record.end">
                  <v-icon small color="error">mdi-phone-hangup</v-icon>
                  <span>{{
                    `Desconectada: ${$moment(
                      `${record.end.created_at}Z`
                    ).format('DD/MM/YYYY - HH:mm')}`
                  }}</span>
                </div>
              </div>
              <span v-if="record.end">{{
                `Duração: ${$moment(record.begin.created_at).diff(
                  record.end.created_at,
                  'minutes'
                )} minutos`
              }}</span>
              <section v-if="record.end" class="w-75">
                <span>Gravação</span>
                <vuetify-audio
                  v-if="record.end.contentRecord"
                  downloadable
                  color="primary"
                  :file="record.end.contentRecord.record_url"
                  :flat="true"
                >
                </vuetify-audio>
              </section>
              <v-divider class="mb-4 mx-4"></v-divider>
            </div>
          </section>
        </section>
      </v-tab-item>
    </v-tabs-items>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'
import SoftPhoneApi from '~/assets/js/softphone/softphone.js'

const initialState = () => {
  return {
    phoneInputKey: '',
    taskType: null,
    templates: [],
    template: null,
    content: null,
    time: '00:00:00',
    timeBegan: null,
    timeStopped: null,
    stoppedDuration: 0,
    started: null,
    running: false,
    listNumber: ['*', 0, '#', 1, 2, 3, 4, 5, 6, 7, 8, 9],
    outputPlaceholder: null,
    taskPlaceholder: null,
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
    taskTabs: [
      { title: 'Ligar para o contato', value: 'call' },
      { title: 'Histórico de ligações', value: 'history' },
    ],
    contact: {},
    contactMedia: {},
    taskTab: 0,
    customToolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: '' }, { align: 'justify' }, { align: 'right' }],
      ['link', 'image'],
    ],
    mediaDialog: false,
    mediaValue: null,
    credentialsError: false,
  }
}

export default {
  props: {
    taskId: { type: [Number, String], default: null },
    opportunityId: { type: [Number, String], default: null },
    propContact: Object,
    propMedia: Object,
    mediaTypeId: Number,
    companies: Array,
    dialog: Boolean,
    taskLog: Array,
    taskState: String,
    taskContent: String,
  },
  data() {
    return initialState()
  },
  components: {
    VuetifyAudio: () => import('vuetify-audio'),
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      meta: 'meta',
    }),
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
    recordsList: function () {
      return this.generateRecordList(this.taskLog)
    },
    phoneCardStyle: function () {
      let color = 'phone-status-default'
      if (this.phoneStatus === 'call') {
        color = 'phone-status-active'
      }
      if (this.phoneStatus === 'hold' || this.phoneStatus === 'muted') {
        color = 'phone-status-hold'
      }
      return `background-color: var(--v-${color}-base);`
    },
    contactId: function () {
      if (this.contact?.id) {
        return this.contact.id
      }
      return null
    },
    finishedTask: function () {
      if (this.taskState === 'Concluída') {
        return true
      }
      return false
    },
    createdTask: function () {
      if (this.taskState === 'Não iniciada') {
        return true
      }
      return false
    },
    onGoingTask: function () {
      if (this.taskState === 'Em execução' || this.taskState === 'Em espera') {
        return true
      }
      return false
    },
    phoneNotConnected: function() {
      if (this.credentialsError) {
        return true
      }
      if (this.phoneStatus === 'webphone_not_connected') {
        return true
      }
      return false
    },
    companyContactId() {
      if (this.companies?.length > 0)
        return this.contact?.companies?.find(
          (company) => company.company_id === this.companies[0]
        )?.id

      return null
    },
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        this.phoneInputKey = null
        this.contact = this.propContact
        this.contactMedia = Object.assign({}, this.propMedia)
        this.content = this.taskContent

        await this.$nextTick()
        this.phoneInputKey = this.propMedia?.value
        this.getConfig()
      } else {
        this.resetData()
        this.reset()
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
  },
  async mounted() {
    this.phoneInputKey = null
    this.contact = this.propContact
    this.contactMedia = Object.assign({}, this.propMedia)
    this.content = this.taskContent

    await this.$nextTick()
    this.phoneInputKey = this.propMedia?.value

    this.getConfig()
  },
  methods: {
    handleCancel() {
      if (this.phoneStatus == 'call' || this.phoneStatus == 'hold') {
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
      } else {
        Object.assign(this.$data, initialState())
        this.$emit('closeDialog')
      }
    },
    loadForm(newValue) {
      if (!newValue) {
        this.phone.doLogoff()
        this.reset()
      } else {
        this.getConfig()
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
    async getConfig() {
      await this.$axios
        .get('/ecosystem/configuration', { params: { team_id: this.userTeam } })
        .then((data) => {
          this.sysconfig = data.data
          this.loadPhone()
        })
    },
    showCredentialsError() {
      this.credentialsError = true
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
      
    },
    loadPhone() {
      let credentials = this.getPhoneCredentials()
      let config = this.sysconfig
      let self = this

      if (!credentials) {
        this.showCredentialsError()
      } else {
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
      }

    },
    showError(err) {
      this.errorMessage = err
    },
    setStatus(status) {
      if (
        (this.phoneStatus === 'hold' ||
          this.phoneStatus === 'call' ||
          this.phoneStatus === 'dropping') &&
        status === 'connected'
      ) {
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
      record && (await this.getAudioStream(record))
      const recordFromS3 = this.provider === 'voixtel'
      const islog = true
      const getRecord = true
      const status = 'error'
      const title = 'Ligação - Encerrada'
      await this.includeContent(islog, getRecord, status, title, recordFromS3)
      this.handleRefresh()
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
      this.reset()
      this.phone.dial(this.onlyNumbers(this.contactMedia.value))

      setTimeout(() => {
        this.start()
      }, 2000)
      if (this.provider === 'voixtel') {
        this.check_line = window.setInterval(async () => {
          await this.check_line_status()
        }, 1000)
      }
      const payload = {
        id: this.taskId,
        contact_id: this.contact.id,
        media_id: this.contactMedia.id,
      }
      if (this.taskState === 'Não iniciada') {
        payload.state = 'active'
      }
      await this.updateData('/cash/task', payload, { fireSuccessAlert: false })

      const islog = true
      const getRecord = false
      const status = 'success'
      const title = 'Ligação - Conectada'
      const media = this.contactMedia.value
      await this.includeContent(islog, getRecord, status, title, media)
      this.handleRefresh()

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
      } else {
        clearInterval(this.check_line)
      }
    },
    getRecord() {
      setTimeout(() => {
        this.stop()
      }, 2000)
      this.phone.getRecord()
    },
    async includeContent(log, record, status, title, recordFromS3, media) {
      const history = JSON.stringify({
        history: {
          phone_called: { ...this.contactMedia, contact: this.contact.name },
          is_log: log,
          status: status,
          user_id: this.userInfo.id,
          user_name: this.userInfo.name,
          record_url: record && this.recordsData,
          record_key: recordFromS3 === true && this.recordKey,
          record_from_S3: recordFromS3,
          media: media,
        },
      })
      const formData = {
        task_id: this.receivedTaskId && this.receivedTaskId,
        description: title,
        content: history,
      }
      await this.createItem('/cash/task-log', formData, {
        fireSuccessAlert: false,
      })
    },

    async updateContentData(newValue) {
      const contentData = JSON.stringify({ body: newValue, isLog: false })
      this.formData.content = contentData
    },
    handleRefresh() {
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
      this.$emit('onCallStart', true)
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
        timeElapsed = new Date(
          currentTime - this.timeBegan - this.stoppedDuration
        ),
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
        return 'Webphone não conectado'
      }
    },
    async handleAddContact(nameValue) {
      try {
        const companyId = this.companies[0]
        const response = await this.createItem(
          'customer/contact',
          { name: nameValue, company_id: companyId },
          { throwError: true }
        )
        const contact = await this.getItem(
          '/customer/contact',
          `id=${response.id}`
        )
        this.contact = contact
      } catch (error) {
        console.log(error)
      }
    },
    handleAddContactMedia(nameValue) {
      this.mediaValue = nameValue
      this.mediaDialog = true
    },
    handleMediaCreate(contactMedia) {
      this.contactMedia = contactMedia
      this.mediaDialog = false
      this.$refs.contactMediaCombobox.refreshList()
    },
    disableCreationBtn(searchValue, items, selectedValue, field = 'name') {
      if (this.companies.length === 0) {
        return true
      }
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
    generateRecordList(logs) {
      const recordDescriptions = ['Ligação - Conectada', 'Ligação - Encerrada']
      const records = logs.filter((log) =>
        recordDescriptions.includes(log.description)
      )
      const finalRecords = records.map((record, index) => {
        const fullRecord = { id: record.id, begin: null, end: null }
        try {
          const contentRecord = JSON.parse(record.content)
          record.contentRecord = contentRecord.history
        } catch (error) {
          record.contentRecord = {}
        }
        if (record.description === 'Ligação - Conectada') {
          fullRecord.begin = record
          if (index < records.length - 1) {
            if (records[index + 1].description === 'Ligação - Encerrada') {
              fullRecord.end = records[index + 1]
            }
          }
          return fullRecord
        } else {
          return null
        }
      })
      return finalRecords.filter((record) => record)
    },
    async handleTaskContent() {
      const payload = {
        id: this.taskId,
        content: this.content,
      }
      try {
        await this.updateData('/cash/task', payload, { throwError: true })
        this.$emit('onCallContentUpdate', this.content)
      } catch (error) {
        console.log(error)
      }
    },
    cancelAction() {
      this.$emit('onCancelAction', true)
    },
    resetData() {
      Object.assign(this.$data, initialState())
    },
  },
}
</script>

<style lang="scss" scoped>
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
.timeline-container {
  height: 320px;
  overflow-y: scroll;
  @include thin-scrollbar;
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
.bottom-editor-action-bar {
  border: 1px solid #d2d6da;
  border-top: none;
  border-radius: 0px 0px 8px 8px !important;
}
</style>