<template>
  <v-row>
    <v-col class="navigation_wrapper" :class="mini ? 'mini' : ''">
      <span
        @click.stop="mini = !mini"
        class="material-symbols-rounded v-icon theme--light close_icon"
        :style="mini ? 'transform: rotate(180deg)' : ''"
      >
        keyboard_double_arrow_left
      </span>

      <v-navigation-drawer
        :mini-variant.sync="mini"
        width="100%"
        permanent
        v-if="contact && loaded"
      >
        <v-list-item>
          <v-avatar color="primary" size="36" class="mr-3">
            <span class="white--text text-h6">{{ getInitials }}</span>
          </v-avatar>

          <v-list-item-title
            class="name text-capitalize"
            v-text="contact.name"
          />
        </v-list-item>

        <v-divider class="my-2" />

        <v-list class="contact_info_list" dense>
          <!-- Company -->
          <v-list-item>
            <v-list-item-icon>
              <i
                class="material-symbols-rounded v-icon"
                style="color: var(--v-default-base)"
              >
                domain
              </i>
            </v-list-item-icon>

            <v-list-item-content
              v-text="contactPrimaryCompany.company.name"
              v-if="
                contactPrimaryCompany &&
                contactPrimaryCompany.company &&
                contactPrimaryCompany.company.name
              "
            />
          </v-list-item>

          <!-- Position -->
          <v-list-item>
            <v-list-item-icon>
              <i
                class="material-symbols-rounded v-icon"
                style="color: var(--v-default-base)"
              >
                badge
              </i>
            </v-list-item-icon>

            <v-list-item-content
              v-text="
                contactPrimaryCompany.contact_positions[
                  contactPrimaryCompany.contact_positions.length - 1
                ].position
              "
              class="text-capitalize"
              v-if="
                contactPrimaryCompany &&
                contactPrimaryCompany.contact_positions &&
                contactPrimaryCompany.contact_positions.length >= 1
              "
            />
          </v-list-item>

          <!-- Email -->
          <v-list-item>
            <v-list-item-icon v-if="mini">
              <i
                class="material-symbols-rounded v-icon"
                style="color: var(--v-default-base)"
              >
                mail
              </i>
            </v-list-item-icon>

            <v-menu
              content-class="contact_info_list"
              top
              offset-y
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <span class="d-flex align-center w-100">
                  <v-list-item-icon>
                    <i
                      class="material-symbols-rounded v-icon"
                      style="color: var(--v-default-base)"
                    >
                      mail
                    </i>
                  </v-list-item-icon>

                  <v-list-item-content
                    class="list_badge_container"
                    v-if="
                      companyContactEmailList &&
                      companyContactEmailList.length >= 1
                    "
                  >
                    <span class="d-flex align-center">
                      <span class="field_text"
                        >{{ companyContactEmailList[0].value }}
                      </span>

                      <span class="badge_wrapper" v-bind="attrs" v-on="on">
                        <v-badge
                          v-bind="attrs"
                          v-on="on"
                          class="ml-2"
                          style="flex: 0"
                          color="primary"
                          :content="companyContactEmailList.length - 1"
                          :value="companyContactEmailList.length - 1"
                          inline
                          v-if="companyContactEmailList.length >= 2"
                        />
                      </span>
                    </span>
                  </v-list-item-content>
                </span>
              </template>

              <v-list
                style="display: flex; flex-direction: column"
                v-if="
                  companyContactEmailList && companyContactEmailList.length >= 2
                "
              >
                <span> E-mail </span>

                <v-divider class="mt-1" />
                <div class="list_wrapper">
                  <v-list-item
                    v-for="email in companyContactEmailList.slice(
                      1,
                      companyContactEmailList.length
                    )"
                    :key="email.id"
                  >
                    <v-list-item-subtitle v-text="email.value" />
                  </v-list-item>
                </div>
              </v-list>
            </v-menu>
          </v-list-item>

          <!-- Phone -->
          <v-list-item>
            <v-list-item-icon v-if="mini">
              <i
                class="material-symbols-rounded v-icon"
                style="color: var(--v-default-base)"
              >
                phone_enabled
              </i>
            </v-list-item-icon>

            <v-menu
              content-class="contact_info_list"
              top
              offset-y
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <span class="d-flex align-center w-100">
                  <v-list-item-icon>
                    <i
                      class="material-symbols-rounded v-icon"
                      style="color: var(--v-default-base)"
                    >
                      phone_enabled
                    </i>
                  </v-list-item-icon>

                  <v-list-item-content
                    class="list_badge_container"
                    v-if="
                      companyContactPhoneList &&
                      companyContactPhoneList.length >= 1
                    "
                  >
                    <span class="d-flex align-center">
                      <span class="field_text">
                        {{ companyContactPhoneList[0].value }}
                      </span>

                      <span class="badge_wrapper" v-bind="attrs" v-on="on">
                        <v-badge
                          v-bind="attrs"
                          v-on="on"
                          class="ml-2"
                          style="flex: 0"
                          color="primary"
                          :content="companyContactPhoneList.length - 1"
                          :value="companyContactPhoneList.length - 1"
                          inline
                          v-if="companyContactPhoneList.length >= 2"
                        />
                      </span>
                    </span>
                  </v-list-item-content>
                </span>
              </template>

              <v-list
                style="display: flex; flex-direction: column"
                v-if="
                  companyContactPhoneList && companyContactPhoneList.length >= 2
                "
              >
                <span> Telefone </span>

                <v-divider class="mt-1" />
                <div class="list_wrapper">
                  <v-list-item
                    v-for="phone in companyContactPhoneList.slice(
                      1,
                      companyContactPhoneList.length
                    )"
                    :key="phone.id"
                  >
                    <v-list-item-subtitle v-text="phone.value" />
                  </v-list-item>
                </div>
              </v-list>
            </v-menu>
          </v-list-item>

          <v-divider class="my-2" />

          <!-- Related Companies -->
          <v-list-item>
            <v-list-item-icon v-if="mini">
              <i
                class="material-symbols-rounded v-icon"
                style="color: var(--v-default-base)"
              >
                domain
              </i>
            </v-list-item-icon>

            <v-menu
              content-class="contact_info_list"
              top
              offset-y
              open-on-hover
            >
              <template v-slot:activator="{ on, attrs }">
                <span class="d-flex align-center w-100">
                  <v-list-item-icon>
                    <i
                      class="material-symbols-rounded v-icon"
                      style="color: var(--v-default-base)"
                    >
                      domain
                    </i>
                  </v-list-item-icon>

                  <v-list-item-content
                    class="list_badge_container"
                    v-if="relatedCompanies"
                  >
                    <span class="d-flex align-center">
                      <span class="field_text"> Empresas Relacionadas </span>

                      <span class="badge_wrapper" v-bind="attrs" v-on="on">
                        <v-badge
                          v-bind="attrs"
                          v-on="on"
                          class="ml-2"
                          style="flex: 0"
                          color="primary"
                          :content="relatedCompanies.length"
                          :value="relatedCompanies.length"
                          inline
                        />
                      </span>
                    </span>
                  </v-list-item-content>
                </span>
              </template>

              <v-list
                style="display: flex; flex-direction: column"
                v-if="relatedCompanies && relatedCompanies.length >= 1"
              >
                <span> Empresas: </span>

                <v-divider class="mt-1" />
                <div class="list_wrapper">
                  <v-list-item
                    v-for="item in relatedCompanies"
                    :key="item.id"
                    @click="handleSelectedBoxCompany(item.company)"
                  >
                    <v-list-item-subtitle v-text="item.company.name" />
                  </v-list-item>
                </div>
              </v-list>
            </v-menu>
          </v-list-item>

          <v-divider class="mt-1" />
        </v-list>
      </v-navigation-drawer>
    </v-col>

    <v-col class="contact_tab_wrapper ml-4">
      <v-tabs
        v-model="activeTab"
        color="primary"
        active-class="active_menu"
        background-color="white"
      >
        <v-tab
          v-for="menu in contactTabs"
          :key="menu.id"
          :disabled="pending || !loaded"
          @click="showContactHistory = false"
        >
          {{ menu.text }}
        </v-tab>
      </v-tabs>

      <v-icon
        class="material-symbols-rounded tab-icon"
        color="primary"
        @click="handleContactHistory()"
        :disabled="pending"
      >
        update
      </v-icon>

      <v-tabs-items v-model="activeTab" v-if="!showContactHistory">
        <component
          :is="activeComponent"
          :viewMode="viewMode"
          :pending="pending"
          :selectedBoxCompany="selectedCompany"
          @updateContactData="getContactInfo(false, true)"
          @setPending="handlePendingChanges"
          v-if="contact && mediaTypes && mediaTypes.length > 0"
        >
          <template v-slot:action-button="{ onCLick }">
            <div class="option_buttons" v-if="loaded">
              <v-btn
                style="min-width: 100px"
                color="secondary"
                class="mr-4"
                @click="handleEditMode()"
                v-if="pending"
              >
                Cancelar
              </v-btn>

              <v-btn
                style="min-width: 100px"
                color="primary"
                @click="handleEditMode(), onCLick(pending)"
              >
                {{ pending ? 'Salvar' : 'Editar' }}
              </v-btn>
            </div>
          </template>
        </component>
      </v-tabs-items>

      <ContactHistory v-if="showContactHistory" />
    </v-col>

    <!-- Loading -->
    <Loading :isLoading="!loaded" />
  </v-row>
</template>

<script>
// Async import
const ContactDetails = () =>
  import('@/components/contact/tabs/ContactDetails.vue')
const Company = () => import('@/components/contact/tabs/company/index.vue')
const ManageContact = () =>
  import('@/components/contact/tabs/manageContact/index')

import { mapGetters } from 'vuex'

import { baseAlert } from '@/plugins/mixins/alerts'

export default {
  props: {
    contactID: Number,
    viewMode: String,
  },
  data: () => ({
    loaded: false,
    mini: false,
    activeTab: 0,
    showContactHistory: false,
    contactInfo: [
      { id: 1, icon: 'badge', text: '-' },
      { id: 2, icon: 'mail', text: '-' },
      { id: 3, icon: 'phone', text: '-', count: 0 },
      {
        id: 4,
        icon: 'domain',
        text: 'Empresas Relacionadas',
        count: 0,
        action: true,
        margin: 'my-5',
      },
      { id: 5, icon: 'thumb_up', text: 'Social' },
    ],
    selectedCompany: 0,
    pending: false,
    nameRegex: new RegExp(/(\p{L}{1})\p{L}+/, 'gu'),
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      contactPrimaryCompany: 'Contact/contactPrimaryCompany',
      pendingChanges: 'Global/pendingChanges',
      mediaTypes: 'Global/mediaTypes',
    }),
    contactTabs() {
      return [
        { id: 0, text: 'Dados do Contato' },
        {
          id: 1,
          text: `Empresas (${
            this.relatedCompanies?.length >= 1
              ? this.relatedCompanies?.length <= 9
                ? '0' + this.relatedCompanies?.length
                : this.relatedCompanies?.length
              : 0
          })`,
        },
        { id: 2, text: 'Gerenciar Contato' },
      ]
    },
    activeComponent() {
      if (this.activeTab === 1) return Company
      else if (this.activeTab === 2) return ManageContact

      return ContactDetails
    },
    getInitials() {
      if (this.contact.name) {
        let initials = [...this.contact.name.matchAll(this.nameRegex)] || []
        return (initials = (
          (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
        ).toUpperCase())
      }
      return ''
    },
    relatedCompanies() {
      return this.contact?.companies?.filter((company) => company.active)
    },
    companyContactEmailList() {
      return this.contactPrimaryCompany?.contact_medias?.filter(
        (media) => media?.media_type?.base === 'mail' && media?.active
      )
    },
    companyContactPhoneList() {
      return this.contactPrimaryCompany?.contact_medias?.filter(
        (media) => media?.media_type?.base === 'mobile' && media?.active
      )
    },
  },
  async mounted() {
    this.handleTabMode()
    await this.getContactInfo(true)
  },
  methods: {
    handleEditMode() {
      if (this.pendingChanges)
        this.$store.dispatch('Global/setPendingChanges', false)

      this.pending = !this.pending
    },
    handlePendingChanges(haveChange) {
      this.pending = haveChange
    },
    handleContactHistory() {
      this.showContactHistory = !this.showContactHistory
    },
    handleTabMode() {
      if (this.viewMode === 'delete') this.activeTab = 2
    },
    async handleSelectedBoxCompany(company) {
      if (this.pending) {
        const result = await baseAlert(
          'Salvamento não realizado',
          'O trabalho feito até aqui não foi salvo, volte e salve a edição ou clique em sair.',
          'Sair sem salvar',
          'Voltar para edição',
          'warning',
          'warning'
        )

        if (result) this.pending = false
        else return
      }

      this.selectedCompany = company?.id
      this.activeTab = 1
    },
    async getContactInfo() {
      this.loaded = false

      const { id } = this.$route.params
      await this.$store.dispatch(
        'Contact/fetchContact',
        `also=companies.company,medias.media_type,companies.contact_positions.creator,companies.contact_medias.media_type,contact_related.contact.companies.contact_positions,addresses&id=${id}`
      )

      // Emit contact name for breadcrumb
      this.$emit('selectContact', {
        id: this.contact.id,
        name: this.contact.name,
      })

      this.loaded = true
    },
  },
}
</script>

<style lang="scss">
.contact_info_list {
  .field_text {
    max-width: 12vw !important;
    word-break: break-word !important;
  }

  .list_badge_container {
    .badge_wrapper {
      position: absolute;
      right: 6px;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }

  .v-badge {
    cursor: pointer;
  }

  .v-list {
    .list_wrapper {
      height: auto;
      width: 100%;
      max-height: 26vh;
      overflow-y: auto;

      // Thinner Scrollbar
      @include thin-scrollbar;
    }

    .v-list-item {
      cursor: pointer;

      &:hover {
        background: var(--v-primary-lighten5) !important;

        .v-list-item__subtitle {
          color: var(--v-default-text-base) !important;
          font-weight: 600;
        }
      }
    }

    span,
    .v-list-item__subtitle {
      color: var(--v-sub-text-base) !important;
      font-size: 1rem;
      font-weight: 500;
    }

    span {
      padding: 0.4rem 16px;
    }
  }
}
</style>

<style lang="scss" scoped>
.navigation_wrapper,
.contact_tab_wrapper {
  height: auto;
  max-height: 72vh;

  position: relative;
  background: var(--v-shape-lighten1);
  color: var(--v-default-text-base);

  border-radius: 8px;
  box-shadow: 0px 2px 1px -1px rgba(0, 0, 0, 0.2),
    0px 4px 16px rgba(0, 0, 0, 0.08), 0px 0px 0px 0px rgba(0, 0, 0, 0);

  overflow: hidden;
}

// Left Sidebar
.navigation_wrapper {
  max-width: 0 0 20%;
  flex: 0 0 20%;
  transition: ease 0.3s;

  &.mini {
    max-width: 0 0 6%;
    flex: 0 0 6%;
  }

  .close_icon {
    cursor: pointer;
    font-size: 22px;
    width: 10px;
    display: block;
    margin-left: auto;
    padding-right: 1.4rem;
  }

  ::v-deep .v-navigation-drawer {
    .v-navigation-drawer__content {
      overflow: hidden !important;
    }
    .v-navigation-drawer__border {
      display: none;
    }

    .v-list-item {
      padding: 0 !important;
    }

    .v-list-item__content {
      font-size: 1rem;
    }

    .action_icon {
      position: absolute;
      right: 0;
      top: 8px;
      color: var(--v-default-text-base);
      opacity: 0.9;
      cursor: pointer;
    }

    .v-list-item__icon {
      margin-right: 10px !important;
      i {
        color: var(--v-default-text-base) !important;
        opacity: 0.9;
      }
    }

    .name {
      color: var(--v-default-text-base);
      font-weight: 600;
      font-size: 1rem !important;
      display: block;
      text-align: left;
      white-space: normal;
      word-break: break-word;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .avatar {
      display: flex;
    }
  }
}

// Main Content
.contact_tab_wrapper {
  position: relative;

  .tab-icon {
    position: absolute;
    right: 1rem;
    top: 20px;
    transform: scaleX(-1);
  }

  ::v-deep .v-tabs {
    &.full-disabled {
      .v-tabs-slider-wrapper {
        width: 0 !important;
      }
      .v-tab {
        color: var(--v-sub-text-base) !important;
        opacity: 0.4 !important;
        &::before {
          background: transparent !important;
        }
      }
    }

    .v-tab {
      letter-spacing: initial !important;
      font-size: 1rem !important;
      text-transform: initial !important;
      font-weight: 500;
    }

    .v-tab--active {
      color: var(--v-primary-base);
    }

    .v-item-group .active_menu {
      font-weight: 600;
      opacity: 1;
    }

    .v-slide-group__wrapper::after {
      content: '';
      width: 100%;
      height: 2px;
      border-bottom: 2px solid var(--v-default-text-base) !important;
      position: absolute;
      bottom: 0;
      opacity: 0.3;
    }
  }

  .v-item-group {
    position: relative;

    .option_buttons {
      position: relative;
      width: 100%;
      background: var(--v-shape-lighten1);
      padding: 0.4rem 1rem;
      z-index: 1;

      display: flex;
      justify-content: flex-end;
    }

    ::v-deep .v-window__container .contact_info_wrapper {
      overflow-y: auto;
      padding: 0.4rem 0 1rem;
      margin: 0 !important;

      @include thin-scrollbar;

      .info_title {
        margin: 0.4rem 0;
        font-size: 1rem !important;
      }

      .list_item {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        text-align: left;

        &.truncate span {
          font-weight: 400 !important;
        }

        a {
          text-decoration: none;
          font-weight: 600;
        }
      }

      .list_item span {
        padding: 0.2rem 0;

        &.empty {
          color: var(--v-sub-text-base);
          font-weight: 400 !important;
        }

        &:first-child {
          min-width: 9vw;
        }

        &.truncate span,
        &:last-child {
          overflow: hidden;
          max-width: 20vw;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          word-wrap: break-word;
        }

        &:last-child {
          width: 100%;
          font-weight: 600;
          text-align: left;
        }

        a {
          text-decoration: none;
          color: var(--v-primary-base);

          &.empty {
            color: var(--v-default-text-base);
          }
        }
      }

      .col {
        padding: 8px 12px;

        .v-input {
          &:hover {
            fieldset {
              border: 1px solid var(--v-stroke-darken1) !important;
            }
          }

          fieldset {
            border: 1px solid var(--v-stroke-base);
          }

          input {
            color: var(--v-default-text-base) !important;
          }

          .v-label {
            font-size: 0.9rem !important;
          }
        }

        .action_link {
          color: var(--v-primary-base);
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .action_button_wrapper {
          display: flex;
          align-items: center;

          i,
          &.material-symbols-rounded {
            color: var(--v-sub-text-base);
            cursor: pointer;
            padding-left: 0.4rem;
          }
        }
      }
    }
  }
}
</style>
