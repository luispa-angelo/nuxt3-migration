<template>
  <div>
    <v-dialog v-model="dialog" max-width="1400" persistent>
      <template v-slot:activator="{ on, attrs }">
        <div>
          <v-btn
            v-if="!editMode"
            x-small
            fab
            data-test="btnProductFormOpen"
            color="secondary"
            v-bind="attrs"
            v-on="on"
            :disabled="opportunityActivated"
          >
            <v-icon color="primary" small>mdi-plus</v-icon>
          </v-btn>
          <v-btn
            v-else
            text
            data-test="btnProductFormOpenEdit"
            color="primary"
            class="px-0"
            v-bind="attrs"
            v-on="on"
            :disabled="opportunityActivated"
          >
            Editar
          </v-btn>
          <span v-if="!editMode" class="mt-1 ml-2">Adicionar produtos ou serviços</span>
        </div>
      </template>
      <v-card id="product-form-card">
        <DialogHeader title="Adicionar Produtos ou Serviços" @onCancel="cancel" />
        <v-card-text class="pt-5 pb-0 px-3 d-flex flex-row justify-space-between v-card-text">
          <v-form ref="product-form" style="max-width: 470px;">
            <h6 class="subtitle-2 mb-3 font-weight-bold">Adicionar Produto</h6>
            <v-autocomplete
              attach
              outlined
              dense
              clearable
              cache-items
              data-test="selectProductFormFamily"
              label="Familia de produto"
              v-model="productFamily"
              :items="familyList"
              :disabled="isEditing"
              :search-input.sync="searchFamily"
            >
            </v-autocomplete>
            <Autocomplete
              clearable
              outlined
              dense
              show-loader
              data-test="selectProductFormProduct"
              ref="productAutocomplete"
              label="Produto"
              no-data-text="Nenhum produto encontrado para faturamento, cnae e enquadramento tributário fornecido"
              endpoint="/ecosystem/product"
              item-value="id"
              item-text="name"
              :initial-value="selectedProductId"
              :loader-height="3"
              :disabled="isEditing"
              :reload-trigger="searchFamily || dialog"
              :query="searchFamily ? `state=active&limit=1000&order=name&company_id=${companyId}&family=${encodedSearchFamily}` : `state=active&company_id=${companyId}&limit=1000&order=family,name`"
              :error="$v.productFormData.product_id.$error"
              :error-messages="$v.productFormData.product_id.$error ? 'Esse campo é obrigatório' : ''"
              @autocompleteList="generateProductsList"
              @valueSelected="(value) => { selectedProductId = value }"
            ></Autocomplete>
            <div class="d-flex flex-row">
              <v-text-field
                required
                outlined
                dense
                data-test="inputProductFormQuantity"
                class="mr-2"
                type="number"
                label="Quantidade"
                min="0"
                v-model="productFormData.amount"
                :disabled="!productFormData.product_id"
                :rules="[rules.min]"
                :error="$v.productFormData.amount.$error"
                :error-messages="$v.productFormData.amount.$error ? 'Esse campo é obrigatório' : ''"
                @change="setTotalValue"
              ></v-text-field>
              <CurrencyInput
                disabled
                required
                outlined
                dense
                data-test="inputProductFormValue"
                class="ml-2"
                label="Valor unitário (R$)"
                :value="productFormData.value"
                :loading="loadingProducts"
              />
            </div>
            <v-autocomplete
              v-if="productPayment !== 'oneshot' && productPayment !== 'mixed'"
              attach
              outlined
              dense
              return-object
              data-test="selectProductFormCadence"
              label="Recorrência"
              item-text="name"
              v-model="cadenceValue"
              :hint="cadenceValue ? cadenceValue.description : ''"
              :items="cadenceItems"
              :disabled="!productFormData.product_id || productFormData.value === 0"
              :error="$v.cadenceValue.name.$error"
              :error-messages="$v.cadenceValue.name.$error ? 'Esse campo é obrigatório' : ''"
              @change="onCadenceChange"
            >
              <template v-slot:item="data">
                  <v-list-item-content>
                    <v-list-item-title class="d-flex align-center">
                    <span>{{data.item.name}}</span>
                    <v-icon
                      small
                      class="material-icons-outlined ml-2"
                      v-tooltip="{
                        content: `
                          <div class='v-btn-tooltip'>
                                ${data.item.description}
                          </div>
                          `,
                        placement: 'bottom-center',
                      }"
                    >
                      info
                    </v-icon>
                    </v-list-item-title>
                  </v-list-item-content>
              </template>
            </v-autocomplete>
            <v-autocomplete
              v-else-if="productPayment == 'mixed'"
              attach
              outlined
              dense
              disabled
              persistent-hint
              data-test="selectProductFormCadence"
              hint="Pagamento realizado com pagamento misto"
              label="Recorrência"
              :value="'Sem recorrência'"
              :items="['Pagamento misto']"
            />
            <v-autocomplete
              v-else
              attach
              outlined
              dense
              disabled
              persistent-hint
              data-test="selectProductFormCadence"
              hint="Pagamento realizado sem recorrência"
              label="Recorrência"
              :value="'Sem recorrência'"
              :items="['Sem recorrência']"
            />
            <v-divider class="mb-4" />
            <h6 class="subtitle-2 mb-3 font-weight-bold">Solicitações</h6>
            <div>
              <v-radio-group
                row
                hide-details
                mandatory
                class="mb-3 mt-0"
                v-model="valueModifier"
                :disabled="!productFormData.product_id || hasPartnershipProduct || disableFields"
                @change="onModifierChange"
              >
                <v-radio
                  label="Cupom de desconto"
                  value="discount"
                  class="mr-3"
                ></v-radio>
                <v-radio
                  value="lock"
                  class="mr-3"
                  :disabled="oneshotProduct"
                >
                <template v-slot:label>
                  <div>
                    <span>Trava do valor</span>
                    <v-icon 
                      small
                      class="material-icons-outlined"
                      :class="{ 'disabled-radio-tooltip': oneshotProduct }"
                      v-tooltip="{
                        content: `<div class='v-btn-tooltip'>
                            Valor fixo durante a vigência selecionada.<br>
                            Não se aplica a itens sem recorrência.
                          </div>`,
                        placement: 'bottom-center',
                      }"
                    >
                      info
                    </v-icon>
                  </div>
                </template>
                </v-radio>
                <v-radio
                  value="overprice"
                  class="mr-3"
                >
                  <template v-slot:label>
                    <div>
                      <span>Valor acrescido</span>
                      <v-icon 
                        small
                        class="material-icons-outlined"
                        v-tooltip="{
                          content: `<div class='v-btn-tooltip'>Valor acima do preço de tabela</div>`,
                          placement: 'bottom-start'
                        }"
                      >
                        info
                      </v-icon>
                    </div>
                  </template>
                </v-radio>
              </v-radio-group>
            </div>
            <div class="d-flex flex-row">
              <v-text-field
                v-if="valueModifier !== 'lock'"
                required
                outlined
                dense
                data-test="inputProductFormDiscount"
                class="mr-4"
                v-model="productFormData.discount"                
                type="number"
                min="0"
                :rules="[rules.min]"
                :label="percentFieldLabel"
                :disabled="!productFormData.product_id || hasPartnershipProduct || disableFields"
                @change="setTotalValue"
              />
              <v-autocomplete
                attach
                v-if="enableDiscountInterval()"
                outlined
                dense
                clearable
                data-test="selectProductFormDiscountInterval"
                v-model="productFormData.discount_months"
                :menu-props="{ top: true }"
                :label="validityFieldLabel"
                :items="expiration_dates"
                :disabled="(!productFormData.product_id || !discountApplied) && !hasPriceLock"
                :error="$v.productFormData.discount_months.$error"
                :error-messages="$v.productFormData.discount_months.$error ? 'Esse campo é obrigatório' : ''"
              >
              </v-autocomplete>
              <v-autocomplete
                attach
                v-else
                outlined
                dense
                clearable
                disabled
                data-test="selectProductFormDiscountInterval"
                :label="validityFieldLabel"
                :value="'anual'"
                :items="['anual']"
              >
              </v-autocomplete>
            </div>
              <CurrencyInput
                required
                outlined
                dense
                ref="totalValueCurrencyInput"
                data-test="inputProductFormTotalValue"
                :value="productFormData.totalValue"
                :label="generateLabelValue()"
                :disabled="!productFormData.product_id || hasPartnershipProduct || disableFields || hasPriceLock"
                :error="$v.productFormData.totalValue.$error"
                :error-messages="$v.productFormData.totalValue.$error ? 'Esse campo é obrigatório' : ''"
                :rules="[priceRules]"
                @inputValue="
                  (value) => {
                    productFormData.totalValue = parseFloat(value).toFixed(2),
                    setDiscount()
                  }
                "
              />                
            <div v-if="productPayment === 'oneshot'" class="d-flex flex-row">
              <v-autocomplete
                attach                
                outlined
                dense
                data-test="selectProductFormInstallments"
                class="mr-2"
                label="Parcelas"
                v-model="productInstallments"
                :menu-props="{ top: true }"
                :items="installmentsItens"
              >
              </v-autocomplete>

              <CurrencyInput
                required
                outlined
                dense
                disabled
                data-test="inputProductFormInstallmentsValue"
                class="ml-2"
                label="Valor da parcela"
                :value="parseFloat((productFormData.totalValue / productInstallments).toFixed(2))"
              />
            </div>
            <div v-if="discountAlert">
              <v-alert
                colored-border
                border="left"
                :color="productFormData.discount <= discountRange.at(-1) ? 'warning' : 'error'"
                elevation="1"
                :icon="productFormData.discount <= discountRange.at(-1) ? 'mdi-alert-circle' : 'mdi-alert'"
                max-width="454"
                class="mb-3"
              >
                <span v-html="discountAlertMessages"/>
              </v-alert>
            </div>
            <div class="d-flex flex-row justify-end">
              <v-btn
                data-test="buttonProductFormClear"
                color="secondary" 
                class="mb-3 mr-2" 
                @click="clearProductForm"
              >
                Limpar Campos
              </v-btn>
              <v-btn
                data-test="buttonProductFormSend"
                color="primary"
                class="mb-3 ml-2"
                :loading="isSendingPayload"
                @click="handleProducts"
                :disabled="discountRange.length > 0 && productFormData.discount > discountRange.at(-1) && valueModifier === 'discount'"
              >
                {{isEditing ? 'Salvar Edição' : 'Inserir Produto'}}
              </v-btn>
            </div>
          </v-form>
          <v-divider vertical class="mx-2" />
          <div class="d-flex flex-column flex-grow-1">
            <h6 class="subtitle-2 mb-3">Produtos</h6>
            <div class="d-flex flex-row">
              <span class="font-body-large align-center font-weight-bold">{{company.name}}</span>
              <span class="font-body-medium align-center ml-4">{{company.identifier}}</span>
            </div>
            <v-list>
              <v-list-item
                v-for="product, index in companyProducts"
                class="px-0"
                :key="product.id"
              >
                <v-list-item-content class="font-body-medium">
                  <v-container>
                    <v-row v-if="companyProducts.length > 0 && index === 0">
                      <v-col cols="2" class="pr-1">
                        <span>Produto</span>
                      </v-col>
                      <v-col cols="1" class="px-1">
                        <span>Qt.</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>Solicitação</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>Tipo</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>Com recorrência</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>Sem recorrência</span>
                      </v-col>
                      <v-col cols="1" class="px-1">
                      </v-col>
                    </v-row>
                    <v-row class="company-item">
                      <v-col cols="2" class="d-flex align-start pr-1">
                        <span>{{product.product.name}}</span>
                      </v-col>
                      <v-col cols="1" class="px-1">
                        <span>{{product.amount}}</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>{{translateModifier(product.valueModifier, product.discount)}}</span>
                      </v-col>
                      <v-col cols="2" class="px-1">
                        <span>{{getProductCadenceName(product.extra, product)}}</span>
                      </v-col>
                      <template v-if="product.product.payment == 'mixed'">
                        <v-col cols="2" class="px-1">
                          <span class="align-center">
                            {{`R$ ${maskMoney('pt-br', product.amount * product.recurring_value)}`}}
                          </span>
                        </v-col>
                        <v-col cols="2" class="px-1">
                          <span class="align-center">
                            {{`R$ ${maskMoney('pt-br', product.amount * product.oneshot_value)}`}}
                          </span>
                        </v-col>
                      </template>
                      <template v-else>
                        <v-col cols="2" class="px-1">
                          <span class="align-center">
                            {{product.product.payment === 'recurring' ? `R$ ${maskMoney('pt-br', product.amount * product.value * getProductCadenceValue(product.extra))}` : '-'}}
                          </span>
                        </v-col>
                        <v-col cols="2" class="px-1">
                          <span class="align-center">
                            {{product.product.payment !== 'recurring' ? `R$ ${maskMoney('pt-br', product.amount * product.value)}` : '-'}}
                          </span>
                        </v-col>
                      </template>
                      <v-col cols="1" class="pl-1">
                        <div class="d-flex justify-start">
                          <v-btn text fab x-small @click="handleProductEdit(product)">
                            <i class="v-icon material-symbols-rounded grey--text text--lighten-3">edit_square</i>
                          </v-btn>
                          <v-btn text fab x-small @click="handleProductDelete(product)">
                            <i class="v-icon material-symbols-rounded grey--text text--lighten-3">delete</i>
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                    <v-row v-if="companyProducts.length > 0 && index === (companyProducts.length-1)" class="total-container">
                      <v-col cols="2" offset="7" class="px-2">
                        <span class="align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', recurringTotalValue)}`}}</span>
                      </v-col>
                      <v-col cols="2" class="px-2">
                        <span class="align-center font-weight-bold">{{`R$ ${maskMoney('pt-br', oneshotTotalValue)}`}}</span>
                      </v-col>
                      <v-col cols="1" class="px-2">
                      </v-col>
                    </v-row>
                  </v-container>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <v-alert
              v-if="applyToAllCompanies"
              colored-border
              border="left"
              color="warning"
              elevation="1"
              icon="mdi-alert-circle"
              max-width="716"
            >
              Selecione os produtos e serviços que devem ser aplicados para todas as empresas da oportunidade.
              <br />
              <br />
              Os valores podem sofrer variações de acordo com as características das empresas.
            </v-alert>
          </div>
        </v-card-text>
        <DialogAction 
          submit-text="Concluir" 
          :disableSubmit="productFormData.discount > discountRange.at(-1) && valueModifier === 'discount'"
          @cancel="cancel" 
          @submit="cancel" 
          />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required, requiredIf } from 'vuelidate/lib/validators'

export default {
  props: {
    opportunityActivated: Boolean,
    hasInvoicePending: Boolean,
    editMode: Boolean,
    opportunity: Object,
    company: Object,
    tab: String,
  },
  data: () => ({
    dialog: false,
    productFormData: {
      opportunity_id: null,
      product_id: null,
      customer_id: null,
      value: null,
      amount: null,
      totalValue: null,
      discount: null,
      discount_months: null,
      extra: null,
    },
    product: null,
    productsList: [],
    familyList: [],
    loadingProducts: false,
    productFamily: null,
    productSelected: false,
    companyProducts: [],
    editingProductId: null,
    isSendingPayload: false,
    rules: {
      min: (v) => v >= 0 || 'Insira uma porcentagem válida',
    },
    expiration_dates: [
      { text: '1 mês', value: 1 },
      { text: '2 meses', value: 2 },
      { text: '3 meses', value: 3 },
      { text: '4 meses', value: 4 },
      { text: '5 meses', value: 5 },
      { text: '6 meses', value: 6 },
      { text: '7 meses', value: 7 },
      { text: '8 meses', value: 8 },
      { text: '9 meses', value: 9 },
      { text: '10 meses', value: 10 },
      { text: '11 meses', value: 11 },
      { text: '12 meses', value: 12 },
      { text: '13 meses', value: 13 },
      { text: '14 meses', value: 14 },
      { text: '15 meses', value: 15 },
      { text: '16 meses', value: 16 },
      { text: '17 meses', value: 17 },
      { text: '18 meses', value: 18 },
      { text: '19 meses', value: 19 },
      { text: '20 meses', value: 20 },
      { text: '21 meses', value: 21 },
      { text: '22 meses', value: 22 },
      { text: '23 meses', value: 23 },
      { text: '24 meses', value: 24 },
    ],
    recurringTotalValue: null,
    oneshotTotalValue: null,
    discountRange: [],
    selectedProductId: null,
    searchFamily: null,
    applyToAllCompanies: false,
    productsToAll: [],
    productExtra: null,
    cadenceItems: [],
    cadenceValue: null,
    productInstallments: 1,
    installmentsItens: [1],
    valueModifier: 'discount',
  }),
  validations: {
    productFormData: {
      product_id: { required },
      amount: { required },
      totalValue: { required: requiredIf(function() {
        if (this.productFormData.value !== 0) {
          return true
        }
        return false
      }) },
      discount_months: { required: requiredIf(function() {
        if ((this.discountApplied || this.hasPriceLock) && this.enableDiscountInterval()) {
          return true
        }
        return false
      }) },
    },
    cadenceValue: {
      name: { required: requiredIf(function() {
        if (!['oneshot', 'mixed'].includes(this.productPayment) && this.productFormData.value !== 0) {
          return true
        }
        return false
      }) }
    },
  },
  computed: {
    ...mapGetters({
      products: 'products',
    }),
    companyId: function() {
      return this.company.id
    },
    companies: function() {
      const { id, name, identifier } = this.company
      return [{ id, name, identifier, active: false, products: this.companyProducts }]
    },
    isEditing: function() {
      if (this.editingProductId) {
        return true
      }
      return false
    },
    discountAlert: function() {
      const { discount } = this.productFormData
      if (discount > this.discountRange?.at(0) && this.valueModifier === 'discount') return true
      return false
    },
    discountAlertMessages() {
      if (this.discountAlert) {
        const { discount } = this.productFormData

        if (this.hasInvoicePending) 
          return ('Você já possui uma proposta com desconto pendente de aprovação. Aguarde a conclusão da solicitação para criar uma nova proposta.')
                 
        else if (discount <= this.discountRange?.at(-1)) 
          return (`O desconto inserido está acima do permitido para o seu usuário. Para seguir com a ${this.tab} será necessário solicitar a aprovação ou ajustar o desconto inserido agora.`)
        
        else if (discount > this.discountRange?.at(-1)) 
          return (`O desconto inserido excede o valor máximo permitido para este produto. Por favor, insira um desconto menor que <b> ${this.discountRange.at(-1)}% <b>`)                  
      }

      return null
    },
    encodedSearchFamily: function() {
      return encodeURI(this.searchFamily)
    },
    hasCompanyRequirements: function() {
      if ((this.company.tax_model && this.company.year_revenue > 0 && this.company.cnaes?.length > 0) || (this.company.identifier_type?.toLowerCase()=='cpf')) {
        return true
      }
      return false
    },
    hasPartnershipProduct: function() {
      const partnershipProductIdentifier = 'cec09e8c33024d5aa19673ad677d6f0d'
      if (this.product?.identifier === partnershipProductIdentifier) {
        return true
      }
      return false
    },
    discountApplied: function() {
      if (this.productFormData.discount && this.productFormData.discount > 0 && !['oneshot'].includes(this.productPayment)) {
        return true
      }
      return false
    },
    productPayment: function() {
      if (this.product) {
        return this.product.payment
      }
      return null
    },
    disableFields: function() {
      if (['oneshot', 'mixed'].includes(this.productPayment)) {
        return false
      }
      if (this.productPayment !== 'oneshot' && !this.cadenceValue) {
        return true
      }
      return false
    },
    percentFieldLabel() {
      if (this.valueModifier === 'discount') {
        return 'Desconto (%)'
      }
      return 'Porcentagem a mais (%)'
    },
    validityFieldLabel() {
      if (this.valueModifier === 'discount') {
        return 'Vigência do desconto'
      } else if (this.valueModifier === 'lock') {
        return 'Vigência da trava'
      }
      return 'Vigência da alteração'
    },
    calcModifier() {
      if (this.valueModifier === 'discount') {
        return -1
      }
      return 1
    },
    hasPriceLock() {
      if (this.valueModifier === 'lock') {
        return true
      }
      return false
    },
    oneshotProduct() {
      if (this.productPayment === 'oneshot') {
        return true
      }
      return false
    },
    priceRules() {
      const cadenceMultiplier = this.cadenceValue?.value ? this.cadenceValue.value : 1
      const defaultValue = this.productFormData.value * this.productFormData.amount * cadenceMultiplier
      if (this.valueModifier === 'discount') {
        return (value) => {
          const floatValue = parseFloat(value.replace('.',''))
          if (floatValue > 0) {
            return floatValue <= defaultValue || `Insira um valor menor que R$${this.maskMoney('pt-br', defaultValue)}`
          }
          return true
        }
      } else if (this.valueModifier === 'overprice') {
        return (value) => {
          const floatValue = parseFloat(value.replace('.',''))
          if (floatValue > 0) {
            return floatValue > defaultValue || `Insira um valor maior que R$${this.maskMoney('pt-br', defaultValue)}`
          }
          return true
        }
      }
      return true
    },
  },
  watch: {
    dialog(newValue) {
      if(newValue) {
        this.productFormData.customer_id = this.companyId
        this.productFormData.opportunity_id = this.opportunity.id
        this.$nextTick(() => {
          if (!this.hasCompanyRequirements) {
            this.$swal({
              icon: 'warning',
              title: 'Necessário informações de cadastro da Empresa',
              footer: 'Enquadramento tributário - Faturamento - CNAE',
              scrollbarPadding: false,
              target: document.getElementById('product-form-card'),
            })
          } else {
            this.getCompanyProducts()
          }
        })
      }
    },
    companyProducts(newValue) {
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
    async selectedProductId(newValue) {
      if (newValue) {
        this.product = null
        this.loadingProducts = true
        const product = await this.getItem('/ecosystem/product', `company_id=${this.companyId}&id=${newValue}`)
        this.product = product
        this.productFormData.product_id = newValue
        this.productFamily = product?.family
        this.productFormData.value = product?.value
        this.getProductExtra(product)
        this.setInstallments(this.productExtra)
        if (!this.isEditing) {
          if (['oneshot', 'mixed'].includes(this.productPayment)) {
            this.productFormData.extra = product.extra
          } else {
            this.productFormData.extra = null
          }
          this.productFormData.discount = null
          this.productFormData.amount = 1
          this.valueModifier = 'discount'
        }
        this.discountRange = product?.discountRange
        this.loadingProducts = false
      } else {
        this.clearProductForm()
      }
    },
    'productFormData.discount': function(newValue) {
      if (!newValue || newValue <= 0) {
        this.productFormData.discount_months = null
      } else {
        this.$v.productFormData.discount_months.$reset()
      }
    },
    productInstallments(newValue) {
      if (newValue) {
        if (this.productExtra?.activation_fields?.installments) {
          const extra = JSON.parse(JSON.stringify(this.productExtra))
          const installments = {
            items: [...Array(extra.activation_fields.installments).keys()].map( i => i+1),
            value: newValue
          }
          extra.activation_fields.installments = installments
          this.productFormData.extra = JSON.stringify(extra)
        }
      }
    },
    productPayment(newValue) {
      if (['oneshot', 'mixed'].includes(newValue)) {
        if (!this.isEditing) {
          this.productFormData.totalValue = this.productFormData.amount * this.productFormData.value
        }
      } else {
        this.setCadenceValue(this.productFormData.extra)
      }
    },
    'productFormData.extra': function(newValue) {
      this.setInstallmentsValue(newValue)
    }
  },
  methods: {
    async getProductsList() {
      this.loadingProducts = true
      await this.$store.dispatch('fetchProducts', `order=family,name&limit=1000&state=active&company_id=${this.companyId}`)
      this.loadingProducts = false
    },
    generateFamilyList(products) {
      const families = products.map((product) => product.family)
      this.familyList =  [...new Set(families)]
    },
    async getCompanyProducts() {
      const { data: opportunityProducts } = await this.getList('/cash/products-by-customer', `includes=product&opportunity_id=${this.opportunity.id}`)
      const companyProducts = opportunityProducts[this.companyId]
      if (companyProducts) {
        this.companyProducts = companyProducts.map((product) => ({
          ...product,
          valueModifier: this.getValueModifier(product.extra)
        }))
      } else {
        this.companyProducts = []
      }
    },
    setTotalValue() {
      const cadenceMultiplier = this.cadenceValue?.value ? this.cadenceValue.value : 1
      const { amount, value, discount } = this.productFormData
      const totalValue = amount * value * cadenceMultiplier * (1 + (discount * this.calcModifier) / 100)
      this.productFormData.totalValue = parseFloat(totalValue.toFixed(2))
    },
    setDiscount() {
      const cadenceMultiplier = this.cadenceValue?.value ? this.cadenceValue.value : 1
      const { amount, value, totalValue } = this.productFormData
      const defaultValue = amount * value * cadenceMultiplier
      const discount = this.calcModifier * (totalValue - defaultValue) / defaultValue * 100
      this.productFormData.discount = parseFloat(discount.toFixed(2))
    },
    async handleProducts() {
      this.$v.productFormData.$touch()
      this.$v.cadenceValue.$touch()
      if (this.$v.productFormData.$error) return
      if (this.$v.cadenceValue.$error) return
      if (!this.$refs['product-form'].validate()) return
      this.isSendingPayload = true
      this.setValueModifier(this.productFormData.extra, this.valueModifier)
      const { discount, value, ...productsPayload } = this.productFormData
      const cadenceMultiplier = this.cadenceValue?.value ? this.cadenceValue.value : 1
      const finalValue = this.productFormData.totalValue / cadenceMultiplier
      productsPayload.totalValue = parseFloat(finalValue.toFixed(2))
      if (this.isEditing) {
        await this.$store.dispatch('Opportunity/updOpportunityProduct', { id: this.editingProductId, ...productsPayload})
        this.editingProductId = null
      } else {
        await this.$store.dispatch('Opportunity/addOpportunityProduct', productsPayload)
      }
      this.clearProductForm()
      await this.getCompanyProducts()
      this.isSendingPayload = false
    },
    clearProductForm() {
      this.$v.$reset()
      this.$refs['product-form'].reset()
      this.$refs.productAutocomplete.clearCachedItems()
      this.product = null
      this.selectedProductId = null
      this.editingProductId = null
      this.productFormData.customer_id = this.companyId
      this.productFormData.opportunity_id = this.opportunity.id
      this.productFormData.extra = null
      this.productFormData.value = null
      this.productFormData.totalValue = null
      this.productExtra = null
      this.cadenceItems = []
      this.cadenceValue = null
      this.productInstallments = 1
      this.installmentsItens = [1]
      this.valueModifier = 'discount'
    },
    cancel() {
      this.$v.$reset()
      this.$refs['product-form'].reset()
      this.$refs.productAutocomplete.clearCachedItems()
      this.selectedProductId = null
      this.editingProductId = null
      this.$emit('updateProducts')
      this.dialog = false
    },
    handleProductEdit(product) {
      const cadenceValue = this.getProductCadenceValue(product.extra)
      this.valueModifier = this.getValueModifier(product.extra)
      this.searchFamily = product.product.family
      this.productFamily = product.product.family
      this.editingProductId = product.id
      this.selectedProductId = product.product_id
      this.productFormData.value = product.original_value
      this.productFormData.amount = product.amount
      this.productFormData.discount_months = product.discount_months
      this.productFormData.extra = product.extra
      this.setCadenceValue(product.extra)
      this.productFormData.totalValue = product.amount * product.value * cadenceValue
      this.$nextTick(() => {
        const discount = this.calcModifier * (product.value - product.original_value) / product.original_value * 100
        this.productFormData.discount = parseFloat(discount.toFixed(2))
      })
    },
    async handleProductDelete(product) {
      await this.removeItem('/cash/opportunity-product', product.id)
      await this.getCompanyProducts()
    },
    generateProductsList(products) {
      this.productsList = products
      this.generateFamilyList(products)
    },
    setCadenceValue(extra) {
      if (extra) {
        const parsedExtra = JSON.parse(extra)
        if (parsedExtra?.activation_fields?.billing_cadence) {
          const cadenceIdentifier = parsedExtra?.activation_fields?.billing_cadence.value
          const cadence = this.cadenceItems.find((item) => item.identifier === cadenceIdentifier)
          this.cadenceValue = cadence
        }
      } else {
        this.cadenceValue = null
      }
    },
    setInstallmentsValue(extra) {
      if (extra) {
        const parsedExtra = JSON.parse(extra)
        if (parsedExtra?.activation_fields?.installments?.value) {
          const installments = parsedExtra?.activation_fields?.installments.value
          this.productInstallments = installments
        }
      } else {
        this.productInstallments = 1
      }
    },
    setInstallments(extra) {
      if (extra) {
        if (extra.activation_fields?.installments) {
          this.installmentsItens = [...Array(extra.activation_fields.installments).keys()].map( i => i+1)
        }
      } else {
        this.installmentsItens = [1]
      }
    },
    getCadence(_product) {
      return 'anual'
    },
    getProductExtra(product) {
      try {
        if (product.extra) {
          const extra = JSON.parse(product.extra)
          this.productExtra = extra
          if (extra?.activation_fields?.billing_cadence) {
            this.cadenceItems = extra.activation_fields.billing_cadence
          }
        }
      } catch (error) {
        console.log(error)
      }
    },
    generateLabelValue() {
      if (this.product?.payment === 'oneshot') {
        return 'Valor Total'
      }
      if (this.cadenceValue?.identifier === 'mensal') {
        return 'Valor mensal'
      } else {
        return 'Valor anual'
      }
    },
    enableDiscountInterval() {
      if (!this.cadenceValue) {
        return true
      }
      if (this.cadenceValue.identifier === 'mensal') {
        return true
      } else {
        return false
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
      else if (product.product.payment === 'mixed') {
        return 'Pagamento misto'
      }
      return cadence ? cadence.name : '-'
    },
    setValueModifier(extra, valueModifier) {
      if (extra) {
        const parsedExtra = JSON.parse(extra)
        parsedExtra.value_modifier = valueModifier
        this.productFormData.extra = JSON.stringify(parsedExtra)
      }
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
    onModifierChange() {
      this.productFormData.discount = null
      this.setTotalValue()
    },
    onCadenceChange(cadenceValue) {
      if (cadenceValue) {
        if (this.productExtra?.activation_fields?.billing_cadence) {
          const extra = JSON.parse(JSON.stringify(this.productExtra))
          const billing_cadence = {
            items: extra.activation_fields.billing_cadence,
            value: cadenceValue.identifier
          }
          extra.activation_fields.billing_cadence = billing_cadence
          this.productFormData.extra = JSON.stringify(extra)
        }
        const totalValue = this.productFormData.amount * this.productFormData.value * cadenceValue.value * (1 - this.productFormData.discount / 100)
        this.productFormData.totalValue = parseFloat(totalValue.toFixed(2))
        if (cadenceValue.identifier !== 'mensal') {
          this.productFormData.discount_months = null
        }
      }
    }
  }
}
</script>

<style scoped>
 .treeview-container {
  border:1px solid #D2D6DA;
  border-radius: 8px;
  min-height: 220px;
 }
 .total-container {
    background-color: rgba(245, 245, 245, 0.5);
    border-top: 0.8px solid #D2D6DA;
    border-radius: 0px;
  }
  .company-item {
    border-top: 0.8px solid #F5F5F5;
  }
  .v-card-text {
    min-height: 550px;
    max-height: 600px;
    overflow-y: auto;
  }

  .disabled-radio-tooltip {
    cursor: default !important;
    pointer-events: visible !important; 
  }
</style>
