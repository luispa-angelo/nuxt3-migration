<template>
  <div>
    <v-dialog v-model="dialog" max-width="1300" persistent scrollable>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <v-btn
            data-test="btnActivationView"
            color="primary"
            v-bind="attrs"
            v-on="on"
            :disabled="isDisabled"
          >
            Ver resultado da ativação
          </v-btn>
        </div>
      </template>
      <v-card data-test="dialogActivationView">
        <DialogHeader :title="`Ativação da Oportunidade #${opportunityId}`" @onCancel="close" />
          <v-card-text class="pt-5 pb-0 v-card-text">
            <div class="d-flex flex-column align-center">
              <v-icon :color="fullActivation ? 'success' : 'warning'" size="36" class="mr-1">
                {{ fullActivation ? 'mdi-check-circle' : 'mdi-alert' }}
              </v-icon>
              <p class="font-weight-bold">{{ fullActivation ? 'Ativação finalizada com sucesso!' : 'Ativação concluída parcialmente.'}}</p>
            </div>
            <v-list two-line dense class="list-container">
            <v-list-item v-for="(item, index) in ProductsByCompanies" :key="index">
              <v-list-item-content class="mb-2">
                <div>
                  <v-row v-if="index == 0">
                    <v-col cols="3" class="pb-0 font-weight-bold">
                    </v-col>
                    <v-col cols="3" class="pb-0 font-weight-bold">
                      <span>Produto</span>
                    </v-col>
                    <v-col cols="2" class="pb-0 font-weight-bold text-center">
                      <span>Status</span>
                    </v-col>
                    <v-col cols="4" class="pb-0 font-weight-bold text-center">
                      <span>Observação</span>
                    </v-col>
                  </v-row>
                  <v-row class="item-table">
                    <v-col cols="3">
                      <div class="d-flex flex-column">
                        <span class="font-body-large mb-1">{{item.customer.name}}</span>
                        <span class="font-body-medium">
                          {{ item.customer.identifier }}
                        </span>
                      </div>
                    </v-col>
                    <v-col cols="3">
                      <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                        <span v-for="product in item.products" :key="product.id" class="font-body-large align-center mb-1">
                          {{`${product.amount}x ${product.product.name}`}}
                          <div class="activation-item-spacer" v-if="product.feedback"></div>
                        </span>
                      </div>
                    </v-col>
                    <v-col v-if="!activationResponse" cols="2">
                      <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-center">
                        <v-chip
                          v-for="product in item.products"
                          :key="product.id"
                          small
                          outlined
                          color="warning"
                          class="font-body-large align-center text-center justify-center my-1"
                        >
                          Processando
                        </v-chip>
                      </div>
                    </v-col>
                    <v-col v-if="activationResponse" cols="2">
                      <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-center">
                        <template v-for="product in item.products">
                          <v-chip
                            :key="product.id"
                            small
                            outlined
                            class="font-body-large align-center text-center justify-center my-1"
                            :color="activationResponse[product.id].color"
                          >
                            {{activationResponse[product.id].text}}
                          </v-chip>
                          <div class="activation-item-spacer" v-if="product.feedback"></div>
                        </template>
                      </div>
                    </v-col>
                    <v-col cols="4">
                      <div v-if="item.products && item.products.length > 0 && activationResponse" class="d-flex flex-column text-center">
                        <div v-for="product in item.products" :key="product.id" class="font-body-large mb-1">
                          <span v-if="activationResponse[product.id].text === 'Pendente'">Aguardando assinatura do termo no ClickSign.</span>
                          <span v-else-if="activationResponse[product.id].text === 'Erro'">
                            <a target="blank_" href="https://omie.atlassian.net/servicedesk/customer/portal/6">Contate o suporte</a>
                            para solucionar este erro.
                            <template v-if="product.feedback">
                              <div class="activation-feedback">{{product.feedback}}</div>
                            </template>
                          </span>
                          <span v-else-if="activationResponse[product.id].text === 'Ativado'">
                            Produto ativado com sucesso!
                            <div v-if="inspectDocument(product)"><a @click="getDocument(product.id)">Ver documento</a></div>
                          </span>
                          <span v-else>-</span>
                        </div>
                      </div>
                      <div v-else class="d-flex flex-column text-center">
                        <span v-for="product in item.products" :key="product.id" class="font-body-large">
                          -
                        </span>
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-list-item-content>
            </v-list-item>
          </v-list>
          </v-card-text>
        <DialogAction submit-text="Fechar" @submit="close" @cancel="close" :hideCancel="true"/>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  props: {
    opportunityId: Number,
    invoice: Object,
    isDisabled: Boolean,
  },
  data: () => ({
    dialog: false,
    isSendingRequest: false,
    companiesProducts: null,
    activationResponse: null,
    fullActivation: false,
  }),
  computed: {
    ProductsByCompanies: function() {
      if (this.invoice.products && this.companiesProducts){
        return this.generateProductsByCompanies(this.invoice.products)
      }
      return []
    }
  },
  watch: {
    dialog(newValue) {
      if(newValue) {
        this.getProducts(this.opportunityId)
      }
    },
  },
  mounted() {
    this.getProducts(this.opportunityId)
  },
  methods: {
    async getProducts(id) {
      const { data: companiesProducts } = await this.getList('/cash/products-by-customer', `includes=product,customer&opportunity_id=${id}`)
      this.companiesProducts = companiesProducts
    },
    generateProductsByCompanies(invoiceProducts) {
      const productsByCompanies = []
      const companies = [...new Set(invoiceProducts.filter((product) => product.customer_id).map((product) => product.customer_id))]
      companies.forEach((customer_id) => {
        const product = invoiceProducts.find((product) => product.customer_id === customer_id)
        const customer = product.customer
        productsByCompanies.push({
          customer_id,
          customer,
          products: this.companiesProducts[customer_id],
        })
        this.generateActivationResponse(this.companiesProducts[customer_id])
      })
      return productsByCompanies
    },
    generateActivationResponse(products) {
      const responsesStatus = {
        'activated': { text: 'Ativado', color: 'success'},
        'fail': { text: 'Erro', color: 'error'},
        'pending': { text: 'Pendente', color: 'primary'},
      }
      this.fullActivation = !products.some((response) => response.state !== 'activated')
      products.forEach((product) => {
        if (this.activationResponse) {
          this.activationResponse = {
            ...this.activationResponse,
            [product.id]: responsesStatus[product.state] || { text: 'Não ativado', color: 'primary'}
          }
        } else {
          this.activationResponse = {
            [product.id]: responsesStatus[product.state] || { text: 'Não ativado', color: 'primary'}
          }
        }
      })
    },
    close() {
      this.dialog = false
    },
    inspectDocument(item) {
      let document = null
      if (item.feedback) {
        try {
          document = JSON.parse(item.feedback)?.document
        }
        catch {
          document = null
        }
      }
      return document
    },
    getDocument(item) {
      this.getItem(`/cash/signed-document?opportunityProductId=${item}`)
        .then(data => {
          if (data.url) {
            window.open(data.url)
          }
        })
    }

  }
}
</script>

<style scoped>
 .item-table {
  border-bottom: 1px solid #D2D6DA;
 }
 .list-container {
  border:1px solid #D2D6DA;
  border-radius: 8px;
  margin-bottom: 1rem;
  margin-top: 1rem;
 }
 .font-size {
  font-size: 14px !important;
 }
 .activation-feedback {
  color: red;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 0.85em;
 }
 .activation-item-spacer::before {
  content: " ";
  white-space: pre;
 }
</style>