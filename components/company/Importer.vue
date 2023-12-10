<template>
  <div>
    <v-btn :fab="companiesUpload" color="secondary" class="mr-1" @click="dialog = !dialog">
      <v-icon>{{companiesTransfer ? 'mdi-swap-horizontal' : 'mdi-login'}}</v-icon>
      {{companiesUpload ? '' : (companiesTransfer ? 'Transferir' : 'Upload de Leads')}}
    </v-btn>
    <v-dialog v-model="dialog" persistent max-width="806">
      <v-card>
        <DialogHeader :title="renderTitle()" @onCancel="handleCancel()"/>
          <v-card-text class="pt-6">
            <v-form ref="form">
              <v-row v-if="config[feature].renderNameField">
                <v-col>
                  <v-text-field
                    hide-details
                    solo
                    flat
                    required
                    outlined
                    dense
                    disabled
                    :placeholder="companyName"
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row>
                <v-col xl="4">
                  <Autocomplete
                    label="Time"
                    outlined
                    dense
                    required
                    endpoint="/ecosystem/any-team"
                    query="order=level,id&strict=true"
                    :initial-value="formData.team_id"
                    :item-text="(item) => item && item.name? item.name : ''"
                    :postProcess="traverseFilter"
                    :error="$v.formData.team_id.$error"
                    :error-messages="
                      $v.formData.team_id.$error ? 'Esse campo é obrigatório' : ''
                    "
                    @valueSelected="(value) => {formData.team_id = value}"
                  ></Autocomplete>
                </v-col>
                <v-col xl="4">
                  <v-select
                    attach
                    label="Negócio"
                    hide-details
                    required
                    outlined
                    dense
                    item-text="name"
                    item-value="id"
                    v-model="formData.pipeline_id"
                    :items="pipelineList"
                    :error="$v.formData.pipeline_id.$error"
                    :error-messages="$v.formData.pipeline_id.$error ? 'Esse campo é obrigatório' : ''"
                  ></v-select>
                </v-col>
                <v-col xl="4">
                  <v-select
                    attach
                    label="Responsável"
                    hide-details
                    required
                    outlined
                    dense
                    item-text="name"
                    item-value="id"
                    v-model="formData.assigned_to_id"
                    :items="coworkers"
                  ></v-select>
                </v-col>
              </v-row>
              <v-row v-if="config[feature].renderAssociationTypeField">
                <v-col>
                  <Autocomplete
                    label="Tipo de associação"
                    hide-details
                    solo
                    flat
                    required
                    outlined
                    dense
                    endpoint="/customer/association-type"
                    :validate="$v.leadsAssociationType"
                    @valueSelected="(value) => {leadsAssociationType = value}"
                  ></Autocomplete>
                </v-col>
              </v-row>
              <v-row v-if="config[feature].renderUploadField">
                <v-col>
                  <DragNDropImporter @onFileRead="getLeads"/>
                  <div class="mt-1">
                    <span v-if="fileData.length > 0">{{`Quantidade de registros Carregados: ${fileData.length}`}}</span>
                  </div>
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <v-textarea
                    label="Observações"
                    no-resize
                    required
                    outlined
                    dense
                    v-model="formData.observations"
                  ></v-textarea>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
        <DialogAction class="align-end" :disable-submit="disableRequestButton" @submit="submitForm()" @cancel="handleCancel()" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import requiredIf from 'vuelidate/lib/validators/requiredIf'
import { mapGetters } from 'vuex'

export default {
  props: {
    itemId: Number,
    companyName: String,
    leadsUpload: {
      type: Boolean,
      default: false
    },
    companiesUpload: {
      type: Boolean,
      default: false
    },
    companiesTransfer: {
      type: Boolean,
      default: false
    },
    companiesToTransfer: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data: () => ({
    dialog: false,
    fileData: [],
    enhance: true,
    type: 'customer',
    payloadSent: false,
    responseReport: [],
    pipelineList: [],
    tabValue: 0,
    leadsAssociationType: null,
    config: {
      leadsUpload: {
        endpoint: '/customer/import-parnter-leads',
        renderAssociationTypeField: true,
        renderNameField: true,
        renderUploadField: true,
        renderTypeRadio: true,
        renderEnhanceRadio: true,
        setPayload: () => {}
      },
      companiesUpload: {
        endpoint: 'endpoint1',
        renderAssociationTypeField: false,
        renderNameField: false,
        renderUploadField: true,
        renderTypeRadio: true,
        renderEnhanceRadio: true,
        setPayload: () => {}
      },
      companiesTransfer: {
        endpoint: '/customer/transfer',
        renderAssociationTypeField: false,
        renderNameField: false,
        renderUploadField: false,
        renderTypeRadio: false,
        renderEnhanceRadio: false,
        setPayload: () => {}
      }
    },
    formData: {
      team_id: null,
      pipeline_id: null,
      assigned_to_id: null,
    },
    reportHeaders: [
      { name: 'CNPJ', value: 'identifier' },
      { name: 'Status', value: 'details' },
    ],
  }),
  validations: {
    formData: {
      team_id: { required },
      pipeline_id: { required },
    },
    leadsAssociationType: { required: requiredIf(function() { return this.leadsUpload }) }
  },
  computed: {
    ...mapGetters({
      company: 'Company/company',
      userTeams: 'userTeams',
      coworkers: 'coworkers',
      associationType: 'associationType',
      userInfo: 'userInfo',
    }),
    feature: function() {
      if (this.companiesUpload) {
        return 'companiesUpload'
      } else if (this.companiesTransfer) {
        return 'companiesTransfer'
      } else if (this.leadsUpload) {
        return 'leadsUpload'
      }
      return null
    },
    companiesReport: function () {
      if (this.payloadSent) {
        return this.responseReport.map((company) => ({
          identifier: this.maskCnpj(company.identifier),
          details: this.translateDetails(company.details)
        }))
      }
      return this.companiesToTransfer.map((company) => ({ identifier: company, details: 'Pendente' }))
    },
    disableRequestButton: function() {
      if (this.companiesToTransfer.length > 0 || this.fileData.length > 0) {
        return false
      }
      return true
    },
    tabItems: function() {
      const items = [
        { name: 'Solicitação', value: 'request', disabled: false },
      ]
      if (this.feature == 'companiesTransfer') {
        items.push({ name: 'Relatório', value: 'report', disabled: false })
      }
      return items
    }
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.setInicialData()
      }
    },
    'formData.team_id': async function(newValue) {
      if (newValue) {
        await this.$store.dispatch('fetchCoworkers', `team_id=${newValue}`)
        if (!this.coworkers.find((user) => user.id == this.formData.assigned_to_id)) {
          this.formData.assigned_to_id = null
        }
        const { data } = await this.$axios.get('/cash/team-pipelines?team_id=' + newValue)
        const pipelines = data
        if (pipelines) {
          pipelines.sort((a, b) => a?.name?.localeCompare(b?.name))
          this.pipelineList = pipelines
        } else {
          this.formData.pipeline_id = null
          this.pipelineList = []
        }
      }
    },
  },
  mounted() {
    this.configSetPayload()
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
    async setInicialData() {
      this.tabValue = 0
      this.$v.$reset()
      this.payloadSent = false
      this.formData.team_id = this.userTeams[0].id
      this.formData.assigned_to_id = this.userInfo.id
      // this.formData.partner_id = this.itemId
      // this.formData.enhance = true
      // this.formData.type = 'customer'
      await this.$store.dispatch('fetchAssociationType')
    },
    handleCancel() {
      this.fileData = []
      this.$refs.form.reset()
      this.dialog = false
    },
    async submitForm() {
      this.$v.formData.$touch()
      this.$v.leadsAssociationType.$touch()
      if (this.$v.formData.$error || this.$v.leadsAssociationType.$error) return
      try {
        this.formData = this.config[this.feature].setPayload()
        const response = await this.createItem(this.config[this.feature].endpoint, this.formData)
        if (response?.status == 'ok') {
          if (this.companiesTransfer) {
            this.responseReport = response.data
            this.payloadSent = true
            this.tabValue = 1
          }
          if (this.leadsUpload) {
            this.handleCancel()
          }
          this.$store.dispatch('BureauCompany/refresh', true)
          this.$store.dispatch('Company/refresh', true)
        }
      } catch (error) {
        console.log('entrou no erro', error)
      }
    },
    getLeads(fileData) {
      this.fileData = fileData
    },
    configSetPayload() {
      this.config.leadsUpload.setPayload = () => ({
        ...this.formData,
        leads: this.fileData,
        partner_id: this.itemId,
        association_type_id: this.leadsAssociationType,
        // enhance: this.enhance,
        // type: this.type,
      })
      this.config.companiesUpload.setPayload = () => ({
        ...this.formData,
        companies: this.fileData,
        enhance: this.enhance,
        type: this.type,
      })
      this.config.companiesTransfer.setPayload = () => ({
        ...this.formData,
        companies: this.companiesToTransfer,
      })
    },
    renderTitle() {
      if (this.leadsUpload) {
        return 'Upload de Empresas - Carteira de Parceiro'
      }
      if (this.companiesUpload) {
        return 'Upload de Empresas'
      }
      if (this.companiesTransfer) {
        return 'Transferência de Empresas'
      }
    },
    translateDetails(details) {
      if (details.includes('transferred')) {
        return 'Transferência efetuada com sucesso!'
      } else if (details.includes('owned')) {
        return 'Empresa ja possui responsável, transferência negada!'
      } else if (details.includes('failed')) {
        return 'Falha no processamento, transferência não efetuada!'
      }
      return details

    }
  }
}
</script>

<style>

</style>