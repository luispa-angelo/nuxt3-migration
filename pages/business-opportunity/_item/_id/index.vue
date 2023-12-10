<template>
  <div class="oppotunity-details-page">
    <v-row class="header-opportunity-details">
      <v-col xl="3" lg="4" md="5" sm="5" class="pb-0">
        <RouterBreadCrump
          has-title
          :page-name="company.name"
        >
          <div class="d-flex justify-space-between ml-2">
            <Sheet
              v-if="hasCompany"
              isEditing
              from-details
              title="Informações da Empresa"
              @submit="$refs.myForm.submitForm()"
              @cancel="$refs.myForm.handleCancel()"
            >
              <template v-slot="{ sheet, closed }">
                <CompanyForm
                  ref="myForm"
                  isEditing
                  :sheet="sheet"
                  @closeForm="closed"
                  :item-id="company.id"
                />
              </template>
            </Sheet>
          </div>
        </RouterBreadCrump>
        <NuxtLink data-test="linkOpportunityCompany" :to="redirectPage(company)" class="company-details">
          {{ company.identifier | VMask(companyIdentifierMask) }}
        </NuxtLink>
        <v-btn
          fab 
          text
          color="grey lighten-3"
          v-tooltip="{
            content: `
              <div class='v-btn-tooltip'>
                Copiar
              </div>
              `,
            placement: 'bottom-center'
          }"
          @click.stop="copyToClipboard(company.identifier)"
        >
          <v-icon class="material-icons-round" size="20">
            copy
          </v-icon>
        </v-btn>
      </v-col>
      <v-col v-if="opportunity.stage" class="opportunity-stage pb-0" xl="9" lg="8">
        <v-slide-group class="slide-opportunity-stage">
          <template v-slot:next>
            <v-btn fab color="secondary">
              <v-icon>$next</v-icon>
            </v-btn>
          </template>
          <v-slide-item
            v-for="(stage) in listStage"
            :key="stage.id"
            multiple
            show-arrows
          >
            <v-col
              @click="checkStageUpdate(stage)"
              :style="
                stage.index == opportunity.stage.index
                  ? 'pointer-events: none;'
                  : ''
              "
              :class="!blockOpportunity ? 'stage-item' : ''"
              class="control-size-stage"
            >
              <v-progress-linear
                rounded
                color="success"
                class="mb-2"
                :value="stage.index <= opportunity.stage.index ? 100 : 0"
              />
              <div class="d-flex align-center">
                <v-icon
                  :color="
                    stage.index <= opportunity.stage.index
                      ? 'success'
                      : 'success lighten-5'
                  "
                  class="mr-1"
                >
                  {{
                    opportunity.stage.index >= stage.index
                      ? 'mdi-check-circle'
                      : 'mdi-circle-outline'
                  }}
                </v-icon>
                <span
                  v-tooltip="{
                    content: `
                      <div class='v-btn-tooltip'>
                        ${stage.name}
                      </div>
                      `,
                    placement: 'bottom-center',
                  }"
                >
                  {{ stage.name | truncate(13) }}
                </span>
              </div>
              <span v-if="opportunity.stage.index >= stage.index" class="ml-7">
                <span v-if="stage.index === 0">{{ $moment(`${opportunity.created_at}Z`).format('DD/MM/YYYY') }}</span>
                <span v-else>
                  <span v-if="stage.date == false"> Etapa pulada </span>
                  <span v-else>
                    {{ $moment(`${stage.date}Z`).format('DD/MM/YYYY') }}
                  </span>
                </span>
              </span>
              <span v-else class="sub-text--text">--/--/--</span>
            </v-col>
          </v-slide-item>
          <template v-slot:prev>
            <v-btn fab color="secondary">
              <v-icon>$prev</v-icon>
            </v-btn>
          </template>
        </v-slide-group>
        </v-col>
      </v-row>
    <v-row>
      <v-col xl="3" lg="4">
        <v-sheet
          class="px-5 py-4"
          style="border: 1px solid var(--v-stroke-base);"
        >
        <v-row class="d-flex justify-center mb-3">
            <v-col class="d-flex justify-center">
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
            </v-col>
          </v-row>
            <p v-if="lastInvoice.id" class="font-body-large">
              {{ `Proposta ${
                    10 > lastInvoice.index + 1
                      ? `0${lastInvoice.index + 1}`
                      : lastInvoice.index + 1
                  } `
              }}
            </p>
          <section class="opportunity-values-section" :style="opportunityValuesColumn">
            <div
              v-for="(value, key) in opportunityValues"
              :key="key"
              class="mb-3"
            >
              <span style="color: var(--v-grey-lighten3);">
                {{ `${key}: ` }}
              </span>
              <p>{{ `R$ ${maskMoney('pt-br', value || '0,00')}` }}</p>
            </div>
          </section>
          <v-select
            attach
            dense
            outlined
            data-test="selectOpportunityStatus"
            label="Status"
            item-value="value"
            item-text="name"
            v-model="sideFormData.status"
            :items="statusList"
            :disabled="blockOpportunity"
            @change="handleWithdrawalForm"
          ></v-select>
          <template
            v-if="
              opportunity.withdrawal_reason &&
              ['lost', 'cancelled'].includes(opportunity.status)
            "
          >
            <p class="withdrawal-reason">
              Motivo: {{ opportunity.withdrawal_reason.value }}
            </p>
          </template>
          <v-select
            attach
            dense
            outlined
            data-test="selectOpportunityTemperature"
            label="Temperatura"
            item-value="value"
            item-text="name"
            v-model="sideFormData.temperature"
            :items="opportunityTemperature"
            :disabled="blockOpportunity"
            @change="changeAsideStatus"
          ></v-select>
          <v-text-field
            outlined
            dense
            data-test="inputOpportunityPrevision"
            label="Previsão"
            type="date"
            v-model="sideFormData.prevision"
            :disabled="blockOpportunity"
            @change="changeAsideStatus"
          ></v-text-field>
          <v-select
            attach
            dense
            outlined
            data-test="selectOpportunityOrigin"
            label="Origem"
            item-value="id"
            item-text="name"
            v-model="sideFormData.origins"
            :items="origins"
            :disabled="blockOpportunity"
            @change="changeAsideStatus"
            multiple
          ></v-select>
          <Panel>
            <template v-slot:panel>
              <OpportunityAggregate
                :opportunity-id="opportunity.id"
                :aggregate-companies="aggregateCompanies"
                :showForm="!blockOpportunity"
                @update="getAggregateCompanies(opportunity.id)"
              />
              <OpportunityContact
                :list="contactList"
                :opportunity-id="opportunity.id"
                :company-id="company.id"
                :showForm="!blockOpportunity"
                @update="updateContact"
              />
              <OpportunityCompetitor
                :opportunity="opportunity"
                :list="competitorList"
                :showForm="!blockOpportunity"
                @update="updateCompetitor"
              />
            </template>
          </Panel>
        </v-sheet>
      </v-col>
      <v-col xl="9" lg="8">
        <v-sheet
          class="pa-3"
          style="border: 1px solid var(--v-stroke-base);"
        >
          <OpportunityDetails
            :item-id="itemId"
            :opportunity="opportunity"
            :aggregate-companies="aggregateCompanies"
            @InvoicesHasChange="handleOpportunityProducts"
          />
        </v-sheet>
      </v-col>
    </v-row>
    <v-dialog
      v-model="confirmDialog"
      hide-overlay
      scrollable
      persistent
      max-width="450"
    >
      <v-card>
        <DialogHeader
          :elevation="0"
          @onCancel="confirmDialog = !confirmDialog"
        />
        <v-card-text class="pt-3">
          <p class="mb-0">
            Ao avançar a etapa não será possível desfazer a ação. Você tem
            certeza que deseja continuar?
          </p>
          <v-checkbox
            label="Não mostrar esta mensagem novamente."
            v-model="notShowAgain"
            class="mb-0 pb-0"
          ></v-checkbox>
        </v-card-text>
        <DialogAction
          :show-divider="false"
          actions-align="center"
          submit-text="Continuar"
          @submit="updateStage(selectedStage.id)"
          @cancel="confirmDialog = !confirmDialog"
        />
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="denyDialog"
      hide-overlay
      scrollable
      persistent
      max-width="450"
    >
      <v-card>
        <DialogHeader :elevation="0" @onCancel="denyDialog = !denyDialog" />
        <v-card-text class="pt-3">
          <p class="mb-0">
            Você não possui permissão para desfazer a ação. Contate o suporte e
            solicite auxílio.
          </p>
          <v-checkbox
            label="Não mostrar esta mensagem novamente."
            v-model="notShowAgainDeny"
            class="mb-0 pb-0"
          ></v-checkbox>
        </v-card-text>
        <DialogAction
          :show-divider="false"
          actions-align="center"
          cancel-text="Voltar"
          :hide-submit="true"
          @cancel="denyDialog = !denyDialog"
        />
      </v-card>
    </v-dialog>
    <OpportunityWithdrawalForm
      :withdrawal-dialog="withdrawalDialog"
      :opportunity-id="itemId"
      :opportunity-team="opportunity.team_id"
      :status-value="sideFormData.status"
      @onClose="
        (value) => {
          this.withdrawalDialog = value
          this.sideFormData.status = this.currentStatus
        }
      "
      @onUpdate="
        (value) => {
          this.withdrawalDialog = value
          this.getOpportunity(this.itemId)
        }
      "
    />
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    selectedStage: null,
    notShowAgain: false,
    notShowAgainDeny: false,
    tabItems: [
      { name: 'Tarefas', value: 'task' },
      { name: 'Dados da Empresa', value: 'companyData' },
      { name: 'Comercial', value: 'comercial' },
      { name: 'Proposta', value: 'proposal' },
      { name: 'Ativação', value: 'activation' },
    ],
    opportunityTemperature: [
      { name: '10º', value: 10 },
      { name: '20º', value: 20 },
      { name: '30º', value: 30 },
      { name: '40º', value: 40 },
      { name: '50º', value: 50 },
      { name: '60º', value: 60 },
      { name: '70º', value: 70 },
      { name: '80º', value: 80 },
      { name: '90º', value: 90 },
      { name: '100º', value: 100 },
    ],
    listStage: [],
    itemId: null,
    confirmDialog: false,
    denyDialog: false,
    temId: null,
    contactList: null,
    competitorList: null,
    userContacts: null,
    enhancementContacts: null,
    mediaValue: null,
    search: '',
    company: {},
    selectedTab: 'generalData',
    loaded: false,
    opportunityValues: {
      ['Valor Total']: null,
      ['Addon']: null,
      ['Produto']: null,
      ['Outro']: null,
    },
    opportunityValuesArray: [],
    sideFormData: {
      id: null,
      status: null,
      temperature: null,
      prevision: null,
      origin_id: null,
      origins: null,
    },
    formData: {
      id: 0,
      stage_id: 0,
    },
    taskHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Tipo', value: 'type_id' },
      { text: 'Estagio', value: 'state' },
      { text: 'Agendado para', value: 'scheduled_to' },
    ],
    steps: [
      {
        step: 1,
        label: 'Backlog',
        color: 'yellow',
      },
      {
        step: 2,
        label: 'Qualificação',
        color: 'blue',
      },
      {
        step: 3,
        label: 'Ligação',
        color: 'pink',
      },
    ],
    businessItemId: null,
    businessCategoryId: null,
    aggregateCompanies: [],
    origins: [],
    opportunityStatus: {
      won: {
        text: 'OPORTUNIDADE GANHA',
        color: 'success',
      },
      waiting_customer_approval: {
        text: 'PENDENTE APROVAÇÃO',
        color: 'warning',
      },
    },
    hasCompany: true,
    lastInvoice: {
      id: null,
    },
    redirectTo: 'business-companies-item-identifier',
    withdrawalDialog: false,
  }),
  computed: {
    ...mapGetters({
      companyRefresh: 'Company/refreshData',
      opportunityRefresh: 'Opportunity/refreshData',
      opportunity: 'Opportunity/opportunity',
      tasksOpportunity: 'tasksOpportunity',
      opportunityProducts: 'Opportunity/opportunityProducts',
      opportunities_api: 'Opportunity/opportunities_api',
      stages: 'stages',
      contacts: 'Contact/contacts',
      meta: 'meta',
      assignedTasks_api: 'Task/assignedTasks_api',
      businessCategories: 'businessCategories',
      businessItems: 'businessItems',
    }),
    isPartnerType: function () {
      const { partnership } = this.company
      const types = ['Parceiro', 'Parceiro em potencial']
      return types.some((type) => type == partnership)
    },
    pageGroup: function () {
      const category = this.businessCategories.find(
        (category) => category.id == this.businessCategoryId
      )
      return category?.name
    },
    pageName: function () {
      const item = this.businessItems.find(
        (item) => item.id == this.businessItemId
      )
      return item?.name
    },
    blockOpportunity: function () {
      const blockStatusList = [
        'won',
        'lost',
        'cancelled',
      ]
      const blockStatus = blockStatusList.some(
        (status) => status === this.opportunity.status
      )

      let isAdmin = this.getUserInfo()?.admin

      if (blockStatus && !isAdmin) {
        return true
      }
      return false
    },
    statusList: function () {
      let filters = ['won']
      
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
    stateLog: function () {
      const stages = this.opportunity.op_log
        .filter((log) => log.type == 'stage')
        .map((log) => ({
          id: log.id,
          stage_id: log.stage_id,
          created_at: log.created_at,
        }))
      return stages
    },
    currentStatus: function () {
      return this.opportunity.status
    },
    companyIdentifierMask() {
      return this.company.identifier_type === 'cnpj' ? this.mask_cnpj : this.mask_cpf
    },
    opportunityData() {
      return { id: this.itemId, stage_id: this.opportunity.stage_id }
    },
    opportunityValuesColumn() {
      return this.lastInvoice.id || Object.keys(this.opportunityValues).length > 4
        ? 'column-count: 3; margin-bottom: 24px'
        : 'column-count: 2; margin-bottom: 12px'
    }
  },
  async created() {
    this.itemId = this.$route.params['id']
    this.businessCategoryId = this.$route.query['category']
    this.businessItemId = this.$route.params['item']
    this.loaded = false
    await this.getOrigin()
    await this.getOpportunity(this.itemId)
    await this.getCompetitor()
    await this.getContacts()
    await this.getAssociations()

    if (this.$route.query.tab == 'product') {
      this.selectedTab = 'product'
    } else if (this.$route.query.tab == 'generalData') {
      this.selectedTab = 'generalData'
    }
    this.refreshCompanyData(false)
  },
  watch: {
    denyDialog(newValue) {
      if (!newValue) {
        if (this.notShowAgainDeny) {
          localStorage.setItem('remove_opportunity_message_deny', true)
        }
      }
    },
    async stages(newValue) {
      this.listStage = []
      if (newValue) {
        for (const item of newValue) {
          this.listStage.push({
            id: item.id,
            index: item.index,
            name: item.name,
            date: this.getStageDate(item.id),
          })
        }
      }
    },
    async opportunity(newValue) {
      this.company = newValue.company
      if (!newValue.company.id) {
        this.hasCompany = false
      }
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
      }

      this.loaded = true
    },
    async opportunities_api(newValue) {
      if (newValue.dataUpdate) {
        await this.getOpportunity(this.itemId)
        this.$store.commit('Opportunity/OPPORTUNITIES_API', {
          dataUpdate: false,
        })
      }
    },
    async companyRefresh(newValue) {
      if (newValue) {
        this.getOpportunity(this.itemId)
        this.company.id = null
        this.refreshCompanyData(false)
      }
    },
    async opportunityRefresh(newValue) {
      if (newValue) {
        this.getOpportunity(this.itemId)
        this.company.id = null
        this.refreshOpportunityData(false)
      }
    },
  },
  methods: {
    ...mapActions({
      refreshCompanyData: 'Company/refresh',
      refreshOpportunityData: 'Opportunity/refresh',
    }),
    checkStageUpdate(stage) {
      this.selectedStage = stage
      var showMessage = localStorage.getItem('remove_opportunity_message')
      var showMessageDeny = localStorage.getItem(
        'remove_opportunity_message_deny'
      )
      if (this.selectedStage.index < this.opportunity.stage.index) {
        if (!showMessageDeny) {
          this.denyDialog = true
        }
      } else {
        if (!this.blockOpportunity) {
          if (!showMessage) {
            this.confirmDialog = true
          } else {
            this.updateStage(this.selectedStage.id)
          }
        }
      }
    },
    getStageDate(id) {
      const stageById = this.stateLog.filter((stage) => stage.stage_id == id)
      if (stageById.length > 0) {
        const { created_at } = stageById.reduce((finalItem, item) =>
          finalItem.id > item.id ? finalItem : item
        )
        return created_at
      }
      return false
    },
    isValidDate(d) {
      return d instanceof Date && !isNaN(d)
    },
    async changeAsideStatus() {
      this.sideFormData.id = this.$route.params.id

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
      }
      await this.updateData('/cash/opportunity', payload)
      this.$store.dispatch('Opportunity/refresh', true)
    },
    async updateCompetitor() {
      const { id } = this.$route.params
      this.itemId = id
      await this.getOpportunity(id)
      await this.getCompetitor()
    },
    async updateContact() {
      const { id } = this.$route.params
      this.itemId = id
      await this.getOpportunity(id)
      await this.getContacts()
      this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: true })
      this.$store.dispatch('Task/refresh', true)
    },
    async getCompetitor() {
      const { competitors } = this.opportunity
      this.competitorList = competitors?.map((item) => {
        return {
          opportunity_id: item.opportunity_id,
          id: item.competitor_id,
          title_1: item.competitor.name,
          title_2: item.competitor.cnpj,
        }
      })
    },
    async getContacts() {
      this.contactList = []
      const { contact } = this.opportunity
      if (contact) {
        const contacts = [contact]
        this.contactList = contacts.map((item) => {
          if (item.medias) {
            const media = item.medias.find(
              (media) => media.type_id != 1 && media.value
            )
            media && (this.mediaValue = media.value)
          }
          return {
            id: item.id,
            title_1: item.active ? item.name : item.name + ' (Inativo)',
            subtitle_1: this.mediaValue,
          }
        })
      }
    },
    async getAssociations() {      
      await this.$store.dispatch(
        'fetchAssociations',
        `includes=left_side,association_type&right_side_id=${this.opportunity?.customer_id}`
      )
    },
    async getOpportunity(id) {
      await this.$store.dispatch(
        'Opportunity/fetchOpportunity',
        'also=competitors.competitor,tasks.assigned_to,tasks.type.media_type,op_log.owner,op_log.stage' +
          `&includes=company.contacts.medias,company.addresses,company.cnaes,partner.memberships.team,contact.medias.media_type,assigned_to,stage,team,withdrawal_reason,origin&id=${id}`
      )

      await this.$store.dispatch(
        'Opportunity/fetchOpportunityLog',
        `includes=owner.capabilities.role,team&opportunity_id=${id}`
      )

      await this.$store.dispatch(
        'Opportunity/fetchOpportunityProducts',
        `includes=product&opportunity_id=${id}`
      )
      await this.getAggregateCompanies(id)
    },
    async getStages(pipelineId) {
      await this.$store.dispatch(
        'fetchStages',
        `order=index&pipeline_id=${pipelineId}`
      )
    },
    async updateStage(stageId) {
      if (this.notShowAgain) {
        localStorage.setItem('remove_opportunity_message', true)
      }
      if (!this.blockOpportunity) {
        (this.formData = {
          id: this.opportunity.id,
          stage_id: stageId,
        }),
        await this.$store.dispatch(
          'Opportunity/updOpportunity',
          this.formData
        )
      }
      this.selectedStage = null
      this.notShowAgain = false
      this.confirmDialog = false
    },
    updateOpportunityValue(value, id) {
      if (
        value > 0 &&
        this.opportunity.value != value &&
        this.loaded &&
        this.opportunity.status != 'won'
      ) {
        this.updateData(
          '/cash/opportunity',
          { id, value },
          { fireSuccessAlert: false }
        )
      }
    },
    async getOrigin() {
      const { data } = await this.getList('/cash/opportunity-origin')
      let optOrigins = []

      for (const d in data) {
        optOrigins.push({ id: data[d].id, name: data[d].name })
      }

      this.origins = optOrigins
    },
    async getAggregateCompanies(id) {
      const { data } = await this.getList(
        '/cash/opportunity-aggregate',
        `includes=company.cnaes&opportunity_id=${id}`
      )
      this.aggregateCompanies = data
    },
    handleOpportunityProducts(invoices) {
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
            const type = productType[key].name
            if (type !== 'Trial') {
              this.opportunityValues[type] = this.sumByTypes(
                lastInvoice.products,
                type
              )
            }
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
    redirectPage(item) {
      const { identifier, id } = item
      const { params } = this.$route
      return {
        name: `${this.redirectTo}`,
        params: { ...params, identifier },
        query: { company_id: id },
      }
    },
    handleWithdrawalForm(value) {
      const withdrawalStatus = ['lost', 'cancelled']
      if (withdrawalStatus.some((status) => status === value)) {
        this.withdrawalDialog = true
      }
    },
  },
}
</script>

<style lang="scss">
.oppotunity-details-page {
  .opportunity-stage {
    padding: 0 22px 0 28px;

    .slide-opportunity-stage {
      width: 100%;

      .control-size-stage {
        max-height: 64px;
        min-width: 135px;
        padding: 4px 0;
      }

      .v-slide-group__next {
        position: absolute;
        top: 38%;
        left: 96%;
        min-width: 0;
      }

      .v-slide-group__prev {
        position: absolute;
        top: 38%;
        left: 0%;
        z-index: 1;
        min-width: 0;
      }

      .v-slide-group__content {
        gap: 8px;
      }

      .v-slide-group__prev--disabled {
        display: none;
      }

      .v-slide-group__next--disabled {
        display: none;
      }
    }
  }
  .stage-item {
    cursor: pointer;
  }
  .disable-events {
    pointer-events: none;
  }
  .company-details {
    color: var(--v-primary-base);
    text-decoration: none;
    cursor: pointer;
  }
  .withdrawal-reason {
    margin-top: -2em;
    font-size: 0.8em;
  }
  .opportunity-values-section {
    column-gap: 2rem;
  }
  .header-opportunity-details {
    align-items: end;
  }
  .widgets-section {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
}
</style>
