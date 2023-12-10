<template>
  <v-autocomplete
    attach  
    v-bind="$attrs"
    v-on="$listeners"
    :cache-items="cacheItems"
    :loading="showLoader ? isLoading : null"
    :items="list"
    :search-input.sync="search"
    :error-messages="handleValidation(validate) ? 'Esse campo é obrigatório' : ''"
    @input="handleInput"
  >
    <template v-if="isRequired" v-slot:label>
      {{ $attrs.label }}
      <span class="error--text"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
              Obrigatório
            </div>
            `,
          placement: 'top-center',
        }"
      >*</span>
    </template>
    <template v-if="customSelection" v-slot:selection="{ item, parent, index }">
      <AutocompleteSelectionSlot
        :maxLength="22"
        :parent="parent"
        :item="item"
        :counter="$attrs.value ? $attrs.value.length : 0"
        :index="index"
        :fieldName="slotFieldName"
      />
    </template>
  </v-autocomplete>
</template>

<script>
export default {
  inheritAttrs: false,
  prop: ['value', 'reloadTrigger'],
  props: {
    isRequired: { type: Boolean, default: false },
    endpoint: { type: String, default: null },
    query: { type: String, default: null },
    searchKey: { type: String, default: 'name' },
    lengthToStartSearch: { type: Number, default: 0 },
    loadOnMount: { type: Boolean, default: true },
    cacheItems: { type: Boolean, default: true },
    preLoadedItems: { type: Array },
    showLoader: { type: Boolean, default: false },
    customCriteria: { type: Boolean, default: false },
    customSelection: { type: Boolean, default: false },
    removeSpecialChars: { type: Boolean, default: false },
    validate: { type: Object, default: null },
    alternativeSearchKey: { type: String, default: null },
    filter: {
      type: Function,
      default() {
        return true
      }
    },
    postProcess: {
      type: Function,
      default(item) {
        return item
      }
    },
    searchValidation: {
      type: Function,
      default(_item) {
        return true
      }
    },
    slotFieldName: {
      type: String,
      default: 'name'
    }
  },
  data: () => ({
    search: null,
    isLoading: false,
    list: [],
  }),
  computed: {
    finalQuery: function() {
      const queries = []

      this.query && queries.push(this.query)

      let hasValue = false
      if (Array.isArray(this.$attrs.value)) {
        hasValue = this.$attrs.value.length > 0
      } else {
        hasValue = this.$attrs.value
      }

      if (this.search && !hasValue && (this.search.length >= this.lengthToStartSearch)) {
        if (this.customCriteria) {
          queries.push(`criteria=${encodeURI(this.search)}`)
        } else {
          if (this.searchValidation(this.search)) {
            queries.push(`${this.searchKey}=like(${encodeURI(this.search)})`)
          } else {
            queries.push(`${this.alternativeSearchKey}=like(${encodeURI(this.search)})`)
          }
        }
      }

      if (hasValue) {
        queries.push(this.handleValueQuery(this.$attrs.value))
      }

      return queries.join('&')
    }
  },
  watch: {
    search(newValue) {
      if(newValue) {
        if(this.removeSpecialChars) {
          this.search = newValue.normalize('NFD').replace(/[\u0300-\u036f]|[^\w\sçÇ]/g, '').replace(/\u0063\u0327/g, 'ç')
        }
        this.$emit('onSearchUpdate', newValue)
      }
    },
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
      this.$emit('onItemsUpdate', newValue)
    },
  },
  mounted() {
    if (this.loadOnMount) {
      this.handleUpdate(this.finalQuery)
    }
  },
  methods: {
    handleInput() {
      this.$emit('input', this.content)
      this.search = null
    },
    async handleUpdate(query) {
      this.isLoading = true
      const response = await this.getList(this.endpoint, query)
      const data = this.handleEndpointResponse(response)
      const list = this.postProcess(data)
      this.list = list.filter(this.filter)
      if(this.preLoadedItems) {
        this.preLoadedItems.forEach(newItem => {
          const existsInList = this.list.some(item => item[this.$attrs['item-value']] === newItem[this.$attrs['item-value']])
          if(!existsInList) {
            this.list.push(newItem)
          }
        })
      }
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
      if(typeof value === 'object') {
        if(this.searchKey) {
          let searchValue = value
          const objectKeys = this.searchKey.split('.')
          objectKeys.forEach((key) => { searchValue = searchValue[key] })
          if (searchValue) {
            return `${this.searchKey}=${searchValue}`
          }
        }
      }else {
        return `${this.$attrs['item-value']}=${value}`
      }
    },
    handleValueReset(list) {
      const { 'item-value': itemValue, value } = this.$attrs
      if (list.some((item) => item[itemValue] === value)) {
        return
      }
      this.$emit('onValueNotFound', null)
    },
    handleEndpointResponse(response) {
      if (Array.isArray(response)) {
        return response
      } else if (typeof response === 'object') {
        return response?.data
      }
      return []
    },
  }
}
</script>