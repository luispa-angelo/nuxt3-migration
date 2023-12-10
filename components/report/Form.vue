<template>
  <div>
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@5.x/css/materialdesignicons.min.css" rel="stylesheet"></link>
    <v-btn fab color="secondary" class="mx-2" @click="dialog = !dialog"
    v-tooltip="{
        content: `<div class='v-btn-tooltip'>Novo Relatório</div>`,
        placement: 'bottom-center',
        trigger: 'hover',
      }">
    <v-icon>mdi-plus</v-icon>
    </v-btn>
    <v-btn fab color="secondary" class="mx-2"  @click="getData"
      v-tooltip="{
          content: `<div class='v-btn-tooltip'>Atualizar</div>`,
          placement: 'bottom-center',
          trigger: 'hover',
        }">
      <v-icon>mdi-cached</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" max-width="600">
      <v-card elevation="0">
        <DialogHeader
          :title="'Solicitar Relatório'"
          @onCancel="handleCancel()"
          class="mb-5"
        />
        <v-form ref="form" class="mx-16">
          <v-card-text>
            <v-row> 
              <v-col cols="12">
                <v-text-field
                  label="Título"
                  v-model="formData.title"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-combobox
                  label="Tipo Relatório"
                  v-model="formData.reportType"
                  :items="reportTypes"
                  :disabled="reportId"
                  item-text="text"
                  item-value="id"
                  @change="getFields"
                  outlined
                  dense
                  :error="$v.formData.reportType.$error"
                  :error-messages="
                    $v.formData.reportType.$error ? 'Esse campo é obrigatório' : ''
                  "
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row  v-if="showDate">
              <v-col cols="6">
                <v-text-field
                  label="Data Início"
                  type="date"
                  v-model="formData.params.dateStart"
                  v-if="showDate"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
              
              <v-col cols="6">
                <v-text-field
                  label="Data fim"
                  type="date"
                  v-model="formData.params.dateEnd"
                  v-if="showDate"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="showTaskType">
              <v-col cols="12">
                <v-select
                  attach
                  label="Tipo de tarefa"
                  :items="mediaTypes"
                  :disabled="!showTaskType"
                  item-text="name"
                  v-model="formData.params.mediaType"
                  return-object
                  outlined
                  dense
                >
                </v-select>
              </v-col>
            </v-row>
            <v-row v-if="showTaskType">
              <v-col>
                <v-combobox
                  label="Motivo"
                  v-if="showTaskType"
                  v-model="formData.params.taskType"
                  :items="taskTypeList"
                  :disabled="!showTaskType"
                  item-text="name"
                  item-value="id"
                  outlined
                  dense
                ></v-combobox>
              </v-col>
            </v-row>
            <v-row v-if="showTeams">
              <v-col cols="12">
                <v-autocomplete
                  attach
                  auto-select-first
                  clearable
                  outlined
                  dense
                  placeholder="Todos"
                  persistent-placeholder
                  label="Time"
                  item-text="pretty"
                  item-value="id"
                  @change="getCoworkers"
                  v-model="formData.params.team_id"
                  :items="teams"
                  v-if="showTeams"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="showAssigned">
               <v-col cols="12">
                <v-autocomplete
                  attach
                  :loading="loadingAssigned"
                  :disabled="loadingAssigned"
                  v-if="showAssigned"
                  label="Responsável"
                  :items="coworkers"
                  item-text="name"
                  item-value="id"
                  placeholder="Todos"
                  persistent-placeholder
                  clearable
                  outlined
                  dense
                  v-model="formData.params.assigned"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="showCnae">
               <v-col cols="12">
                <v-text-field
                  label="CNAE"
                  v-if="showCnae"
                  v-model="formData.params.cnae"
                  outlined
                  dense
                ></v-text-field>
              </v-col>
            </v-row>
            <v-row v-if="showAddress">
               <v-col cols="12">
                <v-autocomplete
                  attach
                  :loading="loadingAssigned"
                  :disabled="loadingAssigned"
                  v-if="showAddress"
                  label="Estado"
                  :items="this.stateList"
                  item-text="name"
                  item-value="id"
                  placeholder="Todos"
                  persistent-placeholder
                  multiple
                  chips
                  deletable-chips
                  small-chips
                  clearable
                  outlined
                  dense
                  v-model="formData.params.state"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row v-if="showAddress">
               <v-col cols="12">
                <v-autocomplete
                  attach
                  :loading="loadingAssigned"
                  :disabled="loadingAssigned"
                  v-if="showAddress"
                  label="Cidade"
                  :items="this.cityList"
                  item-text="name"
                  item-value="id"
                  placeholder="Todas"
                  persistent-placeholder
                  multiple
                  chips
                  deletable-chips
                  small-chips
                  clearable
                  outlined
                  dense
                  v-model="formData.params.city"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-autocomplete
                  attach
                  label="Campos de saída"
                  :loading="loadingOutput"
                  :disabled="loadingOutput"
                  clearable
                  dense
                  hide-selected
                  multiple
                  chips
                  deletable-chips
                  outlined
                  small-chips
                  v-model="reportOutputSelected"
                  :items="reportOutputs"
                ></v-autocomplete>
              </v-col>
            </v-row>
            <v-alert
              class="light-alert"
              outlined
              dismissible
              dense
              type="warning"
            >
              Os relatórios expiram após 24 horas.
            </v-alert>
          </v-card-text>

          <v-card-actions class="d-flex justify-space-between">
            <v-col>
              <v-btn @click="handleCancel()" color="secondary">Cancelar</v-btn>
            </v-col>
            <v-col class="d-flex justify-end">
              <v-btn color="primary" @click="submitForm()">
                Solicitar
              </v-btn>
            </v-col>
          </v-card-actions>
        </v-form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { getTimeDiffInMilliseconds } from 'util'
import { required, requiredIf } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    reportId: Number,
  },
  components: {
  },
  data: () => ({
    showDate: false,
    showTaskType: false,
    showAssigned: false,
    showCnae: false,
    showAddress: false,
    loadingOutput: false,
    loadingAssigned: false,
    dialog: false,
    showTeams: false,
    reportType: null,
    reportTypes: [],
    reportOutputs: [],
    reportOutputSelected: null,
    params: {},
    dateStart: null,
    dateEnd: null,
    datetime: null,
    taskType: null,
    mediaTypes: [],
    mediaType: null,
    taskTypeList: [],
    stateList: [],
    cityList: [],
    availableMedias: [],
    formData: {
      title: '',
      report_type: '',
      fields: {},
      params: {},
      team_id: null,
      reportType: null,
    },
    selectedReport: {},
    teams: [],
    coworkers: []
  }),
  validations: {
    formData: {
      reportType: { required }
    },
  },
  computed: {
    ...mapGetters({
      types: 'reports',
      userInfo: 'userInfo',
    }),
    schedule: function () {
      if(!this.date && !this.date) {
        return null
      } 
      const d = new Date(`${this.date} ${this.hours}`)
      const datetime = `${[d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate()].join('-')} ${[d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()].join(':')}`
      return datetime
    },
  },
  watch: {
    // 'formData.params.team_id': async function(newValue) {
    //   if (newValue) {
    //     alert(newValue)
    //     await this.$store.dispatch('fetchCoworkers', `team_id=${newValue}`)
    //   }
    // },
    async dialog(newValue) {
      if (newValue) {
        const reportTypes = await this.getList(
          '/analytics/report-types'
        )
        this.reportTypes = reportTypes.data
          .sort((a, b) => (a.text > b.text ? 1 : -1))
        this.reportOutputs = []
        this.reportOutputSelected = null
        this.showDate = false
        this.showTaskType = false
        this.showAssigned = false
        this.showAddress = false
        this.showCnae = false
        this.showTeams = false
        this.loadForm()
      } 
    },
    'formData.params.mediaType': async function(newValue, oldValue) {
      if (newValue) {
        const tasksWithMediaType = await this.getList(
          '/cash/task-type',
          `includes=media_type&media_type.id=${newValue.id}`
        )
        this.taskTypeList = tasksWithMediaType.data
        if (oldValue && oldValue != newValue) {
          this.formData.params.taskType = null
        }
      }
    },
  },
  async mounted() {
    let teams = (await this.getList('/ecosystem/any-team', 'strict=true&limit=1000')).data
    this.teams = this.loadTeams(teams)
  },
  methods: {
    traverse(children, full, prefix="") {
        for (let el of children) {
          el.pretty = prefix + el.name
          full.push(el)
          this.traverse(el.children, full, prefix + " ")
        }
      },
      loadTeams(data) {
        let teams = []
        let map = {}

        for(let el of data) {
          teams.push({name: el.name, value: el.id})
          map[el.id] = el.name
        }

        let heads = []
        let hierarchy = {}
        for (let i = 0; i < data.length; i++) {
          let el = data[i]
          if (!(el.id in hierarchy)) {
            hierarchy[el.id] = el
            el["children"] = []
          }
          if (el.parent_id in hierarchy) {
            hierarchy[el.parent_id].children.push(el)
          }
          else {
                heads.push(el)
              }
        }

        let values = []
        this.traverse(heads, values)
        return values
      },
    closed() {
      this.dialog = !this.dialog
    },
    async getFields() {
      try {
        this.loadingOutput = true
        let typeModule = this.formData.reportType.value
        const responseOutputs = await this.$axios.get(
          `/analytics/report-output/${typeModule}`
        ).catch(function (error) {
          console.log(error.response)
        })
        if (responseOutputs.data) {
          this.reportOutputs = responseOutputs.data.data
          this.reportOutputSelected = responseOutputs.data.data
        }
        const responseFields = await this.$axios.get(
          `/analytics/report-fields/${typeModule}`
        ).catch(function (error) {
          console.log(error.response)
        })
        if (responseFields.data) {
          if (responseFields.data.data) {
            if (responseFields.data.data.includes("dateStart") || responseFields.data.data.includes("dateEnd")) {
              this.showDate = true
            } else {
              this.showDate = false
            }
            if (responseFields.data.data.includes("assigned")) {
              this.showAssigned = true
              let userTeams = this.userInfo.capabilities.map((e) => e.team_id)
              this.coworkers = (await this.getList('/ecosystem/capability', `team_id=in(${userTeams})&includes=user&limit=1000`))?.data?.map(el => el?.user)
            } else {
              this.showAssigned = false
            }
            if (responseFields.data.data.includes("team")) {
              this.showTeams = true
            } else {
              this.showTeams = false
            }
            if (responseFields.data.data.includes("cnae")) {
              this.showCnae = true
            } else {
              this.showCnae = false
            }
            if (responseFields.data.data.includes("city") || responseFields.data.data.includes("state")) {
              const responseStateList = []
              const responseState = await this.$axios.get(
                `/customer/get-states`
              ).catch(function (error) {
                console.log(error.response)
              })
              console.log(responseState)
              responseState.data.forEach((d) => {
                responseStateList.push({name: d.state, value: d.state})
              })
              this.stateList = responseStateList

              const responseCityList = []
              const responseCity = await this.$axios.get(
                `/customer/get-cities`
              ).catch(function (error) {
                console.log(error.response)
              })
              responseCity.data.forEach((d) => {
                responseCityList.push({name: d.city, value: d.city})
              })
              this.cityList = responseCityList

              this.showAddress = true
            } else {
              this.showAddress = false
            }
            if (responseFields.data.data.includes("taskType")) {
              await this.getTaskTypes()
              const mediaQuery = this.availableMedias.join()
              const mediaTypes = await this.getList(
                '/ecosystem/media-type',
                `id=in(${mediaQuery})`
              )
              this.mediaTypes = mediaTypes.data
              this.showTaskType = true
              const responseTaskList = []
              const responseTask = await this.$axios.get(
                `/cash/task-type?limit=200&order=id_desc&includes=team,media_type`
              ).catch(function (error) {
                console.log(error.response)
              })
              responseTask.data.data.forEach((d) => {
                responseTaskList.push({name: d.name, value: d.id})
              })
              this.taskTypeList = responseTaskList
            } else {
              this.showTaskType = false
            }
          }
        }
        this.loadingOutput = false
      } catch (error) {
        this.loadingOutput = false
        this.mediaStatus = 'Falha na verificação'
        console.log('error ->', error)
      }
    },
    async getCoworkers(newValue) {
      try {
        this.loadingAssigned = true
        this.formData.params.assigned = null
        if (!newValue) {
          let userTeams = this.userInfo.capabilities.map((e) => e.team_id)
          this.coworkers = (await this.getList('/ecosystem/capability', `team_id=in(${userTeams})&includes=user&limit=1000`))?.data?.map(el => el?.user)
        } else {
          this.coworkers = (await this.getList('/ecosystem/capability', `team_id=${newValue}&includes=user&limit=1000`))?.data?.map(el => el?.user)
        }
        this.loadingAssigned = false
      } catch (error) {
        this.loadingAssigned = false
        this.mediaStatus = 'Falha na verificação'
        console.log('error ->', error)
      }
    },
    async getData() {
      await this.$store.commit('Report/RESET_AND_SET_LIST', [])
      await this.$store.commit('Report/SET_LIST_DETAILS', { page: 0 })
      await this.$store.dispatch('Report/refresh', true)
    },
    collect() {
      var reportData = {}
      var reportForm = new FormData(this.$refs['report-form'])
      reportForm.forEach((value, key) => (reportData[key] = value))
      return reportData
    },
    async loadForm() {
      // this.formData.params.team_id = this.userTeams[0].id
      // await this.getData()
    },
    async submitForm() {
      let formData = this.collect()
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (formData) {
        let data = {}
        if (this.formData.params.dateEnd) {
          let lastHour = "23:59:59"
          this.formData.params.dateEnd = this.formData.params.dateEnd.concat(" ", "23:59:59")
        }
        data['title'] = (this.formData.title == '' || this.formData.title == null)  ?
          this.formData.reportType.text : this.formData.title
        data['report_type'] = this.formData.reportType.value
        data['params'] = this.formData.params
        data['fields'] = this.reportOutputSelected

        const { id } = await this.createItem('/analytics/request-report/' + this.formData.reportType.value, data)
        this.handleCancel()

        await setTimeout(() => {
          this.loadForm()
        }, 200)
      }
      this.getData()
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.displayCard = false
      this.dialog = false
    },
    async getTaskTypes() {
      const { data } = await this.getList('/cash/task-type', 'includes=media_type')
      const medias = data.map((type) => type.media_type_id)
      this.availableMedias = [...new Set(medias)]
    },
  },
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
.light-alert {
  border: none !important;
}
</style>
