<template>
  <section class="my-3 mx-2">
    <div v-if="createdTask" class="mb-2">
      <v-btn fab icon x-small elevation="2" class="mr-1" @click="cancelAction">
        <v-icon color="primary">mdi-chevron-left</v-icon>
      </v-btn>
      <span>Converse pelo CRM</span>
    </div>
    <v-row>
      <v-col xl="4" lg="4">
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
          :disabled="!createdTask"
          @change="resetContactMedia"
        >
          <template v-slot:creationSlot="props">
            <v-btn
              text
              block
              :disabled="disableCreationBtn(props.search, props.list, contact)"
              @click="handleAddContact(props.search)"
            >
              <v-icon class="mr-2 material-icons-round">person</v-icon>
              <span>Cadastrar contato</span>
            </v-btn>
          </template>
        </NewCombobox>
      </v-col>
      <v-col xl="4" lg="4">
        <div class="d-flex align-start">
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
            :custom-mask="maskPhone"
            :load-on-mount="false"
            :label="'Telefone do contato'"
            :rules="phoneRules"
            :messages="phoneValidationMessages"  
            :query="`contact_id=in(${contactId})&base=in(landline,mobile)&company_id=in(${companies})`"
            :disabled="!createdTask"
          >
            <template v-slot:creationSlot="props">
              <v-btn
                text
                block
                :disabled="
                  disableCreationBtn(props.search, props.list, contact, 'value')
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
          <v-icon
            v-if="mediaStatus"
            class="mt-2 ml-1"
            :color="mediaStatus == 'Disponível' ? 'green' : 'red'"
            v-tooltip="{
              content: `${
                mediaStatus == 'Disponível'
                  ? `<div class='v-btn-tooltip'>Disponível</div>`
                  : `<div class='v-btn-tooltip'>Número sem WhatsApp ou falha na verificação</div>`
              }`,
              placement: 'top-center',
            }"
            >{{
              mediaStatus == 'Disponível'
                ? 'mdi-check-circle'
                : ' mdi-alert-circle'
            }}
          </v-icon>

          <ContactMediaDialog
            media-base="mobile"
            :prop-dialog="mediaDialog"
            :contact-id="contact.id"
            :companyContactId="companyContactId"
            :media-value="mediaValue"
            @onMediaCreated="handleMediaCreate"
          />
        </div>
      </v-col>
      <v-col xl="4" lg="4" class="pl-0">
        <div class="d-flex flex-column align-start mx-2">
          <p class="mb-0 mt-n6 clock-title font-body-medium">
            {{
              conversationWindow
                ? 'Status da Janela'
                : 'Status - Aguardando atividade'
            }}
          </p>
          <div class="d-flex flex-row align-center clock-time">
            <v-icon small class="mx-2">mdi-clock-time-four</v-icon>
            <p class="mt-4 clock-text font-body-medium">
              {{
                conversationWindow !== 'Conversa fechada'
                  ? conversationClockTime + ' ' + '-' + ' ' + conversationWindow
                  : '--:--:-- Conversa fechada'
              }}
            </p>
          </div>
        </div>
      </v-col>
    </v-row>

    <div
      id="timeline-scroll"
      ref="timeline-scroll"
      class="chat-container shape pa-2"
    >
      <div
        v-for="message in chatHistory"
        :key="message.uuid"
        :class="
          message.is_bot == 0 ? 'd-flex justify-end' : 'd-flex justify-start'
        "
        class="d-flex"
        elevation="2"
      >
        <v-card
          class="d-flex align-center mb-2"
          :class="message.is_bot == 0 ? 'msg-crm' : 'msg-customer'"
        >
          <v-card-text class="pa-2 d-flex flex-column">
            <div>
              <audio
                v-if="message.msg_attch_url && message.msg_attch_type == 'ogg'"
                controls
                class="my-2"
              >
                <source :src="message.msg_attch_url" />
              </audio>
              <video
                v-else-if="
                  message.msg_attch_url && message.msg_attch_type == 'mp4'
                "
                controls
                height="160"
              >
                <source :src="message.msg_attch_url" type="video/mp4" />
              </video>

              <v-sheet
                v-else-if="
                  message.msg_attch_url && message.msg_attch_type == 'pdf'
                "
              >
                <div class="w-100 d-flex justify-end">
                  <v-btn
                    fab
                    icon
                    x-small
                    :href="message.msg_attch_url"
                    target="_blank"
                    class="text-right my-3"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                  </v-btn>
                </div>
                <iframe :src="message.msg_attch_url" frameborder="1" />
              </v-sheet>

              <span
                v-else-if="!message.msg_attch_url"
                class="font-body-medium"
                style="white-space: pre-wrap"
                v-html="message.message"
              />

              <v-sheet
                v-else-if="
                  (message.msg_attch_url && message.msg_attch_type == 'jpg') ||
                  'jpeg' ||
                  'png' ||
                  'svg'
                "
              >
                <div class="d-flex justify-end">
                  <v-btn
                    fab
                    icon
                    x-small
                    :href="message.msg_attch_url"
                    target="_blank"
                    class="text-right my-3"
                  >
                    <v-icon>mdi-open-in-new</v-icon>
                  </v-btn>
                </div>
                <img
                  :src="message.msg_attch_url"
                  frameborder="0"
                  height="160"
                />
              </v-sheet>
            </div>
            <span
              class="gray--text text--lighten-1 d-flex justify-end message-date"
            >
              {{ formatDate(message.date) }}
              {{ formatHour(message.date) }}
            </span>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div v-if="conversationWindow == 'Conversa iniciada'" ref="chat-editor">
      <v-card class="card-text-area" elevation="0">
        <v-card-text class="pa-1">
          <v-textarea
            dense
            solo
            flat
            no-resize
            counter="640"
            class="ml-2 pa-1"
            rows="3"
            v-model="payloadChat.message"
            :placeholder="
              conversationWindow == 'Conversa fechada'
                ? 'Conversa encerrada, apenas histórico disponível'
                : 'Escreva sua mensagem'
            "
            @keyup.enter.shift.exact.prevent="sendChatMessage"
          >
          </v-textarea>
        </v-card-text>
        <v-card-actions class="d-flex justify-space-between pt-0">
          <section class="d-flex align-center">
            <emoji-picker @emoji="append" :search="searchEmoji">
              <div
                class="emoji-invoker"
                slot="emoji-invoker"
                slot-scope="{ events: { click: clickEvent } }"
                @click.stop="clickEvent"
              >
                <v-btn icon small>
                  <v-icon
                    size="20"
                    :color="
                      conversationWindow != 'Conversa iniciada'
                        ? '#E5E5E5'
                        : '#fbba08'
                    "
                    >mdi-emoticon</v-icon
                  >
                </v-btn>
              </div>
              <v-card
                slot="emoji-picker"
                slot-scope="{ emojis, insert }"
                class="emoji-box"
              >
                <v-card-text
                  class="emoji-picker"
                  style="height: 350px; overflow: auto"
                >
                  <v-text-field
                    v-model="searchEmoji"
                    v-focus
                    dense
                    solo
                    label="Pesquisar"
                  ></v-text-field>
                  <div v-for="(emojiGroup, category) in emojis" :key="category">
                    <p class="subtitle-2 mb-1">{{ category }}</p>
                    <div class="emojis">
                      <span
                        v-for="(emoji, emojiName) in emojiGroup"
                        :key="emojiName"
                        @click="insert(emoji)"
                        :title="emojiName"
                        style="cursor: pointer"
                        >{{ emoji }}</span
                      >
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </emoji-picker>
            <label for="file-upload" class="custom-file-upload">
              <v-icon size="20"> > mdi-paperclip </v-icon>
            </label>
            <input
              id="file-upload"
              type="file"
              accept="image/*,video/*,audio/*,.pdf"
              @change="sendFile"
            />
            <TemplateSelector
              :media-type-id="mediaTypeId"
              @onTemplateChosen="
                (template) => {
                  payloadChat.message += '\n' + template.contentPlainText
                }
              "
            />
          </section>
          <v-btn
            class="primary"
            @click="sendChatMessage"
            :loading="isSendingMessage"
            >Enviar
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>

    <div
      v-if="conversationWindow !== 'Conversa fechada'"
      class="d-flex flex-column align-center wrapper py-2"
    >
      <div v-if="chatHistory.length == 0" class="w-100">
        <v-alert elevation="2" colored-border dense>
          <template v-slot:prepend>
            <v-icon class="material-icons-outlined mr-2" color="warning">
              warning_amber
            </v-icon>
          </template>
          <v-row align="center">
            <v-col class="grow body-3">
              Para trocar mensagens, convide o contato através do botão
              “Solicitar contato”. Caso ele aceite, será aberta uma conversa com
              prazo de 24h, o prazo será atualizado a cada nova mensagem
              recebida.
            </v-col>
            <v-col class="shrink">
              <v-btn
                color="primary"
                :loading="isSendingMessage"
                :disabled="!isValidNumber"
                @click="sendTemplate"
              >
                Solicitar contato
              </v-btn>
              <v-btn
                color="primary"
                v-if="conversationWindow == 'Em espera'"
                @click="sendTemplate"
                >Retomar contato
              </v-btn>
            </v-col>
          </v-row>
        </v-alert>
      </div>
    </div>
    <div
      v-if="conversationWindow === 'Aguardando abertura'"
      class="d-flex flex-column align-center wrapper py-2"
    >
      <v-alert icon="mdi-alert-circle" elevation="2" colored-border dense>
        <v-row align="center">
          <v-col class="grow body-3">
            Para trocar mensagens, convide o contato através do botão “Solicitar
            contato”. Caso ele aceite, será aberta uma conversa com prazo de
            24h, o prazo será atualizado a cada nova mensagem recebida.
          </v-col>
        </v-row>
      </v-alert>
    </div>
    <v-alert
      icon="mdi-alert-circle"
      v-if="conversationWindow == 'Conversa fechada'"
      color="#D2D6DA"
      class="my-2 pa-2 d-flex align-left justify-center"
    >
      <p class="mb-0 black--text text--lighten-1">
        A janela de conversação do WhatsApp está fechada
      </p>
      <p class="mb-0 close-conversation-text">
        Para abrir uma janela conversacional clique no botão “Solicitar
        contato”. O contato receberá um message template de solicitação, caso
        ele aceite será aberto uma janela com prazo de 24h, esse tempo será
        contabilizado e redefinido sempre a partir da última mensagem enviada
        pelo contato.
      </p>
    </v-alert>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

const initialState = () => ({
  phoneInputKey: '',
  mediaValue: null,
  mediaDialog: false,
  contact: {},
  contactMedia: {},
  conversationClockTime: '',
  conversationWindow: '',
  payloadChat: {
    task_id: null,
    opportunity_id: null,
    contact_media_id: null,
    email: null,
    message: null,
    user_id: null,
  },
  searchEmoji: '',
  chatHistory: [],
  interval: false,
  timeInterval: 3000,
  isValidNumber: false,
  mediaStatus: null,
  isSendingMessage: false,
})

export default {
  props: {
    taskId: { type: [Number, String], default: null },
    opportunityId: { type: [Number, String], default: null },
    propContact: Object,
    propMedia: Object,
    mediaTypeId: Number,
    companies: Array,
    dialog: Boolean,
    taskState: String,
  },
  data() {
    return initialState()
  },
  computed: {
    ...mapGetters({
      alertList: 'Alert/formattedAlerts',
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      meta: 'meta',
    }),
    contactId: function () {
      if (this.contact?.id) {
        return this.contact.id
      }
      return null
    },
    disableTask: function () {
      if (
        this.conversationWindow != 'Conversa iniciada' ||
        this.chatHistory.length == 0 ||
        this.taskState == 'Concluída'
      ) {
        return true
      }
      return false
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
    companyContactId() {
      if (this.companies?.length > 0)
        return this.contact?.companies?.find(
          (company) => company.company_id === this.companies[0]
        )?.id

      return null
    },
  },
  directives: {
    focus: {
      inserted(el) {
        el.focus()
      },
    },
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        this.snoozeDisabled = true
        this.setInitialData()
        await this.getHistory()
        this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', {
          taskIdToRead: this.taskId,
        })
      } else {
        this.taskId && this.readChatNotifications(this.taskId)
        this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', {
          taskIdToRead: null,
        })
        this.resetData()
      }
    },
    taskId(newValue) {
      if (newValue && this.dialog) {
        this.installAutoUpdate()
      }
    },
    template(newValue) {
      if (newValue) {
        this.formData.template_id = newValue.id
      }
    },
    contactMedia(newValue) {
      if (newValue) {
        this.payloadChat.contact_media_id = newValue.id
      } else {
        this.payloadChat.contact_media_id = null
      }
    },
    conversationWindow(newValue) {
      this.$emit('onChatStatusChange', newValue)
    },
    chatHistory(newValue, oldValue) {
      if (oldValue.length === 0) {
        this.$nextTick(() => {
          this.scrollToEnd()
        })
      }
    },
    'payloadChat.contact_media_id': function (newValue) {
      if (newValue) {
        if (this.createdTask) {
          this.checkMediaStatus()
        }
      }
    },
  },
  mounted() {
    this.setInitialData()
    this.getHistory()
  },
  methods: {
    async setInitialData() {
      this.phoneInputKey = null
      this.contact = this.propContact
      this.contactMedia = Object.assign({}, this.propMedia)
      this.payloadChat.email = this.userInfo.email
      this.payloadChat.user_id = this.userInfo.id
      this.payloadChat.task_id = this.taskId
      this.payloadChat.opportunity_id = this.opportunityId

      await this.$nextTick()
      this.phoneInputKey = this.propMedia?.value

      if (this.taskId) {
        this.installAutoUpdate()
      }
    },
    async sendFile(e) {
      let formData = new FormData()
      let file = e.target.files[0]
      try {
        formData.append(
          'task_id',
          this.payloadChat.task_id ? this.payloadChat.task_id : this.taskId
        )
        formData.append('opportunity_id', this.payloadChat.opportunity_id)
        formData.append('contact_media_id', this.payloadChat.contact_media_id)
        formData.append('email', this.payloadChat.email)
        formData.append('user_id', this.payloadChat.user_id)
        formData.append('file_size', '')
        formData.append('file_attch', file)
        if (file) {
          await this.$axios
            .post('/chat/weni/send-message-attach', formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            })
            .then((res) => console.log('res post', res.data))
        }
      } catch (error) {
        console.log('formData send file error', formData)
        console.log('erro sendFile', error)
        this.$swal({
          icon: 'warning',
          title: 'Não foi possível enviar o arquivo, tente novamente',
          showConfirmButton: false,
          timer: 2500,
        })
      }
    },
    append(emoji) {
      if (this.payloadChat.message !== null) {
        this.payloadChat.message += emoji
      } else {
        this.payloadChat.message = ''
        this.payloadChat.message += emoji
      }
    },
    async checkMediaStatus() {
      try {
        const response = await this.$axios.get(
          `/chat/weni/check-wpp-contact/${this.payloadChat.contact_media_id}`,
          {
            params: {
              task_id: this.taskId,
              opportunity_id: this.opportunityId,
            },
          }
        )
        if (
          (response.data.in_attendance == true ||
            response.data.status == 'invalid') &&
          this.chatHistory.length == 0
        ) {
          this.isValidNumber = false
          this.mediaStatus = 'Número com conversa em andamento'
          if (response.data.data) {
            if (response.data.data.time == 'Usuário CRM') {
              const opportunityIdFromOpenConversation =
                response.data.data.opportunity_id
              const taskIdFromOpenConversation = response.data.data.task_id
              this.$swal({
                icon: 'warning',
                title: `Não é possível iniciar uma nova conversa de WhatsApp para este contato, pois ele já possui a Tarefa ${taskIdFromOpenConversation} em execução na oportunidade: ${opportunityIdFromOpenConversation}`,
                showConfirmButton: false,
                showCloseButton: true,
              })
            }
            if (response.data.data.time !== 'Usuário CRM') {
              const teamFromOpenConversation = response.data.data.time
              this.isValidNumber = false
              this.$swal({
                icon: 'warning',
                title: `Número em atendimento com o time: ${teamFromOpenConversation}`,
                showConfirmButton: false,
                timer: 2500,
              })
            }
          }
        } else {
          this.isValidNumber = true
          if (response.data.status == 'valid') {
            this.mediaStatus = 'Disponível'
          } else if (response.data.status == 'failed') {
            this.mediaStatus = 'Falha na verificação'
          } else {
            this.mediaStatus = 'Número inválido'
          }
        }
      } catch (error) {
        this.mediaStatus = 'Falha na verificação'
        console.log('error ->', error)
      }
    },
    installAutoUpdate() {
      if (!this.interval) {
        this.interval = true
        setTimeout(() => {
          this.interval = false
          this.getHistory()

          if (this.dialog) {
            this.installAutoUpdate()
          }
        }, this.timeInterval)
      }
    },
    async sendTemplate() {
      try {
        this.isSendingMessage = true
        this.payloadChat.message = ''
        const taskPayload = {
          id: this.taskId,
          state: 'active',
          contact_id: this.contact.id,
          media_id: this.contactMedia.id,
        }
        if (this.payloadChat.message !== null) {
          await this.$axios.post('/chat/weni/send-message', this.payloadChat)
          await this.updateData('/cash/task', taskPayload, {
            fireSuccessAlert: false,
          })
          this.payloadChat.message = ''
          this.getHistory()
          this.installAutoUpdate()
          this.$nextTick(() => {
            this.scrollToEnd()
          })
          this.$emit('onChatStart', true)
          this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
          this.$store.dispatch('Task/refresh', true)
        } else {
          return
        }
        this.isSendingMessage = false
      } catch (error) {
        this.isSendingMessage = false
        this.payloadChat.message = ''
        return
      }
    },
    async sendChatMessage() {
      const message = this.payloadChat.message
      try {
        if (message && message.length <= 640) {
          this.isSendingMessage = true
          await this.$axios.post('/chat/weni/send-message', this.payloadChat)
          this.payloadChat.message = ''
          this.getHistory()
          this.installAutoUpdate()
          this.$nextTick(() => {
            this.scrollToEnd()
          })
          this.isSendingMessage = false
          this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
          this.$store.dispatch('Task/refresh', true)
        }
      } catch (error) {
        this.isSendingMessage = false
        this.payloadChat.message = ''
        this.$swal({
          icon: 'warning',
          title: error.data
            ? error.data.detail
            : 'Confira as informações de tarefa e contato',
        })
        console.log('error ->', error)
        return
      }
    },
    async getHistory() {
      if (this.payloadChat.task_id == null)
        this.payloadChat.task_id = this.taskId
      if (this.taskId) {
        try {
          const response = await this.$axios.get(
            `/chat/weni/conversation/${this.payloadChat.task_id}`
          )
          let responseGetHistory = response.data.data
          const messages = responseGetHistory.filter(
            (item) => item.task_id == this.payloadChat.task_id
          )
          const history = messages.map((message) => message.messages)
          history.length > 0
            ? (this.chatHistory = history[0])
            : (this.chatHistory = [])

          if (messages.length > 0) {
            this.payloadChat.contact_media_id = parseInt(
              messages[0].contact_media_id
            )
            // this.activeContact_media_value =
            //   this.task.contact?.medias?.find(
            //     (media) => media.id == this.payloadChat.contact_media_id
            //   ).value ||
            //   this.opportunity.contact?.medias?.find(
            //     (media) => media.id == this.payloadChat.contact_media_id
            //   ).value
            this.conversationWindow = messages[0].conversation_state.state

            const finalTime = this.$moment(
              new Date(`${messages[0].last_bot_msg}Z`)
            )
              .add(1, 'day')
              .format('YYYY-MM-DD HH:mm')
            switch (this.conversationWindow) {
            case 'Conversa fechada':
              this.conversationClockTime = '--:--:--'
              break
            case 'Em espera':
              this.conversationClockTime = '--:--:--'
              break
            case 'Aguardando abertura':
              this.conversationClockTime = '--:--:--'
              break
            case 'Conversa iniciada':
              this.conversationClockTime = this.timeDiff(
                new Date(),
                new Date(finalTime)
              )
              break
            default:
              this.conversationWindow = 'Aguardando usuário'
              this.conversationClockTime = '--:--:--'
              break
            }
          }
        } catch (err) {
          console.log('Erro:', err)
        }
      }
    },
    scrollToEnd() {
      const timelineScroll = this.$refs['timeline-scroll']
      if (timelineScroll.lastElementChild) {
        timelineScroll.scrollTop = timelineScroll.lastElementChild.offsetTop
      }
    },
    handleCancel() {},
    clearChatWindow() {
      (this.payloadChat = {
        task_id: null,
        opportunity_id: null,
        contact_media_id: null,
        email: null,
        message: null,
        user_id: null,
      }),
      (this.formData = {
        output: null,
        content: '',
        contact_id: null,
        template_id: null,
        assigned_to_id: this.userInfo.id,
        team_id: null,
        opportunity_id: null,
        type_id: null,
        time: null,
      }),
      (this.conversationClockTime = '--:--:--')
      this.conversationWindow = null
      this.mediaStatus = null
      this.chatHistory = []
      this.taskType = null
    },
    async readChatNotifications(entity_id) {
      await this.updateData(
        '/ecosystem/notification-read-by-entity-and-id',
        { entity_type: 'task', entity_id },
        { fireSuccessAlert: false }
      )
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
    cancelAction() {
      this.$emit('onCancelAction', true)
    },
    resetData() {
      Object.assign(this.$data, initialState())
    },
  },
}
</script>

<style scoped lang="scss">
input[type='file'] {
  display: none;
}
.card-text-area {
  border-radius: 0 0 8px 8px;
  border: 1px solid #aeb4c2;
}
.chat-container {
  height: 29vh;
  background-color: #f8f9fa;
  overflow-y: auto;
  @include thin-scrollbar;
}
.clock-text {
  font-weight: normal;
  color: rgba(0, 0, 0, 0.38);
  font-size: 16px;
}
.clock-time {
  width: 100%;
  height: 40px;
  border: 1px solid #aeb4c2;
  border-radius: 8px;
}
.clock-title {
  font-weight: normal;
  color: #757575;
  font-size: 12px;
}
.close-conversation-text {
  font-size: 12px;
  color: #252f40;
}
.custom-file-upload {
  display: inline-block;
  padding: 6px 12px;
  cursor: pointer;
}
.emoji-box {
  width: 250px;
  height: 350px;
  z-index: 550;
  position: absolute;
  top: -270px;
  left: 30px;
}
.message-date {
  font-size: 10px;
}
.msg-crm {
  border-radius: 8px 0 8px 8px;
  background-color: #67748e;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.msg-crm span {
  color: #fff;
}
.msg-customer {
  border-radius: 0 8px 8px 8px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
}
.v-application .shape {
  border: solid #aeb4c2 !important;
  border-width: 1px !important;
  border-radius: 8px 8px 0 0;
}
.wrapper {
  position: relative;
  display: inline-block;
}
.tabs-border {
  border-bottom: solid 1px #f5f5f5;
}
</style>
