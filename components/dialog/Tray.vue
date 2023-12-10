<template>
  <div class="container-tray">
    <transition-group name="fade" tag="div" class="d-flex">
      <v-sheet
        @click="openDialog(item)"
        v-for="item in list"
        :key="item.id"
        elevation="1"
        class="item-tray d-flex justify-space-between align-center"
      >
        <div class="d-flex align-center">
          <i class="v-icon icon-presets material-symbols-rounded mr-1">approval_delegation</i>
          <p class="fix-margin text-center mb-0">
            {{ item.name }} #{{ item.id }}
          </p>
        </div>
        <v-btn @click.stop="removeDialog(item)" fab icon small>
          <v-icon class="material-symbols-rounded">close</v-icon>
        </v-btn>
      </v-sheet>
    </transition-group>
    <InboxCscForm
      :csc-id="itemId"
      :open-dialog="dialog.csc"
      @filter-attendant="redirectWithFilter"
      @closeDialog="() => { dialog.csc = false }"
    />
  </div>
</template>

<script>
export default {
  data: () => ({
    dialog: {
      csc: false
    },
    removingItem: null,
    selected: null,
    itemId: null,
    itemQuantity: 4,
    list: [],
    routes: {
      request: '/request'
    },
  }),
  computed: {
    route() {
      return this.$route.path
    }
  },
  async mounted() {
    this.setupEventListeners()
    await this.createDatabase()
    await this.getDialog()
  },
  methods: {
    setupEventListeners() {
      this.$root.$on('updateTray', () => {
        this.getDialog()
      })
      this.$root.$on('checkQuantity', (item) => {
        this.checkQuantity(item)
      })
      this.$root.$on('removeDialogFromTray', (item) => {
        this.removeDialog(item)
      })
    },
    async createDatabase() {
      try {
        await this.createIDBDatabase(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request)
        await this.getDialog()
      } catch (error) {
        console.error(error)
      }
    },
    async getDialog() {
      try {
        this.list = await this.getAllIDBData(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request)
        this.list.sort((a, b) => {
          const dateA = new Date(a.created_at)
          const dateB = new Date(b.created_at)
          return dateB - dateA
        })
      } catch (error) {
        console.error(error)
      }
    },
    openDialog(item) {
      this.removeFromList(item)
      if(item.dialog === 'request') {
        this.handleRequest(item)
      }
    },
    handleRequest(item) {
      if(this.route === this.routes.request) {
        this.$root.$emit('openDialogTray', item.id)
      }else {
        this.selected = item
        this.itemId = this.selected.id
        this.dialog.csc = true
      }
    },
    async redirectWithFilter(submitter_id) {
      await this.handleMinimize()
      this.$router.push({
        path: this.routes.request,
        query: {
          submitter_id
        }
      })
    },
    async handleMinimize() {
      await this.addIDBData(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request, this.selected, this.itemQuantity)
      await this.getDialog()
      this.dialog.csc = false
    },
    async removeDialog(item) {
      this.removingItem = item
      this.removeFromList(item)
      await this.removeIDBData(this.config_IDB.database, this.config_IDB.version, this.config_IDB.store.request, item.id)
      this.removingItem = null
    },
    removeFromList(item) {
      this.list = this.list.filter((i) => i.id !== item.id)
    },
    async checkQuantity(item) {
      const result = await this.list.find(listItem => listItem.id === item.id)
      if(result && this.list.length == 4) {
        return
      }

      if(this.list.length == 4) {
        const lastItem = this.list[this.list.length - 1]
        this.list = this.list.filter((i) => i.id !== lastItem.id)
      }
    }
  },
}
</script>

<style scoped lang="scss">
  .fade-enter-active,
  .fade-leave-active {
    transition: all 0.3s ease;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
  .container-tray {
    position: fixed;
    right: 60px;
    bottom: 0;
  }
  .item-tray {
    width: 317px;
    height: 48px;
    margin: 0 4px;
    padding: 4px 16px 4px 16px;
    border-radius: 8px 8px 0px 0px;
    border: 1px;
    &:hover {
      cursor: pointer;
      & p {
        color: var(--v-primary-base) !important;
      }
    }
  }
  .fix-margin {
    margin-top: 2px;
  }
</style>