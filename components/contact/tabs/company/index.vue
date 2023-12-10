<template>
  <div class="company_container">
    <v-chip-group v-model="selectedView" mandatory>
      <v-chip
        class="borderless_ship"
        medium
        pill
        active-class="borderless_ship_active"
        color="var(--v-sub-text-base)"
        v-for="option in viewOptions"
        :key="option.text"
        :disabled="pending"
      >
        <i class="material-symbols-rounded v-icon pr-3">
          {{ option.icon }}
        </i>
        {{ option.text }}
      </v-chip>
    </v-chip-group>

    <div class="headline_container">
      <span class="d-flex align-center">
        <v-select
          attach
          class="selected_company_input"
          :items="activeCompaniesList"
          solo
          dense
          item-text="company.name"
          item-value="company_id"
          label="Selecionar empresa"
          no-data-text="Não há empresas disponíveis"
          :disabled="pending"
          v-model="selectedCompany"
        />

        <v-btn
          color="primary"
          text
          @click="handleAddCompany()"
          :disabled="pending"
          class="mb-3"
          v-if="selectedView === 0"
        >
          <i class="material-symbols-rounded v-icon">add</i> Nova empresa
        </v-btn>
      </span>

      <span class="d-flex align-center" v-if="contact">
        <v-btn
          @click="handleDeleteCompany()"
          text
          v-tooltip="{
            content: `
                <div class='v-btn-tooltip'>
                    Excluir empresa
                </div>
              `,
            placement: 'bottom-center',
          }"
          v-if="
            selectedView !== 1 &&
            !pending &&
            contact.companies &&
            contact.companies.length >= 1
          "
        >
          <i class="material-symbols-rounded v-icon">delete</i>
        </v-btn>

        <slot
          name="action-button"
          :onCLick="handleActionButtonClick"
          v-if="
            selectedView !== 1 &&
            (pending || (contact.companies && contact.companies.length >= 1))
          "
        />

        <ContactDialogAddContactMovement
          :selectedCompany="selectedCompany"
          @update="updateContactData"
          v-if="selectedView === 1"
        />
      </span>
    </div>

    <component
      :is="activeComponent"
      :selectedCompany="selectedCompany"
      :addCompany="isAddCompany"
      :pending="pending"
      ref="activeCompanyTab"
      v-if="contact"
    />
  </div>
</template>

<script>
import { baseAlert } from '@/plugins/mixins/alerts'

import { mapGetters } from 'vuex'

// Async import
const CompanyInfo = () => import('./CompanyInfo.vue')
const CompanyMovement = () => import('./CompanyMovement.vue')

export default {
  props: {
    selectedBoxCompany: Number,
    pending: Boolean,
  },
  data: () => ({
    tags: ['Comércio de Bebidas', 'Omie Experience LTDA'],
    viewOptions: [
      { text: 'Informações da empresa', icon: 'business_center' },
      { text: 'Movimentações', icon: 'swap_horiz' },
    ],
    contact_related: [],
    company_medias: [],
    selectedCompany: 0,
    selectedView: 0,
    isAddCompany: false,
    userInfo: '',
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      contactPrimaryCompany: 'Contact/contactPrimaryCompany',
      pendingChanges: 'Global/pendingChanges',
    }),
    activeComponent() {
      if (this.selectedView === 1) return CompanyMovement
      return CompanyInfo
    },
    activeCompaniesList() {
      return this.contact?.companies?.filter((company) => company.active)
    },
  },
  mounted() {
    if (this.selectedBoxCompany > 0)
      this.selectedCompany = this.selectedBoxCompany
    else if (
      this.contactPrimaryCompany?.company_id ||
      (this.activeCompaniesList && this.activeCompaniesList?.length >= 1)
    ) {
      this.selectedCompany = this.contactPrimaryCompany?.company_id
        ? this.contactPrimaryCompany?.company_id
        : this.activeCompaniesList[0]?.company_id
    } else this.selectedCompany = 0

    this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
  },
  watch: {
    selectedBoxCompany() {
      if (this.selectedBoxCompany > 0)
        this.selectedCompany = this.selectedBoxCompany
    },
  },
  methods: {
    handleAddCompany() {
      this.isAddCompany = true
      this.$emit('setPending', true)
    },
    async handleActionButtonClick(pending) {
      if (!pending) {
        if (!this.isAddCompany) await this.updateCompanyContact()
        else await this.createCompanyContact()

        await this.updateContactData()
      }

      this.isAddCompany = false
    },
    async updateContactData() {
      await this.$emit('updateContactData')
    },
    async updateCompanyContact() {
      let company = this.$refs.activeCompanyTab.companyInfo.company
      company.id = this.$refs.activeCompanyTab.activeCompany.id
      company.contact_id = this.contact.id
      company.company_id = this.$refs.activeCompanyTab.activeCompany.company_id

      if (company && company.company_id > 0) {
        const { success } = await this.updateData(
          '/customer/company-contact',
          company
        )

        if (success) {
          await this.$nextTick()
          await this.updateCompanyContactPositions(company.id)
          await this.updateCompanyContactRelations()
          await this.updateCompanyContactMedias(company.id)
        }
      }
    },
    async createCompanyContact() {
      let company = this.$refs.activeCompanyTab.companyInfo.company
      company.contact_id = this.contact.id
      company.company_id = this.$refs.activeCompanyTab.newCompany

      if (company?.company_id > 0) {
        const { success, id } = await this.createItem(
          '/customer/company-contact',
          company
        )

        if (success && id) {
          await this.createCompanyContactPositions(id)
          await this.createCompanyContactMedias(id)
          await this.createCompanyContactRelations()

          if (this.selectedCompany < 1)
            this.selectedCompany = company.company_id
        }
      }
    },
    async updateCompanyContactPositions(id) {
      let position = Object.assign(
        {},
        this.$refs.activeCompanyTab.companyInfo.contactPosition
      )

      position.company_contact_id = id
      position.creator_id = this.userInfo.id
      delete position.updated_at
      delete position.created_at
      delete position.creator

      // Insert
      if (id && position.id < 1) await this.createCompanyContactPositions(id)

      // Update
      if (position.company_contact_id > 0 && position.id > 0) {
        await this.updateData('/customer/contact-position', position, {
          fireSuccessAlert: false,
        })
      }
    },
    async updateCompanyContactRelations() {
      const relations = [
        ...this.$refs.activeCompanyTab.companyInfo.addedLeaderShip,
        ...this.$refs.activeCompanyTab.companyInfo.addedRelations,
      ]
        .filter(
          (relationsItem) =>
            relationsItem.contact_related_id > 0 &&
            relationsItem.id > 0 &&
            relationsItem.contact_id > 0
        )
        .map((r) => {
          delete r.contact
          return r
        })

      // Insert
      await this.createCompanyContactRelations()

      // Update
      if (relations && relations?.length > 0) {
        await this.updateData('/customer/bulk/contact-related', relations, {
          fireSuccessAlert: false,
        })
      }
    },
    async updateCompanyContactMedias(id) {
      let companyMedias = [
        ...this.$refs.activeCompanyTab.companyInfo.addedCompanyEmails,
        ...this.$refs.activeCompanyTab.companyInfo.addCompanyPhones,
      ]

      // Insert
      id && (await this.createCompanyContactMedias(id))

      // Update
      const updatedMedia = companyMedias.filter(
        (media) => media.id >= 1 && media.value !== ''
      )

      if (updatedMedia && updatedMedia.length >= 1) {
        await this.updateData(
          '/customer/bulk/contact-company-media',
          updatedMedia,
          {
            fireSuccessAlert: false,
          }
        )
      }
    },
    async createCompanyContactPositions(id) {
      let position = this.$refs.activeCompanyTab.companyInfo.contactPosition

      position.company_contact_id = id
      position.creator_id = this.userInfo.id
      position.reason = 'inclusion'
      delete position.id

      if (position.company_contact_id > 0) {
        await this.createItem('/customer/contact-position', position, {
          fireSuccessAlert: false,
        })
      }
    },
    async createCompanyContactRelations() {
      const relations = [
        ...this.$refs.activeCompanyTab.companyInfo.addedLeaderShip,
        ...this.$refs.activeCompanyTab.companyInfo.addedRelations,
      ]
        .filter(
          (relationsItem) =>
            relationsItem.id < 1 &&
            relationsItem.contact_id > 0 &&
            relationsItem.contact_related_id > 0 &&
            relationsItem.active
        )
        .map((r) => {
          delete r.id
          delete r.contact

          return r
        })

      if (relations && relations?.length > 0) {
        await this.createItem('/customer/bulk/contact-related', relations, {
          fireSuccessAlert: false,
        })
      }
    },
    async createCompanyContactMedias(id) {
      let companyMedias = [
        ...this.$refs.activeCompanyTab.companyInfo.addedCompanyEmails,
        ...this.$refs.activeCompanyTab.companyInfo.addCompanyPhones,
      ].filter((media) => media.value !== '' && media.active && media.id < 1)

      companyMedias.map((media) => {
        media.company_contact_id = id
        delete media.id
        return media
      })

      if (companyMedias?.length >= 1) {
        await this.createItem(
          '/customer/bulk/contact-company-media',
          companyMedias,
          { fireSuccessAlert: false }
        )
      }
    },
    async handleDeleteCompany() {
      const id = this.$refs.activeCompanyTab.activeCompany.id
      const result = await baseAlert(
        'Excluir informações',
        'Essa ação é irreversível, você tem certeza que deseja excluir informações com esta empresa?',
        'Sim, excluir',
        'não, cancelar',
        'warning',
        'danger',
        'danger'
      )

      if (result && id) {
        const { data } = await this.removeItem('/customer/company-contact', id)
        if (data?.success) {
          await this.updateContactData()
          this.selectedCompany = this.contact.companies[0].company_id
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.company_container {
  ::v-deep .v-chip-group {
    .v-chip {
      &.v-chip--active {
        opacity: 1 !important;
      }

      &.v-chip--disabled {
        opacity: 0.6;
      }

      .v-chip__content {
        z-index: 20;
      }

      &.borderless_ship {
        position: relative;

        border-radius: 8px;
        border-bottom-left-radius: unset;
        border-bottom-right-radius: unset;
        background: unset !important;

        &::before {
          background-color: var(--v-stroke-darken1) !important;
          opacity: 0.1;
          border: 1px solid var(--v-sub-text-base);
        }

        .v-chip__content {
          color: var(--v-sub-text-base) !important;
          padding: 1rem;
        }

        &.borderless_ship_active {
          &::before {
            background-color: #fff !important;
          }
          .v-chip__content {
            color: var(--v-primary-base) !important;
          }
        }
      }
    }
  }
  .headline_container {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    max-height: 60px;

    ::v-deep .selected_company_input {
      max-width: 18vw;
      margin: 1rem 0.4rem 0;

      &.v-input--is-disabled {
        opacity: 0.7;
      }

      .v-input__slot {
        background: var(--v-primary-base) !important;
        border-radius: 16px;
        font-size: 0.75rem;
        min-height: 32px;

        .v-select__selections,
        .v-label,
        .v-select__selection--disabled,
        .v-input__append-inner .v-input__icon i {
          color: #fff !important;
        }
      }
    }
  }
}
</style>
