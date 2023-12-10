<template>
  <v-app-bar color="shape lighten-1" app clipped-left height="52">
    <div class="w-100 d-flex justify-space-between align-center">
      <div class="navigation-menu">
        <OmieLogo is-resumed />

        <NavigationSideMenu :showOnTopNav="true" />
      </div>

      <!-- User options -->
      <div class="d-flex justify-space-between align-center user-options">
        <AlertFeed />

        <SupportMenu />

        <v-btn
          fab
          tile
          rounded
          icon
          to="/configure"
          class="mr-3 link--effect"
          v-if="isAdmin"
          v-tooltip="{
            content: `
                <div class='v-btn-tooltip '>
                  Configurações
                </div>
                `,
            placement: 'bottom-center',
          }"
        >
          <i class="material-symbols-rounded v-icon icon-presets"> settings </i>
        </v-btn>

        <v-menu offset-y rounded>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              fab
              width="32"
              height="32"
              v-bind="attrs"
              v-on="on"
              color="primary"
              elevation="2"
              v-tooltip="{
                content: `
                    <div class='v-btn-tooltip'>
                      Seu <br>
                      Perfil
                    </div>
                    `,
                placement: 'bottom-center',
              }"
            >
              <b v-if="userInfo" class="title white--text">
                {{ userInfo.name[0] }}
              </b>
            </v-btn>
          </template>

          <v-list nav dense min-width="250">
            <v-subheader v-if="userInfo">
              Bem vindo(a), <br />
              {{ userInfo.name }}
            </v-subheader>
            <v-divider class="mt-2 mb-1"></v-divider>
            <v-list-item-group>
              <Dialog
                isEditing
                userEditing
                :userInfo="userInfo"
                @submit="$refs.menuForm.submitForm()"
                @cancel="$refs.menuForm.handleCancel()"
                title="Configurações"
              >
                <template v-slot="{ dialog }">
                  <UserMenuForm
                    isEditing
                    userEditing
                    :userInfo="userInfo"
                    :dialog="dialog"
                    ref="menuForm"
                  />
                </template>
              </Dialog>
              <v-list-item
                v-for="item in userItems"
                @click="menuActionClick(item)"
                :key="item.label"
              >
                <v-list-item-title>
                  {{ item.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-menu>
      </div>
      <!-- End -->
    </div>
  </v-app-bar>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    itemId: null,
    isMobile: false,
    dialog: {
      mail: false,
      call: false,
      chat: false,
      default: false,
    },
    userItems: [
      {
        icon: '',
        label: 'Sair',
        path: '/home',
        action: 'logout',
      },
    ],
    userInfo: null,
    isAdmin: false,
  }),
  created() {
    window.addEventListener('resize', this.handleResizeWindow)
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResizeWindow)
  },
  mounted() {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'))

    if (!userInfo) {
      this.$router.push('/')
    }
    this.isAdmin = false
    if (userInfo) {
      this.isAdmin = userInfo.admin
    }

    this.userInfo = userInfo
    this.setAlertInterval()
  },
  computed: mapGetters({
    notificationList: 'Notification/formattedNotifications',
    notificationRefresh: 'Notification/notificationRefresh',
    notificationQuery: 'Notification/notificationQuery',
    alertRefresh: 'Alert/alertRefresh',
  }),
  methods: {
    handleConfigBtn() {
      this.$router.push('/configure')
    },
    async menuActionClick(item) {
      switch (item.action) {
      case 'logout':
        await localStorage.setItem('userInfo', null)
        await localStorage.removeItem('remove_opportunity_message')
        await localStorage.removeItem('remove_opportunity_message_deny')
        this.$router.push('/')
        break
      default:
        this.$router.push(item.path)
      }
    },
    themeSelect(theme) {
      let darkMode = false
      localStorage.setItem('theme', theme)
      theme === 'dark' ? (darkMode = true) : (darkMode = false)
      this.$vuetify.theme.dark = darkMode
    },
    setAlertInterval() {
      const { intervalId, interval } = this.alertRefresh
      if (!intervalId) {
        const intervalId = setInterval(() => {
          this.getAlerts()
        }, interval)
        this.$store.commit('Alert/SET_ALERTS_REFRESH', { intervalId })
      }
    },
    handleResizeWindow() {
      this.isMobile = window.innerWidth < 890 ? true : false
    },
    async getAlerts() {
      await this.$store.dispatch('Alert/fetchList', {
        url: '/customer/alert',
        reset: true,
      })
    },
  },
}
</script>

<style scoped lang="scss">
header.v-app-bar {
  z-index: 100;
  padding: 0;
  box-shadow: none !important;
  &.v-app-bar--is-scrolled {
    box-shadow: $shadow-overlay !important;
  }
}

.v-navigation-drawer {
  border-right: none !important;

  &.navigation-menu {
    display: flex;
    align-items: center;
  }
}

.omie-logo {
  width: 100px;
}
</style>

<style lang="scss">
.user-options .link--effect:after {
  bottom: -9px !important;
}

.v-btn.v-btn--icon:focus,
.v-btn.v-btn--icon:active {
  &::before {
    background-color: unset !important;
  }
  > i {
    color: var(--v-primary-base) !important;
  }
}
</style>
