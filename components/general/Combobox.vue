<template>
  <v-combobox
    required
    dense
    v-bind="$attrs"
    v-on="$listeners"
    v-model="value"
    :items="list"
    :item-value="itemValue"
    :item-text="itemText"
    :error-messages="hasValidation(validate) ? 'Esse campo é obrigatório' : ''"
    @update:search-input="getData"
  ></v-combobox>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    endpoint: String,
    load: { default: false },
    initialValue: { default: null },
    itemValue: { type: String, default: 'id' },
    itemText: { type: String, default: 'name' },
    query: { type: String, default: null },
    validate: { type: Object },
    filter: {
      type: Function,
      default() {
        return true
      }
    },
    items: {
      type: Array,
      default() {
        return []
      }
    }
  },
  data: () => ({
    list: [],
    value: null
  }),
  mounted() {
    this.getInicialData()
  },
  watch: {
    value(newValue) {
      this.$emit('valueSelected', newValue)
    },
    disabled(newValue) {
      (newValue && !this.initialValue) && (this.value = null)
    },
    initialValue(newValue) {
      newValue && this.setInitialValue(newValue)
    },
    items(newValue) {
      this.list = newValue
    },
    load(newValue) {
      newValue && this.getInicialData()
    }
  },
  methods: {
    getData(nameQuery) {
      if (this.endpoint) {
        if (nameQuery == '') {
          this.setList(this.endpoint, this.query)
        } else if(nameQuery?.length > 1) {
          let fullQuery = `name=like(${nameQuery})`
          this.query && (fullQuery = `${this.query}&${fullQuery}`)
          this.setList(this.endpoint, fullQuery)
        }
      } else {
        this.list = this.items
      }
    },
    getInicialData() {
      this.endpoint && this.setList(this.endpoint, this.query)
      this.setInitialValue(this.initialValue)
    },
    setInitialValue(value) {
      if (value) {
        if (this.endpoint) {
          this.setList(this.endpoint, `${this.itemValue}=${value}`)
        }
        this.value = value
      }
    },
    async setList(endpoint, query) {
      const { data } = await this.getList(endpoint, query)
      this.list = data.filter(this.filter)
    },
    hasValidation(validate) {
      if (validate) {
        return validate.$error
      } else {
        return false
      }
    }
  }
}
</script>
