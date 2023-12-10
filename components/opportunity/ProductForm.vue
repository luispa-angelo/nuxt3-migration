<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="isEditing"
          text
          v-bind="attrs"
          v-on="on"
        >
          Editar
        </v-btn>
        <v-btn
          v-else
          color="secondary"
          x-small
          fab
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="primary">mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Adicionar produto" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-form ref="forms">
            <v-autocomplete
              attach
              outlined
              dense
              clearable
              label="Familia de produto"
              v-model="productFamily"
              :items="familyList"
              :loading="loadingProducts"
              :disabled="loadingProducts"
            >
            </v-autocomplete>
            <v-autocomplete
              attach
              required
              outlined
              dense
              label="Produto"
              item-value="id"
              item-text="name"
              no-data-text="Nenhum produto encontrado para faturamento, cnae e enquadramento tributário fornecido"
              v-model="formData.product_id"
              :items="productsList"
              :loader-height="3"
              :loading="loadingProducts"
              :disabled="loadingProducts"
              :error="$v.formData.product_id.$error"
              :error-messages="$v.formData.product_id.$error ? 'Esse campo é obrigatório' : ''"
            >
            </v-autocomplete>
            <v-text-field
              type="number"
              label="Quantidade"
              v-model="formData.amount"
              required
              outlined
              dense
              :disabled="!formData.product_id"
              min="0"
              :rules="[rules.min]"
              :error="$v.formData.amount.$error"
              :error-messages="$v.formData.amount.$error ? 'Esse campo é obrigatório' : ''"
            ></v-text-field>
            <v-text-field
              type="number"
              label="Valor"
              v-model="formData.value"
              required
              outlined
              dense
              :disabled="!formData.product_id"
              min="0"
              :rules="[rules.min]"
              :error="$v.formData.value.$error"
              :error-messages="$v.formData.value.$error ? 'Esse campo é obrigatório' : ''"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <DialogAction :disable-submit="!hasCompanyRequirements" @submit="handleProducts" @cancel="cancel" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    itemId: Number,
    itemName: String,
    isEditing: Boolean,
    company: Object
  },
  data: () => ({
    productSelected: false,
    dialog: false,
    showTable: true,
    productsList: [],
    familyList: [],
    productFamily: null,
    btnText: 'Adicionar',
    opportunityId: null,
    loadingProducts: false,
    formData: {
      opportunity_id: null,
      product_id: null,
      value: null,
      amount: null
    },
    rules: {
      min: v => v >= 0 || 'Maior que zero'
    }
  }),
  validations: {
    formData: {
      product_id: { required },
      value: { required },
      amount: { required },
    },
  },
  computed: {
    ...mapGetters({
      products: 'products',
      opportunity: 'Opportunity/opportunity',
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta'
    }),
    hasCompanyRequirements: function() {
      if ((this.company.tax_model && this.company.year_revenue > 0 && this.company.cnaes?.length > 0) || (this.company.identifier_type?.toLowerCase()=="cpf")) {
        return true
      }
      return false
    }
  },
  watch: {
    dialog(newValue) {
      if(newValue && !this.hasCompanyRequirements) {
        this.$swal({
          icon: 'warning',
          title:
            'Necessário informações de cadastro da Empresa',
          footer: 'Enquadramento tributário - Faturamento - CNAE'
        })
      }
      if(!this.isEditing && newValue && this.hasCompanyRequirements) {
        this.getData()
      }
      if(this.isEditing && newValue && this.hasCompanyRequirements) {
        this.handleEdit(this.itemId)
      }
    },
    'formData.amount': function(newValue) {
      if (newValue) {
        const { value } = this.products.find(
          product => product.id == this.formData.product_id
        )
        this.formData.value = newValue * value
      }
    },
    'formData.product_id': function(newValue) {
      if (newValue) {
        const product = this.products.find(
          product => product.id == this.formData.product_id
        )
        this.productFamily = product.family
      }
      if (!this.isEditing) {
        this.formData.amount = null
        this.formData.value = null
      }
    },
    isEditing(newValue) {
      !newValue ? (this.btnText = 'Adicionar') : (this.btnText = 'Editar')
    },
    products(newValue) {
      this.generateFamilyList(newValue)
      this.productsList = this.products
    },
    productFamily(newValue) {
      if (newValue) {
        this.productsList = this.products.filter((product) => product.family == newValue)
      } else {
        this.productsList = this.products
      }
    }
  },
  methods: {
    handleDeleteAction(id) {
      const item = this.items.find((item) => item.id == id)
      this.handleDelete(item)
    },
    handleDelete(item) {
      const index = this.items.indexOf(item)
      this.$emit('removeItem', index)
    },
    cancel() {
      this.$refs.forms.reset()
      this.$v.$reset()
      this.dialog = !this.dialog
    },
    async getData() {
      this.loadingProducts = true
      this.opportunityId = this.$route.params.id
      this.formData.opportunity_id = this.opportunityId
      await this.$store.dispatch('fetchProducts', `order=family_asc&state=active&limit=1000&company_id=${this.company.id}`)
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${this.opportunityId}`
      )
      this.loadingProducts = false
    },
    async handleProducts() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (!this.isEditing) {
        await this.$store.dispatch('Opportunity/addOpportunityProduct', this.formData)
      } else {
        await this.$store.dispatch('Opportunity/updOpportunityProduct', this.formData)
        // delete this.formData.id
      }
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${this.opportunityId}`
      )
      this.cancel()
    },
    async handleEdit(id) {
      this.opportunityId = this.$route.params.id
      await this.$store.dispatch('fetchProducts', `order=family_asc&state=active&company_id=${this.company.id}`)
      this.loadingProducts = false
      this.productSelected = this.opportunityProducts.find(
        product => product.id == id
      )
      
      this.productSelected.value = this.productSelected.value.replace(/[^\d.]/g, '')

      const { created_at, updated_at, product, ...content } = this.productSelected
      this.formData = { ...content }
      this.productFamily = product.family
    },
    generateFamilyList(products) {
      const families = products.map((product) => product.family)
      this.familyList =  [...new Set(families)]
    }
  }
}
</script>