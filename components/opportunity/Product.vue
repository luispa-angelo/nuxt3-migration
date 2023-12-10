<template>
  <v-expansion-panel :class="removeShadow ? 'v-expansion-panel-no-shadow' : ''">
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Produtos ({{ counter }})</p>
        </div>
      </template>
      <template v-slot:actions>
        <OpportunityProductForm v-if="showForm" :isEditing='false' :company="company"/>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <DataList
        hasSlot
        hasDelete
        delete-action="delete"
        v-slot:default="slotProps"
        :list="list"
        :hasMenu="showForm"
        @removeItem="handleRemove"
      >
        <OpportunityProductForm 
          :item-id="slotProps.itemId"
          :item-name="slotProps.item.title_1"
          isEditing
          :company="company"
        />
      </DataList>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    opportunityId: Number,
    company: Object,
    removeShadow: Boolean,
    showForm: Boolean
  },
  data: () => ({
    showTable: true,
    counter: 0,
    list: [],
    btnText: 'Adicionar',
    editMode: false
  }),
  computed: {
    ...mapGetters({
      products: 'products',
      opportunity: 'Opportunity/opportunity',
      opportunityProducts: 'Opportunity/opportunityProducts',
      meta: 'meta'
    }),
  },
  async mounted() {
    await this.getData()
  },
  watch: {
    list(newValue) {
      if(newValue) {
        return this.counter = this.list.length
      }
    },
    'formData.amount': function(newValue) {
      if (newValue && !this.editMode) {
        const { value } = this.products.find(
          product => product.id == this.formData.product_id
        )
        this.formData.value = newValue * value
      }
    },
    'formData.product_id': function() {
      if (!this.editMode) {
        this.formData.amount = null
        this.formData.value = null
      }
    },
    opportunityProducts(newValue) {
      this.showTable = true
      this.list = null
      this.list = newValue.map((item) => {
        return {
          id: item.id,
          title_1: item.product.name,
          title_2: item.amount,
          subtitle_1: item.product.type = this.getEnum(item.product.type, this.meta.productType),
          subtitle_2: item.value = `${this.maskMoney('pt-br', item.value)}`,
          tag: item.product.type = this.getEnum(item.state, this.meta.opportunityProductState),
        }
      })
    },
    editMode(newValue) {
      !newValue ? (this.btnText = 'Adicionar') : (this.btnText = 'Editar')
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
      this.dialog = !this.dialog
    },
    async getData() {
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${this.opportunity.id}`
      )
    },
    async handleProducts() {
      this.showTable = false
      if (!this.editMode) {
        await this.$store.dispatch('Opportunity/addOpportunityProduct', this.formData)
      } else {
        await this.$store.dispatch('Opportunity/updOpportunityProduct', this.formData)
        this.editMode = false
        delete this.formData.id
      }
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${this.opportunity.id}`
      )
      this.$refs.form.reset()
    },
    handleEdit(id) {
      const productSelected = this.opportunityProducts.find(
        product => product.id == id
      )
      const { created_at, updated_at, product, ...content } = productSelected
      this.editMode = true
      this.formData = { ...content }
    },
    async handleRemove(index) {
      const itemToRemove = this.opportunityProducts[index]
      await this.removeItem('/cash/opportunity-product', itemToRemove.id)
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${this.opportunity.id}`
      )
    },
  }
}
</script>

<style scoped>
  .v-expansion-panel-no-shadow::before {
    box-shadow: none !important;
  }
</style>