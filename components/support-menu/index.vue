<template>
  <v-menu
    offset-y
    z-index="500"
    tile
    :close-on-content-click="false"
    :close-on-click="false"
    content-class="support-menu"
    v-model="showMenu"
  >
    <template v-slot:activator="{ props }">
      <v-btn
        fab
        tile
        rounded
        icon
        class="nav-link link--effect pt-2"
        v-bind="props"
        @click="getInitialData()"
      >
        <!-- v-tooltip="{
          content: showMenu ? '' : `<div class='v-btn-tooltip'> Ajuda </div>`,
          placement: 'bottom-center',
        }" -->
        <i class="material-symbols-rounded v-icon icon-presets"> help </i>
      </v-btn>
    </template>

    <v-card width="320" tile v-if="showMenu">
      <div class="card-header">
        <i
          v-if="newsID != 0 || showIdeaPortal"
          @click="handleMenuVisibility()"
          class="icon-presets material-symbols-rounded"
        >
          arrow_back
        </i>

        <v-card-title>
          {{
            newsID < 0
              ? 'Novidades Recentes'
              : newsID !== ''
              ? 'Novidades'
              : showIdeaPortal
              ? 'Portal de Ideias'
              : 'Ajuda'
          }}
        </v-card-title>

        <i
          class="icon-presets material-symbols-rounded"
          @click="handleMenuVisibility(true)"
        >
          close
        </i>
      </div>

      <component
        :is="activeComponent"
        :news="newsList"
        :newsID="newsID"
        @selectedNews="handleSelectNews"
        @showIdeasPortal="handleIdeasPortal"
      >
        <template #help-center>
          <a
            class="nav-link"
            href="https://omie.atlassian.net/servicedesk/customer/portal/6"
            target="_blank"
          >
            <span>Ir para Central de Ajuda </span>
            <i
              class="icon-presets material-symbols-rounded pl-2"
              style="color: var(--v-primary-text-base) !important"
              >open_in_new</i
            >
          </a>
        </template>
      </component>
    </v-card>
  </v-menu>
</template>

<script>
// Async import
const SupportMenuItems = () => import('./SupportMenuItems.vue');
const TaskView = () => import('./TaskView.vue');
const WhatsNewList = () => import('./WhatsNewList.vue');
const IdeasPortal = () => import('./IdeasPortal.vue');

export default {
  data: () => ({
    newsID: '',
    auxNewId: '',
    showMenu: false,
    showIdeaPortal: false,
    newsList: [],
  }),
  computed: {
    activeComponent() {
      if (this.showIdeaPortal) return IdeasPortal;
      else if (this.newsID < 0) return WhatsNewList;
      else if (this.newsID !== '') return TaskView;

      return SupportMenuItems;
    },
  },
  mounted() {
    this.getInitialData();
  },
  methods: {
    handleSelectNews(id) {
      this.auxNewId = this.newsID;
      this.newsID = id;
      this.showIdeaPortal = false;
    },
    handleIdeasPortal() {
      this.showIdeaPortal = !this.showIdeaPortal;
    },
    async handleMenuVisibility(close = false) {
      if (close) this.showMenu = false;

      this.showIdeaPortal = false;
      this.newsID = this.auxNewId < 0 ? -1 : '';
      this.auxNewId = '';
    },
    async getInitialData() {
      if (!this.showMenu) {
        const { data, success } = await getList('/media/list');

        if (success && data) this.newsList = data;
      }
    },
  },
};
</script>

<style lang="scss">
.support-menu {
  top: 53px !important;
  bottom: 0;
  right: 0;
  left: auto !important;

  overflow-y: hidden;
  contain: unset;

  .v-card {
    min-height: 100%;
    height: auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      height: 40px;
      padding: 0.4rem 1rem;

      i {
        cursor: pointer;
        color: var(--v-sub-text-base);

        &:hover {
          color: var(--v-primary-base) !important;
        }
      }

      .v-card__title {
        padding: 0;
        margin: 0 auto;
        font-size: 16px;
        color: var(--v-sub-text-base);
      }
    }

    .v-list {
      height: calc(
        100vh - 104px
      ) !important; // 100vh - (navbar height + card-header height)
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0 12px;

      // Thinner Scrollbar
      @include thin-scrollbar;

      .v-list-subheader {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--v-default-text-base);
        overflow-y: auto;
      }

      .v-list-item {
        margin: 0.8rem 0.1rem;
        padding: 0 8px;

        &::before {
          background: transparent !important;
          transition: ease-in-out 0.2s;
          border-radius: 4px;
          padding: 6px;
        }

        &.v-list-item--active,
        &:focus {
          &::before {
            border: 2px solid var(--v-primary-base);
            opacity: 1;
          }
          i {
            color: var(--v-primary-base);
          }
        }

        &:hover {
          &::before {
            border: 1px solid var(--v-sub-text-base);
            opacity: 0.26;
          }
          i {
            color: var(--v-primary-base);
          }
        }
      }

      .v-list-item__icon {
        width: 40px;
        height: 40px;
        border-radius: 4px;
        margin-right: 8px;
        box-shadow: unset !important;

        i {
          margin: auto;
          box-shadow: unset !important;
        }

        &.primary {
          background-color: var(--v-primary-lighten5) !important;

          i {
            color: var(--v-primary-base);
          }
        }

        &.info {
          background-color: var(--v-info-lighten5) !important;

          i {
            color: var(--v-info-darken1);
          }
        }
      }

      .v-list-item__title {
        font-weight: 600;
        font-size: 14px;
        line-height: 13px;
        color: var(--v-default-text-base);
      }

      .v-list-item__subtitle,
      .date {
        color: var(--v-sub-text-base);
      }

      .v-list-item__subtitle {
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        line-clamp: 3;
        white-space: normal;
        font-size: 12px;
        padding: 0.1rem 0;
      }

      .v-list-item__action {
        align-self: flex-start;
        margin: 0;
      }

      i {
        width: 20px;
        height: 20px;
      }

      hr {
        margin: 1.4rem auto;
        width: 94%;
      }

      .nav-link {
        display: flex;
        justify-content: center;

        padding: 1rem;
        text-decoration: none;
        color: var(--v-primary-base);
        cursor: pointer;

        i {
          color: var(--v-primary-base);
          font-weight: 400;
          padding: 0 1.6rem;
        }
      }
    }
  }
}
</style>
