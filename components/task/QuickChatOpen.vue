<template>
  <v-dialog v-model="dialog" inset max-width="336px" scrollable persistent tabindex="1">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        fab
        icon
        class="mx-1"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
                ${title}
            </div>
            `,
          placement: 'top-center'
        }"
      >
        <v-icon>mdi-chat</v-icon>
      </v-btn>
    </template>

    <v-card>
      <v-app-bar color="shape lighten-1" absolute>
          <v-row>
            <v-col class="d-flex align-center">
              <h1 class="bordered-title pl-4">
                {{ title }}
              </h1>
            </v-col>
            <v-col class="d-flex justify-end align-center">
              <v-btn
                fab
                small
                color="secondary"
                class="mx-2"
                @click="submitForm"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn fab small text class="mx-2" @click="handleCancel">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-app-bar>

      <v-form ref="form">
        <v-toolbar color="secondary" class="d-flex flex-column mb-3" flat>
          <v-toolbar-title>{{ title }}</v-toolbar-title>
        </v-toolbar>

        <v-card-text >
          <div  class="d-flex flex-row justify-space-around align-center w-100 mb-3">
            <p class="mb-0 subtitle-1">Contato:</p>

            <v-list v-for="contact in userContacts" :key="contact.id" class="d-flex flex-row justify-center align-center subtitle-1" style="padding: 0;">
              <p class="mb-0" style="color: #3274F4;">{{ contact.name }}</p>
              <v-chip v-if="contact.position" x-small class="mx-2" color="#D8ECF8" style="color: #3274F4;">{{ contact.position }}</v-chip>
            </v-list>

            <v-list v-for="contact in enhancementContacts" :key="contact.id" class="d-flex flex-row justify-center align-center subtitle-1" style="padding: 0;">
              <p class="mb-0" style="color: #3274F4;">{{ contact.name }}</p>
              <v-chip x-small class="mx-2" color="#D8ECF8" style="color: #3274F4;">{{ contact.position }}</v-chip>
            </v-list>
          </div>

          <Autocomplete
            class="mb-2"
            return-object
            label="Tipo de tarefa"
            endpoint="/cash/task-type"
            query="includes=media_type"
            :filter="chatTasks"
            :load="dialog"
            @valueSelected="(value) => {taskType = value}"
            hideDetails
            required
          ></Autocomplete>

          <v-select
            attach
            label="WhatsApp"
            v-model="payloadChat.contact_media_id"
            :items="medias"
            item-value="id"
            item-text="value"
            required
            dense
            outlined
            hide-details
            class="w-100 mb-2"
            prepend-inner-icon="mdi-phone"
          ></v-select>
          
          <v-select
            attach
            label="Template"
            :items="payloadChat.template"
            required
            outlined
            dense
          ></v-select>
        </v-card-text>
      </v-form>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    title: String,
  },
  computed: {
    ...mapGetters(['opportunity', 'tasks', 'task-type', 'userInfo']),
  },
  data: () => ({
    dialog: false,
    task: {},
    userContacts: [],
    enhancementContacts: [],
    outputs: [],
    medias: [],
    taskType: null,
    selected: '',
    mediaType: null,
    mediaTypes: [],
    formData: {
      content: '',
      contact_id: null,
      template_id: null,
      assigned_to_id: null,
      team_id: null,
      opportunity_id: null,
      type_id: null,
      time: null,
      state: 'created'
    },
    payloadChat: {
      task_id: 78,
      opportunity_id: null,
      contact_media_id: null,
      email: null,
      message: null,
      user_id: null,
      template: ['Inicial', 'Continuidade']
    },
  }),
  watch: {
    template(newValue) {
      if (newValue) {
        this.formData.template_id = newValue.id
      }
    },
    taskType(newValue) {
      if (newValue) {
        this.formData.type_id = newValue.id
        this.formData.time = newValue.time
      }
    },
    dialog(newValue) {
      if (newValue) {
        this.setInitialData()
      } 
    }
  },

  async mounted() {
    
  },

  methods: {
    submitForm() {

    },
    async setInitialData() {
      const contacts = []
      const { contact } = this.opportunity
      contacts.push(contact)
      this.getContacts([contact])
      this.getContactMedias(contact)
      this.getUserData()

      this.formData.assigned_to_id = this.opportunity.assigned_to_id
      this.formData.contact_id = this.opportunity.contact.id
      this.formData.opportunity_id = this.opportunity.id
      this.formData.team_id = this.opportunity.team.id
      this.formData.state = 'active'

      this.payloadChat.opportunity_id = this.opportunity.id

      const {
        data: { data }
      } = await this.$axios.get('/ecosystem/media-type')
      this.mediaTypes = data
    
      const taskTypesResponse = await this.$axios.get('cash/task-type?media_type_id=4')
      const taskTypeChat = taskTypesResponse.data.data[0]
      this.outputs = JSON.parse(taskTypeChat.outputs)
    },

    async sendChatMessage() {
      try {
        if (this.payloadChat.message !== null && this.payloadChat.message !== '') {
          const response = await this.$axios.post('/migrater/weni', this.payloadChat)
          this.payloadChat.message = ''
          console.log('response post chat', response)
          this.getHistory()
        } else {
          return
        }
      } catch (error) {
        this.payloadChat.message = ''
        this.getHistory()

        this.$swal({
          icon: 'warning',
          title:
            'Alerta: Confira Tipo de tarefa e WhatsApp'
        })
        console.log('error ->', error)
        return
      }
    },
    getContacts(contacts){
      this.userContacts = contacts.filter((contact) => contact.origin != 'enhancement')
      this.enhancementContacts = contacts.filter((contact) => contact.origin == 'enhancement')
    },
    getContactMedias(contact) {
      if (contact.medias.length > 0) {
        this.medias = contact.medias.filter((media) => media.type_id == 4)
      }
    },
    chatTasks(element) {
      if (!element.media_type) {
        return false
      }
      return element.media_type.id == 4
    },
    async getUserData() {
      const response  = await this.getItem('/ecosystem/user', `id=${this.userInfo.id}`)
      this.payloadChat.email = response.email
      this.payloadChat.user_id = response.id      
    },
    handleCancel() {
      this.dialog = false
      this.$refs.form.reset()
    },
  }
}
</script>