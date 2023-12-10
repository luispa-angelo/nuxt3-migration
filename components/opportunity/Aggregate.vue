<template>
  <v-expansion-panel :class="removeShadow ? 'v-expansion-panel-no-shadow' : ''">
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Empresas ({{ counter }})</p>
        </div>
      </template>
      <template v-slot:actions>
        <OpportunityAggregateForm
          v-if="showForm"
          :isEditing="false"
          :opportunity-id="opportunityId"
          @onCompanyAggregate="handleUpdate"
        />
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <DataList
        hasDelete
        redirect-on-click
        delete-action="delete"
        :hasMenu="showForm"
        :list="list"
        @removeItem="handleRemove"
        @onClick="redirectPage"
      >
      </DataList>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    opportunityId: Number,
    removeShadow: Boolean,
    showForm: Boolean,
    aggregateCompanies: Array,
  },
  data: () => ({
    redirectTo: 'business-companies-item-identifier',
  }),
  computed: {
    ...mapGetters({
      meta: 'meta'
    }),
    list: function() {
      if (this.aggregateCompanies.length > 0) {
        return this.aggregateCompanies.map((company) => {
          return {
            id: company.id,
            title_1: company?.company?.name || company?.company?.legalName || company?.company?.identifier ,
            title_2: null,
            subtitle_1: company?.company?.identifier,
            subtitle_2: null,
          }
        })
      }
      return []
    },
    counter: function() {
      return this.list.length || 0
    }
  },
  async mounted() {
    // await this.getData()
  },
  watch: {
  },
  methods: {
    handleUpdate() {
      this.$emit('update')
    },
    async handleRemove(index) {
      const itemToRemove = this.list[index]
      await this.removeItem('/cash/opportunity-aggregate', itemToRemove.id)
      this.$emit('update')
    },
    redirectPage(index) {
      const item = this.aggregateCompanies[index]
      const { identifier, id } = item.company
      const { params } = this.$route
      this.$router.push({ name: `${this.redirectTo}`, params: { ...params, identifier }, query: { company_id: id } })
    }
  }
}
</script>

<style scoped>
  .v-expansion-panel-no-shadow::before {
    box-shadow: none !important;
  }
</style>