<template>
  <div>
    <v-dialog v-model="dialog" max-width="1360" persistent scrollable>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <v-btn
            data-test="btnActivationForm"
            color="primary"
            v-bind="attrs"
            v-on="on"
            :disabled="isDisabled"
          >
            Ativar
          </v-btn>
        </div>
      </template>
      <v-card data-test="dialogActivationForm">
        <DialogHeader :title="`Ativação da Oportunidade #${opportunityId}`" @onCancel="close" />
        <v-card-text v-if="state == steps.information" class="pt-5 pb-0 px-2 v-card-text">
          <span>Revise e confirme os detalhes de produto e faturamento antes de confirmar a ativação.</span>
          <v-list two-line dense>
          <v-list-item v-for="(item, index) in ProductsByCompanies" :key="index" class="font-size px-1">
            <v-list-item-content class="mb-2">
              <div>
                <v-row v-if="index == 0">
                  <v-col cols="1" class="pb-0 font-weight-bold">
                  </v-col>
                  <v-col cols="2" class="pb-0 px-1 font-weight-bold">
                    <span>Produto</span>
                  </v-col>
                  <v-col cols="1" class="pb-0 px-1 font-weight-bold">
                    <span>Valor</span>
                  </v-col>
                  <v-col cols="2" class="pb-0 px-1 font-weight-bold">
                    <span>Recorrência</span>
                  </v-col>
                  <v-col cols="1" class="pb-0 px-1 font-weight-bold">
                    <span>Dia</span>
                  </v-col>
                  <v-col cols="1" class="pb-0 px-1 font-weight-bold">
                    <span>Método</span>
                  </v-col>
                  <v-col cols="1" class="pb-0 px-1 font-weight-bold">
                    <span>Parcelas</span>
                  </v-col>
                  <v-col cols="3" class="pb-0 font-weight-bold text-center shape">
                    <span>Dados para faturamento</span>
                  </v-col>
                </v-row>
                <v-row class="item-table">
                  <v-col cols="1">
                    <div class="d-flex flex-column">
                      <span class="font-body-medium mb-1">{{item.customer.name}}</span>
                      <span class="font-body-medium">
                        {{ maskCnpj(item.customer.identifier) }}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="2" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2">
                        {{`${product.amount}x ${product.product.name}`}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="1" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2">
                        {{`R$ ${maskMoney('pt-br', product.value * product.amount * getProductCadenceValue(product.extra))}`}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="2" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2">
                        {{product.activation.billing_cadence ? product.activation.billing_cadence : getProductCadenceName(product.extra, product)}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="1" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2 align-center">
                        {{product.activation.due_date ? `${product.activation.due_date}` : '-'}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="1" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2">
                        {{product.activation.payment ? `${product.activation.payment}` : '-'}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="1" class="px-1">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                      <span v-for="product in item.products" :key="product.id" class="font-body-medium mb-2">
                        {{product.activation.installments ? `${product.activation.installments}` : '-'}}
                      </span>
                    </div>
                  </v-col>
                  <v-col cols="3" class="shape">
                    <div v-if="item.responsible" class="d-flex flex-column wrap shape lighten-1 mr-3">
                        <div class="d-flex mt-1 mx-1">
                          <p class="font-small-size mr-4">{{item.responsible.name}}</p>
                          <p class="font-small-size primary--text">{{ item.responsible.email }}</p>
                        </div>
                          <p class="font-small-size mx-1">{{`${item.responsible.location}, ${item.responsible.city} - ${item.responsible.state} (${item.responsible.zipcode})`}}</p>
                          <p class="font-small-size mx-1">{{item.responsible.identifier}}</p>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        </v-card-text>
        <v-card-text v-else-if="state == steps.verification" class="pt-5 pb-0 v-card-text">
          <div class="d-flex flex-column align-center">
            <v-progress-circular
              v-if="!verificationResponse.length"
              indeterminate
              color="primary"
              class="mb-2"
            ></v-progress-circular>
            <v-icon v-else :color="fullActivation ? 'success' : 'warning'" size="36" class="mr-1">
              {{ fullActivation ? 'mdi-check-circle' : 'mdi-alert' }}
            </v-icon>
            <p v-if="!verificationResponse.length" class="font-weight-bold">Aguarde, estamos verificando seus produtos...</p>
            <p v-else class="font-weight-bold">{{ verificationResponse.length == 0 ? 'Verificação finalizada com sucesso!' : 'Verificação com erros. Favor ajustar antes de prosseguir.'}}</p>
          </div>
          <v-list two-line dense class="list-container">
          <v-list-item v-for="(item, index) in ProductsByCompanies" :key="index">
            <v-list-item-content class="mb-2">
              <div>
                <v-row v-if="index == 0">
                  <v-col cols="8" class="pb-0 font-weight-bold">
                    <span>Cliente</span>
                  </v-col>
                  <v-col cols="4" class="pb-0 font-weight-bold text-center">
                    <span>Observação</span>
                  </v-col>
                </v-row>
                <v-row class="item-table">
                  <v-col cols="8">
                    <div class="d-flex flex-column">
                      <span class="font-body-large mb-1">{{item.customer.name}}</span>
                      <span class="font-body-medium">
                        {{ item.customer.identifier }}
                      </span>
                    </div>
                  </v-col>
                  <v-col v-if="!verificationResponse" cols="4">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-center">
                      <v-chip v-for="product in item.products" :key="product.id" small outlined color="warning" class="font-body-large align-center text-center justify-center my-1">
                        Processando
                      </v-chip>
                    </div>
                  </v-col>
                  <v-col v-if="verificationResponse.length" cols="4" >
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-left">
                      <div v-for="product in item.products">
                        <div class="check-error" v-for="error in checkFailedByProductId(product.id)">• {{error}}</div>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        </v-card-text>
        <v-card-text v-else-if="state == steps.configuration" class="pt-5 pb-0 v-card-text">
          <div class="d-flex flex-column align-center">
            <v-progress-circular
              v-if="!verificationResponse.length"
              indeterminate
              color="primary"
              class="mb-2"
            ></v-progress-circular>
            <v-icon v-else color="blue" size="36" class="mr-1">
              mdi-cog-outline
            </v-icon>
            <p class="font-weight-bold">Por favor configure os produtos abaixo</p>
          </div>
          <v-list two-line dense class="list-container">
          <v-list-item v-for="(item, index) in ProductsByCompanies" :key="index">
            <v-list-item-content class="mb-2">
              <div>
                <v-row v-if="index == 0">
                  <v-col cols="4" class="pb-0 font-weight-bold">
                    <span>Cliente</span>
                  </v-col>
                  <v-col cols="4" class="pb-0 font-weight-bold text-center">
                    <span>Informação</span>
                  </v-col>
                  <v-col cols="4" class="pb-0 font-weight-bold text-center">
                    <span>Opção</span>
                  </v-col>
                </v-row>
                <v-row class="item-table">
                  <v-col cols="4">
                    <div class="d-flex flex-column">
                      <span class="font-body-large mb-1">{{item.customer.name}}</span>
                      <span class="font-body-medium">
                        {{ item.customer.identifier }}
                      </span>
                    </div>
                  </v-col>
                  <template  v-if="verificationResponse.length && item.products && item.products.length > 0">
                    <template v-for="product in item.products">
                      <v-col cols="8">
                        <template v-for="detail in getProductDetails(product.id, 'choice')">
                            <v-row>
                              <v-col cols="6" align-self="center">
                                  <span class="font-body-medium">{{detail.message}}</span>
                              </v-col>
                              <v-col cols="6" >
                                  <v-select 
                                  :items="detail.values"
                                  item-value="value"
                                  item-text="title"
                                  v-model="detail.value"
                                  outlined
                                  dense
                                  hide-details
                                  ></v-select>
                              </v-col>
                            </v-row>
                        </template>
                        <template v-for="detail in getProductDetails(product.id, 'confirm')">
                            <v-row>
                              <v-col cols="6" align-self="center">
                                  <span class="font-body-medium">{{detail.message}}</span>
                              </v-col>
                              <v-col cols="6" >
                                  <v-checkbox 
                                    v-model="detail.confirmed"
                                    outlined
                                    dense
                                    hide-details
                                    @change="checkCanProceed"
                                    ></v-checkbox>
                              </v-col>
                            </v-row>
                        </template>
                      </v-col>
                    </template>
                  </template>
                </v-row>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
        </v-card-text>
        <v-card-text v-else class="pt-5 pb-0 v-card-text">
          <div class="d-flex flex-column align-center">
            <v-progress-circular
              v-if="!activationResponse"
              indeterminate
              color="primary"
              class="mb-2"
            ></v-progress-circular>
            <v-icon v-else :color="fullActivation ? 'success' : 'warning'" size="36" class="mr-1">
              {{ fullActivation ? 'mdi-check-circle' : 'mdi-alert' }}
            </v-icon>
            <p v-if="!activationResponse" class="font-weight-bold">Aguarde, estamos ativando seus produtos...</p>
            <p v-else class="font-weight-bold">{{ fullActivation ? 'Ativação finalizada com sucesso!' : 'Ativação concluída parcialmente.'}}</p>
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
                         <div class="activation-item-spacer" v-if="activationResponse && product.id in activationResponse && activationResponse[product.id].feedback"></div>
                      </span>
                    </div>
                  </v-col>
                  <v-col v-if="!activationResponse" cols="2">
                    <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-center">
                      <v-chip v-for="product in item.products" :key="product.id" small outlined color="warning" class="font-body-large align-center text-center justify-center my-1">
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
                        <div class="activation-item-spacer" v-if="activationResponse && product.id in activationResponse && activationResponse[product.id].feedback"></div>
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
                           <template v-if="activationResponse[product.id].feedback">
                              <div class="activation-feedback">{{activationResponse[product.id].feedback}}</div>
                           </template>
                        </span>
                        <span v-else-if="activationResponse[product.id].text === 'Ativado'">Produto ativado com sucesso!</span>
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

        <DialogAction
          :submit-text="state == steps.complete ? 'Fechar' : 'Ativar'"
          :disable-submit="[steps.verification, steps.activation].includes(state) || state == steps.configuration && !configurationComplete"
          @submit="submitAction"
          @cancel="close"
          :hideCancel="state == steps.complete"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

const steps = {
  information: Symbol("information"),
  verification: Symbol("verification"),
  configuration: Symbol("configuration"),
  activation: Symbol("activation"),
  complete: Symbol("complete"),
  error: Symbol("error"),
}


export default {
  props: {
    opportunityId: Number,
    invoice: Object,
    activationSteps: Object,
    disableForms: Boolean,
    isDisabled: Boolean,
  },
  data: () => ({
    dialog: false,
    steps,
    state: steps.information,
    companiesProducts: {},
    activationResponse: null,
    verificationResponse: [],
    confirmationsRequired: [],
    choicesRequired: [],
    fullActivation: false,
    configurationComplete: false,
    hideCancel: false,
  }),
  computed: {
    ProductsByCompanies: function() {
      if (this.invoice.products){
        return this.generateProductsByCompanies(this.invoice.products)
      }
      return []
    }
  },
  methods: {
    generateProductsByCompanies(invoiceProducts) {
      const productsByCompanies = []
      const companies = [...new Set(invoiceProducts.filter((product) => product.customer_id).map((product) => product.customer_id))]
      companies.forEach((customer_id) => {
        const productsList = invoiceProducts.filter((product) => product.customer_id === customer_id)
        const products = productsList.map((product) => {
          const productInActivation = {
            ...product,
            activation: {
              payment: this.getActivationFieldValue(product.id, 'payment'),
              due_date: this.getActivationFieldValue(product.id, 'due_date'),
              billing_cadence: this.getActivationFieldValue(product.id, 'billing_cadence'),
              installments: this.getActivationFieldValue(product.id, 'installments')
            }
          }
          return productInActivation
        })
        productsByCompanies.push({
          customer_id,
          customer: products[0].customer,
          responsible: this.getActivationResponsibleValue(customer_id),
          products,
        })
      })
      return productsByCompanies
    },
    getActivationFieldValue(id, fieldName) {
      if (!this.activationSteps.activation_fields) {
        return null
      }
      const product = this.activationSteps.activation_fields.products.find((product) => product.invoice_product_id === id)
      if (!product) {
        return null
      }
      const field = product.fields.find((field) => field.name === fieldName)
      if (!field) {
        return null
      }
      return field.value
    },
    getActivationResponsibleValue(customer_id) {
      if (!this.activationSteps.activation_responsible) {
        return null
      }
      if (!this.activationSteps.activation_responsible.productsByCompanies) {
        return null
      }
      const productsByCompany = this.activationSteps.activation_responsible.productsByCompanies.find((item) => item.customer_id === customer_id)
      if (!productsByCompany) {
        return null
      }
      const productWithFields = productsByCompany.products.find((product) => product.fields.length > 0)
      if (!productWithFields) {
        return null
      }
      const field = productWithFields.fields.find((field) => field.name === 'financial_responsible')
      if (!field) {
        return null
      }
      if (field.value) {
        try {
          const responsible = JSON.parse(field.value)
          return responsible
        } catch (error) {
          return null
        }
      }
      return null
    },
    async handleActivation() {
      try {
        this.state = steps.activation

        let choices = []
        for (let el of this.choicesRequired) {
          choices.push({
            product: el.product,
            instance: el.instance,
            id: el.detail.id,
            value: el.detail.value
          })
        }

        const response = await this.updateData(
          `/cash/activate-opportunity?opportunity_id=${this.opportunityId}&invoice_id=${this.invoice.id}`,
          { throwError: true, choices}
        )
        this.$store.dispatch('Opportunity/refresh', true)
        this.$store.commit('Opportunity/OPPORTUNITIES_API', { dataUpdate: true })
        this.generateActivationResponse(response)
        this.state = steps.complete
      } catch (error) {
        this.state = steps.error
        console.log('error', error)
      }
    },
    generateActivationResponse(responses) {
      const responsesStatus = {
        'ok': { text: 'Ativado', color: 'success'},
        'error': { text: 'Erro', color: 'error'},
        'pending': { text: 'Pendente', color: 'primary'},
      }
      this.fullActivation = !responses.some((response) => response.status !== 'ok')
      responses.forEach((response) => {
        let feedback = response.feedback
        if (this.activationResponse) {
          this.activationResponse = {
            ...this.activationResponse,
            [response.instance]: {...responsesStatus[response.status], feedback} || { text: 'Não ativado', color: 'primary'}
          }
        } else {
          this.activationResponse = {
            [response.instance]: {...responsesStatus[response.status], feedback} || { text: 'Não ativado', color: 'primary'}
          }
        }
      })
    },
    async checkActivation() {
      try {
        this.state = steps.verification
        const response = await this.updateData(
          `/cash/check-opportunity?opportunity_id=${this.opportunityId}&invoice_id=${this.invoice.id}`,
          { throwError: true}
        )

        this.verificationResponse = []

        let isVerified = true
        for (let el of response) {
           if (el?.details?.length) {
              this.verificationResponse.push(el)
              for (let detail of el?.details) {
                if (detail.type == 'required') {
                  isVerified = false
                }
              }
           }
        }

        if (isVerified) {
          this.checkConfigurations()
        }

      } catch (error) {
        console.log(error)
        this.state = steps.error
        console.log('error', error)
      }
    },
    checkConfigurations() {
      this.confirmationsRequired = []
      this.choicesRequired = []
      let hasConfiguration = false
      for (let el of this.verificationResponse) {
        if (el?.details.length) {
          for (let detail of el.details) {
            let obj = {
              "product": el.product,
              "instance": el.instance,
              "detail": detail
            }
            switch (detail.type) {
              case "confirm":
                this.confirmationsRequired.push(obj)
                break
              case "choice":
                this.choicesRequired.push(obj)
                break
            } 
          }
        }
      }
      
      if (this.confirmationsRequired.length ||  this.choicesRequired.length) {
        this.state = steps.configuration
      }
      else {
        this.handleActivation()
      }
      this.checkCanProceed()
    },
    getProductDetails(productId, type) {
      let details = []
      let element = this.verificationResponse.find(el => el.instance==productId)
      if (element?.details) {
        for (let item of element.details) {
          if (item.type == type) {
            details.push(item)
          }
        }
      }
      return details
    },
    checkFailedByProductId(productId) {
      return this.getProductDetails(productId, "required").map(el => el.message)
    },
    setConfiguration() {
      this.handleActivation()
    },
    close() {
      this.$emit('onActivationSent', true)
      this.state = steps.information
      this.dialog = false
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
      if (product.product.payment === 'Único') {
        return 'Sem recorrência'
      }
      return cadence ? cadence.name : '-'
    },
    submitAction() {
      switch (this.state) {
        case steps.complete:
          this.close()
          break
        case steps.information:
          this.checkActivation()
          break
        case steps.configuration:
          this.setConfiguration()
          break
      }
    },
    checkCanProceed() {
      this.configurationComplete = true
      if (this.stage == steps.configure) {
        for (let el of this.confirmationsRequired) {
          if (!el.detail.confirmed) {
            this.configurationComplete = false
            break
          }
        }
      }
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
 .font-small-size {
  font-size: 12px !important;
 }

 .check-error {
  color: red;
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