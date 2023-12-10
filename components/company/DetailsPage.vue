<template>
  <div>
    <PageHeadline
      enable-copy
      :page-name="company.name"
      :page-group="pageGroup"
    />
    <v-row>
      <v-col>
        <v-card>
          <v-card-text class="d-flex justify-space-between align-center">
            <v-row>
              <v-col
                xl="6"
                lg="6"
                md="6"
                sm="12"
                cols="12"
                class="d-flex align-center"
              >
                <v-avatar
                  size="63"
                  rounded
                  color="primary"
                  class="mr-3 py-5 px-5"
                >
                  <h3 class="white--text">{{ firstLetter }}</h3>
                </v-avatar>
                <div>
                  <h6>{{ company.name }}</h6>
                  <p class="mb-0">{{ maskCnpj(company.identifier) }}</p>
                </div>
              </v-col>
              <v-col
                xl="6"
                lg="6"
                md="6"
                sm="12"
                cols="12"
                class="d-flex justify-center justify-sm-center justify-md-end align-center"
              >
                <div>
                  <div v-if="hasCompanyId" class="mb-3 d-flex">
                    <CompanyImporter
                      leads-upload
                      :item-id="company.id"
                      :company-name="company.name"
                    />
                    <CompanyTransfer
                      companies-transfer
                      :companies-to-transfer="companyToTransfer"
                    />
                  </div>
                  <div v-else class="mb-3 d-flex">
                    <v-btn
                      color="secondary"
                      :loading="companyLoading"
                      :disabled="companyLoading"
                      @click="handleCompanyCreate"
                    >
                      Habilitar Edição
                    </v-btn>
                  </div>
                  <p class="text-right mb-0">{{ company.partnership }}</p>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col xl="4" lg="4" md="5" sm="12" cols="12" class="fill-height">
        <v-card class="mb-6">
          <v-card-title class="d-flex justify-space-between align-center">
            Informações da Empresa
            <Sheet
              v-if="hasCompanyId"
              isEditing
              from-details
              title="Informações da Empresa"
              @submit="$refs.myForm.submitForm()"
              @cancel="$refs.myForm.handleCancel()"
            >
              <template v-slot="{ sheet, closed }">
                <CompanyForm
                  ref="myForm"
                  isEditing
                  :sheet="sheet"
                  @closeForm="closed"
                  :item-id="company.id"
                />
              </template>
            </Sheet>
          </v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item
                v-for="item in companyData"
                :key="item.label"
                class="d-flex justify-space-between align-center pl-0"
              >
                <v-row>
                  <v-col>
                    <label>{{ item.label }}</label>
                  </v-col>
                  <v-col>
                    <p class="mb-0">{{ item.value | truncate(40) }}</p>
                  </v-col>
                </v-row>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            Informações Comerciais
          </v-card-title>
          <v-card-text>
            <v-expansion-panels :mandatory='true'>
              <v-expansion-panel
                v-for="commercialDataItem, i in commercialData"
                :key="i"
              >
                <v-expansion-panel-header>
                  {{commercialDataItem[0].value}}
                </v-expansion-panel-header>
                <v-expansion-panel-content>
                  <v-list>
                    <v-list-item
                      v-for="item, j in commercialDataItem"
                      :key="j"
                      v-if="j > 0"
                      class="pl-0"
                    >
                      <v-row>
                        <v-col>
                          <label>{{ item.label }}</label>
                        </v-col>
                        <v-col>
                          <p class="mb-0">{{ item.value | truncate(40) }}</p>
                        </v-col>
                      </v-row>
                    </v-list-item>
                  </v-list>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col xl="8" lg="8" md="7" sm="12" cols="12" class="fill-height">
        <NewTimeline />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-expansion-panels>
          <CompanyBranch class="mb-3" />
          <OpportunityGroup
            class="mb-3"
            :show-form="hasCompanyId"
            :company-id="company.id"
            :company-tenant-id="tenantId"
          />
          <CompanyContact
            class="mb-3"
            :has-company-id="hasCompanyId"
            :company-id="company.id"
            :contacts="contacts"
            @updateData="getCompanyData"
          />
          <CompanyOpportunity
            class="mb-3"
            :has-company-id="hasCompanyId"
            :company-id="company.id"
            :company="company"
            :opportunities="opportunities"
            :company-has-team="hasTeam"
          />
          <CompanyProduct
            class="mb-3"
            :products="products"
            :company-id="company.id"
          />
          <CompanyAssociation
            class="mb-3"
            v-if="isPartnerType"
            :associations="associations"
          />
          <CompanyOpportunity
            v-if="isPartnerType"
            isRelated
            :has-company-id="hasCompanyId"
            :company-id="company.id"
            :related-opportunities="relatedOpportunities"
          />
        </v-expansion-panels>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    isPartnerDetails: Boolean,
    pageName: String,
    pageGroup: String,
  },
  data: () => ({
    companyIdentifier: null,
    companyId: null,
    companyLoading: false,
    companyQuery:
      'translateEnums=true' +
      '&also=association_l.right_side,association_l.association_type' +
      ',addresses,medias,contacts.contact_medias.media_type,contacts.contact,cnaes.cnae.cnae_class,memberships.team,contacts.contact_positions' +
      '&includes=opportunities.team,opportunities.assigned_to,opportunities.stage,opportunities.products.product',
    relatedOpportunities: [],
  }),
  computed: {
    ...mapGetters({
      company: 'Company/item',
      assignedTasks_api: 'Task/assignedTasks_api',
      contacts_api: 'Contact/contacts_api',
      partners_api: 'Partner/partners_api',
      opportunityRefresh: 'Opportunity/refreshData',
      companyRefresh: 'Company/refreshData',
      alertRefresh: 'Alert/alertRefresh',
    }),
    hasCompanyId: function () {
      if (this.companyId) {
        return true
      }
      return false
    },
    url: function () {
      if (this.hasCompanyId) {
        return 'customer/company'
      }
      return '/customer/official-data-by-identifier'
    },
    query: function () {
      if (this.hasCompanyId) {
        return `${this.companyQuery}&id=${this.companyId}`
      }
      return `identifier=${this.companyIdentifier}`
    },
    firstLetter: function () {
      const { name } = this.company || {}
      return name && name[0]
    },
    city: function () {
      const { addresses } = this.company || {}
      return addresses && `${addresses[0]?.city} - ${addresses[0]?.state}`
    },
    phone: function () {
      const { medias } = this.company || {}
      const phones = medias?.find((media) => media.type_id != 1)
      return phones && phones.value
    },
    tenantId: function () {
      const { tenant_id } = this.company || {}
      return tenant_id ? tenant_id : null
    },
    hasTeam: function () {
      return this.memberships?.length > 0
    },
    assignedTo: function () {
      if (this.opportunities) {
        const sortedOpportunities = this.opportunities
        return sortedOpportunities.sort((a, b) => b.id - a.id)[0]?.assigned_to
          ?.name
      }
      return ''
    },
    prevision: function () {
      if (this.opportunities) {
        var prevision = null
        const lastOpportunities =
          this.opportunities[this.opportunities.length - 1]
        if (lastOpportunities?.prevision) {
          prevision = this.$moment(lastOpportunities?.prevision).format(
            'DD/MM/YYYY'
          )
        } else {
          prevision = null
        }
      }
      return prevision
    },
    cnaeCode: function () {
      var code = null
      if (this.company) {
        const cnaes = this.company?.cnaes || []
        if (cnaes.length) {
          code = cnaes?.find((c) => c.is_main_cnae)?.cnae_code ?? cnaes?.at(0)?.cnae_code
        }
      }
      return code
    },
    companyToTransfer: function () {
      let r = []
      if (this.company) {
        r.push({
          cnpj: this.company?.identifier,
          name: this.company?.name,
          primary_cnae: this.company?.cnaes?.length
            ? this.company.cnaes[0].cnae_code
            : null,
        })
      }
      return r
    },
    companyData: function () {
      return [
        {
          label: 'Nome',
          value: this.company.name ? this.company.name : '--',
        },
        {
          label: 'CNAE',
          value: this.cnaeCode ? this.cnaeCode : '--',
        },
        {
          label: 'Enquadramento tributário',
          value: this.company.tax_model ? this.company.tax_model : '--',
        },
        {
          label: 'Status legal',
          value: this.company.legal_state ? this.company.legal_state : '--',
        },
        {
          label: 'Cidade/UF:',
          value: this.city == 'undefined - undefined' ? '--' : this.city,
        },
        {
          label: 'Telefone:',
          value: this.phone ? this.phone : '--',
        },
        {
          label: 'Site:',
          value: this.company.website ? this.company.website : '--',
        },
        {
          label: 'Health score:',
          value: this.company.health_score || '--',
        },
      ]
    },
    commercialData: function () {
      let commercialDataItems = []
      let opByTeam = {}

      if (this.memberships) {
        let opportunities = [...this.opportunities]
        opportunities.sort((a, b) => a.id - b.id)
        for(let op of opportunities) {
          opByTeam[op.team_id] = op 
        }
        
        for (let el of this.memberships.reverse()) {
          let relatedOp = opByTeam[el.team_id]
          let commercialDataItem = [
            {
              label: 'Equipe:',
              value: el?.team?.name || `# ${el.team_id}` 
            },
            {
              label: 'Data de reserva:',
              value: el.expiration? this.$moment(el.expiration).format('DD/MM/YYYY'):'--'
            },
            {
              label: 'Responsável:',
              value: relatedOp?.assigned_to?.name || '--'
            },
            {
              label: 'Status:',
              value: relatedOp?.status || '--'
            },
            {
              label: 'Prev. Fechamento:',
              value: relatedOp?.prevision ? this.$moment(relatedOp?.prevision).format('DD/MM/YYYY'):'--'
            },
          ] 
          commercialDataItems.push(commercialDataItem)
        }
      }
      else {
        commercialDataItems.push(['Equipe', 'Data de reserva', 'Responsável', 'Status', 'Prev. Fechamento'].map(el => {
          return {
            label: `${el}:`,
            value: '--'
          }
        }))
      }
  
      return commercialDataItems
    },
    contacts: function () {
      return this.company?.contacts?.map((contact) => {        
        contact.contact.contact_medias = contact.contact_medias
        contact.contact.position = contact.contact_positions?.at(-1)?.position

        return contact.contact
      })
    },
    opportunities: function () {
      const { opportunities } = this.company || {}
      return opportunities && opportunities
    },
    memberships: function () {
      const { memberships } = this.company || {}
      return memberships && memberships
    },
    products: function () {
      return (
        this.opportunities &&
        this.opportunities.map(({ products }) => products).flat()
      )
    },
    associations: function () {
      const { association_l } = this.company || {}
      return association_l && association_l
    },
    isPartner: function () {
      const { partnership } = this.company || {}
      if (partnership == 'Parceiro') {
        return true
      }
      return false
    },
    isCustomer: function () {
      const { state } = this.company || {}
      if (state == 'Cliente') {
        return true
      }
      return false
    },
    isPartnerType: function () {
      const { partnership } = this.company || {}
      const types = ['Parceiro', 'Parceiro em potencial']
      return types.some((type) => type == partnership)
    },
  },
  watch: {
    opportunityRefresh(newValue) {
      if (newValue) {
        this.getData()
        this.refreshOpportunityData(false)
      }
    },
    companyRefresh(newValue) {
      if (newValue) {
        this.getData()
        this.refreshCompanyData(false)
      }
    },
    assignedTasks_api(newValue) {
      if (newValue.dataUpdate) {
        this.getData()
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: false })
      }
    },
    contacts_api(newValue) {
      if (newValue.dataUpdate) {
        this.getData()
        this.$store.commit('Contact/CONTACTS_API', { dataUpdate: false })
      }
    },
    partners_api(newValue) {
      if (newValue.dataUpdate) {
        this.getData()
        this.$store.commit('Partner/PARTNERS_API', { dataUpdate: false })
      }
    },
    url() {
      this.getData()
    },
    alertRefresh(newValue) {
      if (newValue.dataUpdateByLeadImport) {
        this.getData()
        this.$store.commit('Alert/SET_ALERTS_REFRESH', {
          dataUpdateByLeadImport: false,
        })
      }
    },
  },
  created() {
    this.companyIdentifier = this.$route.params['identifier']
    this.companyId = this.$route.query['company_id']
  },
  mounted() {
    this.$store.commit('Opportunity/FETCH_INITIAL_OPPORTUNITYS', [])
    this.resetCompany({})
    if (!this.hasCompanyId) {
      this.getData()
    }
  },
  methods: {
    ...mapActions({
      getCompany: 'Company/fetchItem',
      refreshCompanyData: 'Company/refresh',
      resetCompany: 'Company/resetItem',
      refreshOpportunityData: 'Opportunity/refresh',
    }),
    async getData() {
      if (this.hasCompanyId) {
        await Promise.all([
          this.getCompany({ url: this.url, query: this.query }),
          this.getOpportunities(),
          this.getRelatedOpportunities(),
        ])
      } else {
        await this.getCompany({ url: this.url, query: this.query })
      }
      this.companyLoading = false
    },
    async getOpportunities() {
      await this.$store.dispatch(
        'Opportunity/fetchInitialOpportunitys',
        `also=tasks.type.media_type,op_log.owner,op_log.stage,products.product&includes=team,customer,contact,stage&customer_id=${this.companyId}`
      )
    },
    async getRelatedOpportunities() {
      const { data } = await this.getList(
        '/cash/opportunity',
        `translateEnums=true&includes=team,customer,contact,products.product,stage&partner_id=${this.companyId}`
      )
      this.relatedOpportunities = data
    },
    async getCompanyData() {
      await this.getCompany({ url: this.url, query: this.query })
    },
    async handleCompanyCreate() {
      try {
        this.companyLoading = true
        const {
          data: { data },
        } = await this.$axios.put(
          `/customer/official-data-by-identifier?identifier=${this.companyIdentifier}`
        )
        const [company] = data
        const { name, params, query } = this.$route
        this.$router.replace({
          name,
          params,
          query: { ...query, company_id: company.id },
        })
        this.companyId = company.id
      } catch (error) {
        this.companyLoading = false
        console.log('error', error)
      }
    },
  },
}
</script>

<style scoped>
.fix-space-between-checkbox {
  margin-top: -21px;
}
</style>