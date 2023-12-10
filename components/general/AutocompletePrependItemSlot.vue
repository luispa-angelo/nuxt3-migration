<template>
  <v-row>
    <v-col class="mx-2">
      <v-chip-group
        active-class="primary--text"
        class="mx-2"
        mandatory
        :value="dateChip"
        @change="$emit('update:dateChip', $event)"
      >
        <v-chip small>Período</v-chip>
        <v-chip small>Data personalizada</v-chip>
      </v-chip-group>
      <div v-if="dateChip" class="d-flex justify-space-between mb-2">
        <v-text-field
          outlined
          dense
          hide-details
          label="Data Início"
          type="date"
          color="primary"
          class="mt-2 mx-2"
          v-model="initialDate"
          :max="finalDate"
        />
        <v-text-field
          outlined
          dense
          hide-details
          label="Data Final"
          type="date"
          color="primary"
          class="mt-2 mx-2"
          v-model="finalDate"
          :min="initialDate"
        />
      </div>
      <template v-if="dateChip">
        <span v-if="customValueItem" class="ma-2"
          >Clique na data abaixo para seguir com o filtro:</span
        >
        <span v-if="!customValueItem && maxDaysDiff" class="ma-2 error_text">
          {{
            `Intervalo excedido. Insira um intervalo dentro de ${maxDaysDiff} dias.`
          }}
        </span>
      </template>
    </v-col>
  </v-row>
</template>

<script>
export default {
  model: {
    prop: 'dateChip',
    event: 'change',
  },
  props: ['dateChip', 'customValueItem', 'returnOnlyDates', 'maxDaysDiff'],
  data: () => ({
    initialDate: null,
    finalDate: null,
  }),
  computed: {
    customDate: function () {
      if (this.initialDate && this.finalDate) {
        return {
          name: `${this.$moment(this.initialDate).format(
            'DD/MM/YYYY'
          )} até ${this.$moment(this.finalDate).format('DD/MM/YYYY')}`,
          value: this.returnOnlyDates
            ? `${this.$moment(this.initialDate)
              .startOf('day')
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss')},${this.$moment(this.finalDate)
              .endOf('day')
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss')}`
            : `between(${this.$moment(this.initialDate)
              .startOf('day')
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss')},${this.$moment(this.finalDate)
              .endOf('day')
              .utc()
              .format('YYYY-MM-DDTHH:mm:ss')})`,
        }
      }
      return null
    },
  },
  watch: {
    customDate(newValue) {
      //  Limit date-range based on prop when "maxDaysDiff" > 0
      if (
        this.maxDaysDiff &&
        Math.abs(this.$moment(this.initialDate).diff(this.finalDate, 'days')) >
          this.maxDaysDiff
      )
        return this.$emit('onDateChosen', null)

      this.$emit('onDateChosen', newValue)
    },
    dateChip() {
      this.$emit('onChipChange', null)
      this.initialDate = null
      this.finalDate = null
    },
  },
}
</script>

<style lang="scss" scoped>
span.error_text {
  color: var(--v-red-base);
}
</style>
