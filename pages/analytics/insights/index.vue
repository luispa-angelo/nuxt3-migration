<template>
  <div>
    <AnalyticsHeader />

    <v-divider class="my-5"></v-divider>

    <v-row>
      <v-col class="text-center">
        <v-card color="shape lighten-1" class="default-style">
          <v-row class="ma-0 pa-5 d-flex justify-space-between">
            <AnalyticsInsightsCard
              :iconColor="'green'"
              :title="'Vendas'"
              :icon="'mdi-arrow-up'"
              :description="'Descrição do KPI com ação'"
              :imgSrc="''"
            />
            <AnalyticsInsightsCard
              :iconColor="'red'"
              :title="'Forecast'"
              :icon="'mdi-arrow-down'"
              :description="'Descrição do KPI com ação'"
              :imgSrc="''"
            />
            <AnalyticsInsightsCard
              :iconColor="'red'"
              :title="'Capacity'"
              :icon="'mdi-arrow-down'"
              :description="'Descrição do KPI com ação'"
              :imgSrc="''"
            />
            <AnalyticsInsightsCard
              :iconColor="'green'"
              :title="'Atividades'"
              :icon="'mdi-arrow-up'"
              :description="'Descrição do KPI com ação'"
              :imgSrc="''"
            />
          </v-row>

          <v-divider></v-divider>

          <v-row class="w-100 ma-0 expansion-panel">
            <v-col>
              <v-expansion-panels accordion>
                <v-expansion-panel v-for="(item, i) in 8" :key="i" class="mb-1">
                  <v-expansion-panel-header> Item </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                    veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                    commodo consequat.
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
/* .default-style {
  height: calc(100vh - 238px);
} */

.expansion-panel {
  overflow-y: scroll;
}
</style>