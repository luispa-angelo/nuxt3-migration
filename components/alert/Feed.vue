<template>
  <div class="alert-wrapper">
    <v-menu offset-y z-index="500" rounded :close-on-content-click="false">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          fab
          tile
          rounded
          icon
          class="mr-2 link--effect"
          v-bind="attrs"
          v-on="on"
          v-tooltip="{
            content: `
              <div class='v-btn-tooltip'>
                    Notificações
              </div>
              `,
            placement: 'bottom-center',
          }"
        >
          <v-badge
            color="primary"
            :content="alertList.length > 9 ? '9+' : alertList.length"
            :value="alertList.length"
            overlap
          >
            <i class="material-symbols-rounded v-icon icon-presets">
              notifications
            </i>
          </v-badge>
        </v-btn>
      </template>
      <v-list
        nav
        dense
        min-width="250"
        max-height="400"
        style="overflow-y: scroll"
      >
        <v-subheader>Notificações</v-subheader>
        <v-divider class="mt-2 mb-1"></v-divider>
        <v-list-item-group v-if="alertList.length">
          <v-list-item v-for="alert in alertList" :key="alert.timestamp">
            <v-list-item-content @click="handleAlert(alert)">
              <v-list-item-title>
                {{ alert.message }}
                <div class="font-body-xsmall alert-timestamp">{{ toDate(alert) }}</div>
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-btn
                @click="deleteAlert(alert.timestamp)"
                icon
                x-small
                absolute
                class="ajust-button"
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-list-item-icon>
          </v-list-item>
        </v-list-item-group>
        <v-list-item-group v-else>
          <v-list-item>
            <v-list-item-content>
              <v-list-item-title class="text-center">
                Nenhuma notificação.
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <AlertLeadsReport
      :leads="alertLeads"
      :open-dialog="leadsDialog"
      @closeDialog="
        () => {
          leadsDialog = false
        }
      "
    />
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    itemId: null,
    taskOpportunityId: null,
    leadsDialog: false,
    alertLeads: [],
    dialog: {
      mail: false,
      call: false,
      chat: false,
      default: false,
    },
  }),
  mounted() {
    this.getAlerts()
  },
  computed: mapGetters({
    alertList: 'Alert/formattedAlerts',
    alertRefresh: 'Alert/alertRefresh',
  }),
  methods: {
    async getAlerts() {
      await this.$store.dispatch('Alert/fetchList', {
        url: '/customer/alert',
        reset: true,
      })
    },
    async deleteAlert(timestamp) {
      await this.updateData(`/customer/alert-read/${timestamp}`, undefined, {
        fireSuccessAlert: false,
      })
      this.getAlerts()
    },
    toDate(alert) {
      let date
      if (alert.timestamp) {
        date = this.$moment(new Date(alert.timestamp)).format('DD/MM/YY [às] HH[h]mm')
      }
      return date
    },
    handleAlert(alert) {
      if (alert.payload.type == 'e-mail') {
        this.itemId = alert.payload.task
        this.dialog.mail = true
        this.deleteAlert(alert.timestamp)
      } else if (alert.payload.type == 'chat') {
        this.itemId = alert.payload.task
        this.dialog.chat = true
        this.deleteAlert(alert.timestamp)
      } else if (alert.payload.type == 'lead import') {
        this.alertLeads = alert.leads
        this.leadsDialog = true
        // this.deleteAlert(alert.timestamp)
      } else if (alert.payload.type == 'report') {
        this.deleteAlert(alert.timestamp)
        this.$router.push({ path: '/analytics/reports' })
      }else if (alert.payload.type == 'csc_request') {
        this.deleteAlert(alert.timestamp)
        this.$router.push({ path: '/request' })
      }
    },
  },
}
</script>

<style scoped lang="scss">
.alert-wrapper {
  ::v-deep .v-badge > .v-badge__wrapper .v-badge__badge {
    inset: auto auto calc(100% - 12px) calc(100% - 4px) !important;
    height: 18px !important;
    min-width: 18px !important;
  }
}
.alert-timestamp {
  color: var(--suggestionsFontColor);
}
</style>
