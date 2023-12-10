<template>
  <v-form ref="form" class="py-5">
    <v-row>
      <v-col class="text-center">
        <p class="font-weight-bold mb-1">Solicitar apoio</p>
        <p class="sub-text--text mb-2">Inclua as informações necessárias para a solicitação, como data e hora que você precisará desse apoio.</p>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <TextField
          is-required
          type="date"
          label="Data"
          :min="new Date().toISOString().substr(0, 10)"
          outlined
          dense
          v-model="formData.date"
        />
        <v-autocomplete
          attach
          outlined
          dense
          clearable
          :items="communications"
          item-text="name"
          item-value="value"
          v-model="formData.communication"
        >
          <template v-slot:label>
            Meio de comunicação
            <span class="error--text"
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    Obrigatório
                  </div>
                  `,
                placement: 'top-center',
              }"
            >*</span>
          </template>
        </v-autocomplete> 
      </v-col>
      <v-col>
        <TextField
          is-required
          type="time"
          label="Horário"
          outlined
          dense
          v-model="formData.time"
        />
        <v-autocomplete
          attach
          :key="teamKey"
          outlined
          dense
          readonly
          :items="teamList"
          item-text="attendant_team.name"
          item-value="attendant_team.id"
          v-model="formData.team"
        >
          <template v-slot:label>
            Time de Apoio
            <span class="error--text"
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    Obrigatório
                  </div>
                  `,
                placement: 'top-center',
              }"
            >*</span>
          </template>
        </v-autocomplete> 
      </v-col>
      <v-col>
        <TextField
          type="number"
          label="Duração (min)"
          outlined
          dense
          v-model="formData.duration"
        />
        <NewCombobox
          ref="roleCombobox"
          label="Envolvidos na negociação"
          outlined
          dense
          :endpoint="url.roleSuggestion"
          query="order=name"
          item-text="name"
          item-value="id"
          v-model="formData.involved"
          @keydown.enter="addInvolved($event.srcElement.value)"
        />
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col class="pt-0">
        <TextArea
          is-required
          label="Segmento e sub-segmento do negócio (com breve descrição da operação)"
          outlined
          dense
          rows="4"
          no-resize
          v-model="formData.segment"
        />
        <TextArea
          is-required
          label="Principais problemas/necessidades já levantados"
          outlined
          dense
          no-resize
          v-model="formData.problem"
        />
        <NewAutocomplete
          is-required
          label="Concorrentes"
          outlined
          dense
          clearable
          multiple
          item-value="id"
          item-text="name"
          :menu-props="{ top: true, maxHeight: '200px' }"
          :endpoint="url.competitor"
          :query="query.competitor"
          v-model="formData.system_tool"
        />
      </v-col>
    </v-row>
    <v-row class="mt-0">
      <v-col class="d-flex justify-end pt-0">
        <v-btn
          @click="clearField"
          :disabled="disable"
          text
          class="mr-3"
        >
          Limpar Campos
        </v-btn>
        <v-btn @click="submitForm" :disabled="disableSubmit" color="primary">Solicitar</v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'

const initialState = () => {
  return {
    formData: {
      system_tool: []
    },
    teamKey: 0,
    disableSubmit: true,
    disable: true,
    opportunity: [],
    teamList: [],
    systemList: [],
    listCompetitors: null,
    type: null,
    communications: [
      { name: 'Reunião', value: 'meeting' },
      { name: 'E-mail', value: 'email' },
      { name: 'Ligação', value: 'call' }
    ],
    url: {
      requestType: '/csc/request-type',
      requestSupport: '/csc/request-support',
      team: '/ecosystem/team',
      opportunity: '/cash/opportunity',
      roleSuggestion: '/ecosystem/role-suggestion',
      competitor: '/cash/competitor'
    },
    query: {
      competitor: 'includes=tenant&order=name'
    }
  }
}

export default {
  props: {
    opportunityId: {
      type: [String, Number]
    }
  },
  data () {
    return initialState()
  },
  validations: {
    formData: {
      date: { required },
      communication: { required },
      time: { required },
      team: { required },
      segment: { required },
      problem: { required },
      system_tool: { required }
    }
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam'
    })
  },
  watch: {
    teamList(newValue) {
      if(newValue) {
        this.formData.team = newValue[0]
      }
    },
    formData: {
      handler(){
        this.$v.formData.$touch()
        if(this.$v.formData.$error) {
          this.disableSubmit = true
        }else {
          this.disableSubmit = false
        }
        for(var key in this.formData) {
          if(key != 'system_tool' && key != 'team') {
            if(this.formData[key] === '' || this.formData[key] === null) {
              this.disable = true
            }else {
              this.disable = false
            }
          }
        }
      },
      deep: true
    },
    'formData.system_tool': async function(newValue) {
      if(newValue) {
        const { data } = await this.getList(this.url.competitor, `id=in(${newValue})`)
        this.systemList = data
      }
    }
  },
  async mounted() {
    await this.loadForm()
    await this.$root.$on('updateCompetitorRequest', this.updateCompetitor)
  },
  methods: {
    async getArchitectureTeam() {
      if(this.opportunity) {
        const { data } = await this.getList('/csc/get-eligible-team', `team_id=${this.opportunity.team_id}`)
        data.forEach(team => {
          const { attendant_team } = team
          if(attendant_team.extra) {
            const { isArchitecture } = JSON.parse(attendant_team.extra)
            if(isArchitecture) {
              this.teamList.push(team)
            }
          }
        })
      }
    },
    async updateCompetitor() {
      this.formData.system_tool = []
      await this.loadForm()
    },
    async addInvolved(value) {
      const formData = {
        name: value
      }
      const response = await this.createItem(this.url.roleSuggestion, formData)
      
      await this.$refs.roleCombobox.refreshList()
      this.formData.involved = { id: response.id, name: value}
    },
    async loadForm() {
      const support = await this.getItem(this.url.requestType, 'type=support')
      this.opportunity = await this.getItem(this.url.opportunity, `translateEnums=true&includes=customer,team,assigned_to,stage,competitors.competitor&id=${this.opportunityId}`)
      this.type = support
      if (this.opportunity?.competitors) {
        this.opportunity.competitors.forEach(item => {
          this.formData.system_tool.push(item.competitor_id)
        })
      }
      await this.getArchitectureTeam()
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if(this.formData.system_tool) {
        const form = {}
        form.id = this.opportunity.id
        form.competitors = this.formData.system_tool.map(item => ({
          id: item
        }))
        await this.updateData(this.url.opportunity, form, { fireSuccessAlert: false })
        this.$root.$emit('updateCompetitorOpportunity')
      }

      this.formData.opportunity_id = this.opportunityId
      this.formData.opportunity = this.opportunity
      this.formData.system_tool = this.systemList
      const scheduledTo = `${this.formData.date} ${this.formData.time}`
      this.formData.date = this.$moment(this.formData.date).format('DD/MM/YYYY')

      const data = JSON.stringify(this.formData)
      const form = {
        type: this.type.id,
        submitter_team_id: this.userTeam,
        submitter_id: this.userInfo.id,
        scheduled_to: scheduledTo,
        data: data
      }
      
      const response = await this.createItem(this.url.requestSupport, form, { fireSuccessAlert: false })
      if(response) {
        const options = {
          type: 'success',
          message: 'Solicitação enviada com sucesso!',
          requisition: {
            specs: {
              buttonText: 'Ir para Solicitações',
              clickEvent: this.redirectNotification,
              eventParams: response.id
            }
          }
        }
        this.showToast(options)
      }

      await this.clearField()
    },
    redirectNotification(id) {
      this.$router.push(`/request?request_id=${id}`)
    },
    async clearField() {
      await Object.assign(this.$data, initialState())
      await this.$v.$reset()
      await this.loadForm()
      this.teamKey += 1
    }
  }
}
</script>