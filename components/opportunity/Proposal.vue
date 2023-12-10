<template>
  <v-expansion-panels v-model="expansionPanel">
    <v-expansion-panel :disabled="opportunityActivated" class="v-expansion-panel-no-shadow">
      <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionOpportunityProposalCreate">
        <template v-slot:default>
          <div class="d-flex justify-start align-center">
            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
            <p class="mb-0">Criar nova proposta</p>
          </div>
        </template>
        <template v-slot:actions>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <div v-if="lastInvoiceIndex && !opportunityActivated">
        <span>
          {{`Utilize como base a última proposta negociada (#${lastInvoiceIndex}) ou`}}
        </span>
        <a data-test="linkOpportunityProposalClear" @click="clearProducts">crie uma nova proposta.</a>
        </div>
        <v-list two-line dense>
          <v-list-item v-for="(item, index) in companiesList" :key="index" class="px-0">
            <v-list-item-content class="">
              <div>
                <v-row v-if="opportunityProducts.length > 0 && index === 0">
                  <v-col xl="2" offset-xl="3" lg="2" offset-lg="2">
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
                  <v-col xl="1" lg="1">
                  </v-col>
                </v-row>
                <v-row class="company-item mt-1">
                  <v-col xl="3" lg="2">
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
                  <v-col v-else xl="5" lg="5">
                    <div>
                      <OpportunityNewProductForm
                        v-if="!opportunityActivated"
                        tab="proposta"
                        :company="item"
                        :opportunity="opportunity"
                        :opportunity-activated="opportunityActivated"
                        :has-invoice-pending="hasInvoicePending"
                        @updateProducts="getProducts(opportunityId)"
                      />
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
                  <v-col xl="1" lg="1" class="px-0">
                    <div v-if="item.products && item.products.length > 0" class="d-flex justify-start flex-column">
                      <OpportunityNewProductForm
                        v-if="!opportunityActivated"
                        edit-mode
                        tab="proposta"
                        :company="item"
                        :opportunity="opportunity"
                        :has-invoice-pending="hasInvoicePending"
                        @updateProducts="getProducts(opportunityId)"
                      />
                    </div>
                  </v-col>
                </v-row>
                <v-row v-if="opportunityProducts.length > 0 && index === (companiesList.length-1)" class="total-container">
                  <v-col xl="3" offset-xl="4" lg="3" offset-lg="4">
                  </v-col>
                  <v-col xl="2" lg="2">
                    <span class="font-body-medium align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', recurringTotalValue)}`}}</span>
                  </v-col>
                  <v-col xl="2" lg="2">
                    <span class="font-body-medium align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', oneshotTotalValue)}`}}</span>
                  </v-col>
                  <v-col xl="1" lg="1">
                  </v-col>
                </v-row>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        <v-divider class="mb-4"></v-divider>
        <v-form ref="invoice-form">
          <v-row>
            <v-col xl="5" lg="5">
              <div class="d-flex flex-column">
                <Autocomplete
                  clearable
                  outlined
                  dense
                  data-test="selectOpportunityProposalTemplate"
                  label="Template"
                  endpoint="/cash/template"
                  :query="`includes=media_type&media_type.base=invoice`"
                  item-value="id"
                  item-text="name"
                  @valueSelected="(value) => { invoiceData.template_id = value }"
                ></Autocomplete>
                <Autocomplete
                  clearable
                  outlined
                  dense
                  data-test="selectOpportunityProposalContact"
                  label="Contato"
                  endpoint="/customer/company-contact"
                  :query="`includes=contact&company_id=${opportunity.customer_id}`"
                  item-value="contact_id"
                  item-text="contact.name"
                  @valueSelected="(value) => { invoiceData.contact_id = value }"
                ></Autocomplete>
              </div>
            </v-col>
            <v-col xl="7" lg="7">
              <v-textarea
                hide-details
                dense
                outlined
                data-test="inputOpportunityProposalDescription"
                label="Descrição"
                v-model="invoiceData.details"
              >
              </v-textarea>
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-end">
              <OpportunityDiscountRequestForm
                v-if="productsWithDiscountToAprove.length > 0"
                :companies-products="productsWithDiscountToAprove"
                :opportunity-id="opportunityId"
                :invoice-data="invoiceData"
                :disable-forms="disableDiscountForms"
                @onRequestSent="handleInvoiceUpdate"
              />
              <v-btn
                v-else
                data-test="btnOpportunityProposalCreate"
                color="primary"
                class="mb-5"
                :disabled="disableDiscountForms"
                :loading="sendingRequest"
                @click="createInvoice"
              >
                Criar
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-expansion-panel-content>
    </v-expansion-panel>
    <v-expansion-panel class="v-expansion-panel-no-shadow" @change="reloadInvoices">
      <v-expansion-panel-header disable-icon-rotate expand-icon="" data-test="accordionOpportunityProposalView">
        <template v-slot:default>
          <div class="w-100 d-flex justify-start align-center">
            <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
            <p class="mb-0">Propostas ({{ invoicesCounter }})</p>
          </div>
        </template>
        <template v-slot:actions>
        </template>
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-list v-if="hasInvoices" two-line dense>
          <v-list-item v-for="(item, index) in invoices" :key="index">
            <v-list-item-content>
              <v-list-item-title class="d-flex font-body-large mb-0">
                <span class="align-self-center">{{`Proposta ${(10 > item.index + 1) ? `0${item.index + 1}` : item.index + 1}`}}</span>
                <OpportunityProposalView :invoice="item" />
                <a v-if="enableShareInvoice(item.status)" class="align-self-center link-item" target="_blank" href="" @click="handleRedirectInvoice($event, item)">
                  <v-icon color="primary">mdi-open-in-new</v-icon>
                </a>
              </v-list-item-title>
              <v-list-item-subtitle class="font-body-medium mb-2">
                <span>
                  {{ `ID ${item.id} | Responsável: ${item.user_name ? item.user_name : '--'} | Data: ${$moment(item.created_at).format('L')}` }}
                </span>
              </v-list-item-subtitle>
            </v-list-item-content>
            <v-list-item-action>
              <v-btn
                v-if="enableShareInvoice(item.status)"
                data-test="btnOpportunityProposalShare"
                text
                class="primary--text"
                @click="handleShareInvoice(item)"
              >
                Compartilhar
              </v-btn>
              <span v-else-if="item.status === 'rejected'" class="sub-text--text">Rejeitada</span>
              <span v-else class="warning--text">Pendente de aprovação</span>
            </v-list-item-action>
          </v-list-item>
        </v-list>
        <div v-else class="w-100 text-center">
          Nenhuma proposta gerada.
        </div>
        <v-dialog v-model="shareInvoice.dialog" max-width="464" persistent>
          <v-card>
            <DialogHeader :title="`Proposta #${shareInvoice.invoiceId}`" @onCancel="closeShareInvoice" />
            <v-card-text class="text-center pt-5">
              <v-progress-circular v-if="shareInvoice.gettingUrl" indeterminate></v-progress-circular>
              <v-text-field
                v-else
                data-test="inputOpportunityProposalCreate"
                ref="clipboard"
                dense
                outlined
                readonly
                v-model="shareInvoice.url"
              ></v-text-field>
            </v-card-text>
            <v-card-actions class="justify-end">
              <v-btn color="secondary">
                <a data-test="linkOpportunityProposalView" class="link-item" target="_blank" :href="shareInvoice.url">Visualizar</a>
              </v-btn>
              <v-btn data-test="btnOpportunityProposalCopy" class="ml-2" color="primary" @click="copyToClipboard">Copiar link</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    itemId: [String, Number],
    opportunity: Object,
    opportunityActivated: Boolean,
    aggregateCompanies: Array
  },
  data: () => ({
    companiesProducts: {},
    invoiceData: {
      opportunity_id: null,
      template_id: null,
      media_id: null,
      contact_id: null,
      details: null,
      verify: false,
    },
    invoices: [],
    shareInvoice: {
      url: null,
      invoiceId: null,
      dialog: false,
      gettingUrl: false,
    },
    recurringTotalValue: 0,
    oneshotTotalValue: 0,
    sendingRequest: false,
    expansionPanel: null,
  }),
  computed: {
    ...mapGetters({
      opportunityProducts: 'Opportunity/opportunityProducts',
    }),
    opportunityId: function() {
      return this.opportunity.id
    },
    invoicesCounter: function() {
      if (this.invoices.length) {
        return this.invoices.length
      }
      return 0
    },
    companiesList: function() {
      if(this.opportunityId) {
        const companies = this.aggregateCompanies.map(({ company }) => company)
        const list = [this.opportunity.company, ...companies].map((company) => ({
          ...company,
          products: this.generateCompanyProducts(this.companiesProducts[company.id])
        }))
        return list
      }
      return []
    },
    productsWithDiscountToAprove: function() {
      const productsList = []
      this.companiesList.forEach((company) => {
        const products = company.products.filter((product) => product.state === 'csc_required')
        if (products.length > 0) {
          productsList.push({
            ...company,
            products
          })
        }
      })
      return productsList
    },
    disableDiscountForms: function() {
      if (this.invoiceData.template_id && this.invoiceData.contact_id && !this.opportunityActivated) {
        return false
      }
      return true
    },
    hasInvoices: function() {
      if (this.invoices.length > 0) {
        return true
      }
      return false
    },
    lastInvoiceIndex: function() {
      if (this.opportunityProducts.length === 0) {
        return null
      }
      if (this.hasInvoices) {
        const lastInvoice = this.invoices[0]
        return lastInvoice.index + 1
      }
      return null
    },
    hasInvoicePending: function() {
      if (this.invoices.length > 0) {
        return this.invoices.some((invoice) => invoice.status === 'pending_approval')
      }
      return false
    }
  },
  mounted() {
    if(this.itemId) {
      this.getProducts(this.itemId)
      this.getInvoices(this.itemId)
    }
  },
  watch: {
    opportunityProducts(newValue) {
      let recurringTotalValue = 0
      let oneshotTotalValue = 0
      if (newValue.length > 0) {
        newValue.forEach((product) => {
          if (product.product.payment === 'recurring') {
            recurringTotalValue += product.amount * product.value * this.getProductCadenceValue(product.extra)
          } else if (product.product.payment === 'oneshot') {
            oneshotTotalValue += product.amount * product.value
          }
          else if (product.product.payment === 'mixed') {
            recurringTotalValue += product.amount * product.recurring_value
            oneshotTotalValue += product.amount * product.oneshot_value
          }
        })
      }
      this.recurringTotalValue = recurringTotalValue
      this.oneshotTotalValue = oneshotTotalValue
    },
    'invoiceData.contact_id': async function(newValue) {
      if (newValue) {
        const { data } = await this.getList('/customer/contact-media', `includes=media_type&contact_id=${newValue}`) || []
        const emailMedia = data.find((media) => media.media_type.base === 'mail')
        if (emailMedia) {
          this.invoiceData.media_id = emailMedia.id
        } else {
          this.invoiceData.media_id = null
        }
      } else {
        this.invoiceData.media_id = null
      }
    },
    invoices(newValue) {
      this.$emit('onInvoicesChange',  newValue)
    },
  },
  methods: {
    async getProducts(id) {
      await this.$store.dispatch('Opportunity/fetchOpportunityProducts', `includes=product&opportunity_id=${id}`)
      const { data: companiesProducts } = await this.getList('/cash/products-by-customer', `includes=product&opportunity_id=${id}`)
      this.companiesProducts = companiesProducts
    },
    async createInvoice() {
      this.sendingRequest = true
      this.invoiceData.opportunity_id = this.opportunityId
      await this.createItem('/cash/create-invoice', this.invoiceData)
      await this.getInvoices(this.opportunityId)
      this.$refs['invoice-form'].reset()
      this.sendingRequest = false
    },
    async getInvoices(id) {
      const invoices = await this.getList(`/cash/get-invoices-by-opportunity/${id}`)
      if (invoices) {
        this.invoices = invoices.sort((a, b) => b.id - a.id)
      }
    },
    async handleShareInvoice(invoice) {
      this.shareInvoice.invoiceId = invoice.id
      this.shareInvoice.dialog = true
      this.shareInvoice.gettingUrl = true
      try {
        const { data: invoiceUrl } = await this.$axios.get(`/cash/get-invoice-attachment/${invoice.id}`)
        this.shareInvoice.url = invoiceUrl.temporarily_url
        this.shareInvoice.gettingUrl = false
      } catch (error) {
        this.shareInvoice.dialog = false
        this.shareInvoice.gettingUrl = false
        this.$swal({
          icon: 'error',
          title: 'Não foi possível gerar o link',
          footer: `details: ${error.data?.detail}`
        })
      }
    },
    async handleRedirectInvoice(event, invoice) {
      event.preventDefault()
      try {
        const { data: invoiceUrl } = await this.$axios.get(`/cash/get-invoice-attachment/${invoice.id}`)
        window.open(invoiceUrl.temporarily_url, '_blank').focus()
      } catch (error) {
        this.$swal({
          icon: 'error',
          title: 'Não foi possível gerar o link',
          footer: `details: ${error.data?.detail}`
        })
      }
    },
    closeShareInvoice() {
      this.shareInvoice.dialog = false
    },
    copyToClipboard() {
      let clipboard = this.$refs.clipboard.$el.querySelector('input')
      clipboard.select()
      document.execCommand('copy')
      this.dialogClipboard = false
      this.closeShareInvoice()
    },
    handleInvoiceUpdate() {
      this.$refs['invoice-form'].reset()
      this.getInvoices(this.opportunityId)
    },
    enableShareInvoice(status) {
      const invalidStatus = ['rejected', 'pending_approval']
      if (!invalidStatus.includes(status)) {
        return true
      }
      return false
    },
    reloadInvoices() {
      this.getInvoices(this.opportunityId)
    },
    async clearProducts(event) {
      event.preventDefault()
      try {
        await this.removeItem('/cash/opportunity-products', this.opportunityId)
        this.getProducts(this.opportunityId)
      } catch (error) {
        console.log(error)
      }
    },
    refreshData(_value) {
      if (this.opportunityActivated) {
        this.expansionPanel = 1
      }
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
    generateCompanyProducts(products) {
      if (products) {
        return products.map((product) => ({
          ...product,
          valueModifier: this.getValueModifier(product.extra)
        }))        
      } else {
        return []
      }
    },
  }
}
</script>

<style scoped>
  .total-container {
    background-color: rgba(245, 245, 245, 0.5);
    border-top: 0.8px solid #D2D6DA;
    border-radius: 0px;
  }
  .company-item {
    border-top: 0.8px solid #F5F5F5;
  }
</style>
