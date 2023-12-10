<template>
  <v-text-field
    :key="valueKey"
    ref="currencyMoney"
    v-bind="$attrs"
    v-model="maskedValue"
    v-money="moneyMask"
    type="text"
    prefix="R$"
    min="0"
    @change="handleValueChange()"
  />
</template>

<script>
export default {
  data: () => ({
    maskedValue: 0,
    valueKey: null,
    maskRegex: new RegExp(/\./g),
    moneyMask: {
      decimal: ',',
      thousands: '.',
      prefix: '',
      precision: 2,
    },
  }),
  created() {
    this.maskedValue = this.parsedValue
  },
  computed: {
    formatValue() {
      return parseFloat(
        this.maskedValue?.replace(this.maskRegex, '')?.replace(',', '.')
      ).toFixed(2)
    },
    parsedValue() {
      return parseFloat(this.$attrs?.value).toFixed(2)
    },
  },
  watch: {
    parsedValue(newValue) {
      this.maskedValue = newValue
      this.valueKey = newValue
    },
  },
  methods: {
    handleValueChange() {
      if (this.formatValue !== this.$attrs.value)
        this.$emit('inputValue', parseFloat(this.formatValue))
    },
  },
}
</script>
