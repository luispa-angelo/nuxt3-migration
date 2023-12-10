<template>
  <div class="d-flex flex-wrap">
    <PageHeadline page-name="Inbox" />
    <v-card class="w-100 h-100 my-5">
      <v-card-title class="d-flex justify-space-between align-center pa-2 mx-2">
        <div class="d-flex flex-row align-center">
          <InboxReadFilter @readFilter="(value) => { showAllNotifications = value }" />
          <InboxTypeFilter
            @typeFilter="(value) => { selectedTypeFilters = value }"
            @requestFilter="(value) => { selectedRequestFilter = value }"
            @dateFilter="handleDateFilter"
            @contactFilter="(value) => { contactFilter = value }"
          />
        </div>
        <div>
          <v-btn text small :disabled="selectedRows.length == 0" @click="markAsNotRead">
            Marcar como não lido
            <v-icon color="primary" class="ml-1" small>mdi-email</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <v-data-table
          show-select
          hide-default-header
          class="data-table"
          no-data-text="Não há notificações disponíveis"
          item-key="id"
          v-model="selectedRows"
          :loading="isLoading"
          :headers="headers"
          :items="notificationList"
          :item-class="itemRowBackground"
          :footer-props="footerProps"
          @click:row="handleNotification"
          @pagination="handlePagination"
        >
          <template v-slot:[`item.contact`]="{ item }">
            <span v-if="item.contact" :class="itemTextClass(item)">
              {{ item.contact.name }}
            </span>
            <span v-if="item.source">
              {{ item.source.name }}
            </span>
            <v-chip v-if="item.count > 1" small class="align-end">
              {{ item.count > 9 ? '9+' : item.count }}
            </v-chip>
          </template>
          <template v-slot:[`item.description`]="{ item }">
            <span :class="itemTextClass(item)">{{ `${item.previewSubtype} ` }}</span>
            <span :class="itemTextClass(item)">{{ `#${item.entity_id} | ` }}</span>
            <span>{{ item.preview | truncate(50) }}</span>
          </template>
          <template v-slot:[`item.date`]="{ item }">
            <v-chip small class="align-end ml-6">{{ showDate(item.created_at) }}</v-chip>
          </template>
        </v-data-table>
      </v-card-text>
      <InboxCscForm
        task-type="csc"
        :csc-id="itemId"
        :open-dialog="dialog.csc"
        @closeDialog="() => { dialog.csc = false }"
      />
      <TaskModal
        :item-id="itemId"
        :open-dialog="taskDialog"
        @closeDialog="() => { taskDialog = false }"
      />
    </v-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    isLoading: false,
    selectedRows: [],
    itemId: null,
    footerProps: {
      'items-per-page-options': [5, 10, 15]
    },
    dialog: {
      mail: false,
      call: false,
      chat: false,
      csc: false,
      default: false
    },
    taskDialog: false,
    headers:[
      { name: 'contact', value: 'contact' },
      { name: 'description', value: 'description', width: '90%' },
      { name: 'data', value: 'dataInfo' },
      { name: 'date', value: 'date', align: 'center' },
    ],
    showAllNotifications: true,
    selectedTypeFilters: [],
    initialDateFilter: '',
    finalDateFilter: '',
    contactFilter: null,
    notificationList: [],
  }),
  computed: {
    ...mapGetters({
      notifications: 'Notification/notificationList',
      groupByNotifications: 'Notification/groupByNotifications',
      notificationRefresh: 'Notification/notificationRefresh',
      notificationDefaultQuery: 'Notification/notificationDefaultQuery',
      listDetails: 'Notification/listDetails',
    }),
    filterQueries: function () {
      const filters = []
      console.log('teste 3', this.selectedTypeFilters)
      const typeFilters = this.selectedTypeFilters.filter((type) => !type.active).map((type) => type.value)

      if (!this.showAllNotifications) {
        filters.push(`read=${this.showAllNotifications}`)
      }
      if (typeFilters.length > 0) {
        filters.push(`entity_subtype=not_in(${typeFilters.join()})`)
      }
      if (this.initialDateFilter != '' && this.finalDateFilter != '') {
        filters.push(`created_at=between(${this.initialDateFilter},${this.finalDateFilter})`)
      }
      if (this.contactFilter) {
        filters.push(`contact.name=like(${this.contactFilter})`)
      }
      return filters
    },
    remindersTaskId: function () {
      const tasksId = this.groupByNotifications
        .filter((notification) => notification.entity_subtype == 'reminder')
        .map((notification) => notification.entity_id)
      return tasksId.join()
    },
  },
  watch: {
    filterQueries(newValue) {
      if (newValue.length > 0) {
        const queries = newValue.join('&')
        this.$store.commit('Notification/SET_NOTIFICATIONS_QUERY', `${this.notificationDefaultQuery}&${queries}&ne=`)
      } else {
        this.initialQuery = 'order=id_desc&includes=contact'
        this.$store.commit('Notification/SET_NOTIFICATIONS_QUERY', `${this.notificationDefaultQuery}`)
      }
      this.getNotifications()
    },
    notifications(newValue) {
      this.notificationList = this.formatNotifications(newValue)
    }
  },
  mounted() {
    this.notificationList = this.formatNotifications(this.notifications)
  },
  methods: {
    async getNotifications() {
      this.isLoading = true
      this.$store.commit('Notification/SET_LIST_DETAILS', { page: 0 })
      this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', { pagination: false })
      await this.$store.dispatch('Notification/fetchList', { url: '/ecosystem/user-notifications', query: this.notificationDefaultQuery, reset: true })
      this.isLoading = false
    },
    async readNotification(notification, read = true) {
      const {id, count, entity_type, entity_id } = notification
      if (count > 1) {
        await this.updateData('/ecosystem/notification-read-by-entity-and-id', { entity_type, entity_id, read }, { fireSuccessAlert: false })
      } else {
        await this.updateData('/ecosystem/notification-read', { id, read }, { fireSuccessAlert: false })
      }
    },
    async handleNotification(notification) {
      if (notification.entity_type == 'task') {
        this.itemId = notification.entity_id
        this.taskDialog = true
      }else if(notification.entity_type == 'opportunity') {
        this.readNotification(notification)
        this.redirectToOpportunity(notification.entity_id)
      }else if(notification.entity_type == 'csc_request') {
        console.log('csc_request')
        this.readNotification(notification)
        this.itemId = notification.entity_id
        this.dialog.csc = true
      }
      if (!notification.read) {
        await this.readNotification(notification)
        const index = this.notificationList.findIndex((item) => item.id === notification.id)
        this.notificationList[index].read = 1
      }
    },
    itemRowBackground(notification) {
      return notification.read && 'bg-table-row'
    },
    itemTextClass(notification) {
      return !notification.read && 'font-weight-bold'
    },
    formatNotifications(notifications) {
      const notificationList = notifications.map((notification) => {
        if (notification.data) {
          const { company_name = null, invoice_id = null, opportunity_id = null } = JSON.parse(notification.data)
          notification.dataInfo = company_name ? `${this.$options.filters.truncate(company_name)} | ` : ''
          opportunity_id ? notification.dataInfo += `${invoice_id ? `Proposta ${invoice_id}` : `Oportunidade ${opportunity_id}`}` : ''
        } else {
          notification.dataInfo = null
        }
        return notification
      })
      return notificationList.sort((a, b) => b.id - a.id)
    },
    async markAsNotRead() {
      await Promise.all(
        this.selectedRows.map((notification) =>
          notification.read && this.readNotification(notification, false)
        )
      )
      this.getNotifications()
      this.selectedRows = []
    },
    showDate(date) {
      const notificationTime = this.$moment(`${date}Z`)
      const startOfDay = this.$moment().startOf('day').format()
      const isToday = this.$moment(notificationTime).isAfter(startOfDay)
      if (!isToday) {
        return notificationTime.format('ll')
      }
      return notificationTime.format('LT')
    },
    showCounter(notifications) {
      if (notifications.length > 1) {
        return true
      }
      return false
    },
    handleDateFilter(dateInterval) {
      const [initialDate, finalDate] = dateInterval
      if (initialDate === '' && finalDate === '') {
        this.initialDateFilter = initialDate
        this.finalDateFilter = finalDate
      } else if (initialDate !== '' && finalDate === '') {
        this.initialDateFilter = initialDate
        this.finalDateFilter = this.$moment(initialDate).add(100, 'years').format('YYYY-MM-DD')
      } else if (initialDate === '' && finalDate !== '') {
        this.initialDateFilter = this.$moment(finalDate).subtract(100, 'years').format('YYYY-MM-DD')
        this.finalDateFilter = this.$moment(finalDate).add(1, 'days').format('YYYY-MM-DD')
      } else {
        this.initialDateFilter = initialDate
        this.finalDateFilter = this.$moment(finalDate).add(1, 'days').format('YYYY-MM-DD')
      }
    },
    redirectToOpportunity(id) {
      const { query } = this.$route
      this.$router.push({ name: 'business-opportunity-item-id', params: { item: 'inbox', id }, query: { ...query, complement: this.routeComplement } })
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit('Notification/SET_LIST_DETAILS', { page })
          this.$store.commit('Notification/SET_NOTIFICATIONS_REFRESH', { pagination: true })
          const pageQuery = `page=${page}`
          await this.$store.dispatch(
            'Notification/fetchList',
            { url: '/ecosystem/user-notifications', query: `${this.notificationDefaultQuery}&${pageQuery}`, reset: false })
        }
      }
    },
  }
}
</script>

<style scoped lang="scss">
  .data-table {
    cursor: pointer !important;
  }
</style>
