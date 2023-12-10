<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
      <v-select
        attach
        label="Tipo"
        placeholder="Digite aqui..."
        outlined
        dense
        item-text="name"
        item-value="value"
        v-model="formData.type"
        :items="meta.businessItemType"
        :error="$v.formData.type.$error"
        :error-messages="
          $v.formData.type.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-select>
      <div v-if="formData.type == 'companies'">
        <span class="font-weight-bold">Filtros</span>
        <v-divider class="mb-4"></v-divider>
        <template v-for="filter, i in filters">
          <div :key="i">
            <v-row>
              <v-col cols="4" class="pa-2">
                <v-select 
                  attach dense outlined class="mx-1" item-text="name" item-value="value" :items="criteria" v-model="filter.criteria"/>
              </v-col>
              <v-col cols="2" class="pa-2">
                <v-select 
                  attach dense outlined class="mx-1" item-text="key" item-value="value" :items="operators" v-model="filter.operator"/>
              </v-col>
              <v-col cols="5" class="pa-2">
                <v-select
                  attach
                  v-if="findCriteria(filter.criteria)"
                  dense
                  outlined
                  class="mx-1"
                  item-text="value"
                  item-value="key"
                  v-model="filter.value"
                  :items="findCriteria(filter.criteria)"
                />
                <v-text-field v-else dense outlined class="mx-1" type="text" v-model="filter.value"></v-text-field>
              </v-col>
              <v-col cols="1" class="pa-2">
                <v-btn fab icon small @click="removeFilter(i)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </template>
        <v-form ref="filterForm">
          <v-row>
            <v-col cols="4" class="pa-2">
              <v-select
                attach
                dense
                outlined
                class="mx-1"
                item-text="name"
                item-value="value"
                :items="criteria"
                v-model="filterForm.criteria"
                :error="$v.filterForm.criteria.$error"
                :error-messages="$v.filterForm.criteria.$error ? 'Esse campo é obrigatório' : ''"
              />
            </v-col>
            <v-col cols="2" class="pa-2">
              <v-select
                attach
                dense
                outlined
                class="mx-1"
                item-text="key"
                item-value="value"
                :items="operators"
                v-model="filterForm.operator"
              />
            </v-col>
            <v-col cols="5" class="pa-2">
              <v-select
                attach
                v-if="findCriteria(filterForm.criteria)"
                dense
                outlined
                class="mx-1"
                item-text="value"
                item-value="key"
                v-model="filterForm.value"
                :items="findCriteria(filterForm.criteria)"
                :error="$v.filterForm.value.$error"
                :error-messages="$v.filterForm.value.$error ? 'Esse campo é obrigatório' : ''"
              />
              <v-text-field
                v-else
                dense
                outlined
                class="mx-1"
                type="text"
                v-model="filterForm.value"
                :error="$v.filterForm.value.$error"
                :error-messages="$v.filterForm.value.$error ? 'Esse campo é obrigatório' : ''"
              />
            </v-col>
            <v-col cols="1" class="pa-2">
              <v-btn fab icon small color="primary" @click="addFilter(filterForm)">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>
      <Autocomplete
        v-else-if="formData.type == 'opportunities'"
        label="Pipeline"
        outlined
        endpoint="/cash/pipeline"
        :initial-value="formData.pipeline_id"
        :validate="$v.filterOrPipeline"
        @valueSelected="(value) => {formData.pipeline_id = value}"
      ></Autocomplete>
    </v-form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String,
    categoryId: Number
  },
  data: () => ({
    endpoint: '/business/business-item',
    nextIndex: 0,
    formData: {
      name: '',
      type: null,
      index: null,
      business_category_id: null,
      filter: null,
      pipeline_id: null
    },
    filterForm: {
      criteria: null,
      operator: null,
      value: null
    },
    filters: [],
    criteria: [],
    operators: []
  }),
  validations: {
    formData: {
      name: { required },
      type: { required },
    },
    filterForm: {
      criteria: { required },
      value: { required },
    },
    filterOrPipeline: { required }
  },
  mounted() {
    this.getNextIndex()
    this.getFilterExpressions()
    this.loadForm(this.itemId)
  },
  computed: {
    ...mapGetters(['meta']),
    filterOrPipeline: function () {
      if (this.formData.type == 'companies' || this.formData.pipeline_id) {
        return true
      } else {
        return null
      }
    }
  },
  watch: {
    async dialog(newValue) {
      if (newValue) {
        this.getNextIndex()
        if (this.isEditing) {
          this.loadForm(this.itemId)
        }
      }
    },
    'filterForm.criteria': function () {
      this.filterForm.value = null
    }
  },
  methods: {
    loadForm(id) {
      if (this.isEditing) {
        this.getContent(id)
      }
    },
    async submitForm() {
      this.formData.business_category_id = this.categoryId
      this.$v.$touch()
      if (this.$v.formData.$error || this.$v.filterOrPipeline.$error) return
      this.handleFilters()
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.updateData(this.endpoint, this.formData)
      } else {
        this.formData.index = this.nextIndex
        await this.createItem(this.endpoint, this.formData)
      }
      this.$emit('formSubmitted')
      this.handleCancel()
    },
    async getContent(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.formData = { ...content }
      content.filter && (this.filters = JSON.parse(content.filter))
    },
    handleCancel() {
      this.formData.pipeline_id = null
      this.$refs.form.reset()
      this.formData.type == 'companies' && this.$refs.filterForm.reset()
      this.$v.$reset()
    },
    async getNextIndex() {
      const { total } = await this.getList('/business/business-item', `&business_category_id=${this.categoryId}`)
      this.nextIndex = total
    },
    async getFilterExpressions() {
      const { criteria, operators } = await this.getList('/business/business-item-filter-expressions')
      this.criteria = await this.generateProductsList(criteria)
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
      if (this.formData.type == 'companies') {
        if (this.filters.length > 0) {
          this.formData.filter = JSON.stringify(this.filters)
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
    async generateProductsList(criteria) {
      const criteriaList = criteria
      const productValues = {}
      const { data } = await this.getList('/ecosystem/product')
      data.forEach((product) => {
        productValues[product.id] = product.name
      })
      const productIndex = criteria.findIndex((criteria) => criteria.value == 'product_id')
      criteriaList[productIndex].values = productValues
      return criteriaList
    }
  }
}
</script>
