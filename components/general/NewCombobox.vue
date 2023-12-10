<template>
  <v-combobox
    ref="combobox"
    v-bind="$attrs"
    v-on="$listeners"
    v-mask="maskedValue"
    attach
    :no-data-text="noDataText"
    :cache-items="cacheItems"
    :loading="showLoader ? isLoading : null"
    :items="list"
    :search-input.sync="search"
    :error-messages="
      handleValidation(validate) ? 'Esse campo é obrigatório' : ''
    "
    @input="handleInput"
  >
    <template v-slot:no-data>
      <v-list-item>
        <span class="v-list-item__title">{{ noDataText }}</span>
      </v-list-item>
    </template>
    <template v-slot:append-item>
      <v-list-item v-if="enableCreation" class="pa-1">
        <slot name="creationSlot" v-bind="{ search, list }" />
      </v-list-item>
    </template>
    <template v-if="customSelection" v-slot:selection="selectionProps">
      <slot name="selectionSlot" v-bind="selectionProps"></slot>
    </template>
  </v-combobox>
</template>

<script>
export default {
  inheritAttrs: false,
  prop: ['value', 'reloadTrigger'],
  props: {
    endpoint: { type: String, default: null },
    query: { type: String, default: null },
    searchKey: { type: String, default: 'name' },
    lengthToStartSearch: { type: Number, default: 0 },
    loadOnMount: { type: Boolean, default: true },
    noDataText: { type: String, default: 'Não há dados disponíveis' },
    cacheItems: { type: Boolean, default: true },
    showLoader: { type: Boolean, default: false },
    customCriteria: { type: Boolean, default: false },
    validate: { type: Object, default: null },
    enableCreation: { type: Boolean, default: false },
    customSelection: { type: Boolean, default: false },
    resetCacheItems: { type: Boolean, default: false },
    customMask: {
      type: Function,
      default() {
        return null
      },
    },
    filter: {
      type: Function,
      default() {
        return true
      },
    },
    postProcess: {
      type: Function,
      default(item) {
        return item
      },
    },
  },
  data: () => ({
    search: null,
    isLoading: false,
    list: [],
    isInputValue: true,
  }),
  computed: {
    finalQuery: function () {
      const queries = []

      this.query && queries.push(this.query)

      if (
        this.search &&
        !this.$attrs.value &&
        this.search.length >= this.lengthToStartSearch
      ) {
        if (this.customCriteria) {
          queries.push(`criteria=${encodeURI(this.search)}`)
        } else {
          queries.push(`${this.searchKey}=like(${encodeURI(this.search)})`)
        }
      }

      if (this.$attrs.value) {
        const { 'item-text': itemText, value } = this.$attrs
        if (!this.list.some((item) => item[itemText] === value[itemText])) {
          queries.push(this.handleValueQuery(this.$attrs.value))
        }
      }

      return queries.join('&')
    },
    maskedValue() {
      return this.customMask(this.modelValue ?? this.search)
    },
    modelValue() {
      if (
        this.searchKey &&
        this.$attrs?.value &&
        this.$attrs?.value[this.searchKey]?.length > 0 &&
        this.isInputValue
      )
        return this.$attrs.value[this.searchKey]

      return null
    },
  },
  watch: {
    finalQuery(newValue) {
      if (this.isLoading) return
      this.handleUpdate(newValue)
    },
    reloadTrigger() {
      if (this.isLoading) return
      this.handleUpdate(this.finalQuery)
    },
    list(newValue) {
      this.handleValueReset(newValue)
    },
    async search(newValue) {
      await this.$nextTick()
      if (this.modelValue?.length > 0 && this.search === this.modelValue)
        this.closeButton()

      this.isInputValue = false

      // this.$emit('onSearchChange', newValue)
    },
  },
  mounted() {
    if (this.loadOnMount) {
      this.handleUpdate(this.finalQuery)
    }
  },
  methods: {
    handleInput() {
      this.isInputValue = true
      this.$emit('input', this.content)
    },
    async handleUpdate(query) {
      if (this.resetCacheItems) {
        this.$refs['combobox'].cachedItems = []
      }
      this.isLoading = true
      const { data } = await this.getList(this.endpoint, query)
      const list = this.postProcess(data)
      this.list = list.filter(this.filter)
      this.isLoading = false
    },
    handleValidation(validate) {
      if (validate) {
        return validate.$error
      } else {
        return false
      }
    },
    handleValueQuery(value) {
      if (typeof value === 'object') {
        let searchValue = value
        const objectKeys = this.searchKey.split('.')
        objectKeys.forEach((key) => {
          searchValue = searchValue[key]
        })
        if (searchValue) {
          return `${this.searchKey}=${searchValue}`
        }
      } else {
        return `${this.$attrs['item-value']}=${value}`
      }
    },
    handleValueReset(list) {
      const { 'item-text': itemText, value } = this.$attrs
      if (value) {
        if (list.some((item) => item[itemText] === value[itemText])) {
          return
        }
        this.$emit('onValueNotFound', null)
      }
    },
    refreshList() {
      this.handleUpdate(this.finalQuery)
    },
    resetField() {
      this.search = null
      this.$refs['combobox'].cachedItems = []
      this.$refs['combobox'].reset()
    },
    closeButton() {
      this.$refs['combobox']?.blur()
    },
  },
}
</script>
