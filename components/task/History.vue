<template>
  <main>
    
    <v-timeline
      align-top
      dense
      id="timeline-scroll"
      class="timeline-container pb-0"
    >
      <v-timeline-item
        v-for="item, index in history"
        :key="index"
        :color="getIconPhoneColor(item)"
        :icon="item.type === 'upload' ? 'mdi-file-document' : getIconPhone(item)"
        small
        fill-dot
      >
        <v-expansion-panels class="w-75">
          <v-expansion-panel class="rounded" @click="loadOnlineData(item)">
            <v-expansion-panel-header expand-icon="">
              <template v-slot:default>
                <div class="w-100 d-flex justify-space-between align-center">
                  <div class="d-flex align-center">
                    <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                    <p class="mb-0">
                      {{ item.title ? item.title : "Registro de anotação" }}
                    </p>
                  </div>
                  <p class="d-flex align-center mb-0">
                    <span>{{ $moment(item.created_at).format('DD/MM/YYYY HH:mm') }}</span>
                  </p>
                </div>
              </template>
            </v-expansion-panel-header>
            <v-divider></v-divider>
            <v-expansion-panel-content v-if="item.type === 'phoneContent'" class="font-body-medium">
              <p class="mb-0">{{ item.content }}</p>
              <p v-show="item.phone_called" class="font-body-medium mb-0">
                Ligação conectada:
                {{ item.phone_called }}
              </p>
              <section v-if="item.record_url">
                <vuetify-audio :file="item.record_final_url" color="primary" :flat="true" downloadable></vuetify-audio>
              </section>
              <p class="font-body-medium mb-0">Registrada por: {{ item.user_name }}</p>
              <p class="mb-0">Data/Horário: {{ $moment(item.created_at).format('DD/MM/YYYY HH:mm') }}</p>
            </v-expansion-panel-content>
            <v-expansion-panel-content v-else-if="item.type === 'log'" class="font-body-medium">
              <p v-if="item.content" v-html="item.content" class="mb-0"></p>
              <p v-show="item.phone_called" class="font-body-medium mb-0">
                Telefone:
                {{ item.phone_called }}
              </p>
              <section v-if="item.record_url">
                <vuetify-audio :file="item.record_final_url" color="primary" :flat="true" downloadable></vuetify-audio>
              </section>
              <p class="font-body-medium mb-0">Registrada por: {{ item.user_name }}</p>
              <p class="mb-0">Data/Horário: {{ $moment(item.created_at).format('DD/MM/YYYY HH:mm') }}</p>
            </v-expansion-panel-content>
            <v-expansion-panel-content v-else-if="item.type === 'upload'" class="font-body-medium">
              <div class="d-flex flex-row justify-space-between">
                <a class="mb-0 d-flex align-center link-item" target="_blank" href="https://external-link" @click="handleRedirectFile($event, item.content)">
                  <p class="mb-0 mr-1">Abrir Anexo</p>
                  <v-icon color="primary">mdi-open-in-new</v-icon>
                </a>
                <v-btn fab icon color="primary" class="mb-0" @click="copyToClipboard(item.content)">
                  <v-icon color="primary">mdi-content-copy</v-icon>
                </v-btn>
              </div>
              <div class="d-flex flex-row">
                <p class="mb-0">Data/Horário: {{ $moment(item.created_at).format('DD/MM/YYYY HH:mm') }}</p>
              </div>
            </v-expansion-panel-content>

          </v-expansion-panel>
        </v-expansion-panels>
      </v-timeline-item>
    </v-timeline>
    <section class="w-100">
      <v-textarea
        label="Registrar anotação no histórico"
        placeholder="Digite aqui..."
        outlined
        dense
        class="mt-3"
        v-model="content"
        @keydown.enter.prevent="includeContent()"
        :disabled="!itemId"
      ></v-textarea>
    </section>
    <v-sheet class="d-flex justify-space-between align-center w-100 adjust-action-buttons">
      <div class="d-flex">
        <v-file-input
          ref="fileInput"
          class="w-50 py-0 my-0 mx-2"
          v-model="file"
          :dense="invalidFile"
          :small-chips="invalidFile"
          :show-size="invalidFile"
          :hide-input="!invalidFile"
          :rules="rules"
        ></v-file-input>
      </div>
    </v-sheet>
  </main>
</template>

<script>
import { mapGetters } from 'vuex'

const initialState = () => {
  return {
    endpointTaskLog: '/cash/task-log',
    content: null,
    file: null,
    rules: [
      value => !value || value.size < 20000000 || 'Tamanho do arquivo deve ser menor que 20 MB!',
    ],
    invalidFile: false
  }
}
export default {
  props: {
    task: {
      type: Object
    }
  },
  components: {
    VuetifyAudio: () => import('vuetify-audio'),
  },
  data () {
    return initialState()
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo'
    }),
    itemId() {
      if(this.task) {
        return this.task.id
      }
      return false
    },
    mediaType() {
      if(this.task) {
        const media = this.task.type?.media_type.base
        return media
      }
      return false
    },
    phoneContent() {
      if(this.task.content && /^\s*(\{|\[)/.test(this.task.content)) {
        if(this.task.content.isLog) {
          if(this.mediaType == 'landline' || this.mediaType == 'mobile') {
            const content = JSON.parse(this.task.content)
            const logs = content.map((log) => {
              return {
                is_log: log.isLog,
                status: log.statusLog,
                title: log.title,
                content: log?.content,
                phone_called: log?.phoneCalled?.value,
                record_url: log?.recordUrl,
                user_id: log.assigned_to_id,
                user_name: log.assigned_to_name,
                created_at: log.createdOn
              }
            })
            return logs
          }
        }
      }
      return []
    },
    logs() {
      if(this.task.logs) {
        const logs = this.task.logs.map((log) => {
          const content = JSON.parse(log.content)
          if(this.mediaType == 'landline' || this.mediaType == 'mobile') {
            const history = content?.history
            return {
              phone_called: history.phone_called && history.phone_called.value,
              is_log: history.log,
              status: history.status,
              title: log.description,
              content: history.content,
              record_url: history.record_url,
              record_key: history.record_key,
              record_from_S3: history.record_from_S3,
              media: history.media,
              user_id: history.user_id,
              user_name: history.user_name,
              created_at: this.$moment(new Date(`${log.created_at}Z`)),
            }
          }else {
            if(log.description == 'Registro do usuário') {
              return {
                title: log.description,
                content: content.content,
                user_name: content.user_name,
                created_at: this.$moment(new Date(`${log.created_at}Z`)),
              }
            }else {
              return {
                title: log.description,
                content: content.body,
                user_name: content.contact,
                created_at: this.$moment(new Date(`${log.created_at}Z`)),
              }
            }
          }
        })
        return logs
      }
      return []
    },
    uploads() {
      const { uploads } = this.task || {}
      if (uploads?.length > 0) {
        const history = uploads.map((upload) => {
          return {
            title: upload.name,
            created_at: this.$moment(new Date(`${upload.created_at}Z`)),
            content: upload.file_id,
            user: null,
            type: 'upload'
          }
        })
        return history
      }
      return []
    },
    history() {
      const phoneContentHistory =  this.phoneContent.map((item) => ({...item, type: 'phoneContent'}))
      const logsHistory =  this.logs.map((item) => ({...item, type: 'log'}))
      const uploadsHistory =  this.uploads.map((item) => ({...item, type: 'upload'}))
      const history = [...phoneContentHistory, ...logsHistory, ...uploadsHistory]
      return history.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
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
  methods: {
    async includeContent() {
      if (this.content != null) {
        if (!this.itemId) {
          return
        }
        var formData = {}
        if(this.mediaType == 'mail') {
          formData = {
            task_id: this.itemId,
            description: 'Registro do usuário',
            content: JSON.stringify({ content: this.content, user_id: this.userInfo.id, user_name: this.userInfo.name })
          }
        }else {
          const history = JSON.stringify({
            history: {
              content: this.content,
              user_id: this.userInfo.id,
              user_name: this.userInfo.name        
            }
          })
          formData = {
            task_id: this.itemId,
            description: 'Registro do usuário',
            content: history
          }
        }
        await this.createItem(this.endpointTaskLog, formData)
        
        this.$emit('reloadForm', this.itemId)
        this.content = null
      }
    },
    async loadOnlineData(item) {
      if (item.phone_called) {
        if (item?.record_key && !item.record_final_url) {
          let ret = null
          let response = await this.$axios.get('/call/call-recording/get-link', { params: { call_id: item.record_key } })
          if (response.status === 200) {
            ret = response.data.data.public_link
          } 

          item.record_final_url = ret
          this.$forceUpdate()
        }
        else {
          item.record_final_url = item.record_url
        }
      }
    },
    getIconPhone(item) {
      if(item.is_log == true) {
        return 'mdi-phone'
      }else {
        return 'mdi-pencil'
      }
    },
    getIconPhoneColor(item) {
      if(item.status == 'success') {
        return 'success'
      }else if (item.status == 'error') {
        return 'error'
      }else {
        return 'primary'
      }
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
      if (!this.itemId){
        const taskData = await this.$emit('newHistory')
        if (!taskData || !this.itemId) {
          this.$swal({
            icon: 'error',
            title: 'Não foi possível criar a tarefa.',
            footer: `Verifique os campos obrigatórios.`
          })
          return
        }
      }
      this.$refs['fileInput'].validate(file)
      const isValid = this.$refs['fileInput'].valid
      if (isValid) {
        this.invalidFile = false
        const taskInfo = { id: this.itemId }
        const payload = new FormData()
        payload.append('data', JSON.stringify(taskInfo))
        payload.append('file', file)
        try {
          await this.updateData('/cash/task-with-files', payload, { throwError: true })
          this.$emit('reloadForm', this.itemId)
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
.timeline-container {
  height: 410px;
  overflow-y: scroll;
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
.adjust-action-buttons {
    margin-top: -60px;
  }
</style>