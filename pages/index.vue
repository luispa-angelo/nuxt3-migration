<template>
  <v-container fluid fill-height class="py-0">
    <v-row class="fill-height">
      <v-col xl="5" lg="5" md="5" sm="12" cols="12" class="d-flex flex-column justify-center align-end ">
        <article class="pr-5">
          <OmieLogo />
          <h1 class="mb-5">Leve seu <br> trabalho para o <br> próximo nível.</h1>
          <p class="ajust-text subtitle-2">
            A plataforma de CRM simples de configurar e fácil de usar. <br>
            Faça a gestão de tudo em um único lugar com o novo CRM <br>
            da Omie. Estamos melhorando todos os dias.
          </p>
        </article>
      </v-col>
      <v-col xl="2" lg="2" md="1" sm="0" cols="12"><v-spacer></v-spacer></v-col>
      <v-col
        xl="5"
        lg="5"
        md="5"
        sm="12"
        cols="12"
        class="d-flex justify-start align-center"
      >
        <LoginForm />
      </v-col>
    </v-row>
    <v-footer color="shape lighten-1"  fixed padless width="98%" class="d-flex justify-end align-top">
      <a @click="openSupportChat = !openSupportChat" class="mr-7 mb-3">Suporte</a>
      <a href="https://omiecrm.ideanote.io/missions/1/cards" target="_blank" class="mr-7 mb-3">Portal de Ideias</a>
      <SupportChat start-opened v-if="openSupportChat"/>
    </v-footer>
  </v-container>
</template>

<script>
/* eslint-disable no-undef */
import { mapGetters } from 'vuex'

export default {
  layout: 'blank',
  data: () => ({
    openSupportChat: false,
  }),
  computed: {
    ...mapGetters({
      notificationRefresh: 'Notification/notificationRefresh',
      alertRefresh: 'Alert/alertRefresh',
    }),
  },
  async mounted() {
    this.clearNotificationInterval(this.notificationRefresh.intervalId)
    this.clearAlertInterval(this.alertRefresh.intervalId)

    const userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if(userInfo){
      try {
        await this.$axios.get('/ecosystem/my-figures')
        this.$router.push('/home')
        // this.$store.dispatch('setUser', userInfo)
      } catch ({status}) {
        this.$swal({
          icon: 'error',
          title: 'Sessão expirada!',
        })
      }
    }

   
  },
  methods: {
    clearNotificationInterval(id) {
      if (id) {
        clearInterval(id)
        this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', { intervalId: null })
      }
    },
    clearAlertInterval(id) {
      if (id) {
        clearInterval(id)
        this.$store.commit('Alert/SET_ALERTS_REFRESH', { intervalId: null })
      }
    },
  }
}
</script>

<style scoped>
  .hasError label {
    color: red;
  }
  .discover-link {
    text-decoration: none;
  }
  .ajust-text {
    text-align: justify;
  }
  .login-card {
    width: 500px;
    border-radius: 32px;
  }
  a {
    text-decoration: none;
    font-size: 12px;
  }
</style>