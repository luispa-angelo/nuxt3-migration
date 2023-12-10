
<template>
  <v-list two-line dense>
    <v-list-item v-for="(item, index) in productsByCompanies" :key="index" class="item-table px-2">
      <v-list-item-content class="mb-2 font-body-medium">
        <div>
          <v-row>
            <v-col cols="2" class="pb-0 pr-2 font-weight-bold">
            </v-col>
            <v-col cols="2" class="pb-0 px-2 font-weight-bold">
              <span>Produto</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-1 font-weight-bold text-start">
              <span>Solicitação</span>
            </v-col>
            <v-col cols="2" class="pb-0 px-1 font-weight-bold text-start">
              <span>Recorrência</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-2 font-weight-bold text-start">
              <span>Valor unitário</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-2 font-weight-bold text-start">
              <span>Subtotal</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-2 font-weight-bold text-start">
              <span>Variação</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-2 font-weight-bold text-start">
              <span>Valor final</span>
            </v-col>
            <v-col cols="1" class="pb-0 px-2 font-weight-bold text-start">
              <span>Vigência</span>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="2" class="pr-2">
              <div class="d-flex flex-column">
                <span class="body-3 mb-1">{{item.name}}</span>
                <span class="body-3">
                  {{ maskIdentifier(item.identifier, item.identifier_type) }}
                </span>
              </div>
            </v-col>
            <v-col cols="2" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column">
                <span 
                  v-for="product in item.products" 
                  class="body-3 align-center mb-2"
                  :key="product.id"
                  v-tooltip="product.product.name.length > 25 ?
                  {
                    content: `
                      <div class='v-btn-tooltip'>
                        ${product.product.name}
                      </div>
                      `,
                    placement: 'bottom-center',
                  } : null"
                >
                  {{`${product.amount}x ${product.product.name}` | truncate(28)}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-1">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 align-center mb-2">
                  {{translateModifier(product.valueModifier, product.discount)}}
                </span>
              </div>
            </v-col>
            <v-col cols="2" class="px-1">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 align-center mb-2">
                  {{getProductCadenceName(product.extra, product)}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 align-center mb-2">
                  {{`R$ ${product.original_value ? maskMoney('pt-br', product.original_value * getProductCadenceValue(product.extra)) : maskMoney('pt-br', product.value * getProductCadenceValue(product.extra))}`}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 align-center mb-2">
                  {{`R$ ${maskMoney('pt-br', product.original_value * product.amount * getProductCadenceValue(product.extra))}`}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 mb-2" :class="variationColor(product.discount)">
                  {{generateVariation(product.discount)}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 align-center mb-2">
                  {{`R$ ${maskMoney('pt-br', product.value * product.amount * getProductCadenceValue(product.extra))}`}}
                </span>
              </div>
            </v-col>
            <v-col cols="1" class="px-2">
              <div v-if="item.products && item.products.length > 0" class="d-flex flex-column text-start">
                <span v-for="product in item.products" :key="product.id" class="body-3 mb-2">
                  {{product.discount_months > 0 ? `${product.discount_months}m` : 'N/A'}}
                </span>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>

export default {
  props: {
    productsByCompanies: {
      type: Array,
      default: () => []
    }
  },
  data: () => ({}),
  methods: {
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
    translateModifier(valueModifier, discount) {
      let modifier = valueModifier
      if (!discount && valueModifier === 'discount') {
        modifier = null
      }
      switch (modifier) {
      case 'discount':
        return 'Desconto'
      case 'overprice':
        return 'Valor acrescido'
      case 'lock':
        return 'Trava de valor'
      default:
        return '-'
      }
    },
    generateVariation(originalDiscount) {
      const discount = originalDiscount * -1
      return discount ? ((discount > 1 || discount < -1) ? `${discount > 0 ? '+' : ''}${discount.toFixed(0)}%` : `${discount.toFixed(2)}%`) : '-'
    },
    variationColor(discount) {
      if (discount > 0) {
        return 'warning--text'
      } else if (discount < 0) {
        return 'success--text'
      }
      return ''
    },
  }
}
</script>

<style scoped>
 .item-table {
  border:1px dashed #D2D6DA;
  border-radius: 8px;
  margin-bottom: 1rem;
  margin-top: 1rem;
 }
</style>