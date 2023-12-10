<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Concorrentes ({{ counter }})</p>
        </div>
      </template>
      <template v-slot:actions>
        <OpportunityCompetitorForm v-if="showForm" :isEditing='false' :opportunity="opportunity" @update="updateCompetitor" />
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <DataList
        :hasMenu="false"
        :list="list"
      >
      </DataList>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

export default {
  props: {
    opportunity: Object,
    list: Array,
    opportunityActivated: Boolean,
    showForm: Boolean
  },
  data: () => ({
    counter: 0
  }),
  mounted() {
    this.$root.$on('updateCompetitorOpportunity', this.updateCompetitor)
  },
  watch: {
    list(newValue) {
      if(newValue) {
        return this.counter = this.list.length
      }
    }
  },
  methods: {
    updateCompetitor() {
      this.$emit('update')
    }
  }
}
</script>
