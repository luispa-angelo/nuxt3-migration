<template>
  <div>
    <v-timeline dense style="height: 50vh">
      <v-timeline-item
        v-for="(item, index) in history"
        :key="index"
        color="primary"
        icon="mdi-file-document"
        small
        fill-dot
      >
        <v-expansion-panels accordion style="width: 60%">
          <v-expansion-panel class="mb-5" style="border-radius: 10px">
            <v-expansion-panel-header disable-icon-rotate>
              <div class="px-3 d-flex justify-space-between align-center">
                <b class="mb-0 stroke--text text--darken-2">{{
                  item.title
                }}</b>
                <p class="mb-0 caption stroke--text text--darken-2">
                  {{ $moment(`${item.created_at}Z`).format('DD/MM/YYYY HH:mm:ss') }}
                </p>
              </div>
            </v-expansion-panel-header>
            <v-divider></v-divider>
            <v-expansion-panel-content>
              <!-- <div
                class="d-flex flex-row ml-2 caption"
                v-if="item.description == 'Envio de e-mail'"
              >
                <p class="mb-0">Destinatários:&nbsp;</p>
                <p class="mb-0 caption">{{ `${item.to}` }}</p>
              </div> -->
              <div class="d-flex flex-row justify-space-between ml-2 caption">
                <a class="mb-0 d-flex align-center link-item" target="_blank" href="https://external-link" @click="handleRedirectFile($event, item.content)">
                  <p class="mb-0">Abrir Anexo</p>
                  <v-icon color="primary">mdi-open-in-new</v-icon>
                </a>
                <v-btn fab icon color="primary" class="mb-0" @click="copyToClipboard(item.content)">
                  <v-icon color="primary">mdi-content-copy</v-icon>
                </v-btn>
              </div>
              <div class="d-flex flex-row ml-2">
                <p class="caption">Data/Horário:&nbsp;</p>
                <p class="mb-0 caption">{{ $moment(`${item.created_at}Z`).format('DD/MM/YYYY HH:mm:ss') }}</p>
              </div>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-timeline-item>
    </v-timeline>
    <v-file-input
      ref="fileInput"
      class="w-50"
      v-model="file"
      :dense="invalidFile"
      :chips="invalidFile"
      :show-size="invalidFile"
      :hide-input="!invalidFile"
      :rules="rules"
    ></v-file-input>
  </div>
</template>

<script>
export default {
  props: {
    taskId: Number,
    emailHistory: Array,
  },
  data: () => ({
    task: {},
    file: null,
    rules: [
      value => !value || value.size < 20000000 || 'Tamanho do arquivo deve ser menor que 20 MB!',
    ],
    invalidFile: false
  }),
  computed: {
    uploads: function() {
      if (this.task) {
        return this.task.uploads
      }
      return []
    },
    history: function() {
      if (this.uploads) {
        return this.historyByUploads(this.uploads)
      }
      return []
    }
  },
  watch: {
    file(newValue) {
      if (newValue) {
        this.uploadFile(newValue)
      } else {
        this.invalidFile = false
      }
    }
  },
  async mounted() {
    await this.getTaskData()
  },
  methods: {
    async getTaskData() {
      this.task = await this.getItem('cash/task',`also=uploads&id=${this.taskId}`)
    },
    historyByUploads(uploads) {
      const history = uploads.map((upload) => {
        return {
          title: upload.name,
          created_at: upload.created_at,
          content: upload.file_id,
          user: null,
          type: 'upload'
        }
      })
      return history
    },
    async handleRedirectFile(event, fileId) {
      event.preventDefault()
      try {
        const { data: { url } } = await this.$axios.get(`/cash/task-upload-by-uid?task_id=${this.task.id}&uid=${fileId}`)
        window.open(url, '_blank').focus()
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Não foi possível gerar o link',
          footer: `details: ${error.data?.detail}`
        })
      }
    },
    async copyToClipboard(fileId) {
      try {
        const { data: { url } } = await this.$axios.get(`/cash/task-upload-by-uid?task_id=${this.task.id}&uid=${fileId}`)
        await navigator.clipboard.writeText(url)
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Não foi possível copiar o link',
          footer: `details: ${error.data?.detail}`
        })
      }
    },
    async uploadFile(file) {
      this.$refs['fileInput'].validate(file)
      const isValid = this.$refs['fileInput'].valid
      if (isValid) {
        this.invalidFile = false
        const taskInfo = { id: this.taskId }
        const payload = new FormData()
        payload.append('data', JSON.stringify(taskInfo))
        payload.append('file', file)
        try {
          await this.updateData('/cash/task-with-files', payload, { throwError: true })
          await this.getTaskData()
        } catch (error) {
          console.log(error)
        }
        this.file = null
      } else {
        this.invalidFile = true
      }
    }
  }
}
</script>

