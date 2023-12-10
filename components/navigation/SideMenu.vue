<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    permanent
    :mini-variant="!showOnTopNav && mini"
    color="shape lighten-1"
    :width="!showOnTopNav ? 258.34 : '100%'"
    :disable-resize-watcher="showOnTopNav ? true : false"
    height="100%"
    :class="showOnTopNav && 'top-nav'"
    style="z-index: 15; box-shadow: unset"
  >
    <div class="w-100 d-flex justify-end pt-10 px-1" v-if="!showOnTopNav">
      <v-btn
        id="btn-open-side-menu"
        x-small
        icon
        @click="mini = !mini"
        class="mt-8"
      >
        <v-icon
          >{{ mini ? 'mdi-chevron-double-right' : 'mdi-chevron-double-left' }}
        </v-icon>
      </v-btn>
    </div>

    <v-list
      style="height: 100%"
      tile
      nav
      dense
      v-click-outside="closeOpenMenus"
    >
      <v-list-group
        v-for="item in menuItems"
        :key="item.value ? item.value : item.id"
        no-action
        v-model="item.active"
        :active-class="
          !$vuetify.theme.dark
            ? 'stroke lighten-5 stroke--text text--darken-3 parent-menu-active'
            : 'shape parent-menu-active'
        "
        :append-icon="item.categories ? '$expand' : null"
        :disabled="item.disabled"
        :class="checkActiveRoute(item.path, item.value)"
        @click="menuRedirect(item.path)"
      >
        <template v-slot:activator>
          <v-list-item-content :id="`nav-link-${item.id}`">
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </template>

        <template v-slot:prependIcon>
          <v-badge dot :value="showBadge(item)">
            <i
              class="material-symbols-rounded v-icon theme--light"
              :style="
                item.icon == 'approval_delegation' ? 'margin-top: -4px;' : ''
              "
            >
              {{ setIcon(item) }}
            </i>
          </v-badge>
        </template>

        <template v-slot:appendIcon v-if="item.categories">
          <i
            class="material-symbols-rounded material-symbols-rounded-light v-icon theme--light"
          >
            expand_more
          </i>
        </template>

        <div class="category_menu" v-if="item.categories" ref="category_menu">
          <v-list tile style="padding: 1.25rem 0">
            <v-menu
              v-for="category in item.categories"
              :key="category.id"
              v-model="category.active"
              :close-on-content-click="false"
              content-class="fixedOnTop"
              open-on-hover
              :nudge-width="250"
              max-width="250"
              max-height="70vh"
              offset-x
              tile
              @input="handleOpenMenu()"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-list-item-content
                  v-bind="attrs"
                  v-on="on"
                  :id="`nav-link-${category.id}`"
                  style="width: 100%"
                  :class="
                    category.id == activeBusinessId ? 'active_category' : ''
                  "
                >
                  <v-tooltip
                    bottom
                    :z-index="999"
                    :disabled="category.name.length <= 20 ? true : false"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        v-bind="attrs"
                        v-on="on"
                        style="display: flex; justify-content: space-between"
                      >
                        <v-list-item-title>{{ category.name }}</v-list-item-title>
                        <i
                          class="material-symbols-rounded material-symbols-rounded-light v-icon theme--light"
                        >
                          chevron_right
                        </i>
                      </span>
                    </template>

                    <span>{{ category.name }}</span>
                  </v-tooltip>
                </v-list-item-content>
              </template>

              <template v-if="!category.items" v-slot:prependIcon>
                <i class="material-symbols-rounded v-icon icon-presets">
                  {{ category.icon }}
                </i>
              </template>

              <v-list-item
                v-for="(sub_menu, category_index) in category.items"
                :key="sub_menu.id"
                :class="
                  category.id == $route.query.category
                    ? 'v-list-group--active'
                    : ''
                "
                id="submenu_wrapper"
              >
                <v-list-item-content
                  :id="`nav-link-${sub_menu.id} submenu_wrapper`"
                >
                  <v-tooltip
                    bottom
                    :z-index="999"
                    :disabled="sub_menu.name.length <= 20 ? true : false"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-list-item-title
                        v-bind="attrs"
                        v-on="on"
                        id="submenu_title"
                      >
                        {{ sub_menu.name }}
                      </v-list-item-title>
                    </template>
                    <span>{{ sub_menu.name }}</span>
                  </v-tooltip>

                  <v-list-item
                    v-for="item in sub_menu.items"
                    exact
                    :key="item.name"
                    :to="setPath(item, sub_menu)"
                    :active-class="!$vuetify.theme.dark ? '' : 'shape'"
                    @click="closeOpenMenus()"
                  >
                    <v-tooltip
                      bottom
                      :z-index="999"
                      :disabled="category.name.length <= 20 ? true : false"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-list-item-subtitle
                          v-bind="attrs"
                          v-on="on"
                        >
                        {{ item.name }}
                      </v-list-item-subtitle>
                      </template>
                      <span>{{ item.name }}</span>
                    </v-tooltip>
                  </v-list-item>

                  <v-divider
                    class="mt-5"
                    v-if="
                      category_index >= 0 &&
                      category_index < category.items.length - 1
                    "
                  />
                </v-list-item-content>
              </v-list-item>
            </v-menu>
          </v-list>
        </div>
      </v-list-group>
    </v-list>

    <!-- eslint-disable-next-line vue/require-component-is -->
    <component is="style" scoped>
      :root { --minHeight: {{ styles }}; }
    </component>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    showOnTopNav: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    drawer: true,
    mini: true,
    menuItems: [
      {
        id: 1,
        icon: 'home',
        name: 'Home',
        value: 'home',
        path: '/home',
        show: true,
        disabled: false,
      },
      {
        id: 2,
        icon: 'group',
        name: 'Contatos',
        value: 'businness',
        path: '/contact',
        show: true,
        disabled: false,
      },
      {
        id: 3,
        icon: 'domain',
        name: 'Empresas',
        value: 'company',
        path: '/company/repository',
        show: true,
        disabled: false,
      },
      {
        id: 4,
        icon: 'business_center',
        name: 'Negócios',
        value: 'business',
        show: true,
        disabled: false,
        categories: [],
      },
      {
        id: 5,
        icon: 'calendar_month',
        name: 'Tarefas',
        value: 'task',
        path: '/task',
        show: true,
        disabled: false,
      },
      {
        id: 6,
        icon: 'analytics',
        name: 'Analytics',
        value: 'analytics',
        path: '/analytics',
        show: true,
        disabled: false,
      },
      {
        id: 8,
        icon: 'chat',
        name: 'Inbox',
        value: 'inbox',
        path: '/inbox',
        show: true,
        disabled: false,
      },
      {
        id: 9,
        icon: 'approval_delegation',
        name: 'Solicitações',
        value: 'request',
        path: '/request',
        show: true,
      },
    ],
    menuMaxHeightVar: 0,
  }),
  computed: {
    ...mapGetters({
      hasNewNotification: 'Notification/hasNewNotification',
      userBusiness: 'userBusiness',
    }),
    styles() {
      return `${this.menuMaxHeightVar}px`
    },
    businessMenu() {
      return this.menuItems.find((item) => item.value === 'business')
    },
    activeBusinessId() {
      if (this.businessMenu.active) {
        return this.findBusinessByCategory()
      }
      return this.findBusinessByCategory()
    },
  },
  mounted() {
    const businessMenu = this.menuItems.find((menu) => menu.name === 'Negócios')
    businessMenu.categories = this.userBusiness.map((item) => {
      return {
        id: item.id,
        name: item.name,
        disabled: !item.active,
        items: item.categories,
        active: false,
      }
    })

    businessMenu.categories.forEach((category) => {
      category.items.sort((a, b) => a.index - b.index)
      category.items.forEach((item) => {
        item.items.sort((a, b) => a.index - b.index)
      })
    })

    const path = this.$router.history.current.path
    this.menuItems = this.menuItems.map((item) => {
      if (path.includes(item.value)) return { ...item, active: false }
      else return item
    })
  },
  methods: {
    menuRedirect(path) {
      if (path) {
        this.closeOpenMenus()
        this.$router.push(path)
      }
    },
    itemsToShow(items) {
      if (items) {
        return items.filter((item) => item.show == true)
      } else {
        return items
      }
    },
    setPath(item, category) {
      if (item.type == 'opportunities') {
        return `/business-opportunity/${item.id}?category=${category.id}&pipeline-id=${item.pipeline_id}`
      } else if (item.type == 'companies') {
        return `/business-companies/${item.id}?category=${category.id}`
      }
      return ''
    },
    setIcon({ name, icon }) {
      if (icon) {
        return icon
      } else {
        if (name == 'Parceiros') {
          return 'mdi-account-multiple'
        } else if (name == 'Clientes') {
          return 'mdi-wallet'
        } else {
          return 'mdi-wallet-travel'
        }
      }
    },
    showBadge({ value }) {
      if (value == 'inbox' && this.hasNewNotification) {
        return true
      }
      return false
    },
    closeOpenMenus(e) {
      if (
        e?.target?.id?.includes('submenu') ||
        e?.target?.className?.includes('fixedOnTop')
      )
        return ''

      return this.menuItems.some((menu) => {
        if (menu.active) menu.active = false
      })
    },
    checkActiveRoute(path, value) {
      const routePath = this.$route.path

      if (
        (value === 'company' && routePath.includes('/business-companies/bureau')) ||
        (value === 'business' && routePath.includes('/business-') && !routePath.includes('/business-companies/bureau'))
      ) {
        return 'parent-menu-active'
      }

      if (routePath.includes(path)) {
        return 'parent-menu-active'
      }
    },
    async handleOpenMenu() {
      await this.$nextTick()
      this.menuMaxHeightVar = this.$refs.category_menu[0].clientHeight
    },
    findBusinessByCategory() {
      const categoryId = this.$route.query['category']
      if (categoryId) {
        const business = this.userBusiness.find((business) =>
          business.categories.some((category) => category.id == categoryId)
        )
        return business?.id
      } else {
        return null
      }
    },
  },
}
</script>

<style lang="scss">
.v-navigation-drawer {
  border-right: none !important;

  &.top-nav {
    height: 100%;
    max-width: calc(100% - 280px);
    width: 100% !important;
    top: 0;
    bottom: 0;
    left: 60px;
    overflow: visible;

    .v-navigation-drawer__border {
      display: none;
    }

    .v-list {
      display: flex;

      // Main Menu
      .v-list-group {
        transition: ease-in-out 0.3s;

        .v-list-item::before {
          border-radius: unset;
        }

        .v-list-item__title {
          font-size: 0.9rem !important;
          line-height: 20px;
          overflow: visible;
          color: var(--v-sub-text-base);
          font-weight: 500;
        }

        .v-list-item__icon {
          color: var(--v-sub-text-base);

          i {
            color: var(--v-sub-text-base);
          }

          &:first-child {
            margin-right: 8px !important;
          }

          &.v-list-group__header__append-icon {
            min-width: 28px !important;
            margin-left: 0 !important;
          }
        }

        // Hover Menu
        &:hover {
          > .v-list-group__header .v-list-item__title,
          > .v-list-group__header i,
          i {
            color: var(--v-primary-base);
          }
        }

        // Active Parent Business Menu
        &.parent-menu-active .v-list-group__header {
          .v-list-item__title,
          .v-list-item__icon i,
          i {
            color: var(--v-primary-base);
          }

          @include link-effect(100%, true, 7px);
        }

        // Active Parent  Menu
        & .v-list-group__header.parent-menu-active {
          .v-list-item__title,
          .v-list-item__icon {
            color: var(--v-primary-base) !important;
          }

          @include link-effect(100%, false, 7px);
        }
      }

      // Category Menu
      .v-list-group__items > .category_menu {
        position: fixed;
        top: 53px;
        background: var(--v-shape-lighten1);
        max-height: 70vh !important;
        width: 200px;
        max-width: 200px;
        overflow-y: auto;
        overflow-x: hidden;
        height: auto !important;
        box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
          0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        border-radius: unset;

        direction: rtl;

        // Thinner Scrollbar
        @include thin-scrollbar;

        .v-list-item__content {
          display: flex;
          align-items: center;
          justify-content: space-between;

          cursor: pointer;
          padding: 6px 12px;

          &:first-child {
            margin-top: 10px;
          }

          // Hover && Active category menu
          &:hover,
          &[aria-expanded='true'],
          &.active_category {
            background-color: var(--v-primary-lighten5) !important;
            color: var(--v-primary-base) !important;

            .v-list-item__title,
            i {
              color: var(--v-primary-base) !important;
              font-weight: 600;
            }
          }

          .v-list-item__title,
          .v-list-item__subtitle,
          i {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2 !important;
            line-clamp: 2 !important;
            white-space: normal !important;
            -webkit-box-orient: vertical;
            word-break: break-word !important;
            color: var(--v-sub-text-base) !important;
            max-width: 110px;
          }
        }

        & > .v-list {
          display: flex;
          flex-direction: column;
          direction: ltr;
          padding: 0 !important;
        }
      }
    }
  }
}

// Sidemenu
.fixedOnTop {
  top: 53px !important;
  min-height: var(--minHeight);
  overflow-y: auto;
  background-color: var(--v-shape-lighten1);

  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12) !important;

  // Thinner Scrollbar
  @include thin-scrollbar;

  .v-list-item {
    min-height: auto;
    padding: 10px 0;

    .v-list-item__content {
      width: 100%;
      padding-bottom: 0;

      overflow: visible !important;

      & > .v-list-item:hover {
        background-color: #ecf0ff !important;
      }

      .v-list-item__title {
        font-weight: 700;
        padding-bottom: 10px;
        color: inherit !important;
        opacity: 0.78;
        margin: 0 12px;
        font-size: 0.9rem !important;
        line-height: 20px;
      }

      .v-list-item__subtitle {
        font-weight: 500;
        font-size: 0.9rem !important;
        margin: 0 12px;
        padding-left: 8px;
        color: var(--v-sub-text-base) !important;
      }

      .v-list-item__title,
      .v-list-item__subtitle {
        overflow: hidden !important;
        text-overflow: ellipsis;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        line-clamp: 2;
        white-space: nowrap !important;
        word-break: break-word !important;
        -webkit-box-orient: vertical;
        max-width: 200px;
      }
    }
  }
}

.icon-presets {
  font-size: 20px !important;
}
</style>
