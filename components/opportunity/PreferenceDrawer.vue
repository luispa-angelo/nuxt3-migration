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
      width="22%"
      class="detail--right-dialog"
    >
      <v-app-bar
        dense
        fixed
        elevation="0"
        color="shape lighten-1"
      >
        <div class="w-100 d-flex justify-space-between align-center">
          <p class="mb-0 mr-2 font-weight-bold">Personalizar</p>
          <v-btn data-test="btnPreferenceDrawerClose" @click.prevent="handleCancel" icon small>
            <v-icon class="material-symbols-rounded">
              close
            </v-icon>
          </v-btn>
        </div>
      </v-app-bar>
      <section v-if="!isLoadingData" class="px-4 py-1" style="margin-top: 48px;">
        <span>Visualização do funil</span>
        <v-radio-group
          row
          hide-details
          dense
          class="my-1"
          v-model="view"
          @change="handleViewSelected"
        >
          <v-radio
            dense
            data-test="radioPreferenceDrawerPipelineView"
            class="mr-2"
            :value="false"
          >
            <template v-slot:label>
              <v-icon size="20">mdi-view-week-outline</v-icon>
              <span class="ml-1 body-1">Colunas</span>
            </template>
          </v-radio>
          <v-radio
            data-test="radioPreferenceDrawerListView"
            class="mr-2"            
            :value="true"
          >
            <template v-slot:label>
              <i
                class="material-symbols-rounded v-icon"
              >
                view_list
              </i>
              <span class="ml-1 body-1">Lista</span>
            </template>
          </v-radio>
        </v-radio-group>
        <v-tabs active-class="primary--text" v-model="tab" :show-arrows="false">
          <v-tab data-test="tabPreferenceDrawerCard" class="body-1 pa-0">
            Cartão
          </v-tab>
          <v-tab data-test="tabPreferenceDrawerStage" class="body-1 pa-0">
            Etapa
          </v-tab>
        </v-tabs>
        <v-tabs-items v-model="tab">
          <v-tab-item>
            <section class="mx-2">
              <p class="my-1 body-1 font-weight-bold">Mostrar no cartão</p>
              <p class="mb-1 body-3 sub-text--text">Selecione até 10 itens para exibir</p>
              <div
                v-for="option in cardOptions"
                :key="option.value"
                v-tooltip="checkDisabled(option.value) && {
                  content: `
                    <div class='v-btn-tooltip'>
                      Limite de seleção atingido.<br>
                      Desmarque um item para habilitar a seleção.
                    </div>
                    `,
                  placement: 'top-end'
                }"
              >
                <v-checkbox
                  hide-details
                  dense
                  class="mt-1"
                  v-model="selected"
                  :data-test="`checkboxPreferenceDrawerOption${option.value.charAt(0).toUpperCase() + option.value.slice(1)}`"
                  :value="option.value"
                  :disabled="checkDisabled(option.value)"
                  @change="handleOptionSelected"
                >
                  <template v-slot:label>
                    <span class="body-1">{{ option.label }}</span>
                  </template>
                </v-checkbox>
              </div>
              <v-divider class="mb-1 mt-2"></v-divider>
              <span class="body-3 sub-text--text">
                Selecionado <b>{{countSelected}}</b> de <b>10</b>
              </span>
            </section>
          </v-tab-item>
          <v-tab-item>
            <section class="mx-2">
              <p class="my-1 body-1 font-weight-bold">Mostrar na etapa</p>
              <p class="mb-1 body-3 sub-text--text" style="line-height: 16px;">
                O valor representa a soma total das oportunidades da fase. Os valores refletem os filtros aplicados ao funil.
              </p>
              <div class="mb-2">
                <v-checkbox
                  hide-details
                  dense
                  data-test="checkboxPreferenceDrawerFooter"
                  class="mt-1"
                  v-model="footerSummary"
                  @change="handleFooterSummary"
                >
                  <template v-slot:label>
                    <span class="body-1">Valor total das oportunidades</span>
                  </template>
                </v-checkbox>
              </div>
            </section>
          </v-tab-item>
        </v-tabs-items>
      </section>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  model: {
    prop: 'openDrawer',
    event: 'change'
  },
  props: {
    openDrawer: {
      type: Boolean
    },
    pipelineId: {
      type: [Number, String]
    },
  },
  data: () => ({
    drawer: false,
    isLoadingData: false,
    selected: [],
    footerSummary: true,
    tab: 0,
    view: false,
    cardOptions: [
      { label: 'Início do lead', value: 'createdAt' },
      { label: 'Origem', value: 'origin' },
      { label: 'Parceiro', value: 'partner' },
      { label: 'Previsão do lead', value: 'prevision' },
      { label: 'Próxima tarefa não iniciada', value: 'nextTask' },
      { label: 'Atribuído(a) a', value: 'assignedTo' },
      { label: 'Status', value: 'status' },
      { label: 'Temperatura', value: 'temp' },
      { label: 'Tempo na etapa', value: 'timeInStage' },
      { label: 'Última tarefa concluída', value: 'lastTask' },
      { label: 'Data de reserva', value: 'expiration' },
      { label: 'Time', value: 'team' },
      { label: 'Valor da oportunidade', value: 'value' },
    ]
  }),
  computed: {
    ...mapGetters({
      meta: 'meta',
      userInfo: 'userInfo',
      preference: 'Profile/preference',
      pipelineCardOptions: 'Opportunity/pipelineCardOptions',
      pipelineViewPreference: 'Opportunity/pipelineViewPreference',
      pipelineFooterSummary: 'Opportunity/pipelineFooterSummary',
    }),
    countSelected() {
      return this.selected.length
    },
  },
  watch: {
    openDrawer(newValue) {
      this.drawer = newValue
    },
    async drawer(newValue) {
      this.hideWindowScrollbar(newValue)
      this.$emit('update:openDrawer', newValue)
      if(newValue) {
        this.isLoadingData = true
        this.selected = this.pipelineCardOptions
        this.view = this.pipelineViewPreference
        this.footerSummary = this.pipelineFooterSummary
        this.isLoadingData = false
      }
    },
  },
  mounted() {
    this.selected = this.pipelineCardOptions
    this.footerSummary = this.pipelineFooterSummary
  },
  destroyed() {
    this.hideWindowScrollbar(false)
  },
  methods: {
    ...mapActions({
      setPipelineCardOptions:'Opportunity/setPipelineCardOptions',
      setPipelineViewPreference:'Opportunity/setPipelineViewPreference',
      setPipelineFooterSummary:'Opportunity/setPipelineFooterSummary',
    }),
    handleCancel() {
      this.drawer = false
    },
    handleOptionSelected() {
      this.setPipelineCardOptions(this.selected)
      this.setPipelinePreference()
    },
    async handleViewSelected() {
      await this.setPipelinePreference()
      await this.setPipelineViewPreference(this.view)
    },
    async handleFooterSummary() {
      await this.setPipelineFooterSummary(this.footerSummary)
      await this.setPipelinePreference()
    },
    async setPipelinePreference() {
      const opportunityPipeline = this.preference(`opportunity_pipeline_${this.pipelineId}`) 
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          [`opportunity_pipeline_${this.pipelineId}`]: {
            ...opportunityPipeline,
            cardOptions: this.selected,
            viewPreference: this.view,
            footerSummary: this.footerSummary,
          }
        }
      }
      await this.updateData('/ecosystem/set-user-profile-preferences', payload, { fireSuccessAlert: false })
      await this.$getMyProfile()
    },
    checkDisabled(option) {
      return this.selected.length === 10 && !this.selected.includes(option)
    },
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
    margin-right: -4px;
    z-index: 10;
  }
}
.remove-pointer {
  cursor: default !important;
}
</style>