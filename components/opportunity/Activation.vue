<template>
  <div>
    <v-btn block color="primary" class="mb-5" @click="dialog = !dialog">Ativar</v-btn>
    <v-dialog v-model="dialog" persistent max-width="806">
      <v-card class="d-flex flex-column justify-space-between">
          <div>
            <DialogHeader :title="`Ativação Oportunidade #${opportunity.id}`" @onCancel="handleCancel()"/>
              <v-card-text class="mr-5 py-6 fill-height">
                <v-row>
                  <v-col class="pb-0">
                    <div class="d-flex align-center">
                      <v-icon :color="hasValidContact ? 'success' : 'lighten-5'" class="mr-1">
                        {{ hasValidContact ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                      </v-icon>
                      <h6 class="subtitle-2 font-weight-bold">Contato</h6>
                    </div>
                    <!-- <v-progress-linear rounded color="success" class="mb-2 w-50" :value="hasValidContact ? 100 : 0"></v-progress-linear> -->
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="py-0">
                    <DataList
                      no-data-text="Necessário um contato com email para seguir com a ativação"
                      :list="contact"
                      delete-action="Opportunity/deleteOpportunityProduct"
                    >
                    </DataList>
                    <v-divider></v-divider>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pb-0">
                    <div class="d-flex align-center">
                      <v-icon :color="hasValidAddress ? 'success' : 'lighten-5'" class="mr-1">
                        {{ hasValidAddress ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                      </v-icon>
                      <h6 class="subtitle-2 font-weight-bold">Endereço</h6>
                    </div>
                    <!-- <v-progress-linear rounded color="success" class="mb-2 w-50" :value="hasValidAddress ? 100 : 0"></v-progress-linear> -->
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="py-0">
                    <DataList
                      no-data-text="Necessário um endereço para seguir com a ativação"
                      :list="companyAddress"
                      delete-action="Opportunity/deleteOpportunityProduct"
                    >
                    </DataList>
                    <v-divider></v-divider>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="pb-0">
                    <div class="d-flex align-center">
                      <v-icon :color="hasValidProducts ? 'success' : 'lighten-5'" class="mr-1">
                        {{ hasValidProducts ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                      </v-icon>
                      <h6 class="subtitle-2 font-weight-bold">Produtos</h6>
                    </div>
                    <!-- <v-progress-linear rounded color="success" class="mb-2 w-50" :value="hasValidProducts ? 100 : 0"></v-progress-linear> -->
                  </v-col>
                </v-row>
                <v-row>
                  <v-col class="py-0">
                    <v-list v-if="products.length > 0" two-line dense>
                      <v-list-item v-for="product in products" :key="product.id">
                        <v-list-item-content>
                          <v-col>
                            <v-list-item-title class="font-body-large mb-1">
                              <span class="text-center">{{ product.product.name }} {{ product.amount ? `(${product.amount})` : '' }}</span>
                              <!-- <v-chip v-if="item.status" :color="productActivationColor(item.status)" small>
                                <span>{{productActivationText(item.status)}}</span> 
                              </v-chip> -->
                              <v-chip
                                v-if="productActivationStatus(product.product_id, productActivation)"
                                small
                                :color="productActivationColor(product.product_id)"
                              >
                                <span>{{productActivationText(product.product_id)}}</span> 
                              </v-chip>
                            </v-list-item-title>
                            <v-list-item-subtitle class="font-body-medium">
                              <span>
                                {{ getEnum(product.product.type, meta.productType) }}
                              </span>
                              <span v-if="getEnum(product.product.type, meta.productType) && `${maskMoney('pt-br', product.value)}`" class="mx-2">|</span>
                              <span>{{`${maskMoney('pt-br', product.value)}`}}</span>
                            </v-list-item-subtitle>
                          </v-col>
                          <v-col v-if="product['due_date']">
                            <v-autocomplete
                              attach
                              v-if="productsPayload[productsPayloadFindIndex(product.id)]"
                              required
                              dense
                              label="Dia do pagamento*"
                              v-model="productsPayload[productsPayloadFindIndex(product.id)].activation_fields['due_date']"
                              :items="product['due_date'].items"
                            >
                            </v-autocomplete>
                          </v-col>
                          <v-col v-if="product['payment']">
                            <v-autocomplete
                              attach
                              v-if="productsPayload[productsPayloadFindIndex(product.id)]"
                              required
                              dense
                              label="Método de pagamento*"
                              v-model="productsPayload[productsPayloadFindIndex(product.id)].activation_fields['payment']"
                              :items="product['payment'].items"
                            >
                            </v-autocomplete>
                          </v-col>
                          <v-col v-if="product['billing_cadence']">
                            <v-autocomplete
                              attach
                              v-if="productsPayload[productsPayloadFindIndex(product.id)]"
                              required
                              dense
                              label="Cadencia*"
                              v-model="productsPayload[productsPayloadFindIndex(product.id)].activation_fields['billing_cadence']"
                              :items="product['billing_cadence'].items"
                            >
                            </v-autocomplete>
                          </v-col>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                    <!-- <DataList
                      no-data-text="Necessário um produto para seguir com a ativação"
                      :list="products"
                      delete-action="Opportunity/deleteOpportunityProduct"
                    >
                    </DataList> -->
                    <p v-else class="text-center">Necessário um produto para seguir com a ativação</p>
                  </v-col>
                </v-row>
              </v-card-text>
          </div>
          <DialogAction class="align-end" :disable-submit="!allowActivation || activationSent" @submit="submitForm()" @cancel="handleCancel()" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
  },
  data: () => ({
    dialog: false,
    productActivation: [],
    activationSent: false,
    productsPayload: [],
    invalidActivationField: false,
  }),
  computed: {
    ...mapGetters({
      opportunity: 'Opportunity/opportunity',
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta',
    }),
    products: function() {
      const productList = this.opportunityProducts.map((product) => {
        if (product.product.extra) {
          const parsedExtra = JSON.parse(product.product.extra)
          if (parsedExtra.activation_fields) {
            product.hasActivationFields = true
            for (let field in parsedExtra.activation_fields) {
              product[field] = {
                items: parsedExtra.activation_fields[field],
                value: null
              }
            }
          }
        }
        return product
      })
      return productList || []
    },
    hasValidProducts: function() {
      if (this.products?.length > 0 && !this.invalidActivationField) {
        return true
      }
      return false
    },
    contact: function() {
      const emailMedia = this.isValidContact(this.opportunity.contact)
      if (!emailMedia) {
        return []
      }
      const contact = [this.opportunity.contact].map((contact) => {
        return {
          id: contact.id,
          title_1: contact.name,
          title_2: contact.document_value,
          subtitle_1: 'E-mail',
          subtitle_2: emailMedia
        }
      })
      return contact || []
    },
    hasValidContact: function() {
      if (this.isValidContact(this.opportunity.contact)) {
        return true
      }
      return false
    },
    companyAddress: function() {
      if (this.opportunity?.company?.addresses?.length > 0) {
        const address = this.opportunity.company.addresses.map((address) => {
          return {
            id: address.id,
            title_1: address.location,
            title_2: address.zipcode,
            subtitle_1: address.city,
            subtitle_2: address.state
          }
        })
        return [address[0]]
      }
      return []
    },
    hasValidAddress: function() {
      if (this.companyAddress?.length > 0) {
        return true
      }
      return false
    },
    allowActivation: function() {
      if (this.hasValidProducts && this.hasValidContact && this.hasValidAddress) {
        return true
      }
      return false
    }
  },
  watch: {
    // dialog(newValue) {
    //   if (newValue) {

    //   }
    // },
    products(newValue) {
      this.productsPayload = []
      newValue.forEach((product) => {
        if (product.hasActivationFields) {
          const productIndex = this.productsPayloadFindIndex(product.id)
          if (productIndex == -1) {
            const initial_payload = {
              id: product.id,
              productId: product.product_id,
              activation_fields: {
                'due_date': null,
                'payment': null,
                'billing_cadence': null,
              }
            }
            this.productsPayload.push(initial_payload)
          }
        }
      })
    },
    productsPayload: {
      handler(newValue){
        let hasInvalidField = false
        newValue.forEach((product) => {
          for (let field in product.activation_fields) {
            if (!product.activation_fields[field]) {
              hasInvalidField = true
            }
          }
        })
        this.invalidActivationField = hasInvalidField ? true : false
      },
      deep: true
    },
  },
  mounted() {
  },
  methods: {
    isValidContact(contact) {
      if (contact?.medias?.length > 0) {
        const emailMedia = contact.medias.find((media) => (media.media_type.base == 'mail' && media.value))
        return emailMedia ? emailMedia.value : false
      }
      return false
    },
    async submitForm() {
      try {
        const activationPayload = this.generateFinalPayload()
        this.productActivation = await this.updateData(
          `/cash/activate-opportunity?opportunity_id=${this.opportunity.id}`, //'/cash/activate-opportunity'
          activationPayload,
          { throwError: true }
        )
        this.activationSent = true
      } catch (error) {
        console.log('error', error)
      }
    },
    handleCancel() {
      this.activationSent && this.$store.dispatch('Opportunity/refresh', true)
      this.dialog = false
    },
    productActivationStatus(id, productActivation) {
      const product = productActivation.find((product) => product.product == id)
      if (product) {
        return product.status
      }
      return null
    },
    generateFinalPayload() {
      const finalPayload = { opportunity_id: this.opportunity.id, products: this.productsPayload }
      return finalPayload
    },
    getValue(value, field, productId, id) {
      const payload = {
        id: id,
        productId: productId,
        activation_fields: {
          [field]: value,
        }
      }
      const productIndex = this.productsPayload.findIndex((product) => product.id == id)
      if (productIndex >= 0) {
        this.productsPayload[productIndex].activation_fields = { 
          ...this.productsPayload[productIndex].activation_fields,
          [field]: value,
        }
      } else {
        this.productsPayload.push(payload)
      }
    },
    productActivationColor(id) {
      const status = this.productActivationStatus(id, this.productActivation)
      switch (status) {
      case 'ok':
        return 'success'
      case 'error':
        return 'error'
      case 'pending':
        return 'warning'
      default:
        return 'primary'
      }
    },
    productActivationText(id) {
      const status = this.productActivationStatus(id, this.productActivation)
      switch (status) {
      case 'ok':
        return 'Ativo'
      case 'error':
        return 'Erro na ativação'
      case 'pending':
        return 'Pendente aprovação'
      default:
        return ''
      }
    },
    productsPayloadFindIndex(id) {
      const index = this.productsPayload.findIndex((product) => product.id == id)
      return index
    }
  }
}
</script>

<style>

</style>