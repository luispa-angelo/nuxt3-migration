<template>
  <section class="ma-2">
    <div v-if="!emailTracking">
      <div v-if="createdTask" class="mb-2">
        <v-btn
          fab
          icon
          x-small
          elevation="2"
          class="mr-1"
          @click="cancelAction"
        >
          <v-icon color="primary">mdi-chevron-left</v-icon>
        </v-btn>
        <span>Envie pelo CRM</span>
      </div>
      <v-form ref="mail-form">
        <section class="pb-10">
          <div class="email-header-container">
            <NewCombobox
              chips
              clearable
              deletable-chips
              multiple
              hide-details
              dense
              hide-selected
              hide-no-data
              custom-selection
              persistent-hint
              hint="Utilize 𝘌𝘯𝘵𝘦𝘳 ou 𝘛𝘢𝘣 para inserir o endereço de e-mail."
              label="Destinatários"
              item-text="value"
              item-value="value"
              class="mx-2 my-4 py-4"
              item-color="secondary"
              endpoint="customer/all-medias-contact"
              v-model="emailContent.contacts"
              :query="`contact_id=in(${contactId})&base=in(mail)&company_id=in(${companies})`"
              :return-object="false"
              :disabled="isSendingEmail"
            >
              <template
                v-slot:selectionSlot="{ attrs, item, parent, selected }"
              >
                <v-chip
                  class="mb-1"
                  v-bind="attrs"
                  :class="
                    !checkEmailIsValid(item) ? 'email-invalid-chip' : null
                  "
                  :input-value="selected"
                  v-tooltip="
                    !checkEmailIsValid(item)
                      ? {
                          content: `
                      <div class='v-btn-tooltip'>
                        Endereço de e-mail não reconhecido
                      </div>
                      `,
                        }
                      : null
                  "
                >
                  <span class="mr-2">
                    {{ item }}
                  </span>
                  <v-icon
                    small
                    class="material-icons-round"
                    @click="parent.selectItem(item)"
                  >
                    cancel
                  </v-icon>
                </v-chip>
              </template>
            </NewCombobox>
            <v-text-field
              dense
              hide-details
              placeholder="Assunto"
              class="mx-2"
              v-model="emailContent.subject"
              :disabled="emailTracking"
            ></v-text-field>
          </div>
          <VueEditor
            class="custom-vue-editor email-vue-editor-toolbar"
            style="height: 32vh"
            v-model="emailContent.body"
            :disabled="isSendingEmail"
            :editor-toolbar="customToolbar"
          />
        </section>
        <section class="bottom-editor-action-bar px-2 pb-2 mt-1 pt-4">
          <v-alert
            v-for="(file, index) in fileList"
            dismissible
            class="py-1 mb-2 mr-4 align-self-start font-body-medium"
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
          <section class="d-flex justify-space-between align-center">
            <div class="d-flex justify-space-between align-center">
              <v-file-input
                hide-details
                multiple
                hide-input
                dense
                id="file-input"
                class="py-0 my-0 flex-grow-0"
                ref="fileInput"
                placeholder="Clique aqui para selecionar o arquivo ou arraste nesta área"
                prepend-icon="mdi-paperclip"
                v-model="files"
                @change="handleFileInput"
              >
              </v-file-input>
              <v-menu offset-y :close-on-content-click="false">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    outlined
                    class="mr-2"
                    color="primary"
                    small
                    v-bind="attrs"
                    v-on="on"
                    :disabled="finishedTask || isSendingEmail"
                    @click="handleSignature"
                  >
                    <v-icon small left>mdi-draw-pen</v-icon>
                    Adicionar assinatura
                  </v-btn>
                </template>
                <v-card width="200px" elevation="4">
                  <v-card-actions class="d-flex flex-column">
                    <v-btn
                      text
                      @click="applyEmailSignature"
                      :disabled="!signature"
                      block
                    >
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
              <TemplateSelector
                :is-disabled="finishedTask || isSendingEmail"
                :media-type-id="mediaTypeId"
                :icon-btn="false"
                @onTemplateChosen="
                  (template) => {
                    emailContent.body = templateInsertion(template, emailContent.body)
                  }
                "
              />
            </div>
            <div>
              <v-btn
                small
                class="mr-2"
                color="secondary"
                :disabled="finishedTask || !emailTracking || isSendingEmail"
                @click="replyEmail = false"
              >
                Cancelar
              </v-btn>
              <v-btn
                small
                color="primary"
                :disabled="
                  finishedTask ||
                  !emailContent.contacts ||
                  emailContent.contacts.length == 0 ||
                  inValidEmailBody
                "
                :loading="isSendingEmail"
                @click="handleEmail"
              >
                Enviar
              </v-btn>
            </div>
          </section>
        </section>
      </v-form>
    </div>
    <div v-else>
      <div class="d-flex">
        <span class="mr-2">Assunto:</span>
        <span class="font-weight-bold">{{ emailContent.subject }}</span>
      </div>
      <v-expansion-panels
        accordion
        multiple
        class="mt-3 mb-3 mb-2 email-history-container"
        v-model="emailPanel"
      >
        <div
          class="w-100 d-flex justify-space-between px-2 py-1 email-history-header"
        >
          <v-chip-group
            column
            multiple
            class="chip-group"
            v-model="emailChipSelection"
            :show-arrows="false"
          >
            <v-chip
              :outlined="!emailChipSelection.some((value) => value === 0)"
              color="primary"
              class="px-2"
              >Não lidos</v-chip
            >
            <v-chip
              :outlined="!emailChipSelection.some((value) => value === 1)"
              color="primary"
              class="px-2"
              >Lidos</v-chip
            >
            <v-chip
              :outlined="!emailChipSelection.some((value) => value === 2)"
              color="primary"
              class="px-2"
              >Recebidos</v-chip
            >
            <v-chip
              :outlined="!emailChipSelection.some((value) => value === 3)"
              color="primary"
              class="mr-0 px-2"
              >Enviados</v-chip
            >
          </v-chip-group>
          <div class="d-flex align-center">
            <v-progress-circular
              v-if="isCheckingEmail"
              indeterminate
              width="3"
              size="24"
              color="primary"
            ></v-progress-circular>
            <v-icon
              v-if="emailHistory.length !== emailPanel.length"
              class="material-icons-round"
              @click="expandAll"
              >unfold_more</v-icon
            >
            <v-icon v-else class="material-icons-round" @click="expandNone"
              >unfold_less</v-icon
            >
          </div>
        </div>
        <div class="email-timeline w-100">
          <v-expansion-panel v-if="replyEmail">
            <v-expansion-panel-header class="w-100">
              <template v-slot:default>
                <div
                  class="v-expansion-panel-header-order d-flex justify-space-between align-center"
                >
                  <div class="d-flex align-center">
                    <!-- <v-avatar color="shape" class="ml-3" size="29">
                        {{ `${email.contact[0]}` }}
                      </v-avatar> -->
                    <p class="mb-0 mx-4">{{ taskAssignedTo }}</p>
                  </div>
                  <div class="d-flex flex-row justify-end align-center">
                    <p
                      class="text-right mb-0 mr-5 caption stroke--text text--darken-3"
                    >
                      {{ $moment(new Date()).format('DD/MM/YYYY HH[h]mm') }}
                    </p>
                    <v-chip
                      small
                      color="#72B21E"
                      text-color="#fff"
                      class="caption d-flex align-center mr-7"
                      >Enviando...</v-chip
                    >
                  </div>
                </div>
              </template>
              <template v-slot:actions>
                <v-icon class="v-expansion-panel-icon-order mx-2"
                  >mdi-chevron-down</v-icon
                >
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="font-body-medium">
              <v-form ref="mail-form">
                <section class="pb-10">
                  <div class="email-header-container">
                    <NewCombobox
                      chips
                      clearable
                      deletable-chips
                      multiple
                      dense
                      hide-selected
                      hide-no-data
                      custom-selection
                      persistent-hint
                      hint="Utilize 𝘌𝘯𝘵𝘦𝘳 ou 𝘛𝘢𝘣 para inserir o endereço de e-mail."
                      placeholder="Destinatários"
                      item-text="value"
                      item-value="value"
                      class="mx-2 my-4"
                      item-color="secondary"
                      endpoint="customer/all-medias-contact"
                      v-model="emailContent.contacts"
                      :query="`contact_id=in(${contactId})&base=in(mail)&company_id=in(${companies})`"
                      :return-object="false"
                      :disabled="isSendingEmail"
                    >
                      <template
                        v-slot:selectionSlot="{ attrs, item, parent, selected }"
                      >
                        <v-chip
                          class="mb-1"
                          v-bind="attrs"
                          :class="
                            !checkEmailIsValid(item)
                              ? 'email-invalid-chip'
                              : null
                          "
                          :input-value="selected"
                          v-tooltip="
                            !checkEmailIsValid(item)
                              ? {
                                  content: `
                                <div class='v-btn-tooltip'>
                                  Endereço de e-mail não reconhecido
                                </div>
                                `,
                                }
                              : null
                          "
                        >
                          <span class="mr-2">
                            {{ item }}
                          </span>
                          <v-icon
                            small
                            class="material-icons-round"
                            @click="parent.selectItem(item)"
                          >
                            cancel
                          </v-icon>
                        </v-chip>
                      </template>
                    </NewCombobox>
                    <v-text-field
                      dense
                      hide-details
                      placeholder="Assunto"
                      class="mx-2"
                      v-model="emailContent.subject"
                      :disabled="emailTracking"
                    ></v-text-field>
                  </div>
                  <VueEditor
                    class="custom-vue-editor email-vue-editor-toolbar"
                    style="height: 300px"
                    v-model="emailContent.body"
                    :disabled="isSendingEmail"
                    :editor-toolbar="customToolbar"
                  />
                </section>
                <section class="bottom-editor-action-bar px-2 pb-2 mt-1 pt-1">
                  <v-alert
                    v-for="(file, index) in fileList"
                    dismissible
                    class="py-1 mb-2 mr-4 align-self-start font-body-medium"
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
                  <section class="d-flex justify-space-between align-center">
                    <div class="d-flex justify-space-between align-center">
                      <v-file-input
                        hide-details
                        multiple
                        hide-input
                        dense
                        id="file-input"
                        class="py-0 my-0 flex-grow-0"
                        ref="fileInput"
                        placeholder="Clique aqui para selecionar o arquivo ou arraste nesta área"
                        prepend-icon="mdi-paperclip"
                        v-model="files"
                        @change="handleFileInput"
                      >
                      </v-file-input>
                      <v-menu offset-y :close-on-content-click="false">
                        <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            outlined
                            class="mr-2"
                            color="primary"
                            small
                            v-bind="attrs"
                            v-on="on"
                            :disabled="finishedTask || isSendingEmail"
                            @click="handleSignature"
                          >
                            <v-icon small left>mdi-draw-pen</v-icon>
                            Adicionar assinatura
                          </v-btn>
                        </template>
                        <v-card width="200px" elevation="4">
                          <v-card-actions class="d-flex flex-column">
                            <v-btn
                              text
                              @click="applyEmailSignature"
                              :disabled="!signature"
                              block
                            >
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
                      <TemplateSelector
                        :is-disabled="finishedTask || isSendingEmail"
                        :media-type-id="mediaTypeId"
                        :icon-btn="false"
                        @onTemplateChosen="
                          (template) => {
                            emailContent.body = templateInsertion(template, emailContent.body)
                          }
                        "
                      />
                    </div>
                    <div>
                      <v-btn
                        small
                        class="mr-2"
                        color="secondary"
                        :disabled="!emailTracking || isSendingEmail"
                        @click="replyEmail = false"
                      >
                        Cancelar
                      </v-btn>
                      <v-btn
                        small
                        color="primary"
                        :disabled="
                          finishedTask ||
                          !emailContent.contacts ||
                          emailContent.contacts.length == 0 ||
                          inValidEmailBody
                        "
                        :loading="isSendingEmail"
                        @click="handleEmail"
                      >
                        Enviar
                      </v-btn>
                    </div>
                  </section>
                </section>
              </v-form>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <v-expansion-panel
            v-for="(email, index) in emailHistory"
            :key="index"
          >
            <v-expansion-panel-header
              class="w-100"
              :class="itemRowBackground(email.content)"
              @click="handleEmailHeaderClick(email.id, email.content, index)"
            >
              <template v-slot:default>
                <div
                  class="v-expansion-panel-header-order d-flex justify-space-between align-center"
                >
                  <div class="d-flex align-center">
                    <!-- <v-avatar color="shape" class="ml-3" size="29">
                        {{ `${email.contact[0]}` }}
                      </v-avatar> -->
                    <p class="mb-0 mx-4" :class="itemTextClass(email.content)">
                      {{ email.contact }}
                    </p>
                  </div>
                  <div class="d-flex flex-row justify-end align-center">
                    <p
                      class="text-right mb-0 mr-5 caption stroke--text text--darken-3"
                    >
                      {{
                        $moment(email.created_at).format('DD/MM/YYYY HH[h]mm')
                      }}
                    </p>
                    <v-chip
                      small
                      :color="
                        email.description == 'Envio de e-mail'
                          ? '#72B21E'
                          : '#669DF6'
                      "
                      text-color="#fff"
                      class="caption d-flex align-center"
                      :class="
                        email.description == 'Envio de e-mail' ? 'mr-2' : ''
                      "
                      >{{
                        email.description == 'Envio de e-mail'
                          ? 'Enviado'
                          : 'Recebido'
                      }}</v-chip
                    >
                    <v-icon
                      size="20"
                      color="primary"
                      class="mx-2"
                      :disabled="finishedTask"
                      @click="handleReply(email)"
                      >mdi-reply</v-icon
                    >
                  </div>
                </div>
              </template>
              <template v-slot:actions>
                <v-icon class="v-expansion-panel-icon-order mx-2"
                  >mdi-chevron-down</v-icon
                >
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content class="font-body-medium">
              <div class="d-flex flex-row ml-1">
                <span class="stroke--text text--darken-3">Para:&nbsp;</span>
                <span v-if="email.description === 'Envio de e-mail' && email.content">{{
                  email.content.contact
                }}</span>
                <span v-else>{{ `${email.to ? email.to.join(', ') : ''}` }}</span>
              </div>
              <div class="d-flex flex-row ml-1">
                <span class="stroke--text text--darken-3">Cc:&nbsp;</span>
                <span>{{ `${email.cc ? email.cc : ''}` }}</span>
              </div>
              <blockquote
                class="d-flex flex-column ml-1 mt-2 mail-body"
                v-if="!email.isEmailReceived"
                v-html="email.body"
              ></blockquote>
              <blockquote class="d-flex flex-column ml-1 mt-2 mail-body" v-else>
                <div v-html="email.body"></div>
              </blockquote>
              <div class="attachments" v-if="email.attachments">
                <v-chip
                  v-for="attachment in email.attachments"
                  :key="attachment[0]"
                  label
                  class="clickable w-50"
                  @click="downloadAttachment(attachment[0])"
                >
                  <v-icon class="material-icons-round" left>
                    attach_file
                  </v-icon>
                  {{ attachment[1] }}
                </v-chip>
              </div>
              <div class="mt-3 d-flex justify-start">
                <v-btn
                  outlined
                  small
                  class="mr-2"
                  :disabled="finishedTask"
                  @click="handleReply(email)"
                  >Responder</v-btn
                >
                <v-btn
                  outlined
                  small
                  :disabled="finishedTask"
                  @click="handleReply(email, true)"
                  >Responder a todos</v-btn
                >
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </div>
      </v-expansion-panels>
    </div>
    <TaskFileSizeAlert
      :prop-dialog="fileSizeDialog"
      :files="invalidFiles"
      @onClose="
        () => {
          this.fileSizeDialog = false
        }
      "
    />
  </section>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

const initialState = () => ({
  template: null,
  replyEmail: false,
  signature: null,
  emailContent: {
    contacts: [],
    subject: '',
    body: '',
  },
  customToolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: '' }, { align: 'justify' }, { align: 'right' }],
    ['link', 'image'],
  ],
  emailPanel: [],
  emailChipSelection: [],
  isSendingEmail: false,
  files: [],
  fileList: [],
  invalidFiles: [],
  fileSizeDialog: false,
  interval: null,
  timeInterval: 30000,
  updatedEmailHistory: [],
  isCheckingEmail: false,
})
const tagRegex = /(<([^>]+)>)/gi
const charRegex = /\S/

export default {
  props: {
    taskId: { type: [Number, String], default: null },
    opportunityId: { type: [Number, String], default: null },
    propContact: Object,
    propMedia: Object,
    dialog: Boolean,
    taskLog: Array,
    taskAssignedTo: String,
    mediaTypeId: Number,
    taskState: String,
    companies: Array,
  },
  data() {
    return initialState()
  },
  validations: {
    output: { required },
    taskType: { required },
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta',
    }),
    emailHistory: function () {
      let emailHistory = []
      if (this.taskLog) {
        emailHistory = this.generateEmailHistory(this.taskLog)
      }
      if (this.emailChipSelection.length > 0) {
        emailHistory = this.applyFilters(emailHistory, this.emailChipSelection)
      }
      return emailHistory
    },
    emailTracking: function () {
      const emailDescriptions = ['Envio de e-mail', 'Resposta do cliente']
      const hasEmail = this.taskLog.some((log) =>
        emailDescriptions.includes(log.description)
      )
      if (hasEmail) {
        return true
      }
      return false
    },
    contactId: function () {
      if (this.propContact?.id) {
        return this.propContact.id
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
    inValidEmailBody: function () {
      const body = this.emailContent.body
        ? this.emailContent.body.replace(tagRegex, '')
        : ''
      if (body.length > 1 && charRegex.test(body)) {
        return false
      }
      return true
    },
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        if (this.taskId && this.emailTracking) {
          this.installAutoUpdate()
        }
      } else {
        this.resetData()
      }
    },
    template(newValue) {
      if (newValue) {
        this.emailContent.body
          ? (this.emailContent.body += newValue.content)
          : (this.emailContent.body = newValue.content)
      }
    },
    emailTracking(newValue) {
      if (newValue) {
        this.replyEmail = false
        this.template = null
      }
    },
    updatedEmailHistory(newValue) {
      if (newValue.length > this.taskLog.length) {
        this.timeInterval = 30000
        this.$emit('onEmailUpdated', true)
        this.$store.dispatch('Task/refresh', true)
      }
    },
  },
  async mounted() {
    if (this.taskId) {
      if (this.propMedia) {
        this.emailContent.contacts.push(this.propMedia.value)
      }
      if (this.emailTracking) {
        this.installAutoUpdate()
      }
    }
  },
  methods: {
    handleCancel() {
      this.replyEmail && this.$refs['mail-form'].reset()
      this.emailContent.subject = null
      this.fileList = []
      this.discardEmail()
    },
    generateEmailHistory(logs) {
      const emailDescriptions = ['Envio de e-mail', 'Resposta do cliente']
      const emails = logs.filter((log) =>
        emailDescriptions.includes(log.description)
      )
      emails.length > 0 && this.getEmailInfos(emails[0])
      const history = emails.map((email) => {
        const { content, description, created_at, id } = email
        const contentJson = JSON.parse(content)
        const item = {
          id,
          body: '',
          contact: '',
          subject: '',
          to: null,
          cc: null,
          cco: null,
          description: description,
          content: contentJson,
          created_at: this.$moment(`${created_at}Z`),
          created_at_history: this.$moment(`${created_at}Z`),
        }
        if (description == 'Envio de e-mail') {
          item.body = contentJson.body
          item.subject = contentJson.subject
          item.contact = this.taskAssignedTo
          item.to = this.emailContent.contacts
          item.isEmailReceived = false
          item.attachments = contentJson.attachments
          item.content.read = true
        } else {
          item.body = contentJson.simplifiedBody
            ? contentJson.simplifiedBody
            : this.removeEmailChain(contentJson.body) //contentJson.body.replace(/>/g, ' ')
          item.subject = contentJson.subject
          item.contact = contentJson.from
          ;(item.to = contentJson.to ? contentJson.to.split(', ') : null),
          (item.cc = contentJson.cc ? contentJson.cc.split(', ') : null),
          (item.cco = contentJson.cco ? contentJson.cco.split(', ') : null),
          (item.isEmailReceived = true)
          item.attachments = contentJson.attachments
        }
        return item
      })
      return history.sort((a, b) => b.id - a.id)
    },
    getEmailInfos(email) {
      const content = JSON.parse(email.content)
      this.emailContent.subject = content.subject
    },
    async packEmailData() {
      const attachments =
        this.fileList.length > 0 ? await this.createEmailAttachments() : []
      const reSubject = 'Re: '
      let subject = `${this.emailTracking ? reSubject : ''}${
        this.emailContent.subject
      }`

      return JSON.stringify({ ...this.emailContent, subject, attachments })
    },
    async sendEmail() {
      this.isSendingEmail = true
      const payload = {}
      payload.id = this.taskId
      payload.state = 'active'
      payload.runtime = await this.packEmailData()
      await this.updateData('/cash/task', payload)
      await this.handleRefresh()
      this.isSendingEmail = false
      this.handleCancel()
    },
    handleEmail(content) {
      if (this.taskId) {
        this.sendEmail(content)
      }
    },
    discardEmail() {
      this.emailContent.body = ''
      this.emailTracking && (this.replyEmail = false)
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
        signaturePayload.extra = JSON.stringify({
          ...JSON.parse(extra),
          signature,
        })
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
      this.handleEmailCheckInterval()
    },
    removeEmailChain(body) {
      if (body) {
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
        uid: fileUid,
      })
      await this.$axios
        .get('/cash/task-upload-by-uid?' + params.toString())
        .then((data) => {
          window.open(data.data.url)
        })
    },
    handleEmailHeaderClick(id, content, index) {
      if (content.read === false) {
        try {
          content.read = true
          this.updateData(
            '/cash/task-log',
            { id, content: JSON.stringify(content), task_id: this.taskId },
            { fireSuccessAlert: false }
          )
          this.emailHistory[index].content = content
        } catch (error) {
          return
        }
      }
    },
    itemRowBackground(content) {
      if (content.read === false) {
        return ''
      }
      return 'bg-table-row'
    },
    itemTextClass(content) {
      if (content.read === false) {
        return 'font-weight-bold'
      }
      return ''
    },
    expandAll() {
      this.emailPanel = [...Array(this.emailHistory.length).keys()].map(
        (k, i) => i
      )
    },
    expandNone() {
      this.emailPanel = []
    },
    handleReply(email, all = false) {
      if (!this.replyEmail) {
        if (all) {
          const contacts = []
          if (email.cc) {
            contacts.push(...email.cc)
          }
          if (email.content.from) {
            contacts.push(email.content.from)
          }
          if (email.to) {
            contacts.push(...email.to)
          }
          this.emailContent.contacts = contacts.filter((contact) => {
            if (
              contact === 'crm@omie.com.br' ||
              contact.includes('omieinbox')
            ) {
              return false
            }
            return true
          })
        } else {
          this.emailContent.contacts = email.content.from
            ? [email.content.from]
            : []
        }
        this.replyEmail = true
        this.emailPanel = [this.emailHistory.length]
      }
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
    removeFile(toggle) {
      toggle()
      this.$nextTick(() => {
        const list = this.fileList
        this.fileList = list.filter((item) => item.active)
      })
    },
    async createEmailAttachments() {
      const taskInfo = { id: this.taskId }
      const payload = new FormData()
      payload.append('data', JSON.stringify(taskInfo))
      this.fileList.forEach((file) => {
        if (file.valid) {
          payload.append('file', file.file)
        }
      })
      try {
        const response = await this.updateData(
          '/cash/task-with-files',
          payload,
          { throwError: true, fireSuccessAlert: false }
        )
        return response.attachments
      } catch (error) {
        console.log(error)
        return []
      }
    },
    installAutoUpdate() {
      if (!this.interval) {
        this.interval = setTimeout(() => {
          this.interval = null
          this.updateEmailHistory()

          if (this.dialog) {
            this.installAutoUpdate()
          }
        }, this.timeInterval)
      }
    },
    async updateEmailHistory() {
      this.isCheckingEmail = true
      const { data } = await this.getList(
        '/cash/task-log',
        `task_id=${this.taskId}`
      )
      this.updatedEmailHistory = data
      this.isCheckingEmail = false
    },
    applyFilters(emails, selection) {
      const filters = {
        read: [],
        description: [],
      }
      if (selection.some((value) => value === 0)) {
        filters.read.push(false)
      }
      if (selection.some((value) => value === 1)) {
        filters.read.push(true)
      }
      if (selection.some((value) => value === 2)) {
        filters.description.push('Resposta do cliente')
      }
      if (selection.some((value) => value === 3)) {
        filters.description.push('Envio de e-mail')
      }
      const filteredEmails = emails.filter((email) => {
        const { read, description } = filters
        let readFilter = true
        let descriptionFilter = true
        if (read.length > 0) {
          readFilter = read.includes(email.content.read)
        }
        if (description.length > 0) {
          descriptionFilter = description.includes(email.description)
        }
        if (readFilter && descriptionFilter) {
          return true
        }
        return false
      })
      return filteredEmails
    },
    cancelAction() {
      this.$emit('onCancelAction', true)
    },
    resetData() {
      Object.assign(this.$data, initialState())
    },
    handleEmailCheckInterval() {
      if (this.interval) {
        clearTimeout(this.interval)
        this.interval = null
      }
      this.timeInterval = 1000
      this.installAutoUpdate()
    },
  },
}
</script>

<style lang="scss" scoped>
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
  border-bottom: solid 1px #f5f5f5;
}
.bottom-editor-action-bar {
  border: 1px solid #d2d6da;
  border-top: none;
  border-radius: 0px 0px 8px 8px !important;
}
.email-header-container {
  border: 1px solid #d2d6da;
  border-bottom: none;
  border-radius: 8px 8px 0px 0px !important;
}
.email-vue-editor-toolbar .ql-toolbar.ql-snow {
  border-radius: 0px !important;
  border-top: none !important;
  border-bottom: none !important;
}
.v-expansion-panel::before {
  box-shadow: none;
}
.email-history-container {
  border: 1px solid #d2d6da;
  border-radius: 8px !important;
}
.email-invalid-chip {
  border: 1px dashed #b82927;
}
.email-history-header {
  border-bottom: 1px solid #d2d6da;
}
.email-timeline {
  max-height: 51vh;
  overflow: auto;
  @include thin-scrollbar;
}
</style>