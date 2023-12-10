<template>
  <div>
    <v-dialog v-model="dialog" scrollable persistent max-width="1000">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          data-test="btnOpportunityModalOpen"
          v-bind="attrs"
          v-on="on"
          :color="modalBtnColor"
        >
          Criar oportunidade
        </v-btn>
      </template>
      <v-card data-test="cardOpportunityModal" style="min-height: 500px;">
        <DialogHeader
          :elevation="0"
          title="Criar Oportunidade"
          @onCancel="handleCancel()"
        />
          <v-card-subtitle class="v-card-subtitle sub-text--text pl-4 pb-2 align-subtitle">
            Insira as informações necessárias para criar a oportunidade.
          </v-card-subtitle>
          <v-card-text class="pt-4">
            <v-form ref="form">
              <v-row>
                <v-col cols="6">
                  <TextField
                    v-if="hasCompany"
                    is-required
                    outlined
                    dense
                    disabled
                    data-test="inputOpportunityModalCompany"
                    label="Empresa"
                    :value="company.name"
                  ></TextField>
                  <Autocomplete
                    v-else
                    is-required
                    outlined
                    dense
                    clearable
                    return-object
                    custom-criteria
                    data-test="selectOpportunityModalCompany"
                    ref="companyAutocomplete"
                    label="Empresa"
                    endpoint="/bureau/company-by-name-or-identifier"
                    no-data-text="digite o CNPJ ou nome da Empresa"
                    :item-text="item => item.name +' - '+ maskCnpj(item.cnpj) + ` (${item.cnpj})`"
                    :length-to-start-search="4"
                    :menu-props="{ maxHeight: '200px' }"
                    @valueSelected="(value) => {
                      selectedCompany = value
                      checkCompanyEligibility()
                    }"
                  ></Autocomplete>
                  <NewAutocomplete
                    is-required
                    outlined
                    dense
                    clearable
                    data-test="selectOpportunityModalPipeline"
                    label="Funil"
                    endpoint="/cash/team-pipelines"
                    item-value="id"
                    item-text="name"
                    v-model="formData.pipeline_id"
                    :query="`team_id=${formData.team_id ? formData.team_id : '0'}&order=name`"
                    :cache-items="false"
                    :validate="$v.formData.pipeline_id"
                    :menu-props="{ maxHeight: '200px' }"
                    @onValueNotFound="
                      (value) => (formData.pipeline_id = value)
                    "
                    @onSearchUpdate="
                      (value) => (pipelineName = value)
                    "
                    @change="checkCompanyEligibility()"
                  ></NewAutocomplete>
                </v-col>
                <v-col cols="6">
                  <NewAutocomplete
                    is-required
                    outlined
                    dense
                    clearable
                    data-test="selectOpportunityModalTeam"
                    label="Time"
                    endpoint="/ecosystem/any-team"
                    item-value="id"
                    v-model="formData.team_id"
                    :query="'order=level,id&strict=true'"
                    :item-text="(item) => (item && item.name ? item.name : '')"
                    :post-process="showTeamHierarchy"
                    :validate="$v.formData.team_id"
                    :menu-props="{ maxHeight: '200px' }"
                    @onSearchUpdate="
                      (value) => (teamName = value)
                    "
                    @change="checkCompanyEligibility()"
                  ></NewAutocomplete>
                  <NewAutocomplete
                    is-required
                    outlined
                    dense
                    clearable
                    data-test="selectOpportunityModalUser"
                    label="Atribuído(a) a"
                    endpoint="/ecosystem/capability"
                    item-value="user_id"
                    item-text="user.name"
                    v-model="formData.assigned_to_id"
                    :query="`includes=user,team&team_id=${formData.team_id}`"
                    :cache-items="false"
                    :validate="$v.formData.assigned_to_id"
                    :menu-props="{ maxHeight: '200px' }"
                    @onValueNotFound="
                      (value) => (formData.assigned_to_id = value)
                    "
                    @change="checkCompanyEligibility()"
                  ></NewAutocomplete>
                </v-col>
              </v-row>
              <v-row class="mt-0">
                <v-col class="text-center pt-0">
                  <img
                    v-if="!formFilled"
                    class="mt-10"
                    src="~/static/transfer-form.png"
                  >
                  <v-progress-linear
                    v-if="isLoading"
                    indeterminate
                    color="primary"
                  ></v-progress-linear>
                  <section v-if="companyStatus && formFilled">
                    <div class="d-flex justify-start">
                      <span class="body-1 font-weight-bold align-self-start default-text--text mb-2">
                        Status/Motivo
                      </span>
                    </div>
                    <div v-if="companyStatus === 'available'" class="status-border pa-3">
                      <div class="d-flex justify-start">
                        <i color="success" class="v-icon material-symbols-rounded mr-4 success--text">
                          task_alt
                        </i>
                        <span class="body-1 font-weight-medium default-text--text text-left">{{ detailsMessage }}</span>
                      </div>
                    </div>
                    <div v-if="companyStatus === 'request'" class="status-border pa-3">
                      <div class="d-flex justify-start">
                        <i
                          class="material-symbols-rounded v-icon theme--light mr-4 warning--text"
                          style="margin-top: -4px;"
                        >
                          approval_delegation
                        </i>
                        <span class="body-1 font-weight-medium default-text--text text-left">{{ detailsMessage }}</span>
                      </div>
                      <TextArea
                        v-if="companyStatus === 'request'"
                        is-required
                        no-resize
                        required
                        outlined
                        dense
                        hide-details
                        class="mt-3"
                        id="field-reason"
                        label="Motivo da solicitação de transferência"
                        rows="3"
                        v-model="reason"
                        :error="$v.reason.$error"
                        :error-messages="$v.reason.$error ? 'Esse campo é obrigatório' : ''"
                      />
                    </div>
                    <div v-if="companyStatus === 'redirect' || companyStatus === 'inform'" class="status-border pa-3">
                      <div class="d-flex justify-start align-center">
                        <v-icon color="warning" class="material-icons-outlined mr-4">
                          report_problem
                        </v-icon>
                        <span
                          class="body-1 font-weight-medium default-text--text text-left"
                        >
                          {{ detailsMessage }}
                        </span>
                        <NuxtLink
                          v-if="companyStatus !== 'inform' && showRedirect"
                          data-test="linkOpportunityModalRequest"
                          to="/request"
                          target="_blank"
                          class="remove-text-decoration ml-auto"
                          style="min-width: 200px;"
                        >
                          Ir para Solicitações
                          <v-icon color="primary" class="material-symbols-rounded">
                            open_in_new
                          </v-icon>
                        </NuxtLink>
                      </div>
                    </div>
                  </section>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        <DialogAction
          actions-align="end"
          cancel-text="Cancelar"
          :submit-text="confirmBtnLabel"
          :show-divider="false"
          :disable-submit="!enableSubmit"
          :loading-submit="isSubmitting"
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
    company: {
      type: Object,
      default: () => {
        return null
      }
    },
    modalBtnColor: {
      type: String,
      default: 'primary'
    },    
  },
  data: () => ({
    dialog: false,
    isLoading: false,
    isSubmitting: false,
    url: {
      checkTransferEligibility: '/customer/check-transfer-eligibility',
      transfer: '/customer/transfer',
      opportunity: '/cash/opportunity',
    },
    redirectTo: '/business-opportunity',
    formData: {
      team_id: null,
      pipeline_id: null,
      assigned_to_id: null,
    },
    selectedCompany: null,
    pipelineName: null,
    teamName: null,
    reason: null,
    detailsMessage: null,
    companyStatus: null,
  }),
  validations: {
    formData: {
      team_id: { required },
      pipeline_id: { required },
      assigned_to_id: { required },
    },
    selectedCompany: { required },
    reason: { required: requiredIf(function() { return this.companyStatus === 'request' }) }
  },
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      userTeams: 'userTeams',
    }),
    formFilled() {
      return !this.$v.formData.$invalid && !this.$v.selectedCompany.$invalid
    },
    hasCompany() {
      return this.company !== null
    },
    enableSubmit() {
      return this.formFilled && (this.companyStatus === 'available' || this.companyStatus === 'request')
    },
    confirmBtnLabel(){
      return this.companyStatus === 'request' ? 'Solicitar transferência' : 'Criar oportunidade'
    },
    showRedirect() {
      return this.userTeams.some((team) => team.id === this.formData.team_id)
    },
    hasMultipleTeams() {
      return this.userTeams.length > 1
    },
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        await this.setInicialData()
      }
    },
  },
  methods: {
    async setInicialData() {
      this.$v.$reset()
      this.selectedCompany = null
      this.detailsMessage = null
      this.companyStatus = null
      this.formData.pipeline_id = null
      if (!this.hasMultipleTeams) {
        this.formData.team_id = this.userTeam
      }
      this.formData.assigned_to_id = this.userInfo.id
      if (this.hasCompany) {
        this.selectedCompany = this.company
      }
    },
    async checkCompanyEligibility() {
      this.companyStatus = null
      if(this.formFilled) {
        this.isLoading = true
        const payload = {
          companies: [this.selectedCompany.cnpj],
          team_id: this.formData.team_id,
          pipeline_id: this.formData.pipeline_id,
          assigned_to_id: this.formData.assigned_to_id,
        }
        const { data } = await this.updateData(this.url.checkTransferEligibility, payload, { fireSuccessAlert: false })
        if (data?.length > 0) {
          this.handleEligibility(data[0])
        }
        this.isLoading = false
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      this.$v.selectedCompany.$touch()
      this.$v.reason.$touch()
      if (this.$v.formData.$error || this.$v.selectedCompany.$error || this.$v.reason.$error) return
      this.isSubmitting = true
      switch (this.companyStatus) {
      case 'available':
        await this.createOpportunity()
        break
      case 'request':
        await this.sendTransferRequest()
        break
      default:
        break
      }
      this.handleCancel()
      this.isSubmitting = false
    },
    async sendTransferRequest() {
      const dataPayload = {
        companys: [
          {
            identifier: this.selectedCompany.cnpj,
            name: this.selectedCompany.name,
          }
        ],
        pipeline_id: this.formData.pipeline_id,
        pipeline_name: this.pipelineName,
        assigned_to_id: this.formData.assigned_to_id,
        team_id: this.formData.team_id,
        team_name: this.teamName,
        reason: this.reason,
      }
      const payload = {
        submitter_team_id: this.formData.team_id,
        data: JSON.stringify(dataPayload),
      }
      await this.createItem('/csc/multiple-transfer', payload)
      this.$store.dispatch('Opportunity/refresh', true)
    },
    async createOpportunity() {
      const payload = {
        team_id: this.formData.team_id,
        companies: [this.selectedCompany.cnpj],
        pipeline_id: this.formData.pipeline_id,
        assigned_to_id: this.formData.assigned_to_id,
      }
      await this.createItem(this.url.transfer, payload)
      this.$store.dispatch('Opportunity/refresh', true)
    },
    handleCancel() {
      this.dialog = false
      this.isLoading = false
      this.detailsMessage = null,
      this.companyStatus = null,
      this.reason = null
      this.$v.$reset()
      if (!this.hasCompany) {
        this.$refs['companyAutocomplete'].clearCachedItems()
      }
    },
    handleEligibility(response) {
      const companyDetails = response.details.toLowerCase()
      const pipeline = response.pipeline ? response.pipeline : null
      switch (companyDetails) {
      case 'available':
        this.companyStatus = 'available'
        this.detailsMessage = `Empresa disponível para criação da oportunidade no funil ${this.pipelineName}.`
        break
      case 'already owned on remote system. skipping':
        this.companyStatus = 'request'
        this.detailsMessage = 'Esta empresa está reservada para outro time. Solicite a transferência da empresa e aguarde o resultado da análise.'
        break
      case 'request already exists':
        this.companyStatus = 'redirect'
        this.detailsMessage = 'A pessoa selecionada já solicitou a transferência desta empresa. Por favor, aguarde o resultado da análise.'
        break
      case 'already the same request for this team':
        this.companyStatus = 'redirect'
        this.detailsMessage = 'Alguém do time selecionado já solicitou a transferência desta empresa. Por favor, aguarde o resultado da análise.'
        break
      case 'company already owned for this team':
        this.companyStatus = 'available'
        this.detailsMessage = `
        A empresa já possui uma oportunidade ativa no funil ${pipeline} atribuída ao time selecionado.
        Deseja criar outra oportunidade?
        `
        break
      case 'company already owned by this user':
        this.companyStatus = 'available'
        this.detailsMessage = `
        A empresa já possui uma oportunidade ativa no funil ${pipeline} atribuída à pessoa selecionada.
        Deseja criar outra oportunidade?
        `
        break
      default:
        this.companyStatus = 'inform'
        this.detailsMessage = 'Falha no processamento'
        break
      }
    },
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
  .status-border{
    border-bottom: 2px dotted var(--v-stroke-base);
    border-top: 2px dotted var(--v-stroke-base);
  }
</style>