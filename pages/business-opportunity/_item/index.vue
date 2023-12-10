<template>
  <div>
    <OpportunityPreferenceDrawer
      v-bind:openDrawer.sync="preferenceDrawer"
      :pipeline-id="pipelineId"
    />
    <PageHeadline :page-name="pageName" :page-group="pageGroup">
      <v-btn data-test="btnPreferenceDrawerOpen" color="secondary" class="mr-2" @click="preferenceDrawer = true">
        Personalizar
      </v-btn>
      <OpportunityModal />
    </PageHeadline>
    <v-row>
      <v-col class="px-0">
        <v-chip
          v-if="selectedState && pipelineViewPreference == true"
          color="primary"
          class="mb-3"
          close
          close-icon="mdi-close-outline"
          @click:close="removeState"
        >
          {{ selectedState }}
        </v-chip>
        <OpportunityPipeline
          v-if="!pipelineViewPreference"
          :pipeline-id="pipelineId"
          @stagesList="sumStagesAmount"
        />
        <div v-else>
          <DataTableWrapper
            v-if="hasStages"
            :url="url"
            :default-query="query"
            :list="listItems"
            :initial-headers="initialHeaders"
            :main-entity="mainEntity"
            :usedEntities="usedEntities"
            :redirect-to="redirectTo"
            :mutation="mutation"
            :header-config="headerConfig"
            :delete-action="deleteAction"
            :list-details="listDetails"
            :refresh-data="refreshData"
            :fetchList="fetchList"
            :refreshAction="refresh"
            @onRowClick="redirectPage"
          >
            <template v-slot:actionsSlot="actionsProps">
              <v-list-item>
                <v-list-item-title>
                  <Sheet
                    isEditing
                    :title="'Editar Oportunidade'"
                    @submit="$refs[`config-${actionsProps.itemId}`].submitForm()"
                    @cancel="$refs[`config-${actionsProps.itemId}`].handleCancel()"
                  >
                    <template v-slot="{ sheet, closed }">
                      <OpportunityForm
                        isEditing
                        :sheet="sheet"
                        :item-id="actionsProps.itemId"
                        :ref="`config-${actionsProps.itemId}`"
                        @closeForm="closed"
                      />
                    </template>
                  </Sheet>
                </v-list-item-title>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>
                  <DeleteItem
                    :url="url"
                    :item-id="actionsProps.itemId"
                    :item-name="actionsProps.item.company.name"
                    :delete-action="deleteAction"
                    :refreshAction="refresh"
                  />
                </v-list-item-title>
              </v-list-item>
            </template>
          </DataTableWrapper>
        </div>
      </v-col>
    </v-row>
    <OpportunitySideView
      :item-id="pipelineItemId"
      :open-drawer="pipelineSideViewDrawer"
      :items="pipelineSideViewItems"
      @closeDrawer="() => { $store.dispatch('Opportunity/setPipelineSideViewDrawer', false) }"
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
export default {
  data: () => ({
    url: '/cash/opportunity',
    defaultQuery:
      'order=id_desc' +
      '&translateEnums=true' +
      '&includes=company.association_r.left_side,company.memberships.team.parent,contact,product,team,partner,assigned_to,origin',
    listItems: [],
    initialHeaders: [
      { text: 'Razão Social', value: 'company.name', entity: 'company', width: '20%', filterable: true, filterType: null, filterValue: null, pos: 0 },
      { text: 'CNPJ', value: 'company.identifier', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 1 },
      { text: 'Status', value: 'company.state', entity: 'company', meta: 'customerState', filterable: true, filterType: 'equal', filterValue: null, pos: 2 },
      { text: 'Reserva', value: 'reservation_date', entity: 'company', filterable: true, filterType: null, filterValue: null, pos: 3 },
      { text: 'Responsável', value: 'assigned_to.name', entity: 'assigned_to', filterable: true, filterType: null, filterValue: null, pos: 4, class: 'text-truncate' },
      { text: 'Equipe', value: 'team.name', entity: 'team', filterable: true, filterType: null, filterValue: null, pos: 5, class: 'text-truncate' },
    ],
    mainEntity: 'opportunity',
    // usedEntities: 'opportunity,company,team,assigned_to',
    usedEntities: {
      opportunity: '',
      company: 'company',
      team: 'team',
      assigned_to: 'assigned_to',
      'opportunity-origin': 'origin',
    },
    mutation: 'Opportunity/SET_LIST_DETAILS',
    redirectTo: 'business-opportunity-item-id',
    deleteAction: 'Opportunity/deleteItem',
    selectedState: null,
    isLoading: null,
    amount: 0,
    pipelineId: null,
    stagesId: null,
    businessItemId: null,
    businessCategoryId: null,
    preferenceDrawer: false,
  }),
  computed: {
    ...mapGetters({
      stages: 'stages',
      list: 'Opportunity/list',
      listDetails: 'Opportunity/listDetails',
      refreshData: 'Opportunity/refreshData',
      businessCategories: 'businessCategories',
      businessItems: 'businessItems',
      preference: 'Profile/preference',
      pipelineItemId: 'Opportunity/pipelineItemId',
      pipelineSideViewDrawer: 'Opportunity/pipelineSideViewDrawer',
      pipelineSideViewItems: 'Opportunity/pipelineSideViewItems',
      pipelineViewPreference: 'Opportunity/pipelineViewPreference',
    }),
    query: function () {
      return `${this.defaultQuery}&stage_id=in(${this.stagesId})`
    },
    pageGroup: function() {
      const category = this.businessCategories.find((category) => category.id == this.businessCategoryId)
      return category?.name
    },
    pageName: function() {
      const item = this.businessItems.find((item) => item.id == this.businessItemId)
      return item?.name
    },
    headerConfig: function() {
      const group = this.pageGroup ? this.pageGroup : ''
      const name = this.pageName ? this.pageName : ''
      return `${group.replace(/\s+/g, '')}-${name.replace(/\s+/g, '')}-Headers`
    },
    listVisualizationKey: function() {
      const group = this.pageGroup ? this.pageGroup : ''
      const name = this.pageName ? this.pageName : ''
      return `${group.replace(/\s+/g, '')}-${name.replace(/\s+/g, '')}-list-visualization`
    },
    hasStages: function() {
      if (this.stagesId) {
        return true
      }
      return false
    },
  },
  created() {
    this.businessItemId = this.$route.params['item']
    this.pipelineId = this.$route.query['pipeline-id']
    this.businessCategoryId = this.$route.query['category']
    this.getViewPreference()
  },
  mounted() {
    this.isLoading = true
    this.getStages()
  },
  watch: {
    list(newValue) {
      this.listItems = this.formatData(newValue)
    },
  },  
  methods: {
    ...mapActions({
      fetchList: 'Opportunity/fetchList',
      refresh: 'Opportunity/refresh',
      setPipelineViewPreference: 'Opportunity/setPipelineViewPreference',
    }),
    async removeState() {
      this.selectedState = null
      await this.$router.replace({'query': null})
      this.getInitialData(this.apiConfig.action)
    },
    formatData(data) {
      const dataArray = data.map((opp) => {
        if (!opp.company) {
          opp.company = {
            name: ''
          }
        }
        return opp
      })
      return dataArray
    },
    sumStagesAmount(stages) {
      this.amount = 0
      stages.forEach(stage => {
        this.amount += stage.opportunities.length
      })
    },
    async getStages() {
      const pipeline = await this.getItem('cash/pipeline', `includes=stages&id=${this.pipelineId}`)
      const stages = pipeline?.stages?.map((stage) => stage.id)
      stages && (this.stagesId = stages.toString())
    },
    redirectPage(item) {
      const { id } = item
      const { params, query } = this.$route
      this.$router.push({ name: `${this.redirectTo}`, params: { id, ...params }, query })
    },
    getViewPreference() {
      const oppPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`)
      if (oppPipeline) {
        if (oppPipeline['viewPreference']) {
          this.setPipelineViewPreference(oppPipeline['viewPreference'])
        } else {
          this.setPipelineViewPreference(false)
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
.c-pipeline {
  width: 267px;
  min-width: 230px;
  min-height: 670px;
  background-color: transparent;
  border-left: 1px solid #ccd2d4;
  padding-right: 2em;
  &:last-child {
    border-right: 1px solid #ccd2d4;
  }
}
.ajust-vertical-margin {
  margin-top: -28px;
}
</style>
