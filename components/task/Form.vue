<template>
  <div>
    <v-btn v-if="listButton" @click="dialog = !dialog" text> Editar </v-btn>
    <v-btn
      v-else
      fab
      color="primary"
      class="mx-2"
      :disabled="isDisabled"
      @click="dialog = !dialog"
    >
      <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" max-width="806">
      <v-card elevation="0">
        <DialogHeader
          :title="isEditing ? title : 'Criar Tarefa'"
          @onCancel="handleCancel()"
          class="mb-5"
        />
        <v-form ref="form" class="mx-16">
          <v-card-text>
            <v-row>
              <v-col cols="4">
                <v-select
                  attach
                  label="Tipo de tarefa"
                  :items="mediaTypes"
                  :disabled="taskId && formData.state != 'created' || this.isEditing"
                  item-text="name"
                  v-model="mediaType"
                  return-object
                  outlined
                  dense
                >
                </v-select>
              </v-col>
              <v-col>
                <v-combobox
                  label="Motivo"
                  v-model="taskType"
                  :items="taskTypeList"
                  :disabled="taskId && formData.state != 'created' || this.isEditing"
                  item-text="name"
                  item-value="id"
                  outlined
                  dense
                  :error="$v.formData.type_id.$error"
                  :error-messages="
                    $v.formData.type_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-combobox>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Duração da tarefa (min)"
                  placeholder="Digite aqui..."
                  type="number"
                  v-model="formData.time"
                  :disabled="disableTask"
                  class="reduce-height"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  label="Data de vencimento"
                  type="date"
                  v-model="date"
                  :disabled="disableTask"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-text-field
                  label="Horário"
                  type="time"
                  v-model="hours"
                  :disabled="disableTask"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="4">
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
                  :disabled="snoozeDisabled"
                  v-model="reminder"
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="8">
                <v-radio-group
                  label="Prioridade"
                  v-model="formData.priority"
                  :disabled="disableTask"
                  class="mt-n5"
                  row
                  :error="$v.formData.priority.$error"
                  :error-messages="
                    $v.formData.priority.$error ? 'Esse campo é obrigatório' : ''
                  "
                >
                  <v-radio label="Alta" value="high"></v-radio>
                  <v-radio label="Média" value="medium"></v-radio>
                  <v-radio label="Baixa" value="low"></v-radio>
                </v-radio-group>
              </v-col>
            </v-row>
            <v-row>
              <v-col xl="4" lg="4">
                <Autocomplete
                  v-show="!(opportunityId && hideAssign)"
                  label="Time"
                  :disabled="disableTask"
                  :initial-value="formData.team_id"
                  endpoint="/ecosystem/any-team"
                  query="order=level,id&strict=true"
                  :item-text="(item) => item && item.name? item.name : ''"
                  :postProcess="traverseFilter"
                  item-value="id"
                  outlined
                  dense
                  @valueSelected="
                    (value) => {
                      teamSelected = value;
                    }
                  "
                  :error="$v.formData.team_id.$error"
                  :error-messages="
                    $v.formData.team_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></Autocomplete>
              </v-col>
              <v-col xl="4" lg="4">
                <Autocomplete
                  v-if="(currentTask.state == 'created' || !opportunityId) && !hideAssign"
									search-key="customer.name"
                  label="Oportunidade"
                  endpoint="/cash/opportunity"
                  :query="`includes=customer,contact,team&team_id=${teamSelected}`"
                  :initial-value="formData.opportunity_id"
                  :item-text="(item) => getOpportunityLabel(item)"
                  item-value="id"
                  :reload-trigger="teamSelected"
                  outlined
                  dense
                  :disabled="disableTask"
                  @valueSelected="
                    (value) => {
                      opportunitySelected = value;
                      formData.opportunity_id = value
                    }
                  "
                  :error="$v.formData.opportunity_id.$error"
                  :error-messages="
                    $v.formData.opportunity_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></Autocomplete>
                <v-text-field
                  v-else
                  v-model="formData.opportunity_id"
                  label="Oportunidade"
                  outlined
                  dense
                  disabled
                ></v-text-field>
              </v-col>
              <v-col xl="4" lg="4">
                <Autocomplete
                  v-show="!hideAssign"
                  label="Atribuído"
                  :disabled="disableTask"
                  :initial-value="formData.assigned_to_id"
                  endpoint="/ecosystem/capability"
                  :query="`includes=user,team&team_id=${teamSelected}`"
                  :item-text="(item) => getAssignedLabel(item)"
                  item-value="user_id"
                  :reload-trigger="teamSelected"
                  outlined
                  dense
                  @valueSelected="
                    (value) => {
                      userSelected = value;
                    }
                  "
                  :error="$v.formData.assigned_to_id.$error"
                  :error-messages="
                    $v.formData.assigned_to_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></Autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="4">
                <v-text-field
                  label="Contato"
                  v-model="contact_name"
                  :value="formData.contact_id"
                  required
                  class="reduce-height"
                  outlined
                  dense
                  disabled
                  :error="$v.formData.contact_id.$error"
                  :error-messages="
                    $v.formData.contact_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-text-field>
              </v-col>
              <v-col cols="4">
                <v-select
                  attach
                  label="Canal de contato"
                  :items="contactMedias"
                  v-model="formData.media_id"
                  :disabled="disableTask"
                  item-text="value"
                  item-value="id"
                  outlined
                  dense
                  clearable
                  :error="$v.formData.media_id.$error"
                  :error-messages="
                    $v.formData.media_id.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-select>
              </v-col>
            </v-row>
            <v-row>
              <v-col col="12">
                <v-textarea
                  label="Descrição/Observação"
                  placeholder="Digite aqui..."
                  v-model="formData.description"
                  outlined
                  background-color="background1"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="d-flex justify-space-between">
            <v-col>
              <v-btn @click="handleCancel()" color="secondary">Cancelar</v-btn>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn
                v-if="!isEditing"
                color="primary"
                :disabled="hasWhatsappConversation"
                @click="submitForm()"
              >
                Criar
              </v-btn>
              <v-btn
                v-if="taskId"
                color="primary"
                :disabled="hasWhatsappConversation"
                @click="submitForm()"
              >
                Editar
              </v-btn>
            </v-col>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Autocomplete from '../general/Autocomplete.vue'
export default {
  props: {
    taskId: { type: [Number, String], default: null },
    opportunityId: { type: [Number, String], default: null },
    isEditing: Boolean,
    byDetails: Boolean,
    sheet: Boolean,
    opportunitiesList: Array,
    listButton: Boolean,
    isDisabled: Boolean,
  },
  data: () => ({
    dialog: false,
    id: null,
    scheduled: false,
    hasTemplate: false,
    customers: [],
    customerSelected: null,
    opportunitysList: [],
    displayCard: false,
    renderHistory: false,
    showField: false,
    date: null,
    hours: null,
    datetime: null,
    reminder: null,
    taskType: null,
    hasOutput: null,
    templateContent: null,
    formData: {
      assigned_to_id: null,
      team_id: null,
      opportunity_id: null,
      contact_id: null,
      type_id: null,
      time: '0',
      description: '',
      priority: null,
      state: null,
      reminder_to: null,
      media_id: null,
    },
    selectedTask: {},
    contact_name: null,
    timesSnooze: [
      { text: '10 minutos antes', value: 10 },
      { text: '15 minutos antes', value: 15 },
      { text: '20 minutos antes', value: 20 },
      { text: '30 minutos antes', value: 30 },
    ],
    snoozeDisabled: true,
    title: null,
    mediaTypes: [],
    mediaType: null,
    taskTypeList: [],
    availableMedias: [],
    generalMedias: [],
    contactMedias: [],
    hasWhatsappConversation: false,
    teamSelected: null,
    userSelected: null,
    queryOpportunity: null,
    queryTeam: null,
    queryUser: null,
    opportunitySelected: null,
    currentTask: {},
    hideAssign: false
  }),
  validations: {
    formData: {
      assigned_to_id: { required },
      team_id: { required },
      opportunity_id: { required },
      contact_id: { required },
      media_id: {
        requireMedia: function(param) {
          return (param && param.toString().length > 0) || !['mail', 'landline', 'mobile'].includes(this.taskType?.media_type?.base)
        }
      },
      type_id: { required },
      priority: { required },
    },
    date: { required },
    hours: { required },
  },
  computed: {
    ...mapGetters({
      opportunitys: 'Opportunity/opportunitys',
      opportunity: 'Opportunity/opportunity',
      teams: 'teams',
      userInfo: 'userInfo',
      userTeams: 'userTeams',
      templates: 'templates',
      companies: 'Company/companies',
    }),
    schedule: function () {
      // if (!this.date && !this.hours) {
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
    disableTask() {
      if (this.hasOutput || (this.taskId && this.formData.state != 'created')) {
        return true
      } else {
        return false
      }
    },
  },
  watch: {
    async mediaType(newValue, oldValue) {
      if (newValue) {
        const tasksWithMediaType = await this.getList(
          '/cash/task-type',
          `obsolete=false&includes=media_type&media_type.id=${newValue.id}`
        )
        this.taskTypeList = tasksWithMediaType.data
        if (oldValue) {
          this.taskType = null
        }
        if (newValue.base == 'forward') {
          this.hideAssign = true
        }
        else {
          this.hideAssign = false
        }
      }
    },
    async dialog(newValue) {
      if (newValue) {
        this.snoozeDisabled = true

        await this.getTaskTypes()
        const mediaQuery = this.availableMedias.join()
        const mediaTypes = await this.getList(
          '/ecosystem/media-type',
          `id=in(${mediaQuery})`
        )
        this.mediaTypes = mediaTypes.data
        this.loadForm()
        if (this.taskId) {
          const { output } = await this.getItem('cash/task', `id=${this.taskId}`)
          if (output) this.hasOutput = true
        }
        if (!this.isEditing) {
          const now = new Date()
          this.date = this.$moment(now).format('YYYY-MM-DD')
          this.hours = this.$moment(now).format('HH:mm')
          // this.date = this.processDateToLocale(new Date())
          // this.hours = new Date().toLocaleTimeString('pt-BR', {
          //   hour: '2-digit',
          //   minute: '2-digit',
          // })
        }
      }
    },
    'formData.opportunity_id': async function (newValue) {
      if (newValue) {
        if (this.opportunityId) {
          this.formData.contact_id = this.opportunity.contact_id
          console.log('this.formData.opportunity_id from watch', this.formData.opportunity_id)
        }
        // TODO: mover para a chamada do loadForm
        const { id, contact, customer, team_id, assigned_to_id } = await this.getItem(
          '/cash/opportunity',
          `includes=customer,contact.medias.media_type&id=${newValue}`
        )

        this.formData.opportunity_id = id
        if (team_id) {
          this.formData.team_id = team_id
        }

        if (assigned_to_id && !this.formData.assigned_to_id) {
          this.formData.assigned_to_id= assigned_to_id
        }

        if (!contact) {
          this.$swal({
            icon: 'warning',
            title: 'Sem contato associado',
            text: `Para criar uma tarefa, cadastre um contato para a empresa ${customer?.name} e associe-o à oportunidade ${id}.`,
          })
          this.dialog = false
          this.handleCancel()
          return
        }
        this.formData.contact_id = contact.id
      }
    },
    async taskType(newValue) {
      if (newValue) {
        const { id,time } = newValue
        this.formData.type_id = id
        if (!this.isEditing) {
          time && (this.formData.time = time)
        }
        // TODO: UNIFICAR
        if (this.mediaType.base == 'other') {

          this.contactMedias = this.generalMedias.filter(function(media) {
            let show = false
            if (media?.value && media.value.length && media?.media_type?.extra) {
              show = JSON.parse(media?.media_type?.extra).displayContact
            }
            return show
          })
        } else {
          this.contactMedias = this.generalMedias.filter(
            (media) => media.media_type.base == newValue.media_type.base
          )
        }
      }
    },
    opportunitys(newValue) {
      this.customers = newValue.map((opp) => opp.customer)
    },
    customerSelected(newValue) {
      if (!this.opportunitiesList) {
        this.opportunitysList = this.opportunitys.filter(
          (opp) => opp.customer_id == newValue
        )
      }
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
    'formData.contact_id': async function (newValue) {
      if (newValue) {
        const contact = await this.getItem(
          '/customer/contact',
          `includes=medias.media_type&id=${newValue}`
        )
        this.generalMedias = contact.medias
        this.contact_name = contact?.name
        if (this.taskType) {
          this.contactMedias = this.generalMedias.filter(
            (media) => media.media_type.base == this.taskType.media_type.base
          )
          if (this.mediaType.base == 'other') {
            this.contactMedias = this.generalMedias.filter(function(media) {
              let show = false
              if (media?.value && media.value.length && media?.media_type?.extra) {
                show = JSON.parse(media?.media_type?.extra).displayContact
              }
              return show
            })
          } else {
            this.contactMedias = this.generalMedias.filter(
              (media) => media.media_type.base == this.taskType.media_type.base
            )
          }
        }
      }
    },
    teamSelected (newValue) {
      if (newValue) {
        this.formData.team_id = newValue
      }
    },
    userSelected(newValue) {
      if (newValue) {
        this.formData.assigned_to_id = newValue
      }
    },
  },
  methods: {
    traverse(children, full, prefix='') {
      for (let el of children) {
        el.name = prefix + el.name
        full.push(el)
        this.traverse(el.children, full, el.name + ' - ')
      }
    },
    traverseFilter(items) {
      let hierarchy = {}

      let heads = []
      for (let el of items) {
        if (!(el.id in hierarchy)) {
          hierarchy[el.id] = el
          el['children'] = []
        }
        if (el.parent_id in hierarchy) {
          hierarchy[el.parent_id].children.push(el)
        }
        else {
          heads.push(el)
        }
      }

      items = []
      this.traverse(heads, items)

      return items
    },
    getOpportunityLabel(item) {
      let companyName
      item.customer?.name !== null && item.customer?.name !== undefined ? companyName = item.customer?.name : companyName = 'Nome da empresa não informado'
      return `${item.id} - ${companyName}`
    },
    getAssignedLabel(item) {
      const userName = item.user?.name
      return `${userName}`
    },
    getParentName(team) {
      const teamName = team.name
      if (team.parent) {
        var channelName = team.parent.name
      }
      if (team.parent?.parent) {
        var funcionalName = team.parent.parent.name
      }
      return `${funcionalName ? `${funcionalName} - ` : ''} ${
        channelName ? `${channelName}` : ''
      } ${teamName ? ` - ${teamName}` : ''}`
    },
    async checkMediaStatus() {
      this.hasWhatsappConversation = false
      const response = await this.$axios.get(
        `/chat/weni/check-wpp-contact/${this.formData.media_id}/${this.taskId}`
      )
      console.log('response.data', response.data)
      if (response.data.in_attendance == true && this.taskType.name == 'Whatsapp') {
        this.hasWhatsappConversation = true
        if (response.data.data) {
          if (response.data.data.time == 'Usuário CRM') {
            const opportunityIdFromOpenConversation = response.data.data.opportunity_id
            const taskIdFromOpenConversation = response.data.data.task_id
            this.$swal({
              icon: 'warning',
              title: `Número com conversa em andamento, oportunidade: ${opportunityIdFromOpenConversation} - Tarefa ${taskIdFromOpenConversation}`,
              showConfirmButton: false,
              showCloseButton: true,
            })
            this.formData.media_id = null
          }
          if (response.data.data.time !== 'Usuário CRM') {
            const teamFromOpenConversation = response.data.data.time
            this.$swal({
              icon: 'warning',
              title: `Número em atendimento com o time: ${teamFromOpenConversation}`,
              showConfirmButton: false,
              showCloseButton: true,
            })
            this.formData.media_id = null
          }
        }
      }
    },
    processDateToLocale(date) {
      let str = null
      if (date) {
        str = new Date(date).toLocaleDateString('pt-BR').split('/')
        str = `${str[2]}-${str[1]}-${str[0]}` 
      }
      return str
    },
    async getData() {
      if (this.isEditing) {
        this.currentTask = await this.getItem(
          'cash/task',
          `includes=team,assigned_to,opportunity.contact,contact.medias.media_type,opportunity.customer,type.media_type,logs&id=${this.taskId}`
        )
        const {
          scheduled_to,
          priority,
          team,
          assigned_to_id,
          contact_id,
          type,
          opportunity,
          description,
          state,
          media_id,
          reminder_to,
          time,
        } = this.currentTask
        console.log('currentTask.opportunity', this.currentTask.opportunity)
        this.mediaType = type.media_type
        this.taskType = type
        this.formData.priority = priority
        this.formData.assigned_to_id = assigned_to_id
        this.formData.team_id = team.id
        this.formData.contact_id = contact_id
        this.formData.state = state
        this.formData.time = time
        this.date = this.$moment(`${scheduled_to}Z`).format('YYYY-MM-DD')
        this.hours = this.$moment(`${scheduled_to}Z`).format('HH:mm')
        // this.date = this.processDateToLocale(`${scheduled_to}Z`)
        // this.hours = new Date(`${scheduled_to}Z`).toLocaleTimeString('pt-BR', {
        //   hour: '2-digit',
        //   minute: '2-digit',
        // })
        this.customerSelected = opportunity.customer_id
        this.formData.opportunity_id = opportunity.id
        console.log('this.formData.opportunity_id from getData', this.formData.opportunity_id)
        this.contact_name = opportunity.contact?.name
        this.formData.description = description
        this.formData.media_id = media_id
        this.title =
          this.formData.state == 'done' || this.hasOutput
            ? `Tarefa #${this.currentTask.id} concluída`
            : `Editar Tarefa #${this.currentTask.id}`
        var reminder = this.$moment(new Date(reminder_to))
        var schedule = this.$moment(new Date(scheduled_to))
        var duration = this.$moment.duration(schedule.diff(reminder)).asMinutes()
        this.reminder = this.timesSnooze.find((snooze) => snooze.value == duration)
      }
      await this.$store.dispatch('fetchTasks')
      !this.opportunitiesList &&
        (await this.$store.dispatch(
          'Opportunity/fetchOpportunitys',
          'includes=customer,product'
        ))
    },
    collect() {
      var taskData = {}
      var taskForm = new FormData(this.$refs['task-form'])
      taskForm.forEach((value, key) => (taskData[key] = value))
      return taskData
    },
    async loadForm() {
      this.scheduled = false
      this.displayCard = false
      this.opportunitiesList && (this.opportunitysList = this.opportunitiesList)

      if (this.userInfo?.capabilities.length) {
        this.formData.team_id = this.userInfo.capabilities[0].team_id
      }

      this.formData.assigned_to_id = this.userInfo.id
      this.showField = this.showCustomerField()
      await this.getData()
      this.formData.priority = 'low'
      this.formData.opportunity_id = this.opportunityId

      this.hasTemplate = false
    },
    async submitForm() {
      let formData = this.collect()
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (formData) {
        let data = {
          content: JSON.stringify(formData),
        }
        data['opportunity_id'] = this.formData.opportunity_id
        data['type_id'] = this.formData.type_id
        data['assigned_to_id'] = this.formData.assigned_to_id
        data['opportunity_id'] = this.formData.opportunity_id
        data['team_id'] = this.formData.team_id
        data['time'] = this.formData.time
        data['description'] = this.formData.description
        data['priority'] = this.formData.priority
        data['media_id'] = this.formData.media_id
        data['team_id'] = this.formData.team_id
        this.formData.content != ''
          ? (data['content'] = this.formData.content)
          : (data['content'] = '')
        if (this.reminder) {
          data['reminder_to'] = this.$moment(new Date(this.schedule))
            .subtract(this.reminder, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss')
        } else {
          data['reminder_to'] = this.$moment(new Date(this.schedule))
            .subtract(10, 'minute')
            .format('YYYY-MM-DDTHH:mm:ss')
        }
        if (this.schedule) {
          data['scheduled_to'] = this.schedule
        }
        if (this.isEditing) {
          data['id'] = this.taskId
        }

        if (this.mediaType.base == 'forward') {
          data['bypass_schedule'] = true
        }
        else {
          data['bypass_schedule'] = false
        }

        console.log('data to submit', data)
        if (this.isEditing) {
          await await this.updateData('/cash/task', data)
        } else {
          const { id } = await this.createItem('/cash/task', data)
          await this.getItem('/cash/task', id)
        }
        this.handleCancel()
      }
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    handleCancel() {
      this.formData.type_id = null
      this.formData.team_id = null
      this.formData.assigned_to_id = null
      this.formData.opportunity_id = null
      this.$refs.form.reset()
      this.$v.$reset()
      this.displayCard = false
      this.dialog = false
      Object.assign(this.$data, this.$options.data.apply(this))
    },
    async teamOpportunities(id) {
      this.opportunitys.filter((opp) => opp.team_id == id)
    },
    showCustomerField() {
      if (this.opportunityId) {
        return false
      }
      if (this.opportunitiesList?.length > 0) {
        return false
      }
      return true
    },
    async getTaskTypes() {
      const { data } = await this.getList('/cash/task-type', 'obsolete=false&includes=media_type&limit=1000')
      const medias = data.map((type) => type.media_type_id)
      this.availableMedias = [...new Set(medias)]
    },
  },
  components: { Autocomplete },
}
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
