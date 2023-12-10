<template>
  <v-dialog v-model="whatsNew" max-width="806">
      <v-card elevation="0">
        <DialogHeader
          title="Avisos do CROmie"
          @onCancel="closeNews"
          class="mb-5"
        />
        <v-card-text>
          <h5 class="mb-4">Atenção!</h5>
          <p><span class="default-text--text" style="font-size: 20px;">&#128226;</span> Ajude-nos a melhorar!</p>
          <p>
            <span>Estamos coletando feedback dos usuários sobre a recente atualização das telas e usabilidade do nosso CRM.</span>
            <span>
              Compartilhe suas opiniões neste
              <a href="https://forms.gle/PMmUWXwPrgVA62Ak7" target="_blank">formulário</a> 
              e contribua para aperfeiçoarmos sua experiência.
            </span>
          </p>
          <p>Novo horário de Funcionamento da Sala de Suporte</p>
          <p>
            <span>A partir do dia 07/08/2023 nossa sala de suporte irá funcionar de 13:00hrs as 18:00hrs.</span>
            <span>
              Nosso portal segue com atendimento durante todo o horário comercial neste
              <a href="https://omie.atlassian.net/servicedesk/customer/portal/6" target="_blank">link</a>.
            </span> 
            <span>Reforçamos também a necessidade da abertura de um ticket para que o atendimento na sala seja realizado.</span>
          </p>
          <p>Agradecemos a compreensão,</p>
          <p>Equipe do CROmie</p>
        </v-card-text>
        <v-card-actions class="px-6">
          <label><input type="checkbox" v-model="hideWhatsNew">&nbsp;Não mostrar mais até ter algo novo</label>
          <v-spacer></v-spacer>
          <v-btn large color="primary" @click="closeNews">
            Fechar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
</template>

<script>

export default {
  data: () => ({
    whatsNew: false,
    hideWhatsNew: false,
  }),
  mounted() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.whatsNew = userInfo.whatsnew
  },
  methods: {
    closeNews() {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (this.hideWhatsNew) {
        this.$axios.post('/ecosystem/clear-what-is-new')
          .then(() => {
            userInfo.whatsnew = false
            localStorage.userInfo = JSON.stringify(userInfo)
            this.whatsNew = false
          })
      }
      else {
        userInfo.whatsnew = false
        localStorage.userInfo = JSON.stringify(userInfo)
        this.whatsNew = false
      }
    }
  },
}
</script>