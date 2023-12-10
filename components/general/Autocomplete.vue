<template>
  <v-autocomplete
    attach  
    required
    dense
    cache-items
    ref="autocomplete"
    v-bind="$attrs"
    v-on="$listeners"
    v-model="value"
    :return-object="returnObject"
    :loading="showLoader ? isLoading : null"
    :item-value="itemValue"
    :item-text="alternativeText ? alternativeText : itemText"
    :items="endpoint ? list : items"
    :error-messages="hasValidation(validate) ? 'Esse campo é obrigatório' : ''"
    :search-input.sync="search"
  >
    <template v-if="isRequired" v-slot:label>
      {{ $attrs.label }}
      <span class="error--text">*</span>
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    endpoint: String,
    isRequired: { type: Boolean, default: false },
    validate: { type: Object },
    itemValue: { type: String, default: 'id' },
    itemText: { default: 'name' },
    searchKey: { type: String, default: 'name' },
    isSolo: { type: Boolean, default: false },
    query: { type: String, default: null },
    initialValue: { type: [String, Number, Object, Array], default: null },
    reloadTrigger: { type: [String, Number, Object, Boolean], default: null },
    lengthToStartSearch: { type: Number, default: 0 },
    customCriteria: { type: Boolean, default: false },
    customQueryFilter: { type: String, default: '' },
    showLoader: { type: Boolean, default: false },
    returnObject: { type: Boolean, default: false },
    filter: {
      type: Function,
      default() {
        return true
      },
    },
    postProcess: {
      type: Function,
      default(el) {
        return el
      },
    },
    items: {
      type: Array,
      default() {
        return []
      },
    },
  },
  data: () => ({
    list: [],
    search: null,
    value: null,
    alternativeText: null,
    isLoading: false,
  }),
  async mounted() {
    await this.getInicialData()
  },
  watch: {
    async search(newValue, oldValue) {
      if (
        newValue?.length >= this.lengthToStartSearch &&
        newValue !== this.select
      )
        await this.getData(newValue, oldValue)
    },
    value(newValue) {
      this.$emit('valueSelected', newValue)
    },
    disabled(newValue) {
      newValue && !this.initialValue && (this.value = null)
    },
    async initialValue(newValue) {
      newValue && (await this.setInitialValue(newValue))
    },
    async reloadTrigger() {
      this.$refs.autocomplete.cachedItems = []
      this.endpoint && (await this.setList(this.endpoint, this.query))
      if (!this.list.find((item) => item[this.itemValue] === this.value)) {
        this.value = null
      }
    },
    list(newValue) {
      this.$emit('autocompleteList', newValue)
    },
  },
  methods: {
    async getData(nameQuery) {
      if (nameQuery !== this.initialValue) {
        if (this.endpoint) {
          let fullQuery = `${this.searchKey}=like(${encodeURI(nameQuery)})`
          if (this.customCriteria) {
            if (this.customQueryFilter !== '')
              fullQuery = `${this.customQueryFilter}(${nameQuery})`
            else fullQuery = `criteria=${nameQuery}`
          }
          this.query && (fullQuery = `${this.query}&${fullQuery}`)
          await this.setList(this.endpoint, fullQuery)
        } else {
          this.list = this.items
        }
      }
    },
    async getInicialData() {
      if (!this.customCriteria) {
        this.clearCachedItems()
        this.endpoint && (await this.setList(this.endpoint, this.query))
        await this.setInitialValue(this.initialValue)
      }
    },
    async setInitialValue(value) {
      if (value) {
        if (this.endpoint) {
          await this.setList(
            this.endpoint,
            `${this.query ? `${this.query}&` : ''}${this.itemValue}=${encodeURI(
              value
            )}`
          )
        }
        this.value = value
      }
    },
    async setList(endpoint, query, isReload) {
      this.isLoading = true
      let { data } = await this.getList(endpoint, query)
      data = this.postProcess(data)
      this.list = data.filter(this.filter)
      if (isReload) {
        this.value = null
      }
      this.isLoading = false
    },
    hasValidation(validate) {
      if (validate) {
        return validate.$error
      } else {
        return false
      }
    },
    clearCachedItems() {
      this.$refs.autocomplete.cachedItems = []
      this.value = null
    },
  },
}
</script>
