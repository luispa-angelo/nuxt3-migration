<template>
  <v-card class="card">
    <div class="content">
      <BusinessConfigInfo
        v-if="currentStep === 0"
        :tenant="tenant"
        :stepData="currentStepData"
        @submitForm="saveStepData"
        data-test="stepCreateBusinessConfigInfo"
      />
      <BusinessConfigPipeline
        v-if="currentStep === 1"
        :tenantId="tenant.id"
        :stepData="currentStepData"
        @submitForm="saveStepData"
        data-test="stepCreateBusinessConfigPipe"
      />
      <BusinessConfigMenu
        v-if="currentStep === 2"
        :tenantId="tenant.id"
        :businessId="businessId"
        :isEdit="isEdit"
        :stepData="currentStepData"
        @submitForm="saveStepData"
        @goToPipeline="currentStep -= 1"
        data-test="stepCreateBusinessConfigMenu"
      />
    </div>
    <v-card-actions class="d-flex justify-end pa-0">
      <v-btn
        v-if="currentStep > 0"
        class="mr-2 px-4"
        dense
        color="secondary"
        @click="previousStep"
        data-test="btnCreateBusinessPreviousStep"
      >
        <v-icon left>mdi-arrow-left</v-icon>
        <span class="mb-1">Voltar</span>
      </v-btn>
      <v-btn
        v-if="currentStep === 2"
        class="px-4"
        color="primary"
        dense
        :disabled="isDisabled"
        :to="`/configure/${this.tenant.id}/business`"
        data-test="btnCreateBusinessComplete"
      >
        Concluir
      </v-btn>
      <v-btn
        v-else
        class="mr-2 px-4"
        dense
        color="secondary"
        :disabled="isDisabled"
        @click="nextStep"
        data-test="btnCreateBusinessNextStep"
      >
        <span class="mb-1">Próximo</span>
        <v-icon right>mdi-arrow-right</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  layout: 'side-menu-configure',
  data: () => ({
    currentStep: 0,
    tenant: {
      id: 0,
      name: ''
    }, 
    stepsData: [],
    businessName: '',
    endpointTenant: '/ecosystem/tenant',
    endpointTeams: '/ecosystem/any-team',
    isSubmitted: false,
    businessId: null,
    isEdit: false,
    menuSubmitted: false
  }),
  computed: {
    currentStepData() {
      return this.stepsData[this.currentStep]
    },
    isDisabled() {
      if (this.isEdit) {
        return !this.stepsData[this.currentStep]?.isSubmitted
      } else {
        return !this.isSubmitted
      }
    }
  },
  methods: {
    saveStepData(formData) {
      this.$set(this.stepsData, this.currentStep, { ...formData })
      this.isSubmitted = this.stepsData[this.currentStep]?.isSubmitted
      if (!this.isEdit) this.businessId = this.stepsData[0].business?.id
    },
    getParams() {
      const { tenant_id } = this.$route.params
      this.tenant.id = parseInt(tenant_id)
    },
    async getTenantName() {
      const query = `id=${this.tenant.id}`
      const { data } = await this.getList(this.endpointTenant, query)
      this.tenant.name = data[0]?.name
    },
    setInitialData() {
      if(this.$route.query.isEdit) {
        this.isEdit = true
      }
      if(this.isEdit) {
        this.businessId = parseInt(this.$route.query.id)
      }
    },
    async getInitialData() {
      this.getParams()
      await this.getTenantName()
    },
    async nextStep() {
      this.currentStep += 1
    },
    previousStep() {
      this.currentStep -= 1
    }
  },
  watch: {
    stepsData: {
      handler(newStepsData) {
        const updatedStepData = newStepsData[this.currentStep]
        if (updatedStepData && updatedStepData.isSubmitted !== this.isSubmitted) {
          this.isSubmitted = updatedStepData.isSubmitted
        }
      },
      deep: true
    },
  },
  async created() {
    await this.getInitialData()
    this.setInitialData()
  }
}
</script>
<style lang="scss" scoped>
.card {
  padding: 20px 16px;
  .content {
    padding-bottom: 16px;
    min-height: calc(100vh - 208px);
  }
}
</style>