<template>
  <v-dialog scrollable persistent width="1145px" v-model="dialog">
    <template v-if="hasButton" v-slot:activator="{ on, attrs }">
      <v-btn v-if="listButton" v-bind="attrs" v-on="on" text> Abrir </v-btn>
      <v-btn
        v-else
        fab
        class="mx-2"
        depressed
        height="42"
        width="42"
        v-bind="attrs"
        v-on="on"
        :color="
          timelineButton
            ? 'secondary'
            : taskChannelConfig[propChannel ? propChannel : iconButton]
                .dialogButtonColor
        "
        v-tooltip="
          !timelineButton
            ? {
                content: `
            <div class='v-btn-tooltip'>
              ${
                taskChannelConfig[propChannel ? propChannel : iconButton]
                  .dialogButtonTooltip
              }
            </div>
            `,
              }
            : null
        "
      >
        <v-icon v-if="timelineButton">mdi-chevron-right</v-icon>
        <InternalTaskIcon
          v-else-if="iconButton === 'internal'"
          width="19"
          height="19"
          class="ml-1"
        />
        <v-icon
          v-else-if="iconButton"
          :color="taskChannelConfig[iconButton].dialogButtonTextColor"
        >
          {{
            taskChannelConfig[iconButton]
              ? taskChannelConfig[iconButton].dialogButtonIcon
              : 'description'
          }}
        </v-icon>
        <MeetingTaskIcon
          v-else-if="propChannel === 'meeting'"
          class="mr-1"
          width="30"
          height="16"
        />
        <v-icon
          v-else
          class="material-icons-outlined"
          :color="taskChannelConfig[propChannel].dialogButtonTextColor"
        >
          {{
            taskChannelConfig[propChannel]
              ? taskChannelConfig[propChannel].dialogButtonIcon
              : 'description'
          }}
        </v-icon>
      </v-btn>
    </template>
    <template v-else-if="taskButton" v-slot:activator="{ on, attrs }">
      <v-btn
        x-large
        color="secondary"
        class="mx-2 pa-8"
        elevation="1"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon class="material-icons-outlined mr-2">
          {{
            taskChannelConfig[propChannel]
              ? taskChannelConfig[propChannel].dialogButtonIcon
              : 'description'
          }}
        </v-icon>
        {{
          taskChannelConfig[propChannel]
            ? taskChannelConfig[propChannel].dialogButtonLabel
            : 'Criar tarefa'
        }}
      </v-btn>
    </template>

    <v-card class="fill-height">
      <v-card-title color="shape lighten-1" class="card-header">
        <v-row>
          <v-col class="d-flex align-center py-2 px-4">
            <v-avatar
              size="36"
              v-if="taskTypeChannel"
              :color="
                taskChannelConfig[taskTypeChannel].dialogButtonColor
                  ? taskChannelConfig[taskTypeChannel].dialogButtonColor
                  : 'primary'
              "
            >
              <div v-if="taskTypeChannel === 'internal'">
                <InternalTaskIcon width="16" height="16" />
              </div>
              <div v-else-if="taskTypeChannel === 'meeting'">
                <MeetingTaskIcon class="mr-1" width="30" height="16" />
              </div>
              <v-icon
                v-else
                class="material-icons-outlined"
                :color="
                  taskChannelConfig[taskTypeChannel].dialogButtonTextColor
                    ? taskChannelConfig[taskTypeChannel].dialogButtonTextColor
                    : 'shape'
                "
              >
                {{
                  taskChannelConfig[taskTypeChannel]
                    ? taskChannelConfig[taskTypeChannel].dialogButtonIcon
                    : 'description'
                }}
              </v-icon>
            </v-avatar>
            <h6 class="pl-2">
              {{ mediaTypeName }}
            </h6>
            <v-chip
              v-if="taskId"
              outlined
              class="ml-2"
              :color="taskColors.state[task.state]"
              >{{ task.state || '-' }}</v-chip
            >
            <v-chip
              v-if="taskId"
              class="ml-2 white--text"
              :color="taskColors.priority[task.priority]"
              >{{ task.priority || '-' }}</v-chip
            >
            <v-chip v-if="taskId" outlined class="ml-2" :color="dateColor">
              {{ $moment(`${task.scheduled_to}z`).format('DD/MM/YYYY') || '-' }}
            </v-chip>
          </v-col>
          <v-col class="d-flex justify-end align-center py-2 px-5">
            <v-btn
              fab
              text
              v-tooltip="{ content: `<div class='v-btn-tooltip'>Fechar</div>` }"
              @click="dialog = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>

      <v-card-text class="pb-0 default-text--text" :style="modalHeight">
        <v-row class="px-0" :style="modalHeight">
          <v-col cols="8" class="pl-0 pr-1">
            <TabComponent
              class="elevation-0"
              tab-item-custom-class="pt-2 p-0"
              :tab-items="tabItems"
            >
              <template v-slot:task>
                <div v-if="isLoadingTask">
                  <v-skeleton-loader
                    class="mx-auto w-100 ma-2"
                    type="article, card, actions"
                  ></v-skeleton-loader>
                </div>
                <div v-else>
                  <div
                    v-if="!taskView"
                    class="d-flex flex-column justify-center align-center"
                  >
                    <img
                      class="my-3"
                      :src="taskChannelConfig[taskChannel].img"
                      alt=""
                    />
                    <span
                      class="font-body-medium sub-text--text text-center"
                      v-html="taskChannelConfig[taskChannel].text"
                    ></span>
                    <div class="d-flex justify-center mt-8 pb-4">
                      <v-btn
                        elevation="1"
                        class="mr-4 text-none"
                        color="secondary"
                        :disabled="!taskId"
                        @click="taskAction = 'register'"
                      >
                        {{ taskChannelConfig[taskChannel].registerButtonLabel }}
                      </v-btn>
                      <v-btn
                        elevation="1"
                        class="text-none"
                        color="primary"
                        :disabled="!taskId || !hasPhoneCredentials"
                        @click="taskAction = 'execute'"
                      >
                        {{ taskChannelConfig[taskChannel].actionButtonLabel }}
                      </v-btn>
                    </div>
                    <v-alert
                      v-if="!taskId"
                      elevation="1"
                      class="my-2 mx-10 pa-2 d-flex align-left justify-center body-3"
                    >
                      <template v-slot:prepend>
                        <i
                          class="material-symbols-rounded v-icon mr-2 warning--text"
                        >
                          warning
                        </i>
                      </template>
                      <p
                        class="mb-0 font-weight-bold body-3"
                        style="line-height: 16px"
                      >
                        Inclua as informações necessárias
                      </p>
                      <p class="mb-0 body-3" style="line-height: 16px">
                        {{ getCreateAlertText(mediaType) }}
                      </p>
                    </v-alert>
                    <v-alert
                      v-if="!hasPhoneCredentials && taskId"
                      elevation="1"
                      icon="mdi-alert-circle"
                      class="my-2 mx-10 pa-2 d-flex align-left justify-center body-3"
                    >
                      <p class="mb-0 body-3">
                        No momento não há provedor de ligação habilitado para o
                        seu usuário.
                      </p>
                    </v-alert>
                  </div>
                  <div v-if="taskView === 'register'">
                    <section class="pb-10">
                      <div
                        v-if="createdTask && taskChannel !== 'default'"
                        class="mb-2"
                      >
                        <v-btn
                          fab
                          icon
                          x-small
                          elevation="2"
                          class="mr-1"
                          @click="taskAction = null"
                        >
                          <v-icon color="primary">mdi-chevron-left</v-icon>
                        </v-btn>
                        <span>{{
                          taskChannelConfig[taskChannel].registerDismiss
                        }}</span>
                      </div>
                      <VueEditor
                        class="custom-vue-editor custom-vue-editor-toolbar custom-vue-editor-disabled"
                        v-model="formData.content"
                        :style="contentEditorHeight"
                        :editor-toolbar="customToolbar"
                        :disabled="!taskId || finishedTask"
                      />
                    </section>
                    <section
                      v-if="taskId"
                      class="bottom-editor-action-bar d-flex justify-space-between align-center px-2 pb-2 mt-2"
                    >
                      <TemplateSelector
                        :is-disabled="finishedTask"
                        :media-type-id="mediaTypeId"
                        @onTemplateChosen="(template) => { formData.content = templateInsertion(template, formData.content) }"
                      />
                      <v-btn
                        color="secondary"
                        :disabled="invalidContent || finishedTask"
                        @click="handleTaskContent"
                        >Salvar</v-btn
                      >
                    </section>
                    <section
                      v-else
                      class="bottom-editor-action-bar d-flex justify-space-between align-center px-2"
                    >
                      <v-alert
                        elevation="1"
                        class="my-2 mx-10 pa-2 d-flex align-left justify-center body-3"
                      >
                        <template v-slot:prepend>
                          <v-icon
                            class="material-icons-outlined mr-2"
                            color="warning"
                          >
                            warning_amber
                          </v-icon>
                        </template>
                        <p
                          class="mb-0 font-weight-bold body-3"
                          style="line-height: 16px"
                        >
                          Inclua as informações necessárias
                        </p>
                        <p class="mb-0 body-3" style="line-height: 16px">
                          {{ getCreateAlertText(mediaType) }}
                        </p>
                      </v-alert>
                    </section>
                  </div>
                  <div v-if="taskView === 'execute'">
                    <div v-if="taskChannel === 'chat'">
                      <TaskChatChannel
                        :task-id="taskId"
                        :task-state="task.state"
                        :opportunity-id="task.opportunity_id"
                        :companies="[companies]"
                        :prop-contact="contact"
                        :prop-media="contactMedia"
                        :media-type-id="mediaType.id"
                        :dialog="dialog"
                        @onChatStatusChange="(value) => (chatStatus = value)"
                        @onChatStart="getTask"
                        @onCancelAction="taskAction = null"
                      />
                    </div>
                    <div v-else-if="taskChannel === 'mail'">
                      <TaskEmailChannel
                        :task-id="taskId"
                        :task-log="task.logs"
                        :task-state="task.state"
                        :task-assigned-to="task.assigned_to.name"
                        :opportunity-id="task.opportunity_id"
                        :companies="[companies]"
                        :prop-contact="contact"
                        :prop-media="contactMedia"
                        :media-type-id="mediaType.id"
                        :dialog="dialog"
                        @onEmailUpdated="getTask"
                        @onCancelAction="taskAction = null"
                      />
                    </div>
                    <div v-else-if="taskChannel === 'call'">
                      <TaskCallChannel
                        :task-id="taskId"
                        :task-log="task.logs"
                        :task-state="task.state"
                        :task-content="task.content"
                        :opportunity-id="task.opportunity_id"
                        :companies="[companies]"
                        :prop-contact="contact"
                        :prop-media="contactMedia"
                        :media-type-id="mediaType.id"
                        :dialog="dialog"
                        @onCallStart="getTask"
                        @onCancelAction="taskAction = null"
                        @onCallContentUpdate="
                          (content) => {
                            formData.content = content
                          }
                        "
                      />
                    </div>
                  </div>
                </div>
              </template>
              <template v-slot:opportunity>
                <TaskModalOpportunityTab
                  :opportunity-id="
                    task.opportunity_id ? task.opportunity_id : opportunity.id
                  "
                />
              </template>
            </TabComponent>
          </v-col>
          <div class="mt-3" :style="modalHeight">
            <v-divider vertical></v-divider>
          </div>

          <v-col cols="4" class="pl-3 pr-0">
            <section>
              <v-chip-group
                mandatory
                column
                class="chip-group"
                v-model="chipSelection"
                :show-arrows="false"
              >
                <v-chip
                  color="primary"
                  class="px-2"
                  :outlined="!(chipSelection === 0)"
                  >Descrição</v-chip
                >
                <v-chip
                  color="primary"
                  class="px-2"
                  :disabled="!taskId"
                  :outlined="!(chipSelection === 1)"
                  >Comentários</v-chip
                >
                <v-chip
                  color="primary"
                  class="px-2"
                  :disabled="!taskId"
                  :outlined="!(chipSelection === 2)"
                  >Anexos</v-chip
                >
                <v-chip
                  color="primary"
                  class="mr-0 px-2"
                  :disabled="!taskId"
                  :outlined="!(chipSelection === 3)"
                  >Histórico</v-chip
                >
              </v-chip-group>
            </section>
            <div class="task-description" :style="cssVars">

              <section v-if="chipSelection === 0">
                <div v-if="!editMode">
                  <div class="d-flex justify-end">
                    <v-btn
                      fab
                      elevation="0"
                      color="secondary"
                      v-tooltip="{
                        content: `<div class='v-btn-tooltip'>Editar</div>`,
                      }"
                      :disabled="finishedTask"
                      @click="editMode = true"
                    >
                      <v-icon small class="material-icons-round">edit</v-icon>
                    </v-btn>
                  </div>
                  <div class="mb-2">
                    <v-icon small class="material-icons-outlined sub-text--text"
                      >task</v-icon
                    >
                    <span class="font-body-medium sub-text--text">Tipo de tarefa</span>
                    <span v-if="mediaType" class="font-body-medium default-text--text">{{
                      mediaType.name || '-'
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <v-icon small class="material-icons-round sub-text--text"
                      >check_circle_outline</v-icon
                    >
                    <span class="font-body-medium sub-text--text"
                      >Finalidade da tarefa</span
                    >
                    <span class="font-body-medium">{{
                      task.type ? task.type.name : '-'
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <i small class="material-symbols-rounded v-icon sub-text--text" style="font-size: 16px;">assignment_ind</i>
                    <span class="font-body-medium sub-text--text">Atribuído(a) a</span>
                    <span class="font-body-medium">{{ task.assigned_to ? task.assigned_to.name : '-' }}</span>
                  </div>
                  <div class="mb-2">
                    <v-icon small class="material-icons-outlined sub-text--text"
                      >calendar_month</v-icon
                    >
                    <span class="font-body-medium sub-text--text">Data</span>
                    <v-chip outlined x-small :color="dateColor">
                      <v-icon x-small class="material-icons-outlined"
                        >calendar_month</v-icon
                      >
                      <span class="body-3">{{
                        $moment(`${task.scheduled_to}z`).format('DD/MM/YYYY') ||
                        '-'
                      }}</span>
                    </v-chip>
                    <span class="font-body-medium">{{
                      $moment(`${task.scheduled_to}z`).format('HH[h]mm') || '-'
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <v-icon small class="material-icons-round sub-text--text"
                      >priority_high</v-icon
                    >
                    <span class="font-body-medium sub-text--text">Prioridade</span>
                    <v-chip x-small :color="taskColors.priority[task.priority]">
                      <span class="body-3 white--text">{{
                        task.priority || '-'
                      }}</span>
                    </v-chip>
                  </div>
                  <div class="mb-2">
                    <v-icon small class="material-icons-outlined sub-text--text"
                      >person_outline</v-icon
                    >
                    <span class="font-body-medium sub-text--text">A contatar</span>
                    <span class="font-body-medium" color="primary--text">{{
                      task.contact ? task.contact.name : '-'
                    }}</span>
                    <span class="font-body-medium">{{
                      task.media ? task.media.value : '-'
                    }}</span>
                    <v-icon
                      v-if="task.media"
                      small
                      color="primary"
                      class="material-icons-round mr-1"
                      @click.stop="copyToClipboard(task.media.value)"
                      >copy</v-icon
                    >
                  </div>
                  <div v-if="finishedTask" class="mb-2">
                    <v-icon small class="material-icons-round sub-text--text"
                      >rule</v-icon
                    >
                    <span class="font-body-medium sub-text--text">Resultado da tarefa</span>
                    <span class="font-body-medium">{{
                      task.output ? JSON.parse(task.output).value : '-'
                    }}</span>
                  </div>
                  <div class="mb-2">
                    <i
                      class="material-symbols-rounded v-icon mr-1 sub-text--text"
                      style="font-size: 16px"
                      >receipt_long</i
                    >
                    <span class="font-body-medium sub-text--text">Instrução</span>
                    <span v-if="task.description" class="font-body-medium">
                      {{
                        task.description | truncate(showDescription ? 9999 : 400)
                      }}
                      <v-icon
                        v-if="task.description"
                        small
                        color="primary"
                        class="material-icons-round mr-1"
                        @click.stop="copyToClipboard(task.description)"
                        >copy</v-icon
                      >
                      <span
                        v-if="task.description && task.description.length > 400"
                        class="primary--text font-body-medium mr-4 pointer-click"
                        @click.stop="showDescription = !showDescription"
                        >{{ showDescription ? 'Ver menos' : 'Ver mais' }}</span
                      >
                    </span>
                    <span v-else class="font-body-medium">Não informado</span>
                  </div>
                </div>
                <v-form v-else ref="form" class="pb-2 px-1">
                  <div class="d-flex justify-start">
                    <p class="font-body-medium">Editando detalhes da tarefa</p>
                  </div>
                  <NewAutocomplete
                    v-if="!hasOpportunity"
                    outlined
                    dense
                    clearable
                    ref="opportunityAutocomplete"
                    label="Empresa/Oportunidade"
                    endpoint="/cash/opportunity"
                    query="includes=company&load_only=id,customer_id,company.name,company.identifier"
                    item-value="id"
                    search-key="company.name"
                    alternative-search-key="company.identifier"
                    v-model="opportunityId"
                    :item-text="(item) => `${item.id} - ${item.company.name} - ${item.company.identifier} (${maskCnpj(item.company.identifier)})`"
                    :search-validation="StringIsJustNumbers"
                    @onItemsUpdate="(items) => { findCompany(items, opportunityId) }"
                    @change="resetContact"
                  />
                  <v-select
                    attach
                    outlined
                    dense
                    return-object
                    label="Tipo de Tarefa"
                    item-text="name"
                    v-model="mediaType"
                    :items="taskMediaTypes"
                    :disabled="onGoingTask"
                    @change="onMediaTypeChange"
                  ></v-select>
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
                    @change="setTaskTime"
                  ></v-select>
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
                    @change="verifySlots"
                  ></v-text-field>
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
                    @change="verifySlots"
                  ></v-text-field>
                  <v-select
                    attach
                    v-if="isScheduling"
                    outlined
                    dense
                    label="Lembrete"
                    item-text="text"
                    item-value="value"
                    v-model="reminderTo"
                    :items="reminderOptions"
                  ></v-select>
                  <v-select
                    attach
                    outlined
                    dense
                    label="Duração"
                    item-text="text"
                    item-value="value"
                    :items="taskTimeList"
                    v-model="formData.time"
                    :error="$v.formData.time.$error"
                    :error-messages="
                      $v.formData.time.$error ? 'Esse campo é obrigatório' : ''
                    "
                    @change="verifySlots"
                  ></v-select>
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
                    :validate="$v.formData.team_id"
                    :disabled="onGoingTask"
                  ></NewAutocomplete>
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
                    :validate="$v.formData.assigned_to_id"
                    :disabled="onGoingTask"
                    @onValueNotFound="
                      (value) => (formData.assigned_to_id = value)
                    "
                    @change="verifySlots()"
                  ></NewAutocomplete>
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
                    :disabled="hasChatConversation || onGoingTask"
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
                    outlined
                    dense
                    enable-creation
                    ref="contactMediaCombobox"
                    endpoint="customer/all-medias-contact"
                    item-text="value"
                    search-key="value"
                    v-model="contactMedia"
                    :load-on-mount="itemId ? true : false"
                    :custom-mask="mediaFieldMask"
                    :disabled="!formData.contact_id || hasChatConversation"
                    :label="mediaFieldLabel"
                    :rules="mediaFieldRules"
                    :messages="mediaFieldMessages"
                    :query="`contact_id=in(${formData.contact_id})&base=in(${validMedias})&company_id=in(${companies})`"
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
  
                  <v-textarea
                    label="Instruções"
                    outlined
                    dense
                    rows="4"
                    no-resize
                    v-model="formData.description"
                  ></v-textarea>
  
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
                  <div class="d-flex justify-end">
                    <v-btn
                      color="secondary"
                      class="mr-2"
                      :disabled="isUpdatingTask"
                      @click="handleCancel"
                    >
                      Cancelar
                    </v-btn>
                    <v-btn
                      color="primary"
                      class="text-none"
                      :loading="isUpdatingTask"
                      @click="submitTask"
                    >
                      Salvar edição
                    </v-btn>
                  </div>
                </v-form>
              </section>
              <section v-else-if="chipSelection === 1">
                <div>
                  <div
                    v-if="taskComments.length === 0"
                    class="comment-timeline text-center"
                  >
                    <img
                      class="my-10"
                      src="~/static/task-modal-comments-empty.png"
                      alt=""
                    />
                  </div>
                  <div v-else ref="comment-timeline" class="comment-timeline">
                    <div
                      v-for="(comments, commentDate) in taskComments"
                      :key="commentDate"
                      class="text-center mx-1"
                    >
                      <v-chip outlined>{{ commentDate }}</v-chip>
                      <section
                        v-for="comment in comments"
                        :key="comment.id"
                        class="body-3 mb-4"
                      >
                        <div class="d-flex">
                          <span class="align-self-end">{{
                            comment.user_name
                          }}</span>
                          <div
                            v-if="commentToEdit !== comment.id"
                            class="ml-auto"
                          >
                            <i
                              v-if="validateUser(comment.user_id)"
                              class="material-symbols-outlined v-icon v-icon--link mr-1 sub-text--text"
                              @click="deleteComment(comment.id)"
                            >
                              delete
                            </i>
                            <v-icon
                              v-if="validateUser(comment.user_id)"
                              small
                              class="material-icons-round"
                              @click="setCommentToEdit(comment.content, comment.id)"
                            >
                              edit
                            </v-icon>
                          </div>
                        </div>
                        <div v-if="commentToEdit === comment.id" class="mt-1">
                          <v-textarea
                            outlined
                            no-resize
                            hide-details
                            placeholder="Digite um comentário..."
                            class="w-100 textarea-bottom-actions"
                            rows="2"
                            v-model="commentContent"
                            @keydown.shift.enter.exact.prevent="
                              handleComment(true, comment.id)
                            "
                          >
                            <template v-slot:append>
                              <div class="w-100 d-flex mb-2">
                                <div class="ml-auto">
                                  <v-btn
                                    fab
                                    icon
                                    @click="cancelCommentEdit"
                                    v-tooltip="{
                                      content: `<div class='v-btn-tooltip font-body-medium'>
                                          Cancelar
                                        </div>`,
                                    }"
                                  >
                                    <v-icon class="material-symbols-outlined"
                                      >highlight_off</v-icon
                                    >
                                  </v-btn>
                                  <v-btn
                                    @click="handleComment(true, comment.id)"
                                    fab
                                    icon
                                    v-tooltip="{
                                      content: `<div class='v-btn-tooltip font-body-medium'>
                                          Salvar
                                        </div>`,
                                    }"
                                    :disabled="!commentContent"
                                  >
                                    <v-icon class="material-symbols-outlined"
                                      >check_circle</v-icon
                                    >
                                  </v-btn>
                                </div>
                              </div>
                            
                            </template>
                          </v-textarea>
                        </div>
                        <div v-else class="comment-container pa-2 my-2 text-left">
                          <span style="white-space: pre-wrap">{{ comment.content }}</span>
                        </div>
                        <div
                          v-if="commentToEdit !== comment.id"
                          class="d-flex justify-end"
                        >
                          <span
                            v-if="
                              $moment(comment.created_at).isSame(
                                comment.updated_at,
                                'second'
                              )
                            "
                          >
                            {{
                              $moment(comment.created_at).format(
                                'DD/MM/YY [às] HH[h]mm'
                              )
                            }}
                          </span>
                          <span v-else>
                            {{
                              `Editado em: ${$moment(comment.updated_at).format(
                                'DD/MM/YY [às] HH[h]mm'
                              )}`
                            }}
                          </span>
                        </div>
                      </section>
                    </div>
                  </div>
                  <v-textarea
                    outlined
                    no-resize
                    hide-details
                    placeholder="Digite um comentário..."
                    class="w-100 textarea-bottom-actions"
                    rows="2"
                    v-model="taskComment"
                    @keydown.shift.enter.exact.prevent="handleComment()"
                  >
                    <template v-slot:append>
                      <div class="w-100 d-flex mb-2 pt-1">
                        <v-btn
                          fab
                          icon
                          color="primary"
                          class="ml-auto"
                          :disabled="!taskComment"
                          @click="handleComment()"
                        >
                          <v-icon class="material-symbols-outlined">send</v-icon>
                        </v-btn>
                      </div>
                    </template>
                  </v-textarea>
                </div>
              </section>
              <section v-else-if="chipSelection === 2">
                <div>
                  <div
                    v-if="taskUploads.length === 0"
                    class="attach-timeline text-center"
                  >
                    <div class="d-flex flex-column mx-7 mt-10">
                      <v-icon large class="material-icons-round mx-4 mb-2 mt-10"
                        >attach_file</v-icon
                      >
                      <span class="mx-4 font-body-medium"
                        >A Tarefa ainda não possui anexos</span
                      >
                    </div>
                  </div>
                  <div v-else class="attach-timeline mb-3">
                    <div class="text-center mx-1 mb-4">
                      <section
                        v-for="upload in taskUploads"
                        :key="upload.content"
                        class="font-body-medium mb-2"
                      >
                        <div class="attach-container d-flex pa-2 mb-1">
                          <div>
                            <v-icon class="material-icons-round"
                              >attach_file</v-icon
                            >
                            <span class="align-self-end">{{ upload.title }}</span>
                          </div>
                          <div class="ml-auto">
                            <v-icon
                              class="material-icons-outlined mr-1"
                              v-tooltip="{
                                content: `<div class='v-btn-tooltip'>
                                ${
                                  attachId === upload.content
                                    ? 'Link copiado para a área de transferência!'
                                    : 'Copiar link de compartilhamento'
                                }
                                </div>`,
                              }"
                              @click="shareFileUrl(upload.content)"
                            >
                              share
                            </v-icon>
                            <v-icon
                              class="material-icons-outlined mr-1"
                              v-tooltip="{
                                content: `<div class='v-btn-tooltip'>Baixar</div>`,
                              }"
                              @click="downloadFile(upload.content, upload.title)"
                            >
                              file_download
                            </v-icon>
                            <i
                              v-if="validateUser(upload.user_id)"
                              class="material-symbols-outlined v-icon v-icon--link mr-1 theme--light"
                              v-tooltip="{
                                content: `<div class='v-btn-tooltip'>Excluir</div>`,
                              }"
                              @click="deleteFile(upload.id)"
                            >
                              delete
                            </i>
                          </div>
                        </div>
                        <div class="d-flex justify-end body-3">
                          <span class="mr-2 font-weight-bold">{{
                            upload.user
                          }}</span>
                          <span>{{
                            $moment(upload.created_at).format(
                              'DD/MM/YY [às] HH[h]mm'
                            )
                          }}</span>
                        </div>
                      </section>
                    </div>
                  </div>
                  <div>
                    <div
                      class="pa-4 mt-5 v-file-input-bordered label-float"
                      v-cloak
                      @drop.prevent="addDropFile"
                      @dragover.prevent
                    >
                      <label class="floating-input">Anexar Arquivos</label>
                      <div class="d-flex justify-center align-center my-2 font-body-medium">
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
                    </div>
                    <span class="ml-2 body-3">Limite de 20 MB por arquivo</span>
                  </div>
                </div>
              </section>
              <section v-else-if="chipSelection === 3">
                <div v-if="loadingHistory">
                  <v-skeleton-loader
                    v-for="n in 3"
                    :key="n"
                    v-bind="attrs"
                    type="article"
                  ></v-skeleton-loader>
                </div>
                <div v-else class="log-timeline mb-3">
                  <div
                    v-for="(history, historyDate) in taskHistory"
                    :key="historyDate"
                    class="text-center mx-1"
                  >
                    <v-chip outlined>{{ historyDate }}</v-chip>
                    <section
                      v-for="item in history"
                      :key="item.id"
                      class="body-3 mb-4"
                    >
                      <div class="log-container pa-2 my-2 text-left">
                        <div>
                          <v-icon
                            small
                            class="material-icons-round text-weight-bold"
                            >outlined_flag</v-icon
                          >
                          <span class="align-self-end font-body-medium">{{
                            item.type
                          }}</span>
                        </div>
                        <div>
                          <i small class="material-symbols-rounded v-icon sub-text--text" style="font-size: 16px;">assignment_ind</i>
                          <span class="align-self-end">{{ item.user.name }}</span>
                        </div>
                      </div>
                      <div class="d-flex justify-end">
                        <span>{{
                          $moment(item.created_at).format('DD/MM/YY [às] HH[h]mm')
                        }}</span>
                      </div>
                    </section>
                  </div>
                </div>
              </section>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-btn
          class="text-none"
          color="secondary"
          elevation="0"
          :disabled="!createdTask || finishedTask"
          @click="handleDeleteTask"
        >
          <i class="material-symbols-outlined v-icon v-icon--link mr-1">
            delete
          </i>
          Excluir tarefa
        </v-btn>
        <v-spacer></v-spacer>
        <div>
          <v-btn color="secondary" class="mr-2" @click="dialog = false">
            Fechar
          </v-btn>
          <v-btn
            color="primary"
            class="text-none"
            @click="outputDialog = true"
            :disabled="editMode || finishedTask"
          >
            Finalizar tarefa
          </v-btn>
          <TaskOutputForm
            :prop-dialog="outputDialog"
            :outputs="taskOutputs"
            @onClose="handleTaskConclusion"
          />
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'

const initialState = () => ({
  dialog: false,
  chipSelection: 0,
  editMode: false,
  tabItems: [
    { name: 'Tarefa', value: 'task', disabled: false },
    { name: 'Oportunidade', value: 'opportunity', disabled: false },
  ],
  customToolbar: [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: '' }, { align: 'justify' }, { align: 'right' }],
    ['link', 'image'],
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
  taskColors: {
    priority: {
      Baixa: '#6284FD',
      Média: '#E36822',
      Alta: '#EA312F',
    },
    state: {
      'Não iniciada': '#67748E',
      'Em execução': '#6284FD',
      Concluída: '#008C1F',
      'Em espera': '#E36822',
    },
  },
  formData: {
    id: null,
    time: null,
    priority: null,
    team_id: null,
    assigned_to_id: null,
    type_id: null,
    contact_id: null,
    media_id: null,
    description: null,
    content: null,
    reminder_to: null,
  },
  opportunityId: null,
  selectedOpportunity: null,
  taskSchedule: {
    date: null,
    hours: null,
  },
  taskMediaTypes: [],
  mediaType: {},
  taskTypeList: [],
  taskType: {},
  task: {
    id: null,
    state: null,
    priority: null,
    opportunity_id: null,
    logs: [],
    assigned_to: {
      name: null,
    },
    type: {
      name: null,
      extra: null,
    },
    contact: {
      name: null,
    },
    media: {
      value: null,
    },
    description: null,
    content: null,
    output: null,
    scheduled_to: null,
  },
  contact: {},
  contactMedia: {},
  mediaValue: null,
  mediaDialog: false,
  isLoadingTask: true,
  isUpdatingTask: false,
  taskComment: null,
  commentContent: null,
  commentToEdit: null,
  error: false,
  showDescription: false,
  scheduleDialog: false,
  scheduleIsAvailable: true,
  slotSuggestions: [],
  taskAction: null,
  outputDialog: false,
  taskChannelConfig: {
    mail: {
      dialogButtonIcon: 'mail_outline',
      dialogButtonLabel: 'Enviar E-mail',
      dialogButtonColor: 'email-icon-bg',
      dialogButtonTextColor: 'email-icon-text',
      dialogButtonTooltip: 'E-mail',
      actionButtonLabel: 'Envie um e-mail pelo CRM',
      registerButtonLabel: 'Registre um e-mail',
      text: 'Troque e-mails com qualquer pessoa sem precisar sair do CRM!<br/>E mantenha um histórico de mensagens trocadas em cada tarefa.',
      img: '/task-mail-logo.png',
      registerDismiss: 'Registre um e-mail',
    },
    call: {
      dialogButtonIcon: 'call',
      dialogButtonLabel: 'Efetuar Ligação',
      dialogButtonColor: 'phone-icon-bg',
      dialogButtonTextColor: 'phone-icon-text',
      dialogButtonTooltip: 'Ligação',
      actionButtonLabel: 'Ligue pelo CRM',
      registerButtonLabel: 'Registre uma ligação',
      text: 'Faça ligações para qualquer pessoa sem precisar sair do CRM,<br/>e mantenha um histórico de chamadas em cada tarefa.',
      img: '/task-call-logo.png',
      registerDismiss: 'Registre uma ligação',
    },
    chat: {
      dialogButtonIcon: 'mdi-whatsapp',
      dialogButtonLabel: 'Enviar WhatsApp',
      dialogButtonColor: 'chat-icon-bg',
      dialogButtonTextColor: 'chat-icon-text',
      dialogButtonTooltip: 'WhatsApp',
      actionButtonLabel: 'Inicie uma conversa pelo CRM',
      registerButtonLabel: 'Registre uma conversa',
      text: 'Troque mensagens com qualquer contato sem precisar sair do CRM!<br/>E mantenha um histórico de conversas em cada tarefa.',
      img: '/task-chat-logo.png',
      registerDismiss: 'Registre uma conversa',
    },
    meeting: {
      dialogButtonIcon: '',
      dialogButtonLabel: 'Fazer Reunião',
      dialogButtonColor: 'meeting-icon-bg',
      dialogButtonTextColor: 'meeting-icon-text',
      dialogButtonTooltip: 'Reunião',
      actionButtonLabel: '',
      registerButtonLabel: '',
      text: '',
      img: '',
      registerDismiss: 'Registre uma tarefa',
    },
    internal: {
      dialogButtonIcon: '',
      dialogButtonLabel: 'Registrar',
      dialogButtonColor: 'internal-icon-bg',
      dialogButtonTextColor: 'internal-icon-text',
      dialogButtonTooltip: 'Interna',
      actionButtonLabel: '',
      registerButtonLabel: '',
      text: '',
      img: '',
      registerDismiss: 'Registre uma tarefa',
    },
    default: {
      dialogButtonIcon: 'pending',
      dialogButtonLabel: 'Registrar',
      dialogButtonColor: 'default-icon-bg',
      dialogButtonTextColor: 'default-icon-text',
      dialogButtonTooltip: 'Outros',
      actionButtonLabel: '',
      registerButtonLabel: '',
      text: '',
      img: '',
      registerDismiss: 'Registre uma tarefa',
    },
  },
  chatStatus: null,
  createdTaskId: null,
  isScheduling: false,
  reminderTo: null,
  reminderOptions: [
    { text: 'Nenhum', value: null },
    { text: '5 minutos antes', value: 5 },
    { text: '10 minutos antes', value: 10 },
    { text: '15 minutos antes', value: 15 },
    { text: '20 minutos antes', value: 20 },
    { text: '30 minutos antes', value: 30 },
    { text: '1 hora antes', value: 60 },
  ],
  attachId: null,
  files: [],
  taskHistory: [],
  loadingHistory: false,
})
const charRegex = /\S/

export default {
  props: {
    hasButton: Boolean,
    listButton: Boolean,
    timelineButton: Boolean,
    taskButton: Boolean,
    iconButton: String,
    openDialog: Boolean,
    itemId: { type: [Number, String], default: null },
    propChannel: { type: String, default: null },
    opportunity: {
      type: Object,
      default: () => ({
        id: null,
        customer_id: null,
      }),
    },
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
          return !this.isInternalTask
        }),
      },
      media_id: {
        required: requiredIf(function () {
          return !this.isInternalTask
        }),
      },
      priority: { required },
      team_id: { required },
      assigned_to_id: { required },
    },
    taskSchedule: {
      date: { required },
      hours: { required },
    },
    opportunityId: { required: requiredIf(function() { return !this.hasOpportunity }) },
  },
  computed: {
    ...mapGetters({
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
      const mediaBase = this.taskId
        ? this.getEnumValue(this.mediaType.base, this.meta.mediaBase)
        : this.mediaType.base
      switch (mediaBase) {
      case 'mobile':
        return 'mobile'
      case 'landline':
        return 'mobile'
      case 'phone':
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
      case 'landline':
        return 'mobile'
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
      case 'landline':
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
      case 'landline':
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
      if (this.opportunity.id) {
        return this.opportunity.customer_id
      }
      const opportunity = this.task.opportunity
      if (opportunity) {
        return opportunity.customer_id
      }
      if (this.selectedOpportunity) {
        return this.selectedOpportunity.customer_id
      }
      return null
    },
    taskUploads: function () {
      const uploads = this.task?.uploads || []
      if (uploads) {
        const taskUploads = uploads.map((upload) => {
          return {
            id: upload.id,
            title: upload.name,
            created_at: this.$moment(new Date(`${upload.created_at}Z`)),
            content: upload.file_id,
            user: upload.user ? upload.user.name : '-',
            user_id: upload.user_id,
            type: 'upload',
            date: this.$moment(`${upload.created_at}Z`).format('DD/MM/YYYY'),
          }
        })
        return taskUploads
      }
      return []
    },
    taskComments: function () {
      const logs = this.task?.logs || []
      if (logs.length > 0) {
        const comments = logs
          .filter((log) => log.description === 'Registro do usuário')
          .map((log) => {
            try {
              const content = JSON.parse(log.content)
              return {
                id: log.id,
                title: log.description,
                content: content.history
                  ? content.history.content
                  : content.content,
                user_name: log.user
                  ? log.user.name
                  : content.history
                    ? content.history.user_name
                    : content.user_name,
                user_id: log.user_id
                  ? log.user_id
                  : content.history
                    ? content.history.user_id
                    : content.user_id,
                updated_at: this.$moment(new Date(`${log.updated_at}Z`)),
                created_at: this.$moment(new Date(`${log.created_at}Z`)),
                date: this.$moment(`${log.created_at}Z`).format('DD/MM/YYYY'),
              }
            } catch (error) {
              console.log(error)
              return {
                title: log.description,
                content: '',
                user_name: '',
                updated_at: this.$moment(new Date(`${log.updated_at}Z`)),
                created_at: this.$moment(new Date(`${log.created_at}Z`)),
                date: this.$moment(`${log.created_at}Z`).format('DD/MM/YYYY'),
              }
            }
          })
        return this.arrayGroupBy(comments, 'date')
      }
      return []
    },
    taskChannel: function () {
      const extra = this.taskType?.extra
      if (extra) {
        try {
          const parsedExtra = JSON.parse(extra)
          if (parsedExtra.modal) {
            if (parsedExtra.modal === 'meeting') {
              return 'default'
            }
            return parsedExtra.modal
          } else {
            return 'default'
          }
        } catch (error) {
          return 'default'
        }
      } else {
        if (this.taskTypeList.length > 0) {
          const taskType = this.taskTypeList.find((type) => {
            if (type.extra) {
              return type.extra.includes('modal')
            }
            return false
          })
          if (taskType?.extra) {
            try {
              const parsedExtra = JSON.parse(taskType.extra)
              if (parsedExtra.modal) {
                if (parsedExtra.modal === 'meeting') {
                  return 'default'
                }
                return parsedExtra.modal
              } else {
                return 'default'
              }
            } catch (error) {
              return 'default'
            }
          }
        } else {
          if (this.propChannel) {
            if (this.propChannel === 'meeting') {
              return 'default'
            }
            return this.propChannel
          }
        }
      }
      return 'default'
    },
    taskView: function () {
      if (this.taskChannel === 'default') {
        return 'register'
      }
      return this.taskAction
      // return 'execute'
    },
    taskOutputs: function () {
      const outputs = this.taskType?.outputs
      if (outputs) {
        return JSON.parse(outputs)
      }
      return []
    },
    finishedTask: function () {
      if (this.task?.output && this.task.state === 'Concluída') {
        return true
      }
      return false
    },
    taskId: function () {
      if (this.itemId) {
        return this.itemId
      } else {
        return this.createdTaskId
      }
    },
    createdTask: function () {
      if (this.task.state === 'Não iniciada') {
        return true
      }
      return false
    },
    onGoingTask: function () {
      if (
        this.task.state === 'Em execução' ||
        this.task.state === 'Em espera'
      ) {
        return true
      }
      return false
    },
    hasPhoneCredentials: function () {
      return this.checkPhoneStatus(this.taskChannel)
    },
    hasChatConversation: function () {
      const activeChatStatus = [
        'Conversa iniciada',
        'Conversa fechada',
        'Aguardando abertura',
        'Em espera',
      ]
      if (activeChatStatus.includes(this.chatStatus)) {
        return true
      }
      return false
    },
    dateColor: function () {
      const taskDate = this.task.scheduled_to
      if (taskDate) {
        return this.isLate(this.task.scheduled_to)
      }
      return 'primary'
    },
    isInternalTask: function () {
      const extra = this.taskType?.extra
      if (extra) {
        if (extra.includes('internal')) {
          return true
        }
      }
      return false
    },
    validMedias: function () {
      const mediaBase = this.getEnumValue(
        this.mediaType.base,
        this.meta.mediaBase
      )
      switch (mediaBase) {
      case 'mail':
        return 'mail'
      case 'mobile':
        return 'mobile,landline'
      case 'landline':
        return 'mobile,landline'
      case 'other':
        return 'landline,mail,mobile'
      default:
        return 'mail,landline,mobile'
      }
    },
    taskTypeChannel: function () {
      if (this.taskTypeList.length > 0) {
        const taskType = this.taskTypeList[0]
        if (taskType?.extra) {
          const { modal, internal = false } = JSON.parse(taskType.extra)
          if (internal) {
            return 'internal'
          }
          switch (modal) {
          case 'mail':
            return 'mail'
          case 'call':
            return 'call'
          case 'chat':
            return 'chat'
          case 'meeting':
            return 'meeting'
          default:
            return 'default'
          }
        }
        return 'default'
      }
      return null
    },
    mediaTypeId: function () {
      const mediaType = this.mediaType
      if (mediaType?.id) {
        return mediaType.id
      }
      return null
    },
    mediaTypeName: function () {
      const mediaType = this.mediaType
      if (mediaType?.name) {
        return mediaType.name
      }
      return null
    },
    hasOpportunity: function() {
      if (this.itemId) {
        return true
      }
      if (this.opportunity && this.opportunity.id) {
        return true
      }
      return false
    },
    companyContactId() {
      return this.contact?.companies?.find(
        (company) => company.company_id === this.companies
      )?.id
    },
    modalHeight() {
      if (this.windowHeight <= 900) {
        return { height: '70vh' }
      }
      return { height: '75vh' }
    },
    contentEditorHeight() {
      if (this.windowHeight <= 900) {
        return { height: '33vh' }
      }
      return { height: '47vh' }
    },
    cssVars() {
      if (this.windowHeight <= 900) {
        return {
          '--task-description-height': '58vh',
          '--comment-timeline-height': '36vh',
          '--attach-timeline-height': '34vh',
          '--log-timeline-height': '54vh',
        }
      }
      return {
        '--task-description-height': '68vh',
        '--comment-timeline-height': '50vh',
        '--attach-timeline-height': '48vh',
        '--log-timeline-height': '66vh',
      }
    },
    invalidContent: function () {
      const content = this.formData.content ? this.formData.content : ''
      if (content?.length > 1 && charRegex.test(content)) {
        return false
      }
      return true
    },
  },
  watch: {
    openDialog(newValue) {
      this.dialog = newValue
    },
    async dialog(newValue) {
      if (newValue) {
        this.taskMediaTypes = await this.getAllTaskMediaTypes()
        if (this.taskId) {
          this.getTask()
        } else {
          this.fillCreateFormData(this.opportunity)
          this.editMode = true
          this.isLoadingTask = false
        }
      } else {
        this.$emit('closeDialog')
        this.$nextTick(() => {
          this.resetData()
        })
      }
    },
    async scheduleTo(newValue) {
      this.formData.scheduled_to = newValue
      if (newValue) {
        this.checkSchedulingTask(newValue)
        this.updateReminderTo(this.reminderTo, newValue)
      }
    },
    reminderTo(newValue) {
      this.updateReminderTo(newValue, this.scheduleTo)
    },
    async mediaType(newValue) {
      if (newValue) {
        this.taskTypeList = await this.getTaskTypeList(newValue.id)
      }
    },
    taskType(newValue) {
      if (newValue) {
        this.formData.type_id = newValue.id
      } else {
        this.formData.type_id = newValue
      }
    },
    contact(newValue) {
      // this.resetContactMedia()
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
    opportunityId(newValue) {
      if (!newValue) {
        this.resetContact()
      }
    },
    chipSelection(newValue) {
      if (newValue === 3) {
        this.getTaskHistory()
      }
    },
  },
  methods: {
    async getTask() {
      if (!this.task.id) {
        this.isLoadingTask = true
      }
      const endpoint = '/cash/task'
      const params = new URLSearchParams()
      params.append('translateEnums', 'true')
      params.append('includesInactive', 'true')
      params.append(
        'includes',
        'contact,contact.companies,assigned_to,type.media_type,opportunity.customer,template,media'
      )
      params.append('also', 'logs.user,uploads.user')
      params.append('id', this.taskId)

      try {
        const task = await this.getItem(endpoint, params, { throwError: true })

        this.task = task
        this.fillFormData(task)
        this.setView(task)
        this.isLoadingTask = false
      } catch (error) {
        this.error = true
        this.isLoadingTask = false
      }
    },
    fillFormData(task) {
      Object.keys(this.formData).forEach((key) => {
        this.formData[key] = this.task[key]
      })
      this.formData.priority = this.getEnumValue(
        this.formData.priority,
        this.meta.taskPriority
      )
      this.mediaType = task.type.media_type
      this.formData.time = task.time
      if (
        task.time &&
        !this.taskTimeList.find((time) => time.value == task.time)
      ) {
        this.taskTimeList.push({
          text: `${task.time} minutos`,
          value: task.time,
        })
        this.taskTimeList = this.taskTimeList.sort((a, b) => a.value - b.value)
      }
      this.taskType = task.type
      this.contact = task.contact
      this.contactMedia = task.media
      this.setTaskSchedule(`${task.scheduled_to}Z`)
    },
    fillCreateFormData(opportunity) {
      this.getChannelMediaType(this.propChannel)
      // if (this.propChannel === 'chat') {
      // } else {
      //   this.mediaType = this.taskMediaTypes.find((mediaType) => mediaType.base === this.taskChannel)
      // }
      this.contactMedia = null
      this.contact = opportunity.contact
      this.formData.team_id = this.userTeam
      this.formData.assigned_to_id = this.userInfo.id
      this.formData.priority = 'low'
      this.setTaskSchedule(new Date())
    },
    async getChannelMediaType(channel) {
      const mediaIds = this.taskMediaTypes.map((type) => type.id)
      const taskTypeList = await this.getTaskTypeList(
        `in(${mediaIds.join(',')})&limit=1000`
      )
      const taskType = taskTypeList.find((type) => {
        if (type.extra) {
          const parsedExtra = JSON.parse(type.extra)
          if (channel === 'default') {
            if (!parsedExtra?.modal && !parsedExtra?.internal) {
              return true
            }
            const extraValues = ['modal', 'internal']
            return !extraValues.some((value) => type.extra.includes(value))
          }
          if (this.iconButton === 'internal') {
            return type.extra.includes('internal')
          }
          return type.extra.includes(channel)
        } else {
          if (channel === 'default') {
            return true
          }
        }
        return false
      })
      if (taskType) {
        this.mediaType = this.taskMediaTypes.find(
          (mediaType) => mediaType.id === taskType.media_type_id
        )
      } else {
        this.mediaType = this.taskMediaTypes.find(
          (mediaType) => mediaType.base === 'other'
        )
      }
    },
    setTaskSchedule(datetime) {
      this.taskSchedule.date = this.$moment(datetime).format('YYYY-MM-DD')
      this.taskSchedule.hours = this.$moment(datetime).format('HH:mm')
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
    handleMediaCreate(contactMedia) {
      this.contactMedia = contactMedia
      this.mediaDialog = false
      this.$refs.contactMediaCombobox.refreshList()
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
    resetContact() {
      this.contact = null
      if (this.$refs['contactCombobox']) {
        this.$refs['contactCombobox'].resetField()
      }
      this.resetContactMedia()
    },
    resetContactMedia() {
      this.contactMedia = null
      if (this.$refs['contactMediaCombobox']) {
        this.$refs['contactMediaCombobox'].resetField()
      }
    },
    handleCancel() {
      if (this.taskId) {
        this.fillFormData(this.task)
        this.editMode = false
      } else {
        this.dialog = false
      }
    },
    submitTask() {
      this.$v.formData.$touch()
      this.$v.taskSchedule.$touch()
      this.$v.opportunityId.$touch()
      if (this.$v.formData.$error || this.$v.taskSchedule.$error || this.$v.opportunityId.$error) return
      if (!this.scheduleIsAvailable) return
      if (!this.taskId) {
        this.handleCreateTask()
      } else {
        this.handleEditTask()
      }
    },
    async handleCreateTask() {
      try {
        this.isUpdatingTask = true
        const { id, ...payload } = this.formData
        payload.opportunity_id = this.hasOpportunity ? this.opportunity.id : this.opportunityId
        const response = await this.createItem('/cash/task', payload, { throwError: true })
        this.createdTaskId = response.id
        this.task.id = response.id
        await this.getTask()
        this.handleRefresh()
        this.editMode = false
        this.isUpdatingTask = false
      } catch (error) {
        console.log(error)
        this.isUpdatingTask = false
      }
    },
    async handleEditTask() {
      try {
        this.isUpdatingTask = true
        await this.updateData('/cash/task', this.formData, { throwError: true })
        await this.getTask()
        this.handleRefresh()
        this.editMode = false
        this.isUpdatingTask = false
      } catch (error) {
        console.log(error)
        this.isUpdatingTask = false
      }
    },
    async generateFileUrl(fileId) {
      try {
        const {
          data: { url },
        } = await this.$axios.get(
          `/cash/task-upload-by-uid?task_id=${this.task.id}&uid=${fileId}`
        )
        return url
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Não foi possível gerar o link',
          footer: `details: ${error.data?.detail}`,
        })
      }
    },
    async downloadFile(fileId, title) {
      const [fileName] = title.split('.')
      const fileUrl = await this.generateFileUrl(fileId)
      if (fileUrl) {
        const fileLink = document.createElement('a')
        fileLink.href = fileUrl
        fileLink.setAttribute('target', '_blank')
        fileLink.setAttribute('download', fileName)
        document.body.appendChild(fileLink)
        fileLink.click()
      }
    },
    async shareFileUrl(fileId) {
      const fileUrl = await this.generateFileUrl(fileId)
      if (fileUrl) {
        this.copyToClipboard(fileUrl)
        this.attachId = fileId
      }
    },
    async deleteFile(fileId) {
      try {
        await this.removeItem('/cash/task-upload', fileId, { throwError: true })
        this.getTask()
      } catch (error) {
        return
      }
    },
    async handleComment(isEditing = false, id = null) {
      const formData = {
        task_id: this.task.id,
        user_id: this.userInfo.id,
        description: 'Registro do usuário',
      }
      try {
        if (isEditing) {
          if (this.commentContent) {
            const content = JSON.stringify({
              content: this.commentContent,
              user_id: this.userInfo.id,
              user_name: this.userInfo.name,
            })
            const payload = { ...formData, content, id }
            await this.updateData('/cash/task-log', payload, {
              throwError: true,
            })
          }
        } else {
          if (this.taskComment) {
            const content = JSON.stringify({
              content: this.taskComment,
              user_id: this.userInfo.id,
              user_name: this.userInfo.name,
            })
            const payload = { ...formData, content }
            await this.createItem('/cash/task-log', payload, {
              throwError: true,
            })
          }
        }
        await this.getTask()
        if (isEditing) {
          this.commentContent = null
          this.commentToEdit = null
        } else {
          this.taskComment = null
          this.$nextTick(() => this.scrollToEnd(this.$refs['comment-timeline']))
        }
      } catch (error) {
        console.log(error)
      }
    },
    cancelCommentEdit() {
      this.commentContent = null
      this.commentToEdit = null
    },
    scrollToEnd(element) {
      element.scrollTop = element.lastElementChild.lastElementChild.offsetTop
    },
    setCommentToEdit(comment, id) {
      this.commentContent = comment
      this.commentToEdit = id
    },
    async deleteComment(id) {
      try {
        await this.removeItem('/cash/task-log', id)
        await this.getTask()
      } catch (error) {
        console.log(error)
      }
    },
    async handleFileInput(files) {
      const fileList = files.map((file) => ({
        file,
        active: true,
        valid: file.size < 20000000 ? true : false,
      }))
      const filesToUpload = fileList.filter((file) => file.valid)
      const taskInfo = { id: this.task.id }
      const payload = new FormData()
      payload.append('data', JSON.stringify(taskInfo))
      filesToUpload.forEach((file) => {
        if (file.valid) {
          payload.append('file', file.file)
        }
      })
      try {
        await this.updateData('/cash/task-with-files', payload, {
          throwError: true,
        })
        await this.getTask()
      } catch (error) {
        console.log(error)
      }
      this.files = []
    },
    addDropFile(event) {
      this.handleFileInput(Object.values(event.dataTransfer.files))
    },
    async verifySlots() {
      if (this.formData.assigned_to_id && this.formData.scheduled_to) {
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
    async checkAvailability() {
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
    async handleTaskConclusion(output) {
      if (output) {
        const payload = {
          id: this.task.id,
          state: 'done',
          output: JSON.stringify(output),
          content: this.formData.content,
        }
        this.closeChatConversation()
        try {
          await this.updateData('/cash/task', payload, { throwError: true })
          await this.getTask()
          this.handleRefresh()
          this.outputDialog = false
        } catch (error) {
          this.outputDialog = false
        }
      } else {
        this.outputDialog = false
      }
    },
    async handleTaskContent() {
      const payload = {
        id: this.task.id,
        content: this.formData.content,
        state: 'active',
        task_behavior: 'register',
      }
      try {
        await this.updateData('/cash/task', payload, { throwError: true })
        await this.getTask()
        this.handleRefresh()
      } catch (error) {
        console.log(error)
      }
    },
    async closeChatConversation() {
      if (this.chatStatus !== 'Conversa fechada') {
        try {
          await this.$axios.post('/chat/weni/closeconversation', {
            task_id: this.taskId,
          })
        } catch (error) {
          return
        }
      }
    },
    setView(task) {
      const { id, task_behavior, logs } = task
      if (!this.createdTask) {
        if (task_behavior === 'Registrar') {
          this.taskAction = 'register'
        } else {
          let isExecuting = false
          switch (this.taskChannel) {
          case 'chat':
            isExecuting = this.verifyChatBehavior(id)
            if (isExecuting) {
              this.taskAction = 'execute'
            } else {
              this.taskAction = 'register'
            }
            break
          case 'mail':
            isExecuting = this.verifyMailBehavior(logs)
            if (isExecuting) {
              this.taskAction = 'execute'
            } else {
              this.taskAction = 'register'
            }
            break
          case 'call':
            isExecuting = this.verifyCallBehavior(logs)
            if (isExecuting) {
              this.taskAction = 'execute'
            } else {
              this.taskAction = 'register'
            }
            break
          case 'meeting':
            this.taskAction = 'register'
            break
          default:
            this.taskAction = 'register'
            break
          }
        }
      }
    },
    verifyMailBehavior(logs) {
      const emailDescriptions = ['Envio de e-mail', 'Resposta do cliente']
      return logs.some((log) => emailDescriptions.includes(log.description))
    },
    verifyCallBehavior(logs) {
      const callDescriptions = ['Ligação - Conectada', 'Ligação - Encerrada']
      return logs.some((log) => callDescriptions.includes(log.description))
    },
    async verifyChatBehavior(id) {
      try {
        await this.$axios.get(`/chat/weni/conversation/${id}`)
        return true
      } catch (error) {
        return false
      }
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

      return sfInfo?.login ? true : false
    },
    checkPhoneStatus(channel) {
      if (channel === 'call') {
        return this.getPhoneCredentials()
      } else {
        return true
      }
    },
    checkSchedulingTask(scheduledTo) {
      const now = new Date()
      if (this.$moment(`${scheduledTo}Z`).isAfter(now, 'minute')) {
        this.isScheduling = true
        this.formData.reminder_to = 15
      } else {
        this.isScheduling = false
        this.formData.reminder_to = null
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
    onMediaTypeChange() {
      this.taskType = null
      this.resetContactMedia()
    },
    resetData() {
      Object.assign(this.$data, initialState())
    },
    async handleDeleteTask() {
      try {
        await this.removeItem('/cash/task', this.taskId)
        this.handleRefresh()
        this.dialog = false
      } catch (error) {
        return
      }
    },
    isLate(taskDate) {
      const now = new Date()
      if (
        this.$moment(`${taskDate}Z`).isBefore(now, 'minute') &&
        this.createdTask
      ) {
        return 'error'
      }
      return 'primary'
    },
    setTaskTime() {
      const time = this.taskType.time ? this.taskType.time : 1
      this.formData.time = time
      if (!this.taskTimeList.find((time) => time.value == time)) {
        this.taskTimeList.push({ text: `${time} minutos`, value: time })
        this.taskTimeList = this.taskTimeList.sort((a, b) => a.value - b.value)
      }
    },
    getCreateAlertText(mediaType) {
      const typeName = mediaType?.name ? ` "${mediaType?.name}"` : ''
      if (this.taskView === 'register') {
        return `Para prosseguir com o registro ou agendamento da tarefa ${typeName} preencha os campos obrigatórios na área ao lado denominada “Descrição”.  Lembre-se de salvar a edição.`
      } else {
        return `Para prosseguir com o registro ou a execução da tarefa ${typeName} preencha os campos obrigatórios na área ao lado denominada “Descrição”.  Lembre-se de salvar a edição.`
      }
    },
    handleRefresh() {
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
      this.$store.dispatch('Opportunity/refresh', true)
      if (this.chipSelection === 3) {
        this.getTaskHistory(false)
      }
    },
    validateUser(userId) {
      const loggedUserId = this.userInfo.id
      if (userId && userId === loggedUserId) {
        return true
      }
      return false
    },
    findCompany(items, opportunityId) {
      if (opportunityId) {
        const opportunity = items.find((opportunity) => opportunity.id === opportunityId)
        if (opportunity) {
          this.selectedOpportunity = opportunity
        }        
      } else {
        this.selectedOpportunity = null
      }
    },
    async getTaskHistory(fireLoader = true) {
      if (fireLoader) {
        this.loadingHistory = true
        this.taskHistory = []
      }
      const endpoint = '/cash/task'
      const params = new URLSearchParams()
      params.append('includes', 'history.user')
      params.append(
        'load_only',
        'id,history.type,history.created_at,history.user.name'
      )
      params.append('id', this.taskId)
      const task = await this.getItem(endpoint, params)
      if (task?.history) {
        const { history } = task
        const actionType = {
          create: 'Criado por:',
          change: 'Editado por:',
        }
        if (history) {
          const taskHistory = history.map((item) => ({
            ...item,
            type: actionType[item.type],
            created_at: this.$moment(new Date(`${item.created_at}Z`)),
            date: this.$moment(`${item.created_at}Z`).format('DD/MM/YYYY'),
          }))
          this.taskHistory = this.arrayGroupBy(taskHistory, 'date')
        }
      }
      this.loadingHistory = false
    },
  }
}
</script>

<style lang="scss" scoped>
  .fix-padding-bar {
    padding-top: 1rem !important;
  }
  .card-header {
    border-bottom: 1px solid var(--v-shape-base);
  }
  .chip-group .v-slide-group__content {
    justify-content: center !important;
    padding-top: 8px !important;
  }
  .comment-container {
    background: var(--v-shape-lighten2);
    border-radius: 0px 8px 8px 8px;
    line-height: 24px;
  }
  .attach-container {
    background: var(--v-shape-base);
    border-radius: 8px;
  }
  .log-container {
    border: 0.8px solid var(--v-stroke-base);
    border-radius: 12px;
  }
  .task-description {
    overflow-y: auto;
    height: var(--task-description-height);
    @include thin-scrollbar;
  }
  .comment-timeline {
    overflow-y: auto;
    height: var(--comment-timeline-height);
    margin-bottom: 13px;
    @include thin-scrollbar;
  }
  .attach-timeline {
    overflow-y: auto;
    height: var(--attach-timeline-height);
    @include thin-scrollbar;
  }
  .log-timeline {
    overflow-y: auto;
    height: var(--log-timeline-height);
    @include thin-scrollbar;
  }
  .bottom-editor-action-bar {
    border: 1px solid var(--v-stroke-base);
    border-top: none;
    border-radius: 0px 0px 8px 8px !important;
    padding-top: 3px;
  }
</style>
