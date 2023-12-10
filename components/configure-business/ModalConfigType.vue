<template>
  <v-dialog
    scrollable
    persistent
    max-width="602px"
    v-model="showDialog"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-list-item
        v-bind="attrs"
        v-on="on"
      >
      <v-list-item-content>
        <v-list-item-title>
          Configurar
        </v-list-item-title>
      </v-list-item-content>
      </v-list-item>
    </template>
    <v-card v-if="showDialog" height="415px" class="px-4 py-4">
      <v-card-title class="d-flex justify-end pa-0">
        <v-btn
          fab
          color="secondary"
          max-width="25"
          max-height="25"
          x-small
          @click="closeDialog"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="cardContent">
        <div class="d-flex justify-center">
          <v-icon left>business_center</v-icon>
          <h6 style="font-size: 20px">Tipo</h6>
        </div>
        <v-radio-group v-model="type" class="pb-7">
          <v-radio label="Empresa" value="companies"/>
          <v-radio label="Oportunidade" value="opportunities"/>
        </v-radio-group>
        <div v-if="type === 'companies'">
          <v-form
            v-for="(filter, i) in filters"
            :key="i"
            ref="filterForm"
            class="d-flex align-start flex-column"
          >
            <div class="form_companies">
              <v-select
                attach
                v-model="filter.criteria"
                class="selectFilter"
                label="Filtro"
                :items="criteria"
                item-text="name"
                item-value="value"
                outlined
                dense
              />
              <v-select
                attach
                v-model="filter.operator"
                label="Condição"
                class="selectOperator"
                :items="operators"
                item-text="key"
                item-value="value"
                outlined
                dense
              />
              <v-select
                attach
                v-if="findCriteria(filter.criteria)"
                label="Selecione"
                class="selectFilter"
                dense
                outlined
                item-text="value"
                item-value="key"
                v-model="filter.value"
                :items="findCriteria(filter.criteria)"
              />
              <v-text-field
                v-else
                label="Digite aqui"
                class="selectFilter"
                dense
                outlined
                required
                v-model="filter.value"
              />
            </div>
          </v-form>
          <v-form
            ref="filterForm"
            class="d-flex align-start flex-column"
          >
            <div class="form_companies">
              <v-select
                attach
                v-model="filterForm.criteria"
                class="selectFilter"
                label="Filtro"
                :items="criteria"
                item-text="name"
                item-value="value"
                outlined
                dense
              />
              <v-select
                attach
                v-model="filterForm.operator"
                class="selectOperator"
                label="Condição"
                :items="operators"
                item-text="key"
                item-value="value"
                outlined
                dense
              />
              <v-autocomplete
                attach
                v-if="filterForm.criteria === 'product_id'"
                class="selectFilter"
                label="Selecione"
                placeholder="Comece a digitar para pesquisar"
                dense
                outlined
                item-text="name"
                item-value="id"
                v-model="filterForm.value"
                :items="products"
                :search-input.sync="search"
                :loading="isLoading"
                return-object
                cache-items
                no-data-text="Comece a digitar para pesquisar"
              />
              <v-select
                attach
                v-else-if="findCriteria(filterForm.criteria)"
                class="selectFilter"
                label="Selecione"
                dense
                outlined
                item-text="value"
                item-value="key"
                v-model="filterForm.value"
                :items="findCriteria(filterForm.criteria)"
              />
              <v-text-field
                v-else
                class="selectFilter"
                label="Digite aqui"
                dense
                outlined
                required
                v-model="filterForm.value"
              />
            </div>
          </v-form>
          <v-btn
            color="secondary"
            @click="addFilter(filterForm)"
          >
            Adicionar filtro
          </v-btn>
        </div>
        <v-form v-if="type === 'opportunities'">
          <NewAutocomplete
            dense
            label="Selecione o Pipeline"
            :endpoint="`/cash/pipeline?limit=100&tenant_id=${tenantId}`"
            v-model="formData.pipeline_id"
            item-value="id"
            item-text="name"
            outlined
            hide-details
          />
          <!-- TODO: descomentar código abaixo após criação da tela de Playbook
          <Autocomplete
            label="Selecione o Playbook"
            outlined
            :items="selectPlaybook"
          /> -->
        </v-form>
      </v-card-text>
      <v-card-actions class="d-flex justify-space-between">
        <v-btn color="secondary" @click="closeDialog" class="px-5">
          Cancelar
        </v-btn>
        <div>
          <v-btn
            v-show="type === 'opportunities'"
            color="secondary"
            class="px-5 mr-2"
            @click="$emit('createPipeline')"
          >
            Criar um Pipeline
          </v-btn>
          <v-btn color="primary" class="px-5" @click="submitForm">
            Salvar
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  data: () => ({
    showDialog: false,
    type: 'companies',
    selectPlaybook: [],
    nextIndex: 0,
    formData: {},
    filterForm: {
      criteria: null,
      operator: null,
      value: null
    },
    filters: [],
    criteria: [],
    operators: [],
    product: {
      id: null,
      name: ''
    },
    products: [],
    endpointFilter: '/business/business-item-filter-expressions',
    endpointItem: '/business/business-item',
    endpointProduct: '/ecosystem/product',
    isLoading: false,
    search: null
  }),
  props: {
    dataItem: {
      type: Object,
      default: () => {}
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    tenantId: {
      type: Number,
      default: null
    }
  },
  validations: {
    filterForm: {
      criteria: { required },
      value: { required },
    },
  },
  methods: {
    closeDialog() {
      this.showDialog = false
      this.filterForm = {
        criteria: null,
        operator: null,
        value: null
      }
    },
    async getFilterExpressions() {
      const { criteria, operators } = await this.getList(this.endpointFilter)
      this.criteria = criteria
      this.operators = this.generateKeyArray(operators)
    },
    removeFilter(index) {
      this.filters.splice(index,1)
    },
    addFilter(filter) {
      this.$v.$touch()
      if (this.$v.filterForm.$error) return
      this.filters.push({ ...filter })
      this.$refs.filterForm.reset()
      this.$v.filterForm.$reset()
    },
    handleFilters() {
      if (this.type == 'companies') {
        if (this.filterForm) {
          if (!this.filters.length) this.formData.filter = JSON.stringify([this.filterForm])
          else this.formData.filter = JSON.stringify(this.filters)
        } else {
          this.formData.filter = null
        }
      }
    },
    generateKeyArray(object) {
      const keyArray = []
      Object.entries(object).forEach(([key, value]) => {
        keyArray.push({ key, value })
      })
      return keyArray
    },
    findCriteria(criteriaValue) {
      const criteriaFound = this.criteria.find(({ value }) => value == criteriaValue)
      if (criteriaFound?.values) {
        return this.generateKeyArray(criteriaFound.values)
      } else {
        return null
      }
    },
    async generateProductsList() {
      const criteriaList = this.criteria
      const productValues = {}
      for (const product of this.products) {
        productValues[product.id] = product.name
      }
      const productIndex = this.criteria.findIndex((criteria) => criteria.value == 'product_id')
      criteriaList[productIndex].values = productValues
      return this.criteria = criteriaList
    },
    async submitForm() {
      this.$v.$touch()
      this.handleFilters()
      if (this.type == 'opportunities') this.formData.filter = null
      this.formData.type = this.type
      await this.updateData(this.endpointItem, this.formData)
      this.filters.push({...this.filterForm})
      this.closeDialog()
    },
    async getContent(itemId) {
      const { ...content } = await this.getItem(this.endpointItem, `id=${itemId}`)
      content.filter && (this.filters = JSON.parse(content.filter))
    },
  },
  mounted() {
    this.getFilterExpressions()
    this.formData = this.dataItem
    if (this.dataItem.type) this.type = this.dataItem.type
    if (this.isEdit || this.dataItem.id) {
      this.getContent(this.dataItem.id)
    }
  },
  watch: {
    async search(value) {
      if(value) {
        if(this.isLoading) return
        this.isLoading = true

        const { data } = await this.getList(this.endpointProduct, `name=like(${value})`)
        this.products = data.map((product => (product.name)))
        await this.generateProductsList()
        this.isLoading = false
      }
    }
  }
}
</script>
<style lang="scss">
.form_companies {
  display: flex;
  gap: 16px;
  .selectFilter {
    max-width: 180px;
  }
  .selectOperator {
    max-width: 124px;
  }
}
.cardContent {
  @include thin-scrollbar;
  display: flex;
  flex-direction: column;
  margin: 16px 0;

  .v-input--radio-group__input {
    display: flex;
    flex-direction: row !important;
    align-items: center;
    justify-content: center;
    gap: 30px;
  }
  .v-radio:not(:last-child):not(:only-child) {
    margin-bottom: 0 !important;
  }
}
</style>