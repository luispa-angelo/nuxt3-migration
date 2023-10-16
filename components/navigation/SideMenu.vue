<template>
  <v-navigation-drawer
    v-model="drawer"
    :mini-variant="!showOnTopNav && mini"
    :width="!showOnTopNav ? 258.34 : '100%'"
    :disable-resize-watcher="showOnTopNav ? true : false"
    :class="showOnTopNav && 'top-nav'"
  >
    <div class="w-100 d-flex justify-end pt-10" v-if="!showOnTopNav">
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
      nav
      open-strategy="single"
      active-class="parent-menu-active"
      v-click-outside="closeOpenMenus"
      v-model:opened="openedMenu"
      class="pb-0 h-100"
      v-if="menuItems.length >= 1"
    >
      <v-list-group
        v-for="item in menuItems"
        :key="item.value ? item.value : item.id"
        v-model="item.value"
        :class="[
          checkActiveRoute(item.path, item.value),
          item.categories ? 'hasMenu' : '',
        ]"
        @click="menuRedirect(item.path)"
      >
        <template v-slot:activator="{ props }">
          <span
            :id="`nav-link-${item.id}`"
            v-bind="props"
            class="d-flex align-center h-100 position-relative"
          >
            <v-list-item class="d-flex align-center">
              <v-badge
                offset-y="-6"
                offset-x="-6"
                dot
                class="mr-2"
                :value="showBadge(item)"
                :color="showBadge(item) ? 'primary' : 'transparent'"
              >
                <i
                  class="material-symbols-rounded v-icon"
                  :style="
                    item.icon == 'approval_delegation'
                      ? 'margin-top: -4px;'
                      : ''
                  "
                >
                  {{ setIcon(item) }}
                </i>
              </v-badge>
              {{ item.name }}
            </v-list-item>
          </span>
        </template>

        <div class="category_menu" v-if="item.categories" ref="category_menu">
          <v-list tile style="padding: 1.25rem 0">
            <v-menu
              v-for="category in item.categories"
              :key="category.id"
              :close-on-content-click="false"
              v-model="category.active"
              content-class="fixedOnTop"
              open-on-hover
              location="end"
              width="250"
              max-height="70vh"
              offset-x
              @update:model-value="handleOpenMenu()"
            >
              <template v-slot:activator="{ props: menu }">
                <v-tooltip
                  bottom
                  :z-index="999"
                  :disabled="category.name.length <= 20 ? true : false"
                >
                  <template v-slot:activator="{ props: tooltip }">
                    <span
                      class="category_item"
                      v-bind="mergeProps(menu, tooltip)"
                    >
                      <v-list-item
                        :id="`nav-link-${category.id}`"
                        :class="
                          category.id == activeBusinessId
                            ? 'active_category'
                            : ''
                        "
                      >
                        {{ category.name }}

                        <i class="material-symbols-rounded v-icon">
                          chevron_right
                        </i>
                      </v-list-item>
                    </span>
                  </template>

                  <span>{{ category.name }}</span>
                </v-tooltip>
              </template>

              <v-list class="submenu_wrapper">
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
                  <span :id="`nav-link-${sub_menu.id} submenu_wrapper`">
                    <v-tooltip
                      bottom
                      :z-index="999"
                      :disabled="sub_menu.name.length <= 20 ? true : false"
                    >
                      <template v-slot:activator="{ props }">
                        <v-list-item-title v-bind="props" id="submenu_title">
                          {{ sub_menu.name }}
                        </v-list-item-title>
                      </template>
                      <span>{{ sub_menu.name }}</span>
                    </v-tooltip>

                    <v-list-item
                      v-for="item in sub_menu.items"
                      :key="item.name"
                      :to="setPath(item, sub_menu)"
                      :active-class="!$vuetify.theme.dark ? '' : 'shape'"
                      @click="closeOpenMenus()"
                      exact
                    >
                      <v-tooltip
                        bottom
                        :z-index="999"
                        :disabled="category.name.length <= 20 ? true : false"
                      >
                        <template v-slot:activator="{ props }">
                          <v-list-item-subtitle v-bind="props">
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
                  </span>
                </v-list-item>
              </v-list>
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
// import { mapGetters } from 'vuex';
import { mergeProps } from 'vue';

import { mapState } from 'pinia';
import { useUserStore } from '../../stores/user';

const router = useRouter();
const path = router.currentRoute.value.path;

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
    admins: [
      ['Management', 'mdi-account-multiple-outline'],
      ['Settings', 'mdi-cog-outline'],
    ],
    cruds: [
      ['Create', 'mdi-plus-outline'],
      ['Read', 'mdi-file-outline'],
      ['Update', 'mdi-update'],
      ['Delete', 'mdi-delete'],
    ],
    menuMaxHeightVar: 0,
    openedMenu: ['home'],
  }),
  computed: {
    ...mapState(useUserStore, {
      userInfo: 'getUserInfo',
    }),
    // ...mapGetters({
    //   hasNewNotification: 'Notification/hasNewNotification',
    //   userBusiness: 'userBusiness',
    // }),
    styles() {
      return `${this.menuMaxHeightVar}px`;
    },
    businessMenu() {
      return this.menuItems.find((item) => item.value === 'business');
    },
    activeBusinessId() {
      if (this.businessMenu.active) {
        return this.findBusinessByCategory();
      }
      return this.findBusinessByCategory();
    },
  },
  mounted() {
    const businessMenu = this.menuItems.find(
      (menu) => menu.name === 'Negócios'
    );
    businessMenu.categories = this.userInfo?.business.map((item) => {
      return {
        id: item.id,
        name: item.name,
        disabled: !item.active,
        items: item.categories,
        active: false,
      };
    });

    this.menuItems = this.menuItems.map((item) => {
      if (path.includes(item.value)) return { ...item, active: false };
      else return item;
    });
  },
  methods: {
    menuRedirect(path) {
      if (path) {
        this.closeOpenMenus();
        router.push(path);
      }
    },
    itemsToShow(items) {
      if (items) {
        return items.filter((item) => item.show == true);
      } else {
        return items;
      }
    },
    setPath(item, category) {
      if (item.type == 'opportunities') {
        return `/business-opportunity/${item.id}?category=${category.id}&pipeline-id=${item.pipeline_id}`;
      } else if (item.type == 'companies') {
        return `/business-companies/${item.id}?category=${category.id}`;
      }
      return '';
    },
    setIcon({ name, icon }) {
      if (icon) {
        return icon;
      } else {
        if (name == 'Parceiros') {
          return 'mdi-account-multiple';
        } else if (name == 'Clientes') {
          return 'mdi-wallet';
        } else {
          return 'mdi-wallet-travel';
        }
      }
    },
    showBadge({ value }) {
      // if (value == 'inbox' && this.hasNewNotification) {
      //   return true;
      // }
      return false;
    },
    closeOpenMenus(e) {
      this.openedMenu = [];
    },
    checkActiveRoute(path, value) {
      const routePath = this.$route.path;

      if (
        (value === 'company' &&
          routePath.includes('/business-companies/bureau')) ||
        (value === 'business' &&
          routePath.includes('/business-') &&
          !routePath.includes('/business-companies/bureau'))
      ) {
        return 'parent-menu-active';
      }

      if (routePath.includes(path)) {
        return 'parent-menu-active';
      }
    },
    async handleOpenMenu() {
      if (this.menuMaxHeightVar < 1) {
        await this.$nextTick();
        this.menuMaxHeightVar = this.$refs.category_menu[0].clientHeight;
      }
    },
    findBusinessByCategory() {
      const categoryId = this.$route.query['category'];
      if (categoryId) {
        const business = this.userInfo.business.find((business) =>
          business.categories.some((category) => category.id == categoryId)
        );
        return business?.id;
      } else {
        return null;
      }
    },
    mergeProps,
  },
};
</script>

<style lang="scss">
.v-navigation-drawer {
  border-right: none !important;

  &.top-nav {
    max-width: calc(100% - 280px);
    width: 100% !important;
    top: 0 !important;
    bottom: 0;
    left: 60px !important;
    overflow: visible;
    height: auto !important;

    background-color: rgb(var(--v-theme-shape-lighten1)) !important;
    border-color: rgb(var(--v-theme-shape-lighten1)) !important;

    .v-list {
      display: flex;

      // Main Menu
      .v-list-group {
        transition: ease-in-out 0.3s;
        cursor: pointer;

        &.v-list-group--open .v-list-group__header {
          @include link-effect(100%, true, 7px);
        }

        i,
        .v-list-item {
          color: rgb(var(--v-theme-sub-text-base));
        }

        .v-list-item {
          &,
          .v-list-item-title {
            font-size: 0.9rem !important;
            line-height: 20px;
            overflow: visible;
            color: rgb(var(--v-theme-sub-text-base));
            font-weight: 500;
          }

          .v-list-item__content {
            display: flex;
            align-items: center;
            overflow: visible;
          }
        }

        .v-list-item__append .v-list-item__spacer {
          display: none;
        }

        &:not(.hasMenu) .v-list-item__append {
          display: none;
        }

        &.hasMenu .v-list-item__append {
          margin-left: 0.6rem;
        }

        .v-list-item-title {
          font-size: 0.9rem !important;
          line-height: 20px;
          overflow: visible;
          color: rgb(var(--v-theme-sub-text-base));
          font-weight: 500;
        }

        // Hover Menu
        &:hover,
        &.v-list-group--open {
          > .v-list-group__header .v-list-item-title,
          > .v-list-group__header i,
          i {
            color: rgb(var(--v-theme-primary-base));
          }
          .v-list-item,
          .v-list-item-title {
            color: rgb(var(--v-theme-primary-base));
          }
        }

        &.parent-menu-active {
          .v-list-item,
          .v-list-item-title {
            color: rgb(var(--v-theme-primary-base)) !important;
          }
        }

        // Active Parent Business Menu
        &.parent-menu-active .v-list-group__header {
          .v-list-item-title,
          .v-list-item__icon i,
          i {
            color: rgb(var(--v-theme-primary-base));
          }

          @include link-effect(100%, true, 7px);
        }

        // Active Parent  Menu
        & .v-list-group__header.parent-menu-active {
          .v-list-item-title,
          .v-list-item__icon {
            color: rgb(var(--v-theme-primary-base)) !important;
          }

          @include link-effect(100%, false, 7px);
        }
      }

      // Category Menu
      .v-list-group__items > .category_menu {
        position: fixed;
        top: 53px;
        background: rgb(var(--v-theme-shape-lighten1));
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

        .v-list {
          .category_item .v-list-item {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 !important;
            font-size: 0.9rem !important;
            font-weight: 500;
            min-height: 40px;
            color: rgb(var(--v-theme-sub-text-base));
          }
          &:first-child {
            margin-top: 10px;
          }
        }

        .v-list-item__content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;

          cursor: pointer;
          padding: 6px 12px;

          // Hover && Active category menu
          &:hover,
          &[aria-expanded='true'],
          &.active_category {
            background-color: rgb(var(--v-theme-primary-lighten5)) !important;
            color: rgb(var(--v-theme-primary-base)) !important;

            .v-list-item-title,
            i {
              color: rgb(var(--v-theme-primary-base)) !important;
              font-weight: 600;
            }
          }

          .v-list-item-title,
          .v-list-item-subtitle,
          i {
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2 !important;
            line-clamp: 2 !important;
            white-space: normal !important;
            -webkit-box-orient: vertical;
            word-break: break-word !important;
            color: rgb(var(--v-theme-sub-text-base)) !important;
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
  background-color: rgb(var(--v-theme-shape-lighten1));

  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12) !important;
  border-radius: unset !important;

  // Thinner Scrollbar
  @include thin-scrollbar;

  .submenu_wrapper {
    background: transparent !important;
    box-shadow: unset !important;
    padding: 0 !important;
    margin: 0 !important;

    .v-list-item {
      width: 100%;

      a:hover,
      a.v-list-item-active {
        background-color: rgb(var(--v-theme-blue-lighten5));
      }
    }

    .v-list-item-title {
      padding-top: 20px;
      font-weight: 700;
      padding-bottom: 10px;
      color: inherit !important;
      opacity: 0.78;
      font-size: 0.9rem !important;
      line-height: 20px;
      margin: 0 12px !important;
    }

    .v-list-item-subtitle {
      font-weight: 500;
      font-size: 0.9rem !important;
      margin-left: 8px;
      padding: 12px;
    }

    .v-list-item-title,
    .v-list-item-subtitle {
      width: 100%;
      display: block;
      overflow: hidden !important;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      white-space: nowrap !important;
      word-break: break-word !important;
      -webkit-box-orient: vertical;
      max-width: 220px;
    }
  }

  .v-list-item {
    min-height: auto;
    padding: 0 !important;
  }
}

.icon-presets {
  font-size: 20px !important;
}
</style>
