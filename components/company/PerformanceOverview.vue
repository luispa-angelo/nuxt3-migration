<template>
  <div>
    <v-btn color="secondary" @click="dialog = !dialog">Resumo de Performance</v-btn>
    <v-dialog v-model="dialog" persistent fullscreen>
      <v-card>
        <DialogHeader title="Resumo de Performance" @onCancel="handleCancel()"/>
          <v-card-text class="mt-4">
            <v-row>
              <v-col>
                <h6 class="subtitle-2 font-weight-bold">Highlights</h6>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <IndicatorSecondary title="Leads na Carteira" :value="'200'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="Clientes" :value="'107'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="% da Carteira" :value="'64%'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="Clientes Integrados" :value="'15'" :has-delta="false" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h6 class="subtitle-2 font-weight-bold">Insights sobre o parceiro</h6>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card class="w-75 my-2">
                  <v-card-title>
                    <span>Este parceiro está em 20º lugar entre os que mais enviam leads.</span>
                  </v-card-title>
                </v-card>
                <v-card class="w-75 my-2">
                  <v-card-title>
                    <span>Este parceiro está em 20º lugar entre os que mais enviam leads.</span>
                  </v-card-title>
                </v-card>
                <v-card class="w-75 my-2">
                  <v-card-title>
                    <span>Este parceiro está em 20º lugar entre os que mais enviam leads.</span>
                  </v-card-title>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h6 class="subtitle-2 font-weight-bold">Visão Geral</h6>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card v-if="dialog" class="w-100 my-2">
                  <v-card-text>
                    <v-row class="ma-1">
                      <v-col cols="6">
                        <LineChartContainer chart-label="Leads Enviados" />
                      </v-col>
                      <v-col cols="6">
                        <LineChartContainer chart-label="Ativações" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <h6 class="subtitle-2 font-weight-bold">Informações Financeiras</h6>
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <IndicatorSecondary title="MRR Ativo" :value="'R$157.358'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="MRR Cancelado" :value="'R$2.500'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="Comissão Recebida" :value="'R$8.500'" :has-delta="false" />
              </v-col>
              <v-col>
                <IndicatorSecondary title="Comissão a Receber" :value="'R$9.750'" :has-delta="false" />
              </v-col>
            </v-row>
            <v-row>
              <v-col>
                <v-card v-if="dialog" class="w-100 my-2">
                  <v-card-text>
                    <v-row class="ma-1">
                      <v-col cols="6">
                        <LineChartContainer chart-label="NMRR Ativado" />
                      </v-col>
                      <v-col cols="6">
                        <LineChartContainer chart-label="Churn Financeiro" />
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
  }),
  methods: {
    handleCancel() {
      this.dialog = false
    },
  }
}
</script>

<style>

</style>