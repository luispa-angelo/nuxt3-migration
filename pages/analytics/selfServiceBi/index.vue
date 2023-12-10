<template>
  <div>
    <AnalyticsHeader />

    <v-divider class="my-5"></v-divider>

    <v-row class="default-style">
      <v-col class="fill-height text-center" cols="3">
        <v-card color="shape lighten-1" class="fill-height">
          <v-list nav dense>
            <div class="d-flex flex-row justify-space-between">
              <v-subheader class="font-body-medium subheader">Meus relatórios salvos</v-subheader>
              <button class="btn-filter pa-0">
                <v-icon small color="#0346F2" @click="newReport = !newReport"
                  >mdi-plus</v-icon
                >
              </button>
            </div>
            <v-divider class="mt-2 mb-1"></v-divider>
            <v-list-item-group>
              <v-list-item v-for="bi in biList" :key="bi.report_id">
                <v-list-item-content>
                  <v-list-item-title class="font-body-medium d-flex align-start">
                    {{ `${bi.name}` }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card>
      </v-col>
      <v-col cols="9" v-if="newReport" class="fill-height">
        <v-card color="shape lighten-1">

          <!-- <v-card-title>teste</v-card-title>
          <v-card-text>teste</v-card-text>
          <v-card-actions></v-card-actions> -->

          <v-card-title class="d-flex flex-row justify-space-between align-center">
            <div class="d-flex flex-row">
              <v-subheader class="font-body-medium">Visuais:</v-subheader>
              <v-icon class="icon">mdi-chart-bar</v-icon>
              <v-icon class="icon">mdi-chart-bell-curve-cumulative</v-icon>
              <v-icon class="icon">mdi-chart-areaspline</v-icon>
              <v-icon class="icon">mdi-chart-line-stacked</v-icon>
              <v-icon class="icon">mdi-chart-pie</v-icon>
              <v-icon class="icon">mdi-filter</v-icon>
              <v-icon class="icon">mdi-chart-donut</v-icon>
            </div>
            <v-btn color="primary" class="mx-2"> Salvar </v-btn>
          </v-card-title>

          <v-divider class="mt-2 mb-1"></v-divider>

          <v-row class="h-100">
            <v-col cols="9"> </v-col>
            <v-col class="text-center" cols="3">
              <v-card color="shape lighten-1" elevation="1" class="h-100">
                <v-list nav dense>
                  <div class="d-flex flex-row justify-space-between">
                    <v-subheader class="font-body-medium">Campos Disponíveis</v-subheader>
                  </div>
                  <v-divider class="mt-2 mb-1"></v-divider>
                  <v-list-item-group>
                    <v-list-item
                      v-for="bi in biList"
                      :key="bi.report_id"
                      class="item-campos-disponiveis"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="font-body-medium d-flex align-start">
                          {{ `${bi.name}` }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>

                <v-list nav dense>
                  <div class="d-flex flex-row justify-space-between">
                    <v-subheader class="font-body-medium">Campos Selecionados</v-subheader>
                  </div>
                  <v-divider class="mt-2 mb-1"></v-divider>
                  <v-list-item-group>
                    <v-list-item
                      v-for="bi in biList"
                      :key="bi.report_id"
                      class="item-campos-disponiveis"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="font-body-medium d-flex align-start">
                          {{ `${bi.name}` }}
                        </v-list-item-title>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list-item-group>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    newReport: false,
    biList: [
      {
        name: 'Tarefas atrasadas por dia',
        report_id: 1,
      },
      {
        name: 'Relatório 2',
        report_id: 2,
      },
      {
        name: 'Relatório 3',
        report_id: 3,
      },
      {
        name: 'Relatório 4',
        report_id: 4,
      },
    ],
  }),
}
</script>

<style scoped>
.default-style {
  height: calc(100vh - 238px);
}
.btn-filter {
  width: 34px;
  height: 34px;
  background-color: #fff !important;
  border-radius: 50%;
}
.subheader {
  color: #0346f2 !important;
}
.icon {
  color: #0346f2 !important;
  margin-right: 10px;
}
.item-campos-disponiveis {
  background-color: #d2d6da;
  min-height: 27px !important;
}
</style>