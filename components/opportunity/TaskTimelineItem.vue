<template>
  <v-card outlined flat :class="delayed ? 'delayed-task' : ''" @click="handleModalOpening">
    <v-card-title class="d-flex justify-space-between">
      <div>
        <template v-if="task.type">
          <span class="mr-2 font-weight-bold">{{task.type.name}}</span>
        </template>
        <v-chip outlined :color="stateColors[task.state]">{{task.state}}</v-chip>
      </div>
      <v-menu
            left
            v-model="menu"
            :offset-x="true"
            :close-on-content-click="false"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                style="margin-left: -15px;"
              >
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
        <v-list>
          <v-list-item>
              <v-list-item-title>
                <v-btn text @click="handleModalOpening"> Abrir </v-btn>
              </v-list-item-title>
            </v-list-item>
            <v-list-item>
              <v-list-item-title>
                <DeleteItem
                  :delete-action="'Task/deleteItem'"
                  :url="'/cash/task'"
                  :item-id="task.id"
                  :refreshAction="refresh"
                />
              </v-list-item-title>
            </v-list-item>
        </v-list>
      </v-menu>
    </v-card-title>
    <v-card-text>
      <div class="d-flex justify-space-between mb-2">
        <div>
          <i small class="material-symbols-rounded v-icon mr-1">assignment_ind</i>
          <span class="mr-1 font-body-medium">Atribuído(a) a</span>
          <span class="mr-1 font-body-medium">{{task.assigned_to ? task.assigned_to.name : 'Não informado'}}</span>
        </div>
        <div class="mr-4">
          <span class="mr-2 font-body-medium">Prioridade</span>
          <v-chip small :color="priorityColors[task.priority]">{{task.priority || 'Não informado'}}</v-chip>
        </div>
      </div>
      <div class="d-flex justify-space-between mb-2">
        <div>
          <v-icon class="material-icons-round mr-1">person_outline</v-icon>
          <span class="mr-1 font-body-medium">A contatar</span>
          <span class="mr-1 font-body-medium primary--text">
            {{task.contact ? task.contact.name : 'Não informado'}}
          </span>
          <span class="mr-1 font-body-medium primary--text">
            {{task.media ? task.media.value : 'Não informado'}}
          </span>
          <v-icon v-if="task.media" small color="primary" class="material-icons-round mr-1" @click.stop="copyToClipboard(task.media.value)">copy</v-icon>
        </div>
        <div class="mr-4">
          <span class="mr-2 font-body-medium">Data</span>
          <v-chip
            small
            outlined
            :color="delayed ? 'error' : 'primary'"
            v-tooltip="delayedTooltip"
          >
            {{$moment(`${task.scheduled_to}Z`).format('DD/MM/YY [às] HH[h]mm')}}
          </v-chip>
        </div>
      </div>
      <div :class="!showDescription ? 'd-flex justify-space-between' : 'd-flex justify-space-between flex-column'">
        <div>
          <i class="material-symbols-rounded v-icon mr-1">receipt_long</i>
          <span class="mr-1 font-body-medium">Instrução</span>
          <span v-if="!showDescription" class="mr-2 font-body-medium">{{task.description || 'Não informado' | truncate(descriptionMaxLength)}}</span>
          <span v-else class="mr-2 font-body-medium">{{task.description || 'Não informado'}}</span>
        </div>
        <div v-if="task.description && task.description.length > descriptionMaxLength" :style="{ 'min-width': 77 + 'px' }">
          <span class="primary--text font-body-medium mr-4" @click.stop="handleDescription">{{showDescription ? 'Ver menos' : 'Ver mais'}}</span>
        </div>
      </div>
    </v-card-text>
    <TaskModal
      :item-id='task.id'
      :open-dialog="taskDialog"
      @closeDialog="() => { taskDialog = false }"
    />
  </v-card>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  props: {
    task: Object,
  },
  data: () => ({
    showDescription: false,
    viewportWidth: document.documentElement.clientWidth,
    stateColors: {
      'Não iniciada': '',
      'Em execução': 'primary',
      'Concluída': 'success',
      'Em espera': 'warning',
    },
    priorityColors: {
      'Alta': 'error',
      'Média': 'warning',
      'Baixa': 'primary',
    },
    dialog: {
      mail: false,
      call: false,
      chat: false,
      default: false
    },
    taskDialog: false,
    menu: false
  }),
  computed: {
    delayed: function() {
      if (this.task.state !== 'Não iniciada') {
        return false
      }
      const scheduledTo = this.$moment(`${this.task.scheduled_to}Z`)
      const isDelayed = !this.$moment(scheduledTo).isAfter(new Date(), 'minute')
      return isDelayed
    },
    delayedTooltip() {
      if (!this.delayed) {
        return false
      } else {
        const scheduledTo = this.$moment(`${this.task.scheduled_to}Z`)
        return {
          content: `
            <div class='ml-2 v-btn-tooltip'>
              Atrasada ${scheduledTo.fromNow()}
            </div>
            `,
          placement: 'bottom-end'
        }
      }
    },
    descriptionMaxLength: function() {
      if (this.viewportWidth > 1366) {
        return 100
      }
      return 40
    },
    opportunityId: function() {
      return Number(this.task.opportunity_id)
    }
  },
  methods: {
    ...mapActions({ refresh: 'Task/refresh' }),
    handleModalOpening() {
      this.taskDialog = true
    },
    async copyToClipboard(value) {
      try {
        await navigator.clipboard.writeText(value)
      } catch (error) {
        console.log(error)
      }
    },
    handleDescription() {
      this.showDescription = !this.showDescription
    },
    handleCloseMenu() {
      if (this.menu) {
        this.menu = false
      }
    },
  }
}
</script>

<style>
  .delayed-task {
    border: 1px solid var(--v-error-tag-base) !important;
  }
</style>