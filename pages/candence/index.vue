<template>
  <div>
    <PageHeadline page-name="Painel" page-group="Cadências">
    </PageHeadline>
    <v-card class="mx-auto mt-4">
      <v-card-title>
        Escolha um fluxo de automação:
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-5">
        <v-sheet v-for="item in candenceList" :key="item.id" rounded outlined class="v-sheet-text-container mb-5 py-6 px-5">
          <v-avatar size="34" color="primary">
            <v-icon size="22" dark>mdi-lightning-bolt-outline</v-icon>
          </v-avatar>
          <v-row>
            <v-col xl="10" lg="10" class="d-flex align-center">
              <p class="mb-0">
                <span class="primary--text font-weight-bold">{{ item.title }}</span>
                <span class="font-weight-bold">{{ item.subtitle }}</span> <br>
                {{ item.description }}
              </p>
            </v-col>
            <v-col xl="2" lg="2" class="d-flex justify-end">
              <div v-if="!item.configured" class="d-flex justify-space-between align-center">
                <v-btn fab x-small color="secondary" class="mr-3">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <p class="mt-1 mb-0 mr-1">Configurar</p>
              </div>
              <div v-else class="d-flex justify-space-between align-center">
                <v-icon color="success" class="mr-3">mdi-check-circle</v-icon>
                <p class="mt-1 mb-0 mr-1">Configurado</p>
              </div>
            </v-col>
          </v-row>
        </v-sheet>
        <v-sheet rounded outlined class="v-sheet-text-container v-sheet-clickable mb-5 py-6 px-5">
          <v-avatar size="34" color="stroke darken-3">
            <v-icon size="22" dark>mdi-lightning-bolt-outline</v-icon>
          </v-avatar>
          <v-row>
            <v-col xl="10" lg="10" class="d-flex align-center" @click="dialog = true">
              <p class="stroke--text text--darken-3 mb-0">
                <span class="font-weight-bold">Solicitar nova cadência:</span> <br>
                Clique aqui para solicitar um novo tipo de automação para o seu time.
              </p>
            </v-col>
          </v-row>
        </v-sheet>
        <v-dialog v-model="dialog" max-width="600">
          <v-card>
            <DialogHeader title="Solicitar nova cadência" @onCancel="cancel" />
            <v-card-text class="pt-5">
              <v-form ref="forms">
                <v-text-field
                  label="Solicitante"
                  placeholder="E-mail do solicitante"
                  outlined
                  dense
                ></v-text-field>
                <v-text-field
                  label="Sugestão de cadência"
                  placeholder="Distribuição"
                  outlined
                  dense
                ></v-text-field>
                <v-textarea
                  label="Descreva aqui"
                  placeholder="Descreva aqui o que você precisa"
                  outlined
                  dense
                ></v-textarea>
              </v-form>
            </v-card-text>
            <DialogAction @submit="submit" @cancel="cancel" />
          </v-card>
        </v-dialog>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: false,
    candenceList: [
      {
        id: 1,
        title: 'Distribuição:',
        subtitle: 'Quando um novo lead de potencial parceiro chega',
        description: 'Com esse fluxo, você pode definir como os novos leads de potenciais parceiros serão distribuídos automaticamente entre o seu time.',
        configured: false
      },
      {
        id: 2,
        title: 'Tarefas:',
        subtitle: 'Tarefas automáticas para novo Parceiro',
        description: '',
        configured: true
      },
      {
        id: 3,
        title: 'Distribuição:',
        subtitle: 'Quando um novo cliente é ativado',
        description: '',
        configured: false
      }
    ]
  }),
  methods: {
    submit() {
      alert('foi!')
    },
    cancel() {
      this.dialog = !this.dialog
    }
  }
}
</script>

<style scoped>
  .v-sheet-text-container {
    border-style: dashed;
    border-color: rgba(103, 116, 142, 0.4);
    position: relative;
  }
  .v-avatar {
    position: absolute;
    top: -10px;
    left: -10px;
  }
  .v-sheet-clickable {
    cursor: pointer;
  }
  .fix-label-margin-top {
    margin-top: -5px;
  }
</style>