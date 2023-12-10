<template>
  <div>
    <v-overlay
      @click.prevent="handleCancel"
      :value="drawer"
      z-index="1"
    ></v-overlay>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      right
      stateless
      width="75%"
      class="detail--right-dialog"
      id="opportunity-side-view"
    >
      <v-app-bar
        dense
        fixed
        elevation="0"
        class="side-view-header"
      >
        <div class="w-100 d-flex justify-space-between align-center ">
          <v-btn
            @click="redirectToOpportunityPage(opportunityId)"
            icon
            small
            v-tooltip="{
              content: `
                <div class='v-btn-tooltip'>
                  Ir para a Oportunidade
                </div>
                `,
              placement: 'right-center'
            }"
          >
            <span class="material-symbols-rounded">
              expand_content
            </span>
          </v-btn>
          <div class="d-flex justify-space-between align-center">
            <v-btn
              icon
              small
              :disabled="blockPrevious"
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    Anterior
                  </div>
                  `,
                placement: 'auto'
              }"
              @click="changeOpportunity(-1)"
             class="mr-2">
              <v-icon class="material-symbols-rounded">
                arrow_back
              </v-icon>
            </v-btn>
            <p class="mb-0 mr-2">{{ `Oportunidade ${itemPosition + 1} de ${items.length}` }}</p>
            <v-btn
              icon
              small
              :disabled="blockNext"
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    Posterior
                  </div>
                  `,
                placement: 'auto'
              }"
              @click="changeOpportunity(1)"
            >
              <v-icon class="material-symbols-rounded">
                arrow_forward
              </v-icon>
            </v-btn>
          </div>
          <v-btn
            icon
            small
            v-tooltip="{
              content: `
                <div class='v-btn-tooltip'>
                  Fechar
                </div>
                `,
              placement: 'auto'
            }"
            @click.prevent="handleCancel"
          >
            <v-icon class="material-symbols-rounded">
              close
            </v-icon>
          </v-btn>
        </div>
      </v-app-bar>
      <section v-if="!isLoadingData" class="px-4 py-2" style="margin-top: 48px;">
        <div v-if="opportunity">
          <div class="d-flex justify-space-between mb-2">
            <div class="d-flex align-center">
              <span
                class="font-weight-bold mr-2"
                v-if="opportunity.company && opportunity.company.name"
              >
                {{ `${opportunity.company.name}` | truncate(label_truncate) }}
              </span>
              <Sheet
                v-if="opportunity.company"
                isEditing
                from-details
                title="Informações da Empresa"
                class="mr-2"
                @submit="$refs.myForm.submitForm()"
                @cancel="$refs.myForm.handleCancel()"
              >
                <template v-slot="{ sheet, closed }">
                  <CompanyForm
                    ref="myForm"
                    isEditing
                    :sheet="sheet"
                    @closeForm="closed"
                    :item-id="opportunity.company.id"
                  />
                </template>
              </Sheet>
              <div class="d-flex align-center">
                <span class="grey--text text--lighten-4">
                  {{ opportunity.company.identifier | VMask(mask_cnpj) }}
                </span>
                <v-icon
                  small
                  color="primary"
                  class="ml-1 material-icons-round"
                  @click.stop="copyToClipboard(opportunity.company.identifier)"
                >
                  copy
                </v-icon>
              </div>
            </div>
            <div class="d-flex justify-center">
              <TaskModal
                has-button
                prop-channel="call"
                :opportunity="opportunity"
              />
              <TaskModal
                has-button
                prop-channel="mail"
                :opportunity="opportunity"
              />
              <TaskModal
                has-button
                prop-channel="chat"
                :opportunity="opportunity"
              />
              <TaskModal
                has-button
                prop-channel="meeting"
                :opportunity="opportunity"
              />
              <TaskModal
                has-button
                prop-channel="default"
                :opportunity="opportunity"
              />
              <TaskModal
                has-button
                icon-button="internal"
                :opportunity="opportunity"
              />
            </div>
          </div>
          <div class="mb-3">
            <p
              v-for="(value, key) in opportunityValues"
              class="d-inline mr-5"
              :key="key"
            >
              <span class="sub-text--text">{{ `${key}: ` }}</span>
              <span>{{ `R$ ${maskMoney('pt-br', value || 0.00)}` }}</span>
            </p>
          </div>
          <div class="d-flex justify-space-between mb-1">
            <v-select
              attach
              dense
              outlined
              hide-details
              label="Fase atual"
              item-value="id"
              item-text="name"
              app
              class="mr-2"
              v-model="sideFormData.stage_id"
              v-tooltip="{
                content: `
                  <div class='v-btn-tooltip'>
                    Não é possível voltar para fases anteriores.
                  </div>
                  `,
                placement: 'auto'
              }"
              :items="stages"
              :disabled="blockOpportunity"
              :item-disabled="(item) => !userInfo.admin && (item.index < opportunity.stage.index)"
              @change="changeAsideStatus"
            >
            </v-select>
            <div class="d-flex flex-column">
              <v-select
                attach
                dense
                outlined
                hide-details
                label="Status"
                item-value="value"
                item-text="name"
                class="mx-2"
                v-model="sideFormData.status"
                :items="statusList"
                :disabled="blockStatusChange"
                @change="handleWithdrawalForm"
              ></v-select>
              <template
                v-if="
                  opportunity.withdrawal_reason &&
                  ['lost', 'cancelled'].includes(opportunity.status)
                "
              >
                <p class="mb-0 ml-2">
                  Motivo: {{ opportunity.withdrawal_reason.value }}
                </p>
              </template>
            </div>
            <v-select
              attach
              dense
              outlined
              hide-details
              label="Temperatura"
              item-value="value"
              item-text="name"
              class="mx-2"
              v-model="sideFormData.temperature"
              :items="opportunityTemperature"
              :disabled="blockOpportunity"
              @change="changeAsideStatus"
            ></v-select>
            <v-text-field
              outlined
              dense
              hide-details
              label="Previsão"
              type="date"
              class="mx-2"
              v-model="sideFormData.prevision"
              :disabled="blockOpportunity"
              @change="changeAsideStatus"
            ></v-text-field>
            <NewAutocomplete
              outlined
              dense
              clearable
              hide-details
              multiple
              ref="originAutocomplete"
              label="Origem"
              endpoint="/cash/opportunity-origin"
              item-text="name"
              item-value="id"
              class="mx-2"
              v-model="sideFormData.origins"
              :disabled="blockOpportunity"
              @change="changeAsideStatus"
            />
          </div>
        </div>
        <OpportunityDetails
          :item-id="itemId"
          :opportunity="opportunity"
          :aggregate-companies="aggregateCompanies"
          @InvoicesHasChange="handleOpportunityProducts"
        />
      </section>
      <section v-else style="margin-top: 48px;">
        <v-skeleton-loader type="article"></v-skeleton-loader>
        <v-skeleton-loader class="mt4" type="list-item"></v-skeleton-loader>
        <v-skeleton-loader class="mt4 pa-4" type="sentences"></v-skeleton-loader>
        <v-skeleton-loader class="mt4 pa-4" type="card"></v-skeleton-loader>
      </section>
    </v-navigation-drawer>
    <OpportunityWithdrawalForm
      v-if="opportunity"
      :withdrawal-dialog="withdrawalDialog"
      :opportunity-id="opportunityId"
      :opportunity-team="opportunity.team_id"
      :status-value="sideFormData.status"
      @onClose="
        (value) => {
          this.withdrawalDialog = value
          this.sideFormData.status = this.opportunity.status
        }
      "
      @onUpdate="
        (value) => {
          this.withdrawalDialog = value
          this.$store.commit('Opportunity/OPPORTUNITIES_API', { dataUpdate: true })
          this.$store.dispatch('Opportunity/refresh', true)
          this.getOpportunity(this.itemId)
        }
      "
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    openDrawer: {
      type: Boolean
    },
    itemId: {
      type: Number
    },
    items: {
      type: [Array]
    }
  },
  data: () => ({
    drawer: false,
    link: {
      opportunity: '/business-opportunity',
    },
    aggregateCompanies: [],
    opportunityId: null,
    isLoadingData: false,
    opportunityValues: {
      ['Valor Total']: null,
      ['Produto']: null,
      ['Addon']: null,
      ['Trial']: null,
      ['Outro']: null,
    },
    sideFormData: {
      id: null,
      status: null,
      temperature: null,
      prevision: null,
      origin_id: null,
      origins: null,
      stage_id: null,
    },
    opportunityTemperature: [
      { name: '10°', value: 10 },
      { name: '20°', value: 20 },
      { name: '30°', value: 30 },
      { name: '40°', value: 40 },
      { name: '50°', value: 50 },
      { name: '60°', value: 60 },
      { name: '70°', value: 70 },
      { name: '80°', value: 80 },
      { name: '90°', value: 90 },
      { name: '100°', value: 100 },
    ],
    origins: [],
    stages: [],
    withdrawalDialog: false,
    lastInvoice: {
      id: null,
    },
  }),
  computed: {
    ...mapGetters({
      meta: 'meta',
      userInfo: 'userInfo',
      opportunity: 'Opportunity/opportunity',
      opportunities_api: 'Opportunity/opportunities_api',
      opportunityRefresh: 'Opportunity/refreshData',
      companyRefresh: 'Company/refreshData',
    }),
    label_truncate() {
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return 40
      case 'sm':
        return 40
      case 'md':
        return 30
      case 'lg':
        return 30
      case 'xl':
        return 50
      default:
        return 30
      }
    },
    itemPosition() {
      return this.items.findIndex(item => item === this.opportunityId)
    },
    blockPrevious() {
      return this.itemPosition === 0
    },
    blockNext() {
      return this.itemPosition === this.items.length - 1
    },
    blockOpportunity: function () {
      const blockStatusList = [
        'won',
        'waiting_customer_approval',
        'lost',
        'cancelled',
      ]
      const blockStatus = blockStatusList.some(
        (status) => status === this.opportunity.status
      )
      if (blockStatus && !this.userInfo.admin) {
        return true
      }
      return false
    },
    blockStatusChange: function() {
      const blockStatusList = [
        'won',
        'lost',
        'cancelled',
      ]
      const blockStatus = blockStatusList.some(
        (status) => status === this.opportunity.status
      )
      if (blockStatus && !this.userInfo.admin) {
        return true
      }
      return false
    },
    statusList: function () {
      const filters = ['won']
      
      if (this.opportunity?.status == 'waiting_customer_approval') {
        filters.push('active')
      }
      else {
        filters.push('waiting_customer_approval')
      }
      if (this.opportunity?.status === 'won') {
        return this.meta.opportunityStatus
      }
      return this.meta.opportunityStatus.filter(
        (status) => !filters.includes(status.value)
      )
    },
    disabledStages: function () {
      return this.stages.filter(
        (stage) => stage.index < this.opportunity.stage.index
      ).map((stage) => stage.name)
    },
  },
  watch: {
    openDrawer(newValue) {
      this.drawer = newValue
    },
    async drawer(newValue) {
      this.hideWindowScrollbar(newValue)
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', newValue)
      if(newValue) {
        this.isLoadingData = true
        await this.getData(this.itemId)
        this.isLoadingData = false
      } else {
        this.resetSideView()
      }
    },
    itemId(newValue) {
      this.opportunityId = newValue
    },
    async opportunityId(newValue) {
      if (newValue && this.drawer) {
        this.isLoadingData = true
        await this.getData(this.opportunityId)
        this.isLoadingData = false
      }
    },
    opportunities_api(newValue) {
      if (newValue.dataUpdate) {
        this.getData(this.opportunityId)
        this.$store.commit('Opportunity/OPPORTUNITIES_API', {
          dataUpdate: false,
        })
      }
    },
    opportunityRefresh(newValue) {
      if (newValue) {
        this.getData(this.opportunityId)
        this.refreshOpportunityData(false)
      }
    },
    companyRefresh(newValue) {
      if (newValue) {
        this.getData(this.opportunityId)
        this.refreshCompanyData(false)
      }
    },
    async opportunity(newValue) {
      if ('stage' in newValue && 'pipeline_id' in newValue.stage) {
        await this.getStages(newValue.stage.pipeline_id)
      }

      if (
        newValue.origin &&
        this.origins &&
        !this.origins.find((el) => el.id == newValue.origin_id)
      ) {
        this.origins.push({
          id: newValue.origin_id,
          name: newValue.origin.name,
        })
      }

      this.sideFormData = {
        status: newValue.status,
        temperature: newValue.temperature,
        prevision: newValue.prevision
          ? this.$moment(newValue.prevision).format('YYYY-MM-DD')
          : null,
        origin_id: newValue.origin_id,
        origins: newValue.origin_id ? [newValue.origin_id] : null,
        stage_id: newValue.stage_id,
      }
    },
  },
  destroyed() {
    this.hideWindowScrollbar(false)
    this.resetSideView()
  },
  methods: {
    ...mapActions({
      refreshOpportunityData: 'Opportunity/refresh',
      refreshCompanyData: 'Company/refresh',
    }),
    async getData(id) {
      if (id) {
        await this.getOpportunity(id)
        await this.getAggregateCompanies(id)
      }
    },
    async getOpportunity(id) {
      await this.$store.dispatch(
        'Opportunity/fetchOpportunity',
        'also=op_log.owner,op_log.stage,products' +
        `&includes=company.cnaes,partner,contact,assigned_to,stage,team,withdrawal_reason,origin&id=${id}`)
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityLog',
        `includes=owner.capabilities.role,team&opportunity_id=${id}`
      )
    },
    async getAggregateCompanies(id) {
      const { data } = await this.getList(
        '/cash/opportunity-aggregate',
        `includes=company.cnaes&opportunity_id=${id}`
      )
      this.aggregateCompanies = data
    },
    redirectToOpportunityPage(id) {
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', false)
      this.$store.dispatch('Opportunity/setPipelineItemId', null)
      this.$store.dispatch('Opportunity/setPipelineSideViewItems', [])
      this.$router.push(`${this.link.opportunity}/router/${id}`)
    },
    changeOpportunity(increment) {
      this.opportunityId = this.items[this.itemPosition + increment]
      this.$store.dispatch('Opportunity/setPipelineItemId', this.opportunityId)
    },
    handleCancel() {
      this.$emit('closeDrawer')
    },
    async changeAsideStatus() {
      this.sideFormData.id = this.opportunityId
      const isValidDate = isNaN(this.sideFormData.prevision)
      const payload = {
        id: this.sideFormData.id,
        status: this.sideFormData.status,
        temperature: this.sideFormData.temperature,
        prevision: isValidDate
          ? this.$moment(this.sideFormData.prevision).utc().format(
            'YYYY-MM-DDTHH:mm:ss'
          )
          : null,
        origin_id: this.sideFormData?.origins?.length
          ? this.sideFormData.origins[this.sideFormData.origins.length - 1]
          : null,
        stage_id: this.sideFormData.stage_id,
      }
      await this.updateData('/cash/opportunity', payload, { swalTarget: 'opportunity-side-view' })
      this.$store.commit('Opportunity/OPPORTUNITIES_API', { dataUpdate: true })
      this.$store.dispatch('Opportunity/refresh', true)
    },
    handleWithdrawalForm(value) {
      const withdrawalStatus = ['lost', 'cancelled']
      if (withdrawalStatus.some((status) => status === value)) {
        this.withdrawalDialog = true
      }
    },
    async getStages(pipelineId) {
      const { data } = await this.getList(
        '/cash/stage',
        `order=index&pipeline_id=${pipelineId}`
      )
      if (data?.length > 0) {
        const stagesLog = this.opportunity.op_log.filter((log) => log.type == 'stage')
        const opportunityStageIndex = this.opportunity.stage.index
        const stages = data.map((stage, index) => {
          const stageDate = this.getStageDate(stage.id, index, stagesLog)
          const finalName = stageDate
            ? `${stage.name} (${this.$moment(`${stageDate}Z`).format('DD/MM/YYYY')})`
            : `${stage.name}${stage.index < opportunityStageIndex ? ' (Etapa pulada)' : ''}`
          return {
            id: stage.id,
            name: finalName,
            index: stage.index,
            disabled: true
          }
        })
        this.stages = stages
      }
    },
    getStageDate(id, index, logs) {
      const stageById = logs.filter((stage) => stage.stage_id == id)
      if (stageById.length > 0) {
        const { created_at } = stageById.reduce((finalItem, item) =>
          finalItem.id > item.id ? finalItem : item
        )
        return created_at
      }
      if (index === 0) {
        return this.opportunity.created_at
      }
      return false
    },
    handleOpportunityProducts(invoices) {
      this.resetOpportunityValue()
      if (invoices.length > 0) {
        let lastInvoice = invoices[0]
        const activatedInvoice = invoices.find(
          (invoice) => invoice.status === 'activated'
        )
        if (activatedInvoice) {
          lastInvoice = activatedInvoice
        }
        if (lastInvoice.id !== this.lastInvoice.id) {
          this.lastInvoice = lastInvoice
          const { productType } = this.meta
          for (const key in productType) {
            this.opportunityValues[productType[key].name] = this.sumByTypes(
              lastInvoice.products,
              productType[key].name
            )
          }
          this.opportunityValues['Valor Total'] = lastInvoice.products.reduce(
            (acc, currentValue) =>
              acc + currentValue.value * currentValue.amount,
            0
          )
          this.updateOpportunityValue(
            this.opportunityValues['Valor Total'],
            this.opportunity.id
          )
        }
      }
    },
    resetOpportunityValue() {
      this.lastInvoice = {
        id: null,
      }
      this.opportunityValues['Valor Total'] = 0
      const { productType } = this.meta
      for (const key in productType) {
        this.opportunityValues[productType[key].name] = 0
      }
    },
    async updateOpportunityValue(value, id) {
      if (
        value > 0 &&
        this.opportunity.value != value &&
        !this.isLoadingData &&
        this.opportunity.status != 'won'
      ) {
        await this.updateData(
          '/cash/opportunity',
          { id, value },
          { fireSuccessAlert: false }
        )
        this.$store.commit('Opportunity/OPPORTUNITIES_API', { dataUpdate: true })
        this.$store.dispatch('Opportunity/refresh', true)
      }
    },
    resetSideView() {
      this.$store.dispatch('Opportunity/setPipelineItemId', null)
      this.$store.dispatch('Opportunity/setPipelineSideViewItems', [])
      this.$store.dispatch('Opportunity/setPipelineSideViewDrawer', false)
    }
  }
}
</script>

<style scoped lang="scss">
.v-navigation-drawer {
  border-right: none !important;
  &.v-navigation-drawer__border {
    display: none;
  }
  &.detail--right-dialog {
    height: calc(100vh - 54px) !important;
    margin-right: -2px;
  }
}
.remove-pointer {
  cursor: default !important;
}
.side-view-header {
  background-color: var(--v-shape-lighten1) !important;
  border-bottom: 1px solid var(--v-stroke-base) !important;
}
</style>