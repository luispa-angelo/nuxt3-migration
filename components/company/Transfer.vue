<template>
  <div>
    <v-tooltip v-if="companiesToTransfer.length == 0" left>
      <template v-slot:activator="{ on, attrs }">
        <div v-on="on">
          <v-btn
            disabled
            data-test="btnTransferOpen"
            id="btn-open-transfer"
            class="mr-1"
            v-bind="attrs"
            :color="btnColor"
          >
            Prospectar
          </v-btn>
        </div>
      </template>
      <span>Selecione, pelo menos, 1 empresa para prospectar.</span>
    </v-tooltip>
    <v-btn
      data-test="btnTransferOpen"
      v-else
      id="btn-open-transfer"
      class="mr-1"
      :color="btnColor"
      @click="dialog = !dialog"
    >
      Prospectar
    </v-btn>
    <v-dialog v-model="dialog" scrollable persistent max-width="1050" content-class="transfer_modal">
      <v-card>
        <DialogHeader
          :elevation="0"
          title="Informações de Prospecção"
          @onCancel="handleCancel()"
        />
          <v-card-subtitle class="v-card-subtitle sub-text--text pl-4 align-subtitle">
            Insira as informações de destino dessa(s) empresa(s).
          </v-card-subtitle>
          <v-card-text class="pt-6">
            <v-form ref="form">
              <v-row>
                <v-col xl="4">
                 <Autocomplete
                    data-test="selectTransferTeam"
                    isRequired
                    id="field-team-id"
                    label="Time"
                    outlined
                    dense
                    clearable
                    return-object
                    endpoint="/ecosystem/any-team"
                    query="order=level,id&strict=true"
                    :initial-value="defaultTeam"
                    :item-text="(item) => item && item.name? item.name : ''"
                    :postProcess="traverseFilter"
                    :error="$v.formData.team.$error"
                    :error-messages="
                      $v.formData.team.$error ? 'Esse campo é obrigatório' : ''
                    "
                    @valueSelected="(value) => {formData.team = value}"
                    :disabled="doneSubmit"
                  ></Autocomplete>
                </v-col>
                <v-col xl="4">
                  <v-autocomplete
                    data-test="selectTransferPipeline"
                    attach
                    id="field-pipeline-id"
                    hide-details
                    required
                    outlined
                    dense
                    item-text="name"
                    item-value="id"
                    clearable
                    v-model="formData.pipeline_id"
                    :disabled="doneSubmit"
                    :items="pipelineList"
                    :error="$v.formData.pipeline_id.$error"
                    :error-messages="$v.formData.pipeline_id.$error ? 'Esse campo é obrigatório' : ''"
                  >
                    <template v-slot:label>
                      Pipeline
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
                <v-col xl="4">
                  <v-autocomplete
                    data-test="selectTransferAssigned"
                    attach
                    id="field-assigned-to-id"
                    hide-details
                    required
                    outlined
                    dense
                    clearable
                    item-text="name"
                    item-value="id"
                    v-model="formData.assigned_to_id"
                    :disabled="doneSubmit"
                    :error="$v.formData.assigned_to_id.$error"
                    :error-messages="$v.formData.assigned_to_id.$error ? 'Esse campo é obrigatório' : ''"
                    :items="coworkers"
                  >
                    <template v-slot:label>
                      Responsável
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
              </v-row>
              <v-row class="mt-0">
                <v-col class="text-center pt-0">
                  <img
                    v-if="formData.team == null || formData.pipeline_id == null || formData.assigned_to_id == null"
                    class="mt-10"
                    src="~/static/transfer-form.png"
                  >
                  <section v-else>
                    <v-data-table
                      data-test="tableTransferCompanies"
                      item-key="identifier"
                      :loading="isLoading"
                      :headers="reportHeaders"
                      :items="companiesReport"
                    >
                      <template v-slot:[`item.checkbox`]="{ item }">
                        <div v-if="payloadSent">
                          <v-simple-checkbox
                            data-test="checkboxTransferCompanies"
                            v-if="item.default_details == 'available' || item.default_details == 'already owned on remote system. skipping'"
                            v-model="item.checkbox"
                            :ripple="false"
                          ></v-simple-checkbox>
                          <v-icon
                            v-else
                            color="warning"
                            class="material-symbols-outlined mr-1"
                          >
                            warning
                          </v-icon>
                        </div>
                      </template>
                      <template v-slot:[`item.action`]="{ item }">
                        <div v-if="item.default_details == 'done'">
                          <NuxtLink
                            data-test="linkTransferRedirectToRequest"
                            v-if="item.typeResult == 'CSC'"
                            to="/request"
                            target="_blank"
                            class="remove-text-decoration"
                          >
                            Ir para Solicitações
                            <v-icon color="primary" small class="material-symbols-rounded">
                              open_in_new
                            </v-icon>
                          </NuxtLink>
                          <a
                            v-else
                            data-test="linkTransferRedirectToOpportunity"
                            :href="redirectPage(item.opportunity_id)"
                            target="_blank"
                            class="remove-text-decoration"
                          >
                            Ir para Oportunidade
                            <v-icon color="primary" small class="material-symbols-rounded">
                              open_in_new
                            </v-icon>
                          </a>
                        </div>
                        <div v-else-if="item.default_details.includes('skipping')">
                          <ApprovalDelegationIcon
                            width="24"
                            height="24"
                            fill="warning"
                          />
                        </div>
                      </template>
                    </v-data-table>
                    <TextArea
                      data-test="textareaTransferReason"
                      v-if="hasCscItem"
                      is-required
                      id="field-reason"
                      label="Motivo da solicitação de transferência"
                      no-resize
                      rows="3"
                      required
                      outlined
                      dense
                      v-model="reason"
                      :error="$v.reason.$error"
                      :error-messages="$v.reason.$error ? 'Esse campo é obrigatório' : ''"
                    />
                  </section>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        <DialogAction
          actions-align="end"
          :show-divider="false"
          :disable-submit="disableRequestButton"
          submit-text="Concluir"
          cancel-text="Cancelar"
          @submit="submitForm()"
          @cancel="handleCancel()"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'
import requiredIf from 'vuelidate/lib/validators/requiredIf'

export default {
  props: {
    companiesToTransfer: {
      type: Array,
      default: () => {
        return []
      }
    },
    btnColor: {
      type: String,
      default: 'secondary'
    },
  },
  data: () => ({
    dialog: false,
    removeSpecialChars: /[^a-zA-Z0-9 ]/g,
    isLoading: false,
    defaultTeam: null,
    enableSubmit: false,
    payloadSent: false,
    hasTransferItem: false,
    hasCscItem: false,
    doneSubmit: false,
    pipelineList: [],
    companiesReport: [],
    listOldCompanies: [],
    doneList: [],
    reportHeaders: [
      { text: '', value: 'checkbox' },
      { text: 'Nome', value: 'name', align: 'left' },
      { text: 'CNPJ', value: 'identifier', align: 'left' },
      { text: 'Status/Motivo', value: 'details', align: 'left' },
      { text: 'Ação', value: 'action', align: 'left' },
    ],
    url: {
      checkTransferEligibility: '/customer/check-transfer-eligibility',
      multipleTransfer: '/csc/multiple-transfer',
      transfer: '/customer/transfer',
      company: '/customer/company',
      opportunity: '/cash/opportunity',
    },
    redirectTo: '/business-opportunity',
    formData: {
      team: null,
      pipeline_id: null,
      assigned_to_id: null,
    },
    reason: null
  }),
  validations: {
    formData: {
      team: { required },
      pipeline_id: { required },
      assigned_to_id: { required }
    },
    reason: { required: requiredIf(function() { return this.hasCscItem }) }
  },
  computed: {
    ...mapGetters({
      company: 'Company/company',
      userTeams: 'userTeams',
      coworkers: 'coworkers',
      associationType: 'associationType',
      userInfo: 'userInfo',
    }),
    routeName() {
      return this.$route.name
    },
    disableRequestButton: function() {
      if (this.enableSubmit && this.formData.team && this.formData.pipeline_id && this.formData.assigned_to_id) {
        return false
      }
      return true
    },
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        await this.setInicialData()
      }
    },
    companiesToTransfer(newValue) {
      if(newValue && !this.doneSubmit) {
        this.companiesReport = this.companiesToTransfer.map((company) => ({
          name: company?.name,
          identifier: this.maskCnpj(company?.cnpj),
          details: 'Pendente',
          default_details: 'pending',
          cnae: company?.primary_cnae,
          checkbox: false
        }))
      }
    },
    companiesReport: {
      handler(newValue){
        const list = newValue.filter(item => item.default_details.includes('skipping'))
        const hasSelected = list.find(item => item.checkbox == true)
        if(hasSelected) {
          this.hasCscItem = true
        }else {
          this.hasCscItem = false
        }

        for(var item of newValue) {
          if(item.checkbox) {
            this.enableSubmit = true
            return false
          }
          this.enableSubmit = false
        }
      },
      deep: true
    },
    'formData.team': async function(newValue) {
      if(newValue) {
        var team_id = newValue.id
        await this.$store.dispatch('fetchCoworkers', `team_id=${team_id}`)
        if (!this.coworkers.find((user) => user.id == this.formData.assigned_to_id)) {
          this.formData.assigned_to_id = null
        }
        const { data } = await this.$axios.get('/cash/team-pipelines?team_id=' + team_id)
        const pipelines = data
        if (pipelines) {
          pipelines.sort((a,b) => a.name.localeCompare(b.name))
          this.pipelineList = pipelines.map(({ id, name }) => ({
            id,
            name
          }))
        } else {
          this.formData.pipeline_id = null
          this.pipelineList = []
        }
      }
      await this.getTransferEligibility()
    },
    'formData.pipeline_id': async function() {
      await this.getTransferEligibility()
    },
    'formData.assigned_to_id': async function() {
      await this.getTransferEligibility()
    }
  },
  methods: {
    redirectPage(id) {
      return `${this.redirectTo}/router/${id}`
    },
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
    async setInicialData() {
      this.$v.$reset()
      this.payloadSent = false
      this.formData.assigned_to_id = this.userInfo.id
      if (this.userInfo?.capabilities.length) {
        if (this.userInfo?.capabilities.length == 1) {
          this.defaultTeam = {
            id: this.userInfo.capabilities[0].team_id,
            name: this.userInfo.capabilities[0].team.name
          }
        }
      }
      await this.$store.dispatch('fetchAssociationType')
    },
    async getTransferEligibility() {
      if(this.formData.team && this.formData.pipeline_id && this.formData.assigned_to_id) {
        this.isLoading = true
        var list = []
        this.companiesReport.forEach(item => {
          const identifier = item.identifier.replace(/[^A-Z0-9]/ig, '')
          list.push(identifier)
        })
        const formData = {
          assigned_to_id: this.formData.assigned_to_id,
          team_id: this.formData.team.id,
          pipeline_id: this.formData.pipeline_id,
          companies: list
        }
        
        const { data } = await this.updateData(this.url.checkTransferEligibility, formData, { fireSuccessAlert: false })
        data.forEach(item => {
          if(item.details.includes('Skipping')) {
            this.hasCscItem = true
          }
          if(item.details.includes('available')) {
            this.hasTransferItem = true
          }
        })

        const listCompanies = this.companiesReport
        this.companiesReport = []
        for (const company of listCompanies) {
          const { name, identifier } = company
          const clearedIdentifier = identifier.replace(this.removeSpecialChars, '')
          const item = await data.find(item => item.identifier == clearedIdentifier)
          if(item) {
            let details = item.details.toLowerCase()
            let checked = false
            if(details == 'available' || details == 'already owned on remote system. skipping') {
              checked = true
            }

            this.companiesReport.push({
              name: name,
              identifier: identifier,
              default_details: item.details.toLowerCase(),
              details: this.translateDetails(item.details),
              checkbox: checked
            })
          }
        }
        this.payloadSent = true
        this.isLoading = false
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      this.$v.reason.$touch()
      if (this.$v.formData.$error || this.$v.reason.$error) return
      this.isLoading = true
      this.listOldCompanies = await this.companiesReport

      if(this.hasCscItem) {
        let listCompanies = []
        const pipeline = await this.pipelineList.find(pipeline => pipeline.id == this.formData.pipeline_id)

        for await (const item of this.companiesReport) {
          if(item.default_details.includes('skipping') && item.checkbox == true) {
            listCompanies.push(item)
          }
        }

        const info = {
          companys: listCompanies,
          pipeline_id: this.formData.pipeline_id,
          pipeline_name: pipeline.name,
          assigned_to_id: this.formData.assigned_to_id,
          team_id: this.formData.team.id,
          team_name: this.formData.team.name,
          reason: this.reason
        }

        const data = JSON.stringify(info)
        const formData = {
          submitter_team_id: this.formData.team.id,
          data
        }

        const response = await this.createItem('/csc/multiple-transfer', formData, { fireSuccessAlert: false })
        for await (const item of response.data) {
          if(item.success) {
            this.doneList.push({
              request_id: item.id,
              identifier: item.company.replace(this.removeSpecialChars, ''),
              typeResult: 'CSC'
            })
          }
        }
      }
      if(this.hasTransferItem) {
        try {
          let listCompanies = []

          for await (const item of this.companiesReport) {
            if(item.default_details.includes('available') && item.checkbox == true) {
              listCompanies.push(item.identifier)
            }
          }
          
          this.formData.team_id = this.formData.team.id
          this.formData.companies = listCompanies

          const response = await this.createItem(this.url.transfer, this.formData, { fireSuccessAlert: false })
          if (response?.status == 'ok') {
            for await (const item of response.data) {
              this.doneList.push({
                opportunity_id: item.opportunity_id,
                identifier: item.identifier,
                typeResult: 'transfer'
              })
            }

            this.$store.dispatch('BureauCompany/refresh', true)
            this.$store.dispatch('Company/refresh', true)
          }
        } catch(error) {
          console.log(error)
        }
      }

      this.companiesReport = []
      for (const company of this.doneList) {
        const { request_id, opportunity_id, identifier, typeResult } = company
        const maskIdentifier = this.maskCnpj(identifier)
        const details = typeResult == 'CSC' ? 'Solicitação enviada com sucesso!' : 'Empresa prospectada com sucesso!'
        const item = await this.listOldCompanies.find(item => item.identifier == maskIdentifier)
        this.companiesReport.push({
          ...item,
          opportunity_id: opportunity_id ? opportunity_id : null,
          request_id: request_id ? request_id : null,
          default_details: 'done',
          details: details,
          typeResult: typeResult,
          checkbox: false
        })
      }

      this.payloadSent = false
      this.hasCscItem = false
      this.doneSubmit = true
      this.reason = null
      this.isLoading = false
    },
    handleCancel() {
      this.$emit('clearSelected')
      this.dialog = false
      this.isLoading = false
      this.enableSubmit = false
      this.payloadSent = false
      this.hasTransferItem = false
      this.hasCscItem = false
      this.doneSubmit = false
      this.$refs.form.reset()
      this.reason = null
      this.$v.$reset()
      if(this.routeName != 'business-companies-item-identifier') {
        this.companiesReport = []
      }
    },
    translateDetails(details) {
      var text = details.toLowerCase()
      if(text.includes('available')) {
        return 'Disponível'
      }else if (text.includes('already owned on remote system. skipping')) {
        return 'Pendente de aprovação: irá para Solicitações'
      }else if (text.includes('request already exists')) {
        return 'Você já solicitou a transferência'
      }else if (text.includes('already the same request for this team')) {
        return 'Alguém do seu time já solicitou a transferência'
      }else if (text.includes('company already owned for this team')) {
        return 'Alguém do seu time já está responsável'
      }else if (text.includes('company already owned by this user')) {
        return 'Você já é responsável por essa empresa'
      }else if (text.includes('failed')) {
        return 'Falha no processamento, transferência não efetuada!'
      }
      return text
    }
  }
}
</script>
<style scoped>
  .align-subtitle {
    margin-top: -4px;
  }
  .remove-text-decoration {
    text-decoration: none !important;
  }
</style>

<style lang="scss">
.transfer_modal {
  height: 100% !important;

  &:not(.v-dialog--fullscreen) {
    @media (min-width: 1400px) {
      max-height: 604px;
    }
  }
  
}
</style>