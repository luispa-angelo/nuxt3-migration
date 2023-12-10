<template>
  <v-expansion-panels>
    <v-expansion-panel class="mb-5">
      <v-expansion-panel-header expand-icon="" disable-icon-rotate>  
        <template v-slot:default>
          <div class="w-100 d-flex justify-start align-center">
            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
            <p class="mb-0">Informações da Oportunidade</p>
          </div>
        </template>
        <template v-slot:actions>
          <v-btn @click="linkToOpp(generalInfo.id)" color="secondary" fab>
            <v-icon color="primary">
              mdi-open-in-new
            </v-icon>
          </v-btn>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div class="d-flex">
          <b>ID da oportunidade:&nbsp;</b>
          <span>{{ generalInfo.id }}</span>
        </div>
        <div class="d-flex">
          <b>Data de criação:&nbsp;</b>
          <span>{{ generalInfo.created_at }}</span>
        </div>
        <div class="d-flex">
          <b>Fase:&nbsp;</b>
          <span>{{ generalInfo.stage }}</span>
        </div>
        <div class="d-flex">
          <b>Temperatura:&nbsp;</b>
          <span
            >{{
              generalInfo.temperature == null ? "Não informado" : generalInfo.temperature
            }}°</span
          >
        </div>
        <div class="d-flex">
          <b>Previsão de fechamento:&nbsp;</b>
          <span>{{ generalInfo.close_at }}</span>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel class="mb-5">
      <v-expansion-panel-header expand-icon="" disable-icon-rotate>
        <template v-slot:default>
          <div class="w-100 d-flex justify-start align-center">
            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
            <p class="mb-0">Dados da Empresa</p>
          </div>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div class="d-flex flex-row">
          <b>Nome da empresa:&nbsp;</b>
          <span>{{ company.name }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>Razão social:&nbsp;</b>
          <span>{{ company.legalName }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>CNPJ:&nbsp;</b>
          <span>{{ company.identifier }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>Porte:&nbsp;</b>
          <span>{{ company.size }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>N° de funcionários:&nbsp;</b>
          <span>{{ company.nbr_employess }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>Receita anual:&nbsp;</b>
          <span>{{ company.year_revenue }}</span>
        </div>
        <div class="d-flex flex-row">
          <b>Última atualização:&nbsp;</b>
          <span>{{ company.updated_at }}</span>
        </div>
      </v-expansion-panel-content>
    </v-expansion-panel>

    <OpportunityContact
      class="mb-5"
      :list="contactList"
      :opportunity="opportunity"
      :company-id="company.id"
      :showForm="false"
    />
    <OpportunityProduct
      class="mb-5"
      :opportunity-id="opportunity.id"
      :company="company"
      :removeShadow="false"
      :showForm="false"
    />
    <OpportunityCompetitor :opportunity="opportunity" :list="competitorList" :showForm="false"/>
  </v-expansion-panels>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    taskId: Number,
    opportunity: {
      type: Object,
      default: null
    },
  },
  data: () => ({
    task: {},
    productsList: [],
    contactList: null,
    mediaValue: null,
    contact: {},
    products: [],
    competitorList: [],
    redirectOppTo: 'business-opportunity-item-id',
  }),
  computed: {
    ...mapGetters({
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta',
    }),
    generalInfo() {
      if (this.opportunity) {
        return {
          id: this.opportunity.id,
          created_at: new Date(this.opportunity.created_at).toLocaleDateString(),
          stage: this.opportunity.stage?.name,
          temperature: this.opportunity.temperature,
          close_at: new Date(this.opportunity.prevision).toLocaleDateString('pt-BR'),
        }
      } else {
        return {
          id: null,
          created_at: null,
          stage: null,
          temperature: null,
          close_at: null,
        }
      }
    },
    company() {
      if (this.opportunity) {
        return {
          name: this.opportunity.customer?.name,
          legalName: this.opportunity.customer?.legalName,
          identifier: this.maskCnpj(this.opportunity.customer?.identifier),
          size: this.getEnum(this.opportunity.customer?.size, this.meta.companySize),
          nbr_employess: this.opportunity.customer?.nbr_employess
            ? this.opportunity.customer?.nbr_employess
            : 'Não informado',
          year_revenue:
          this.opportunity.customer?.year_revenue !== null
            ? `R$${this.maskMoney('pt-br', this.opportunity.customer?.year_revenue)}`
            : 'Não informado',
          updated_at: new Date(this.opportunity.customer?.updated_at).toLocaleDateString(),
        }
      } else {
        return {
          name: null,
          legalName: null,
          identifier: null,
          size: null,
          nbr_employess: null,
          year_revenue: null,
          updated_at:null,
        }
      }
    }
  },
  watch: {
    async opportunity(newValue) {
      if (newValue) {
        await this.loadData()
        await this.getContacts()
        await this.getCompetitor()
      }
    },
    dialog(newValue) {
      if (newValue) {
        this.loadData()
      }
    },
  },
  methods: {
    async loadData() {
      this.getTaskData()
    },
    async getTaskData() {
      this.task = await this.getItem(
        'cash/task',
        `includes=contact.medias,assigned_to,logs,type.media_type,opportunity.customer,logs,template&id=${this.taskId}`
      )
    },
    async getOpportunityData() {

      const created = new Date(this.opportunity.created_at)
      this.dateLabel = created.toLocaleDateString()
      this.partner = this.opportunity.partner

    },
    async getContacts() {
      const { contact } = this.opportunity
      if (contact) {
        const contacts = [contact]
        if (contact.medias) {
          this.contactList = contacts.map((item) => {
            const media = item.medias.find((media) => media.type_id != 1)
            media && (this.mediaValue = media.value)
            return {
              id: item.id,
              title_1: item.name,
              subtitle_1: this.mediaValue,
            }
          })
        }
      }
    },
    async getCompetitor() {
      const { competitors } = this.opportunity
      console.log('competitors', competitors)
      if(competitors) {
        this.competitorList = competitors.map((item) => {
          return {
            opportunity_id: item.opportunity_id,
            id: item.competitor_id,
            title_1: item.competitor.name,
          }
        })

      }
    },
    linkToOpp(id) {
      const { params, query } = this.$route
      this.$router.push({
        name: `${this.redirectOppTo}`,
        params: { ...params, id },
        query: { ...query, complement: this.routeComplement },
      })
    },
  },
}
</script>
