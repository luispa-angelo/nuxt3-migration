<template>
  <header
    color="shape lighten-1"
    height="52"
    :class="scrollPosition >= 100 ? 'elevation-1' : ''"
  >
    <div class="w-100 d-flex justify-space-between align-center px-4">
      <div class="d-flex align-center">
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
          class="link--effect pt-2"
          v-if="isAdmin"
        >
          <!-- v-tooltip="{
            content: `
                  <div class='v-btn-tooltip '>
                    Configurações
                  </div>
                  `,
            placement: 'bottom-center',
          }" -->
          <i class="material-symbols-rounded v-icon icon-presets"> settings </i>
        </v-btn>

        <v-menu offset-y rounded>
          <template v-slot:activator="{ props }">
            <v-avatar v-bind="props" size="32px" color="primary" class="ml-2">
              <b v-if="userInfo" class="title white--text">
                {{ userInfo.name[0] }}
              </b>
            </v-avatar>

            <!-- v-tooltip="{
                content: `
                      <div class='v-btn-tooltip'>
                        Seu <br>
                        Perfil
                      </div>
                      `,
                placement: 'bottom-center',
              }" -->
          </template>

          <v-list nav dense min-width="250">
            <v-list-item v-if="userInfo">
              Bem vindo(a), <br />
              {{ userInfo.name }}
            </v-list-item>
            <v-divider class="mt-2 mb-1"></v-divider>
            <span>
              <!-- <Dialog
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
              </Dialog> -->
              <v-list-item
                v-for="item in userItems"
                @click="menuActionClick(item)"
                :key="item.label"
              >
                <v-list-item-title>
                  {{ item.label }}
                </v-list-item-title>
              </v-list-item>
            </span>
          </v-list>
        </v-menu>
      </div>
      <!-- End -->
    </div>
  </header>
</template>

<script>
//   import { mapGetters } from 'vuex'
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
    scrollPosition: '',
  }),
  created() {
    window.addEventListener('resize', this.handleResizeWindow);
    window.addEventListener('scroll', this.handleScroll);
  },
  destroyed() {
    window.removeEventListener('resize', this.handleResizeWindow);
  },
  mounted() {
    var userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (!userInfo) {
      this.$router.push('/');
    }
    this.isAdmin = false;
    if (userInfo) {
      this.isAdmin = userInfo.admin;
    }

    this.userInfo = userInfo;
    this.setAlertInterval();
  },
  // computed: mapGetters({
  //   notificationList: 'Notification/formattedNotifications',
  //   notificationRefresh: 'Notification/notificationRefresh',
  //   notificationQuery: 'Notification/notificationQuery',
  //   alertRefresh: 'Alert/alertRefresh',
  // }),
  unmounted() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleConfigBtn() {
      this.$router.push('/configure');
    },
    async menuActionClick(item) {
      switch (item.action) {
        case 'logout':
          await localStorage.setItem('userInfo', null);
          await localStorage.removeItem('remove_opportunity_message');
          await localStorage.removeItem('remove_opportunity_message_deny');
          this.$router.push('/');
          break;
        default:
          this.$router.push(item.path);
      }
    },
    themeSelect(theme) {
      let darkMode = false;
      localStorage.setItem('theme', theme);
      theme === 'dark' ? (darkMode = true) : (darkMode = false);
      this.$vuetify.theme.dark = darkMode;
    },
    setAlertInterval() {
      // const { intervalId, interval } = this.alertRefresh
      // if (!intervalId) {
      //   const intervalId = setInterval(() => {
      //     this.getAlerts()
      //   }, interval)
      //   this.$store.commit('Alert/SET_ALERTS_REFRESH', { intervalId })
      // }
    },
    handleResizeWindow() {
      this.isMobile = window.innerWidth < 890 ? true : false;
    },
    async getAlerts() {
      // await this.$store.dispatch('Alert/fetchList', {
      //   url: '/customer/alert',
      //   reset: true,
      // })
    },
    handleScroll() {
      // TODO: Transform into composable
      this.scrollPosition = window.scrollY;
    },
  },
};
</script>

<style scoped lang="scss">
header {
  padding: 0;
  box-shadow: none !important;
  overflow: visible;
  top: 0px;
  z-index: 1006;
  transform: translateY(0%);
  position: fixed;
  left: 0px;
  width: calc(100% - 0px);
  background-color: rgb(var(--v-theme-shape-lighten1)) !important;
  &.elevation-1 {
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
.user-options {
  .v-btn {
    box-shadow: unset;
  }
  .v-btn .v-btn__overlay {
    background: transparent !important;
  }
  .link--effect:after {
    bottom: -9px !important;
    border: unset;
    border-radius: unset;
  }
}

.v-btn.v-btn--icon:focus,
.v-btn.v-btn--icon:active {
  &::before {
    background-color: unset !important;
  }
  > i {
    color: rgb(var(--v-theme-primary-base)) !important;
  }
}
</style>
