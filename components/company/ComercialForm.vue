<template>
  <div>
    <v-btn x-small icon @click="dialog = !dialog">
      <v-icon>mdi-arrow-expand</v-icon>
    </v-btn>
    <v-dialog v-model="dialog" persistent max-width="1000">
      <v-card>
        <DialogHeader
          has-confirm-button
          title="Informações Comerciais"
          @onCancel="cancel"
          @onConfirm="submit"
        />
        <v-card-text class="pt-6">
          <v-expansion-panels>
            <v-expansion-panel class="mb-3">
              <v-expansion-panel-header>
                <div class="d-flex justify-space-between align-center w-100">
                  <p class="mb-0">
                    Infos Gerais
                  </p>
                </div>
              </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-4">
                  <v-row>
                    <v-col>
                      <v-text-field outlined dense label="Data de Criação"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Data de Reserva"/>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field outlined dense label="Origem"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Última Conversão"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Propriedade"/>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel class="mb-3">
              <v-expansion-panel-header>
                <div class="d-flex justify-space-between align-center w-100">
                  <p class="mb-0">
                    Relacionamento
                  </p>
                </div>
              </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-4">
                  <v-row>
                    <v-col>
                      <v-text-field outlined dense label="Relacionamento"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Empresa"/>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel class="mb-3">
              <v-expansion-panel-header>
                <div class="d-flex justify-space-between align-center w-100">
                  <p class="mb-0">
                    Equipes
                  </p>
                </div>
              </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-4">
                  <v-row>
                    <v-col>
                      <v-text-field outlined dense label="Tipo"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Equipe"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Função"/>
                    </v-col>
                    <v-col>
                      <v-text-field outlined dense label="Usuário"/>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    maxWidth: {
      type: Number,
      default: 650
    }
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    submit() {
      this.dialog = !this.dialog
      console.log('submit 2')
    },
    cancel() {
      this.dialog = !this.dialog
      console.log('cancel 2')
    }
  }
}
</script>