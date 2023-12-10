<template>
  <div>
    <v-tabs
      hide-slider
      height="36"
      active-class="v-tab-secondary-active"
      class="mb-2 text-capitalize"
      v-model="tab"
    >
      <v-tab
        v-for="oppTab in opportunityTabs"
        active-class="v-tab-secondary-active"
        class="d-flex flex-row v-tab-secondary mx-1"
        :key="oppTab.value"
      >
        <span class="text-none font-body-medium">{{oppTab.title}}</span>
      </v-tab>
    </v-tabs>

      <v-tabs-items v-model="tab" class="tab-content-container">
        <v-tab-item
          eager
          href="#tab-1"
          class="mr-1"
        >
          <section>
            <v-row>
              <v-col cols="5">
                <section class="infos-container pl-4 pt-2 pr-2 pb-2 mb-4 font-body-medium">
                  <div class="d-flex justify-space-between mb-2">
                    <b class="font-body-large font-weight-bold">Oportunidade</b>
                    <v-icon color="primary" class="material-icons-round" @click="redirectToOpportunity">launch</v-icon>
                  </div>
                  <div class="d-flex mb-2">
                    <span>ID da oportunidade&nbsp;</span>
                    <b>{{ generalInfo.id }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Data de criação&nbsp;</span>
                    <b>{{ generalInfo.created_at }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Etapa atual&nbsp;</span>
                    <b>{{ generalInfo.stage }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Temperatura&nbsp;</span>
                    <b>
                      {{generalInfo.temperature == null ? 'Não informado' : generalInfo.temperature}}
                    </b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Previsão de fechamento&nbsp;</span>
                    <b>{{ generalInfo.close_at }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Origem&nbsp;</span>
                    <b>{{generalInfo.origin ? generalInfo.origin : 'Não informado'}}</b>
                  </div>
                </section>
                <section class="infos-container pl-4 pt-2 pr-2 pb-2 font-body-medium">
                  <div class="d-flex mb-2">
                    <b class="font-body-large font-weight-bold">Concorrente</b>
                  </div>
                  <div v-for="competitor in opportunityCompetitors" :key="competitor.id" class="d-flex mb-2">
                    <b>{{ competitor.name }}</b>
                  </div>
                </section>
              </v-col>
              <v-col cols="7">
                <section class="infos-container pl-4 pt-2 pr-2 pb-2 font-body-medium">
                  <div class="d-flex justify-space-between mb-2">
                    <b class="font-body-large font-weight-bold">Empresa Principal</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Nome&nbsp;</span>
                    <a class="font-weight-bold" @click="redirectToCompany(opportunityCompany)">{{ opportunityCompany.name || 'Não informado' }}</a>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Razão Social&nbsp;</span>
                    <b>{{ opportunityCompany.legalName || 'Não informado' }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>CNPJ&nbsp;</span>
                    <b>{{ maskCnpj(opportunityCompany.identifier) || 'Não informado' }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Porte&nbsp;</span>
                    <b>
                      {{opportunityCompany.size || 'Não informado'}}
                    </b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Nº de funcionários&nbsp;</span>
                    <b>{{ opportunityCompany.nbr_employess || 'Não informado' }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Receita anual&nbsp;</span>
                    <b>{{ `R$ ${maskMoney('pt-br', opportunityCompany.year_revenue)}` || 'Não informado' }}</b>
                  </div>
                  <div class="d-flex mb-2">
                    <span>Última atualização&nbsp;</span>
                    <b>{{ $moment(`${opportunityCompany.updated_at}Z`).format('DD/MM/YYYY') || 'Não informado' }}</b>
                  </div>
                  <div class="d-flex justify-space-between mb-2 mt-1">
                    <b class="font-body-large font-weight-bold">{{`Empresas da Oportunidade (${aggregateCompanies.length})`}}</b>
                  </div>
                  <div v-for="company in aggregateCompanies" :key="company.id" class="d-flex mb-2">
                    <a class="font-weight-bold" @click="redirectToCompany(company)">{{ company.name || 'Não informado' }}&nbsp;</a>
                    <b>{{ maskCnpj(company.identifier) || 'Não informado' }}</b>
                  </div>
                </section>
              </v-col>
            </v-row>
          </section>
        </v-tab-item>
        <v-tab-item
          eager
          href="#tab-2"
          class="mr-1"
        >
          <section>
            <v-data-table
              :headers="headerArray"
              :items="opportunityContacts"
              hide-default-footer
              item-key="id"
              class="elevation-1"
            >
              <template v-slot:item[name]="{ item }"
              >
                {{ item.name.toUpperCase() }}
              </template>
            </v-data-table>
          </section>
        </v-tab-item>
        <v-tab-item
          eager
          href="#tab-3"
          class="mr-1"
        >
          <section>
            <v-list two-line dense>
              <v-list-item v-for="(item, index) in companiesList" :key="index" class="px-0">
                <v-list-item-content class="">
                  <div>
                    <v-row v-if="opportunity.products.length > 0 && index === 0">
                      <v-col xl="2" offset-xl="4" lg="2" offset-lg="3">
                        <span>Produto</span>
                      </v-col>
                      <v-col xl="2" lg="3">
                        <span>Tipo</span>
                      </v-col>
                      <v-col xl="2" lg="2">
                        <span>Com recorrência</span>
                      </v-col>
                      <v-col xl="2" lg="2">
                        <span>Sem recorrência</span>
                      </v-col>
                    </v-row>
                    <v-row class="company-item mt-1">
                      <v-col xl="4" lg="3">
                        <div class="d-flex flex-column">
                          <span class="font-body-medium mb-1">{{item.name}}</span>
                          <span class="font-body-medium">
                            {{ maskCnpj(item.identifier) }}
                          </span>
                        </div>
                      </v-col>
                      <v-col v-if="item.products && item.products.length > 0" xl="2" lg="2">
                        <div class="d-flex flex-column">
                          <span
                            v-for="product in item.products"
                            :key="product.id"
                            class="font-body-medium align-center mb-2"
                            v-tooltip="{
                              content: product.product.name.length > 8 ? `
                                <div class='v-btn-tooltip'>
                                      ${product.product.name} (${product.amount})
                                </div>
                                ` : null,
                              placement: 'bottom-center',
                            }"
                          >
                            {{`${product.product.name} (${product.amount})` | truncate(13)}}
                          </span>
                        </div>
                      </v-col>
                      <v-col xl="2" lg="3">
                        <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                          <span v-for="product in item.products" :key="product.id" class="font-body-medium align-center mb-2">
                            {{getProductCadenceName(product.extra, product)}}
                          </span>
                        </div>
                      </v-col>
                      <v-col xl="2" lg="2">
                        <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                          <span v-for="product in item.products" :key="product.id" class="font-body-medium align-center mb-2">
                            <template v-if="product.product.payment == 'mixed'">
                              {{`R$ ${maskMoney('pt-br', product.amount * product.recurring_value)}`}}
                            </template>
                            <template v-else>
                              {{product.product.payment === 'recurring' ? `R$ ${maskMoney('pt-br', product.amount * product.value * getProductCadenceValue(product.extra))}` : '-'}}
                            </template>
                          </span>
                        </div>
                      </v-col>
                      <v-col xl="2" lg="2">
                        <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                          <span v-for="product in item.products" :key="product.id" class="font-body-medium align-center mb-2">
                            <template v-if="product.product.payment == 'mixed'">
                              {{`R$ ${maskMoney('pt-br', product.amount * product.oneshot_value)}`}}
                            </template>
                            <template v-else>
                              {{product.product.payment !== 'recurring' ? `R$ ${maskMoney('pt-br', product.amount * product.value)}` : '-'}}
                            </template>
                          </span>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row v-if="opportunity.products.length > 0 && index === (companiesList.length-1)" class="total-container">
                      <v-col xl="3" offset-xl="5" lg="4" offset-lg="4">
                      </v-col>
                      <v-col xl="2" lg="2">
                        <span class="font-body-medium align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', recurringTotalValue)}`}}</span>
                      </v-col>
                      <v-col xl="2" lg="2">
                        <span class="font-body-medium align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', oneshotTotalValue)}`}}</span>
                      </v-col>
                    </v-row>
                  </div>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </section>
        </v-tab-item>
      </v-tabs-items>
  </div>
</template>

<script>
export default {
  props: {
    opportunityId: { type: [Number, String] }
  },
  data: () => ({
    tab: 0,
    payloadData: null,
    opportunity: {
      company: {
        contacts: [],
      },
      aggregates: [
        {
          company: {
            contacts: {},
          },
        },
      ],
      products: [],
      competitors: [],
      origin: {
        name: null
      }
    },
    companiesProducts: {},
    opportunityTabs: [
      { title: 'Informações', value: 'info'},
      { title: 'Contato', value: 'contact'},
      { title: 'Produtos', value: 'products'},
    ],
    headerArray: [
      {
        text: 'Nome',
        align: 'start',
        value: 'name',
      },
      { text: 'Telefone', value: 'phone' },
      { text: 'E-mail', value: 'mail' },
    ],
  }),
  computed: {
    generalInfo() {
      if (this.opportunity) {
        return {
          id: this.opportunity.id,
          created_at: new Date(this.opportunity.created_at).toLocaleDateString(),
          stage: this.opportunity.stage?.name,
          temperature: this.opportunity.temperature,
          close_at: new Date(this.opportunity.prevision).toLocaleDateString('pt-BR'),
          origin: this.opportunity?.origin?.name,
        }
      } else {
        return {
          id: null,
          created_at: null,
          stage: null,
          temperature: null,
          origin: null,
        }
      }
    },
    opportunityContacts: function() {
      const aggregateContacts = [].concat.apply([], this.opportunity.aggregates.contacts)
      const contacts = [...this.opportunity.company.contacts, ...aggregateContacts]
      const opportunityContacts = contacts.map(({ contact }) => {
        const phone = contact.medias.find((media) => media.media_type.base === 'Celular')
        const mail = contact.medias.find((media) => media.media_type.base === 'E-mail')
        return {
          ...contact,
          phone: phone ? phone.value : '-',
          mail: mail ? mail.value : '-',
        }
      })
      return opportunityContacts
    },
    companiesList: function() {
      const companies = this.opportunity.aggregates.map(({ company }) => company)
      const list = [this.opportunity.company, ...companies].map((company) => ({
        ...company,
        products: this.companiesProducts[company.id] ? this.companiesProducts[company.id] : []
      }))
      return list
    },
    recurringTotalValue: function() {
      let recurringTotalValue = 0
      this.opportunity.products.forEach((product) => {
        if (product.product.payment === 'Recorrente') {
          recurringTotalValue += product.amount * product.value * this.getProductCadenceValue(product.extra)
        }
        else if (product.product.payment === 'mixed') {
          recurringTotalValue += product.amount * product.recurring_value
        }
      })
      return recurringTotalValue
    },
    oneshotTotalValue: function() {
      let oneshotTotalValue = 0
      this.opportunity.products.forEach((product) => {
        if (product.product.payment === 'Único') {
          oneshotTotalValue += product.amount * product.value
        }
        else if (product.product.payment === 'mixed') {
          oneshotTotalValue += product.amount * product.oneshot_value
        }
      })
      return oneshotTotalValue
    },
    opportunityCompany: function() {
      const company = this.opportunity.company
      if (company) {
        return company
      }
      return {}
    },
    aggregateCompanies: function() {
      const companies = this.opportunity.aggregates.map(({ company }) => company)
      if (companies.length > 0) {
        return companies
      }
      return []
    },
    opportunityCompetitors: function() {
      const competitor = this.opportunity?.competitors.map(({ competitor }) => competitor)
      if (competitor.length > 0) {
        return competitor
      }
      return []
    },
  },
  watch: {
    opportunityId(newValue) {
      this.getOpportunity(newValue)
    }
  },
  mounted() {
    this.getOpportunity(this.opportunityId)
  },
  methods: {
    async getOpportunity(id) {
      if (id) {
        const endpoint = '/cash/opportunity'
        const params = new URLSearchParams()
        params.append('translateEnums', 'true')
        params.append('includes', 'company.contacts.contact.medias.media_type,stage,origin')
        params.append('also', 'products.product,aggregates.company.contacts.contact.medias.media_type,competitors.competitor')
        params.append('id', id)
        try {
          const task = await this.getItem(endpoint, params, { throwError: true })
          this.getCompaniesProducts(id)
          const { data: companiesProducts } = await this.getList('/cash/products-by-customer', `includes=product&opportunity_id=${id}`)
          this.companiesProducts = companiesProducts
          this.opportunity = task
        } catch (error) {
          console.log(error)
        }
      }
    },
    async getCompaniesProducts(id) {
      if (id) {
        const endpoint = '/cash/products-by-customer'
        const params = new URLSearchParams()
        params.append('includes', 'product')
        params.append('also', 'products.product,aggregates.company.contacts.contact.medias.media_type')
        params.append('opportunity_id', id)
        try {
          const { data: companiesProducts } = await this.getList(endpoint, params, null, { throwError: true })
          this.companiesProducts = companiesProducts
        } catch (error) {
          console.log(error)
        }
      }
    },
    getProductCadenceValue(extra) {
      const cadence = this.checkProductCadence(extra)
      return cadence ? cadence.value : 1
    },
    getProductCadenceName(extra, product) {
      const cadence = this.checkProductCadence(extra)
      if (product.product.payment === 'oneshot') {
        return 'Sem recorrência'
      }
      return cadence ? cadence.name : '-'
    },
    checkProductCadence(productExtra) {
      try {
        if (productExtra) {
          const extra = JSON.parse(productExtra)
          if (extra?.activation_fields?.billing_cadence?.value) {
            const cadenceIdentifier = extra.activation_fields.billing_cadence.value
            const cadence = extra.activation_fields.billing_cadence.items.find((item) => item.identifier === cadenceIdentifier)
            return cadence
          }
        }
        return null
      } catch (error) {
        return null
      }
    },
    redirectToOpportunity() {
      const { params, query } = this.$route
      const redirectRoute = this.$router.resolve({
        name: 'business-opportunity-item-id',
        params: { item: 'router', id: this.opportunityId, ...params },
        query
      })
      window.open(redirectRoute.href, '_blank')
    },
    redirectToCompany(company) {
      const { identifier, id } = company
      const { params } = this.$route
      const redirectRoute = this.$router.resolve({
        name: 'business-companies-item-identifier',
        params: { item: 'router', identifier, ...params },
        query: { company_id: id }
      })
      window.open(redirectRoute.href, '_blank')
    },
  }
}
</script>

<style lang="scss" scoped>
  .infos-container {
    border: 0.8px solid var(--v-stroke-base);
    border-radius: 8px;
  }
  .total-container {
    background-color: rgba(245, 245, 245, 0.5);
    border-top: 0.8px solid var(--v-stroke-base);
    border-radius: 0px;
  }
  .company-item {
    border-top: 0.8px solid var(--v-shape-lighten2);
  }
  .tab-content-container {
    overflow-y: auto;
    height: 60vh;
    @include thin-scrollbar;
  }
</style>