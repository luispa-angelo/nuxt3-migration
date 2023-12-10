<template>
  <div>
    <v-dialog v-model="dialog" scrollable max-width="1280" tabindex="1">
      <template v-if="hasButton" v-slot:activator="{ on, attrs }">
        <v-btn v-if="listButton" v-bind="attrs" v-on="on" text>Abrir</v-btn>
        <v-btn
          v-else
          v-bind="attrs"
          v-on="on"
          fab
          :color="timelineButton ? 'secondary' : 'primary'"
          class="mx-2"
          v-tooltip="{
            content: `
            <div class='v-btn-tooltip'>
                ${title}
            </div>
            `,
            placement: 'bottom-center',
          }"
        >
          <v-icon v-if="timelineButton">mdi-chevron-right</v-icon>
          <v-icon v-else>mdi-chat</v-icon>
        </v-btn>
      </template>
      <template v-else-if="taskButton" v-slot:activator="{ on, attrs }">
        <v-btn x-large v-bind="attrs" v-on="on" color="secondary" class="mx-2 pa-8">
          <v-icon class="mr-2">mdi-chat</v-icon>
          Enviar WhatsApp
        </v-btn>
      </template>
      <v-card>
        <DialogHeader :title="payloadChat.task_id ? `Tarefa #${payloadChat.task_id}` : 'Abrir Chat'" @onCancel="handleCancel">
          <template v-slot:subtitle>
            <v-chip v-if="task.state" color="primary" outlined>
              {{ task.state }}
            </v-chip>
            <v-chip v-else color="primary" outlined>
              {{ getEnum(formData.state, meta.taskState) }}
            </v-chip>
          </template>
        </DialogHeader>
          <v-card-text class="pt-2">
            <v-form ref="form">
              <v-row>
                <v-col xl="9" lg="9" md="9" sm="12" cols="12">
                  <TabComponent :tab-items="tabItems">
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
                            <section class="ma-6">
                              <v-row>
                                <v-col xl="4" lg="4">
                                  <v-text-field
                                    label="Contato"
                                    outlined
                                    dense
                                    disabled
                                    :value="
                                      activeContactTask
                                        ? activeContactTask.name
                                        : activeContactOpportunity.name
                                    "
                                  >
                                  </v-text-field>
                                </v-col>
                                <v-col xl="4" lg="4">
                                  <div>
                                    <v-text-field
                                      v-if="activeContactTask && chatHistory.length > 0"
                                      label="Telefone"
                                      disabled
                                      :value="activeContact_media_value"
                                      @change="checkMediaStatus()"
                                      dense
                                      outlined
                                    ></v-text-field>
                                    <v-select
                                      attach
                                      label="Telefone"
                                      v-else
                                      :disabled="
                                        chatHistory.length > 0 || task.state == 'Concluído'
                                      "
                                      v-model="payloadChat.contact_media_id"
                                      :items="medias"
                                      @change="checkMediaStatus()"
                                      item-value="id"
                                      item-text="value"
                                      required
                                      dense
                                      outlined
                                      hide-details
                                    >
                                      <template v-slot:append>
                                        <v-icon
                                          v-if="mediaStatus"
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
                                            mediaStatus == "Disponível"
                                              ? "mdi-check-circle"
                                              : " mdi-alert-circle"
                                          }}
                                        </v-icon>
                                      </template>
                                    </v-select>
                                  </div>
                                </v-col>
                                <v-col xl="4" lg="4">
                                  <div class="d-flex flex-column align-start mx-2">
                                    <p class="mb-0 mt-n6 clock-title">
                                      {{
                                        conversationWindow
                                          ? "Status da Janela"
                                          : "Status - Aguardando atividade"
                                      }}
                                    </p>
                                    <div class="d-flex flex-row align-center clock-time">
                                      <v-icon class="mx-2" size="20">mdi-clock-time-four</v-icon>
                                      <p class="mt-4 clock-text">
                                        {{
                                          conversationWindow !== "Conversa fechada"
                                            ? conversationClockTime +
                                              " " +
                                              "-" +
                                              " " +
                                              conversationWindow
                                            : "--:--:-- Conversa fechada"
                                        }}
                                      </p>
                                    </div>
                                  </div>
                                </v-col>
                              </v-row>

                              <div id="timeline-scroll" class="chat-container shape pa-2">
                                <div
                                  v-for="message in chatHistory"
                                  :key="message.uuid"
                                  :class="
                                    message.is_bot == 0
                                      ? 'd-flex justify-end'
                                      : 'd-flex justify-start'
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
                                          v-if="
                                            message.msg_attch_url && message.msg_attch_type == 'ogg'
                                          "
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

                                        <span v-else-if="!message.msg_attch_url">
                                          {{ message.message }}
                                        </span>

                                        <v-sheet
                                          v-else-if="
                                            (message.msg_attch_url &&
                                              message.msg_attch_type == 'jpg') ||
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

                              <div v-if="conversationWindow == 'Conversa iniciada'">
                                <v-card class="card-text-area" elevation="0">
                                  <v-card-text>
                                    <v-textarea
                                      solo
                                      flat
                                      class="ml-2 pa-0"
                                      :placeholder="
                                        conversationWindow == 'Conversa fechada'
                                          ? 'Conversa encerrada, apenas histórico disponível'
                                          : 'Escreva sua mensagem'
                                      "
                                      :disabled="disableTask"
                                      v-model="payloadChat.message"
                                      @keydown.enter.exact.prevent
                                      @keyup.enter.exact="sendChatMessage"
                                      hide-details
                                      rows="2"
                                      no-resize
                                    >
                                    </v-textarea>
                                  </v-card-text>
                                  <v-card-actions class="d-flex justify-space-between">
                                    <section class="d-flex align-center">
                                      <emoji-picker @emoji="append" :search="searchEmoji">
                                        <div
                                          class="emoji-invoker"
                                          slot="emoji-invoker"
                                          slot-scope="{ events: { click: clickEvent } }"
                                          @click.stop="clickEvent"
                                          :disabled="disableTask"
                                        >
                                          <v-btn icon small :disabled="disableTask">
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
                                          <v-card-text class="emoji-picker">
                                            <v-text-field
                                              v-model="searchEmoji"
                                              v-focus
                                              dense
                                              solo
                                              label="Pesquisar"
                                            ></v-text-field>
                                            <div
                                              v-for="(emojiGroup, category) in emojis"
                                              :key="category"
                                            >
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
                                        <v-icon size="20" :disabled="disableTask">
                                          > mdi-paperclip
                                        </v-icon>
                                      </label>
                                      <input
                                        id="file-upload"
                                        type="file"
                                        accept="image/*,video/*,audio/*,.pdf"
                                        @change="sendFile"
                                        :disabled="
                                          chatHistory.length < 2 ||
                                          conversationWindow != 'Conversa iniciada'
                                        "
                                      />
                                      <v-menu top :offset-x="true" :close-on-content-click="false">
                                        <template v-slot:activator="{ on, attrs }">
                                          <v-btn
                                            color="secondary"
                                            fab
                                            v-bind="attrs"
                                            v-on="on"
                                            :disabled="disableTask"
                                            elevation="0"
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
                                            ></v-text-field>
                                          </v-card-title>
                                          <v-card-text class="v-menu-card-text px-0">
                                            <v-list dense two-line>
                                              <v-list-item
                                                v-for="template in arrayTemplateContents"
                                                :key="template.id"
                                                @click="payloadChat.message = template.content"
                                              >
                                                <v-list-item-content>
                                                  <v-list-item-title
                                                    class="font-body-medium d-flex align-start"
                                                  >
                                                    {{ `${template.name}` }}
                                                  </v-list-item-title>
                                                  <v-list-item-subtitle
                                                    class="font-body-medium"
                                                    v-html="template.content"
                                                  ></v-list-item-subtitle>
                                                </v-list-item-content>
                                              </v-list-item>
                                            </v-list>
                                          </v-card-text>
                                        </v-card>
                                      </v-menu>
                                    </section>
                                    <v-btn
                                      class="primary"
                                      @click="sendChatMessage"
                                      :disabled="
                                        isSendingMessage ||
                                        disableTask ||
                                        payloadChat.message == '' ||
                                        !payloadChat.message
                                      "
                                      >Enviar</v-btn
                                    >
                                  </v-card-actions>
                                </v-card>
                              </div>

                              <div
                                v-if="conversationWindow !== 'Conversa fechada'"
                                class="d-flex flex-column align-center wrapper py-2"
                              >
                                <div class="w-100 d-flex justify-end">
                                  <v-btn
                                    color="primary"
                                    v-if="chatHistory.length == 0"
                                    @click="sendTemplate"
                                    :disabled="
                                      isValidNumber == false ||
                                      !formData.assigned_to_id ||
                                      !taskType
                                    "
                                  >
                                    Solicitar contato
                                  </v-btn>
                                  <v-btn
                                    color="primary"
                                    v-else-if="
                                      chatHistory.length > 0 && conversationWindow == 'Em espera'
                                    "
                                    @click="sendTemplate"
                                    >Retomar contato
                                  </v-btn>
                                </div>
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
                                  contato”. O contato receberá um message template de solicitação,
                                  caso ele aceite será aberto uma janela com prazo de 24h, esse
                                  tempo será contabilizado e redefinido sempre a partir da última
                                  mensagem enviada pelo contato.
                                </p>
                              </v-alert>
                            </section>
                          </v-tab-item>
                          <v-tab-item
                            eager
                            href="#tab-2"
                          >
                            <section class="pb-10 ma-2">
                              <span class="font-body-medium">Descreva o que aconteceu na troca de mensagens...</span>
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

                    <template v-slot:opportunity>
                      <TaskTabOpportunity
                        :opportunity="opportunity"
                        :opportunity-id="opportunityId"
                        :task-id="taskId"
                      />
                    </template>

                    <template v-slot:history>
                      <TaskHistory :task="task" @reloadForm="getTask" />
                    </template>
                  </TabComponent>
                </v-col>

                <v-divider vertical></v-divider>

                <v-col xl="3" lg="3" md="3" sm="12" cols="12">
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
                    :filter="chatTasks"
                    :load="dialog"
                    :initial-value="taskType"
                    :disabled="chatHistory.length > 0 || task.state == 'Concluído'"
                    v-model="taskType"
                  />
                  <Autocomplete
                    label="Atribuído"
                    endpoint="/ecosystem/capability"
                    :initial-value="formData.assigned_to_id"
                    v-model="formData.assigned_to_id"
                    :query="`includes=user,team&team_id=${formData.team_id}`"
                    :item-text="(item) => getAssignedLabel(item)"
                    :reload-trigger="formData.team_id"
                    item-value="user_id"
                    outlined
                    dense
                    :disabled="chatHistory.length > 0 || task.state == 'Concluído'"
                    @valueSelected="
                      (value) => {
                        formData.assigned_to_id = value;
                      }
                    "
                  ></Autocomplete>

                  <v-select
                    attach
                    label="Prioridade"
                    :items="priorityList"
                    v-model="formData.priority"
                    :disabled="chatHistory.length > 0 || task.state == 'Concluído'"
                    item-text="text"
                    item-value="value"
                    outlined
                    dense
                  ></v-select>

                  <v-text-field
                    label="Data de vencimento"
                    type="date"
                    v-model="date"
                    :disabled="chatHistory.length > 0 || task.state == 'Concluído'"
                    outlined
                    dense
                  ></v-text-field>

                  <v-text-field
                    label="Horário"
                    type="time"
                    v-model="hours"
                    :disabled="chatHistory.length > 0 || task.state == 'Concluído'"
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
                    :disabled="
                      snoozeDisabled || chatHistory.length > 0 || task.state == 'Concluído'
                    "
                    v-model="reminder"
                  ></v-select>

                  <v-select
                    attach
                    label="Resultado da tarefa"
                    item-text="value"
                    v-model="output"
                    :items="outputList"
                    :disabled="task.state == 'Concluído'"
                    outlined
                    dense
                    return-object
                    clearable
                    :error="$v.output.$error"
                    :error-messages="$v.output.$error ? 'Esse campo é obrigatório' : ''"
                  ></v-select>
                  <v-textarea
                    label="Descrição/Observação"
                    outlined
                    dense
                    rows="4"
                    no-resize
                    :disabled="!payloadChat.task_id"
                    v-model="formData.description"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-divider></v-divider>
          <v-card-actions class="d-flex justify-end py-4 px-4">
            <v-btn color="secondary" @click="editTask()" :disabled="!payloadChat.task_id">
              Editar tarefa
            </v-btn>
            <v-btn
              color="primary"
              @click="closeConversation"
              :disabled="
                !output ||
                conversationWindow == 'Conversa fechada' ||
                task.state == 'Concluído'
              "
            >
              {{
                conversationWindow == "Conversa fechada"
                  ? "Conversa e tarefas finalizadas"
                  : "Finalizar conversa e tarefa"
              }}
            </v-btn>
          </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

const initialState = () => {
  return {
    activeContactOpportunity: {
      name: '',
      position: '',
    },
    activeContact_media_value: null,
    activeContactTask: null,
    arrayTemplateContents: [],
    companyId: null,
    date: null,
    dialog: false,
    chatHistory: [],
    conversationClockTime: '',
    conversationWindow: '',
    enhancementContacts: [],
    formData: {
      id: null,
      output: null,
      description: '',
      contact_id: null,
      template_id: null,
      assigned_to_id: null,
      team_id: null,
      opportunity_id: null,
      type_id: null,
      time: null,
      state: 'created',
      media_id: null,
      priority: null,
      reminder_to: null,
      content: '',
    },
    hours: null,
    interval: false,
    isSendingMessage: false,
    isValidNumber: false,
    linkImg: '<a :href="message.msg_attch_url">Arquivo</>',
    medias: [],
    mediaStatus: null,
    mediaType: null,
    mediaTypes: [],
    opportunity: {
      assigned_to: {
        name: '',
      },
      contact: {
        name: '',
      },
    },
    opportunityId: null,
    output: null,
    outputList: [],
    outputs: [],
    payloadChat: {
      task_id: null,
      opportunity_id: null,
      contact_media_id: null,
      email: null,
      message: null,
      user_id: null,
    },
    priorityList: [
      { text: 'Alta', value: 'high' },
      { text: 'Média', value: 'medium' },
      { text: 'Baixa', value: 'low' },
    ],
    redirectOppTo: 'business-opportunity-item-id',
    redirectToCompany: 'business-companies-item-identifier',
    reminder: null,
    search: '',
    searchEmoji: '',
    selected: '',
    snoozeDisabled: true,
    tabItems: [
      { name: 'Atividade', value: 'task' },
      { name: 'Oportunidade', value: 'opportunity' },
      { name: 'Histórico', value: 'history' },
    ],
    task: {},
    taskLog: [],
    taskType: null,
    templateContent: '',
    timeInterval: 3000,
    timesSnooze: [
      { text: '10 minutos antes', value: 10 },
      { text: '15 minutos antes', value: 15 },
      { text: '20 minutos antes', value: 20 },
      { text: '30 minutos antes', value: 30 },
    ],
    userContacts: [],
    endpointTaskLog: '/cash/task-log',
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
    title: String,
    openTaskType: String,
    oppIdFromTaskList: { type: [Number, String], default: null },
    taskId: Number,
    listButton: Boolean,
    hasButton: Boolean,
    openDialog: Boolean,
    openByAlert: Boolean,
    timelineButton: Boolean,
    taskButton: Boolean,
    isQuickTask: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapGetters({
      alertList: 'Alert/formattedAlerts',
      tasks: 'tasks',
      assignedTasks: 'assignedTasks',
      userInfo: 'userInfo',
      customer: 'customer',
      company: 'company',
      userTeam: 'userTeam',
      coworkers: 'coworkers',
      meta: 'meta',
    }),
    schedule: function () {
      // if (!this.date && !this.time) {
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
    disableTask: function () {
      if (
        this.conversationWindow != 'Conversa iniciada' ||
        this.chatHistory.length == 0 ||
        this.task.state == 'Concluído'
      ) {
        return true
      }
      return false
    },
    taskTabs: function() {
      if (this.taskId || this.payloadChat.task_id) {
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
  data () {
    return initialState()
  },
  validations: {
    output: { required },
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
        if (this.taskId) {
          this.installAutoUpdate()
        }
      } else {
        this.taskId && this.readChatNotifications(this.taskId)
        this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', {
          taskIdToRead: null,
        })
        this.$emit('closeDialog')
      }
    },
    openDialog(newValue) {
      this.dialog = newValue
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
    taskType(newValue) {
      if (newValue) {
        this.outputList = JSON.parse(newValue.outputs)
        this.formData.type_id = newValue.id
        this.formData.time = newValue.time
      }
      this.getTemplates(newValue)
    },
    'task.state': async function (newValue) {
      if (newValue == 'Não iniciado') {
        await this.checkMediaStatus()
      }
    },
    'formData.team_id': async function (newValue) {
      if (newValue) {
        await this.$store.dispatch('fetchCoworkers', `team_id=${newValue}`)
        if (!this.coworkers.find((user) => user.id == this.formData.assigned_to_id)) {
          this.formData.assigned_to_id = null
        }
      }
    },
  },
  methods: {
    getAssignedLabel(item) {
      const userName = item.user?.name
      return `${userName}`
    },
    async editTask() {
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      if (this.reminder) {
        this.formData.reminder_to = this.$moment(new Date(this.schedule))
          .subtract(this.reminder, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      } else {
        this.formData.reminder_to = this.$moment(new Date(this.schedule))
          .subtract(10, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      }
      this.payloadChat.contact_media_id
        ? (this.formData.media_id = this.payloadChat.contact_media_id)
        : (this.formData.media_id = this.activeContact_media_value)
      switch (this.task.state) {
      case 'Não iniciado':
        this.formData.state = 'created'
        break
      case 'Em execução':
        this.formData.state = 'active'
        break
      case 'Concluído':
        this.formData.state = 'done'
        break
      case 'Postergado':
        this.formData.state = 'postponed'
        break
      case 'Em espera':
        this.formData.state = 'wait'
        break
      default:
        this.formData.state = 'active'
        break
      }
      this.formData.id = this.payloadChat.task_id
      this.formData.opportunity_id = this.opportunity.id
      this.formData.team_id = this.opportunity.team.id
      await this.$store.dispatch('Task/updAssignedTask', this.formData)
      await this.handleRefresh()
    },
    handleRefresh() {
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    async setInitialData() {
      this.getOpportunityId()
      this.taskId && (await this.getTask(this.taskId))
      const contacts = []
      this.opportunity = await this.getItem(
        '/cash/opportunity',
        'also=op_log' +
        `&includes=stage,products.product,customer,partner,competitors.competitor,tenant,contact.medias.media_type,assigned_to,team&id=${this.opportunityId}`
      )
      console.log('this.opportunity from quickChat', this.opportunity)
      const { contact, customer_id } = this.opportunity
      if (!contact) {
        this.$swal({
          icon: 'warning',
          title: 'Sem contato associado',
          text:
            'Para abrir um chat, cadastre um contato para esta empresa e associe-o à oportunidade.',
        })
        this.dialog = false
        this.$emit('closeDialog')
      } else {
        if (!this.taskId && contact) {
          contacts.push(contact)
          this.getContacts([contact])
          this.getContactMedias(contact)
          this.formData.contact_id = this.opportunity.contact.id
          this.activeContactOpportunity = contact
          this.formData.assigned_to_id = this.userInfo.id
        }
        await this.$store.dispatch('fetchCoworkers', `team_id=${this.userTeam}`)
        await this.getUserData()
        this.companyId = customer_id
        this.formData.opportunity_id = this.opportunity.id
        this.formData.team_id = this.opportunity.team.id
        // this.formData.state = 'active'
        this.payloadChat.opportunity_id = this.opportunity.id
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
        const {
          data: { data },
        } = await this.$axios.get('/ecosystem/media-type')
        this.mediaTypes = data
        this.chatHistory.length && this.scrollToEnd()
      }
    },
    async getTask(idTask) {
      if (this.taskId) {
        idTask = this.taskId
      }
      this.task = await this.getItem(
        '/cash/task',
        `includes=contact.medias.media_type,assigned_to,logs,type.media_type,opportunity.customer,logs,template,uploads&id=${idTask}`
      )
      this.opportunityId = this.task.opportunity_id
      this.payloadChat.task_id = this.taskId
      this.formData.assigned_to_id = this.task.assigned_to_id
      this.formData.priority = this.task.priority
      this.formData.content = this.task.content
      this.taskType = this.task.type
      this.output = JSON.parse(this.task.output)
      this.task.state = this.getEnum(this.task.state, this.meta.taskState)
      this.activeContactTask = this.task.contact
      idTask && this.getContactMedias(this.task.contact)
      this.formData.contact_id = this.task.contact.id
      this.payloadChat.contact_media_id = this.task.media_id
      this.formData.media_id = this.task.media_id
      this.formData.description = this.task.description
      
      this.date = this.$moment(`${this.task.scheduled_to}Z`).format('YYYY-MM-DD')
      this.hours = this.$moment(`${this.task.scheduled_to}Z`).format('HH:mm')
      // this.date = new Date(`${this.task.scheduled_to}Z`).toISOString().split('T')[0]
      // this.hours = new Date(`${this.task.scheduled_to}Z`).toLocaleTimeString('pt-BR', {
      //   hour: '2-digit',
      //   minute: '2-digit',
      // })
      var reminder = this.$moment(new Date(this.task.reminder_to))
      var schedule = this.$moment(new Date(this.task.scheduled_to))
      var duration = this.$moment.duration(schedule.diff(reminder)).asMinutes()
      this.reminder = this.timesSnooze.find((snooze) => snooze.value == duration)
    },
    async sendFile(e) {
      let formData = new FormData()
      let file = e.target.files[0]
      try {
        formData.append(
          'task_id',
          this.payloadChat.task_id ? this.payloadChat.task_id : this.taskId
        )
        formData.append('opportunity_id', this.opportunity.id)
        formData.append('contact_media_id', this.payloadChat.contact_media_id)
        formData.append('email', this.userInfo.email)
        formData.append('user_id', this.userInfo.id)
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
    async getTemplates(taskType) {
      var templates = await this.getList(
        '/cash/template',
        `includes=media_type&media_type.id=${taskType.media_type.id}`
      )
      if (templates) {
        var regex = /(<([^>]+)>)/gi
        this.templates = templates.data.forEach((template) => {
          template.content ? template.content : (template.content = '')
          this.arrayTemplateContents.push({
            id: template.id,
            name: template.name,
            content: template.content.replace(regex, ''),
          })
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
    getContacts(contacts) {
      this.userContacts = contacts.filter((contact) => contact.origin != 'enhancement')
      this.enhancementContacts = contacts.filter(
        (contact) => contact.origin == 'enhancement'
      )
    },
    getContactMedias(contact) {
      if (contact.medias.length > 0) {
        this.medias = contact.medias.filter(
          (media) =>
            media.media_type.base == 'mobile' || media.media_type.base == 'landline'
        )
      }
    },
    getOpportunityId() {
      if (this.oppIdFromTaskList) {
        this.opportunityId = this.oppIdFromTaskList
      }
    },
    async getUserData() {
      this.payloadChat.email = this.userInfo.email
      this.payloadChat.user_id = this.userInfo.id
    },
    async createTask() {
      if(this.isQuickTask) {
        this.formData.bypass_schedule = true
      }

      this.formData.media_id = this.payloadChat.contact_media_id
      if (this.schedule) {
        this.formData.scheduled_to = this.schedule
      }
      if (this.reminder) {
        this.formData.reminder_to = this.$moment(new Date(this.schedule))
          .subtract(this.reminder, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      } else {
        this.formData.reminder_to = this.$moment(new Date(this.schedule))
          .subtract(10, 'minute')
          .format('YYYY-MM-DDTHH:mm:ss')
      }
      const { id } = await this.createItem('/cash/task', this.formData)
      await this.$store.dispatch('fetchTasks')
      return id
    },
    async checkMediaStatus() {
      try {
				const response = await this.$axios.get(
					`/chat/weni/check-wpp-contact/${
						this.payloadChat.contact_media_id
							? this.payloadChat.contact_media_id
							: this.activeContact_media_value
					}`, {
						params: {
							task_id: this.taskId,
							opportunity_id: this.opportunityId
						}
					}
				)
        if (
          (response.data.in_attendance == true || response.data.status == 'invalid') &&
          this.chatHistory.length == 0
        ) {
          this.isValidNumber = false
          this.mediaStatus = 'Número com conversa em andamento'
          if (response.data.data) {
            if (response.data.data.time == 'Usuário CRM') {
              const opportunityIdFromOpenConversation = response.data.data.opportunity_id
              const taskIdFromOpenConversation = response.data.data.task_id
              this.$swal({
                icon: 'warning',
                title: `Número com conversa em andamento, oportunidade: ${opportunityIdFromOpenConversation} - Tarefa ${taskIdFromOpenConversation}`,
                showConfirmButton: false,
                timer: 2500,
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
    chatTasks(element) {
      if (!element.media_type) {
        return false
      }
      const extraType = element.extra && JSON.parse(element.extra)
      if (extraType !== null && extraType.modal == 'chat') {
        return element
      }
    },
    async sendTemplate() {
      try {
        if (!this.taskId && !this.payloadChat.task_id) {
          this.payloadChat.task_id = await this.createTask()
          this.task = await this.getItem('/cash/task',`includes=contact.medias.media_type,assigned_to,logs,type.media_type,opportunity.customer,logs,template,uploads&id=${this.payloadChat.task_id}`)
        }
        this.payloadChat.message = ''
        if (this.payloadChat.message !== null) {
          this.payloadChat.opportunity_id = this.opportunity.id
          this.payloadChat.user_id = this.userInfo.id
          await this.$axios.post('/chat/weni/send-message', this.payloadChat)
          this.formData.state = 'active'
          await this.$store.dispatch('Task/updAssignedTask', {
            id: this.payloadChat.task_id,
            state: 'active',
          })
          this.task.state = 'Em execução'
          this.payloadChat.message = ''
          this.installAutoUpdate()
          this.scrollToEnd()
          const title = 'Conversa - Iniciada'
          const status = 'success'
          await this.includeContent(title, status)
        } else {
          return
        }
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
        this.$store.dispatch('Task/refresh', true)
      } catch (error) {
        this.payloadChat.message = ''
        return
      }
    },
    async includeContent(title, status) {
      const history = JSON.stringify({
        history: {
          phone_called: this.dialNumber,
          status: status,
          user_id: this.userInfo.id,
          user_name: this.userInfo.name,
        }
      })
      const formData = {
        task_id: this.payloadChat.task_id && this.payloadChat.task_id,
        description: title,
        content: history
      }
      console.log('formData', formData)
      await this.createItem(this.endpointTaskLog, formData, { fireSuccessAlert: false })
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
    async sendChatMessage() {
      try {
        this.isSendingMessage = true
        if (!this.taskId && !this.payloadChat.task_id) {
          this.payloadChat.task_id = await this.createTask()
        }
        if (this.payloadChat.message !== null) {
          await this.$axios.post('/chat/weni/send-message', this.payloadChat)
          this.payloadChat.message = ''
          this.installAutoUpdate()
          this.scrollToEnd()
        } else {
          return
        }
        this.isSendingMessage = false
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
        this.$store.dispatch('Task/refresh', true)
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
      if (this.payloadChat.task_id == null) this.payloadChat.task_id = this.taskId
      if (this.payloadChat.task_id && this.opportunity.contact && this.task.state !== 'Não iniciado' && this.task.state !== 'Concluído') {
        try {
          const response = await this.$axios.get(`/chat/weni/conversation/${this.payloadChat.task_id}`)
          let responseGetHistory = response.data.data
          const messages = responseGetHistory.filter(
            (item) => item.task_id == this.payloadChat.task_id
          )
          const history = messages.map((message) => message.messages)
          history.length > 0 ? (this.chatHistory = history[0]) : (this.chatHistory = [])

          if (messages.length > 0) {
            this.payloadChat.contact_media_id = parseInt(messages[0].contact_media_id)
            this.activeContact_media_value =
              this.task.contact?.medias?.find(
                (media) => media.id == this.payloadChat.contact_media_id
              ).value ||
              this.opportunity.contact?.medias?.find(
                (media) => media.id == this.payloadChat.contact_media_id
              ).value
            this.conversationWindow = messages[0].conversation_state.state

            const finalTime = this.$moment(new Date(`${messages[0].last_bot_msg}Z`))
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
              this.conversationClockTime = this.timeDiff(new Date(), new Date(finalTime))
              break
            default:
              this.conversationWindow = 'Aguardando usuário'
              this.conversationClockTime = '--:--:--'
              break
            }
          }
        }catch(err) {
          console.log('Erro:', err)
        }
      }
    },
    async closeConversation() {
      this.$v.output.$touch()
      if (this.$v.output.$error) return
      if(!this.payloadChat.task_id) {
        this.$swal({
          icon: 'warning',
          html: '<p class="subtitle-1">Não é possível encerrar conversa não iniciada.</p>',
          showConfirmButton: false,
          showCloseButton: true,
        })
        this.dialog = false
        this.$emit('closeDialog')
        return
      }
      this.formData.state = 'done'
      if (this.conversationWindow !== 'Conversa fechada') {
        await this.$axios.post('/chat/weni/closeconversation', {
          task_id: this.payloadChat.task_id,
        })
      }
      const payload = {
        id: this.payloadChat.task_id,
        state: 'done',
        output: JSON.stringify(this.output),
      }
      await this.$store.dispatch('Task/updAssignedTask', payload)
      const title = 'Conversa - Finalizada'
      const status = 'error'
      await this.includeContent(title ,status)
      await this.handleRefresh()
      this.handleCancel()
    },
    linkToTab(tab) {
      this.handleCancel()

      this.$router.push(`/opportunity/${this.opportunityId}?tab=${tab}`)
    },
    scrollToEnd() {
      const timelineScroll = document.querySelector('#timeline-scroll')
      timelineScroll.scrollTop =
        timelineScroll.scrollHeight - timelineScroll.clientHeight
    },
    handleCancel() {
      this.clearChatWindow()
      this.dialog = false
      this.$v.$reset()
      // this.$refs.taskAutocomplete.clearCachedItems()
      Object.assign(this.$data, initialState())
      this.$emit('closeDialog')
    },
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
    redirectToCompanyPage(item) {
      const { identifier, id } = item
      const { params } = this.$route
      this.$router.push({
        name: `${this.redirectToCompany}`,
        params: { ...params, item: 'noitem', identifier },
        query: { company_id: id },
      })
    },
    redirectToOpportunityPage(id) {
      const { params, query } = this.$route
      this.$router.push({
        name: `${this.redirectOppTo}`,
        params: { ...params, id },
        query: { ...query, complement: this.routeComplement },
      })
    },
  },
}
</script>

<style scoped lang="scss">
* {
  scrollbar-width: auto;
  scrollbar-color: #0b0b0b #252525;
}
*::-webkit-scrollbar {
  width: 5px;
}
*::-webkit-scrollbar-track {
  background: #828282;
  border-radius: 6px;
}
*::-webkit-scrollbar-thumb {
  background-color: #0b0b0b;
  border-radius: 6px;
  border: 3px solid #4f4f4f;
}
input[type="file"] {
  display: none;
}
.card-text-area {
  border-radius: 0 0 8px 8px;
  border: 1px solid #aeb4c2;
}
.chat-container {
  height: 450px;
  background-color: #f8f9fa;
  overflow-y: scroll;
}
.clock-text {
  font-weight: normal;
  color: rgba(0, 0, 0, 0.38);
  font-size: 16px;
}
.clock-time {
  width: 100%;
  height: 38px;
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
  top: -355px;
  left: 40px;
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
  border-bottom: solid 1px #F5F5F5;
}
</style>
