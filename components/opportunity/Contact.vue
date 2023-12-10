<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Contato ({{ counter }})</p>
        </div>
      </template>
       <template v-slot:actions>
        <OpportunityContactForm v-if="showForm" @update="updateContact" :isEditing='false' :opportunity="opportunity" :company-id="companyId"/>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <DataList
        :list="list"
        :hasMenu="false"
      >
      </DataList>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: null
    },
    opportunity: Object,
    companyId: Number,
    showForm: Boolean
  },
  data: () => ({
    counter: 0
  }),
  watch: {
    list(newValue) {
      if(newValue) {
        return this.counter = this.list.length
      }
    },
  },
  methods: {
    updateContact() {
      this.$emit('update')
    },
  }
}
</script>

