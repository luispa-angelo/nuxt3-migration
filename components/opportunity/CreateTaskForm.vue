<template>
  <v-dialog v-model="dialog" max-width="700">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs" 
        v-on="on" 
        small
        icon
        data-test="btnActivationCreateTask"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
                  Criar Tarefa
            </div>
            `,
          placement: 'bottom-center',
        }"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-card>
      <DialogHeader :title="!noTaskType ? 'Criar Tarefa' : ''" @onCancel="cancel" />
      <v-card-text class="pt-5">
        <v-form v-if="!noTaskType" ref="form" class="mb-2">
          <v-textarea
            v-if="diagnosis"
            outlined
            dense
            data-test="inputDiagnosis"
            placeholder="Insira o diagnóstico aqui..."
            v-model="content"
          ></v-textarea>
          <v-sheet v-else class="v-file-input-bordered pt-4 pb-3 px-3" min-width="465" v-cloak @drop.prevent="addDropFile" @dragover.prevent>
            <v-file-input
              dense
              data-test="inputFileCreateTaskForm"
              ref="fileInput"
              color="primary"
              placeholder="Selecione o arquivo ou arraste aqui"
              prepend-icon="mdi-paperclip"
              v-model="file"
              :rules="rules"
            >
            </v-file-input>
          </v-sheet>
        </v-form>
        <div v-else>
        <p class="subtitle-1 font-weight-bold text-center">Não foi possível concluir a operação</p>
        <span>Não encontramos uma Tarefa correspondente para anexar o termo. Por favor, 
          <a data-test="linkSupportContact" target="blank_" href="https://omie.atlassian.net/servicedesk/customer/portal/6">contate o suporte utilizando este link</a> 
          para prosseguir com a criação da tarefa.
        </span>
        </div>
      </v-card-text>
      <DialogAction
        :cancel-color="noTaskType ? 'primary' : 'secondary'"
        :disable-submit="disable"
        :loading-submit="isLoading"
        :hide-submit="noTaskType"
        :cancel-text="noTaskType ? 'Fechar' : 'Cancelar'"
        @submit="submitForm"
        @cancel="cancel"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    diagnosis: { type: Boolean, default: false },
    opportunity: Object,
  },
  data: () => ({
    dialog: false,
    file: null,
    content: null,
    isLoading: false,
    taskTypeId: null,
    taskTypeOutput: null,
    noTaskType: false,
    rules: [
      value => !value || value.size < 20000000 || 'Tamanho do arquivo deve ser menor que 20 MB!',
    ],
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
    }),
    disable: function() {
      if (!this.taskTypeId) {
        return true
      }
      if (this.diagnosis) {
        if (this.content) {
          return false
        }
        return true
      } else {
        if (this.file) {
          if (!this.validateFile(this.file)) {
            return true
          }
          return false
        }
        return true
      }
    }
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        this.getTaskType()
      }
    }
  },
  mounted() {
    this.getTaskType()
  },
  methods: {
    getData() {

    },
    async submitForm() {
      this.isLoading = true
      if (!this.diagnosis) {
        await this.handleFile()
      } else {
        await this.createTask()
      }
      this.isLoading = false
      this.cancel()
    },
    cancel() {
      this.file = null
      this.content = null
      this.isLoading = false
      this.taskTypeId = null,
      this.taskTypeOutput = null,
      this.noTaskType = false,
      this.dialog = !this.dialog
    },
    validateFile(file) {
      this.$refs['fileInput'].validate(file)
      return this.$refs['fileInput'].valid
    },
    async handleFile() {
      const taskInfo = {
        type_id: this.taskTypeId,
        state: 'done',
        assigned_to_id: this.userInfo.id,
        contact_id: this.opportunity.contact_id,
        opportunity_id: this.opportunity.id,
        team_id: this.opportunity.team_id,
        output: this.taskTypeOutput,
        scheduled_to: this.$moment.utc(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
        time: 0,
      }
      const payload = new FormData()
      payload.append('data', JSON.stringify(taskInfo))
      payload.append('file', this.file)
      try {
        const response = await this.createItem('/cash/task-with-files', payload, { throwError: true })
        this.$emit('onCreatedTask', response.id)
        this.$store.dispatch('Task/refresh', true)
      } catch (error) {
        console.log(error)
      }
    },
    async createTask() {
      const task = {
        type_id: this.taskTypeId,
        state: 'done',
        assigned_to_id: this.userInfo.id,
        contact_id: this.opportunity.contact_id,
        opportunity_id: this.opportunity.id,
        team_id: this.opportunity.team_id,
        content: this.content,
        output: this.taskTypeOutput,
        scheduled_to: this.$moment.utc(new Date()).format('YYYY-MM-DDTHH:mm:ss'),
        time: 0,
      }
      try {
        const response = await this.createItem('/cash/task', task, { throwError: true })
        this.$emit('onCreatedTask', response.id)
        this.$store.dispatch('Task/refresh', true)
      } catch (error) {
        console.log(error)
      }
    },
    async getTaskType() {
      const taskType = await this.getItem('/cash/task-type', `obsolete=false&extra=like(${this.diagnosis ? 'diagnosis' : 'document'})`)
      if (taskType) {
        this.noTaskType = false
        this.taskTypeId = taskType.id
        const outputs = JSON.parse(taskType.outputs)
        const output = outputs.find((output) => (output.value === `${this.diagnosis ? 'Completo' : 'Proposta aceita'}`))
        if (output) {
          this.taskTypeOutput = JSON.stringify(output)
        }
      } else {
        this.noTaskType = true
      }
    },
    addDropFile(event) {
      this.file = event.dataTransfer.files[0]
    }
  }
}
</script>

<style scoped>
  .v-file-input-bordered {
    border: dashed 1px #D2D6DA;
  }
</style>