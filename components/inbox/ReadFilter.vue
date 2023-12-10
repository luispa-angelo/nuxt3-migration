<template>
   <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        small
        v-bind="attrs"
        v-on="on"
        class="mr-2 pl-0 pr-1"
      >
        <v-icon color="primary">mdi-chevron-down</v-icon>
        {{ filterTypes[selectedIndex].name }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item-group
        mandatory
        v-model="selectedIndex"
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
    selectedIndex: 0,
    filterTypes: [
      { name: 'Todas', value: true},
      { name: 'Não Lidas', value: false},
    ]
  }),
  watch: {
    selectedIndex(newValue) {
      if (newValue >= 0) {
        this.$emit('readFilter', this.filterTypes[newValue].value)
      } else {
        this.$emit('readFilter', null)
      }
    }
  }
}
</script>