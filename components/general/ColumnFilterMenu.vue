<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-icon v-bind="attrs" v-on="on" small>{{(selectedFilter != null) ? 'mdi-filter-outline' : 'mdi-filter'}}</v-icon>
    </template>
    <v-list>
      <v-list-item-group
        v-model="selectedFilter"
        mandatory
      >
        <v-list-item
          v-for="(filter, index) in filterTypes"
          :key="index"
        >
          <v-list-item-content>
            <v-list-item-subtitle>{{filter.name}}</v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data: () =>({
    defaultValue: 0,
    selectedFilter: null,
    filterTypes: [
      { name: 'Contém', value: 'like'},
      { name: 'Não Contém', value: 'notlike'},
      { name: 'Igual a', value: 'equal'},
      { name: 'Diferente', value: 'ne'},
    ]
  }),
  watch: {
    async selectedFilter(newValue, oldValue) {
      if (newValue >= 0) {
        this.$emit('onFilterSelected', this.filterTypes[newValue])
      }else {
        await this.setDefault(oldValue)
        this.$emit('onFilterSelected', this.filterTypes[oldValue])
      }
    }
  },
  mounted() {
    this.setDefault(this.defaultValue)
  },
  methods: {
    setDefault(value) {
      this.selectedFilter = value
    }
  }
}
</script>

<style>

</style>