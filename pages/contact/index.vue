<template>
  <div>
    <PageHeadline class="headline" :page-name="showContactName && contactName">
      <ContactDialogImportContactFile @addContact="handleAddContacts" />
      <ContactDialogAddContactForm
        @addContact="handleAddContacts"
        v-if="mediaTypes && mediaTypes.length > 0"
      />
    </PageHeadline>

    <Nuxt-Child
      ref="childComponents"
      @selectContact="handleSelectContact"
      @changeViewMode="handleViewModeChange"
      :contactID="contactID"
      :updateTable="updateTable"
      :viewMode="viewMode"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    myFilter: 0,
    contactName: null,
    contactID: 0,
    viewMode: '',
    updateTable: false,
  }),
  computed: {
    ...mapGetters({
      mediaTypes: 'Global/mediaTypes',
    }),
    selectedFilter() {
      if (this.$route.params.id) return 'Dados do Contato'
      return 'Todos os contatos'
    },
    showContactName() {
      return this.$route.fullPath !== '/contact' ?? false
    },
  },
  async mounted() {
    await this.$store.dispatch('Global/fetchMediaTypes')
    await this.getContactInfoFields()
  },
  methods: {
    handleSelectContact(row) {
      this.contactID = row.id
      this.contactName = row.name
    },
    handleViewModeChange(view) {
      this.viewMode = view
    },
    handleAddContacts() {
      if (this.$route.name === 'contact-index') {
        const query =
          this.$refs.childComponents.$refs.dataContactTableWrapper.finalQuery
        this.$refs.childComponents.$refs.dataContactTableWrapper.getData(query)
      }
    },
    async getContactInfoFields() {
      await this.$store.dispatch('Contact/fetchDepartments')
      await this.$store.dispatch('Contact/fetchPositions')
      await this.$store.dispatch('Contact/fetchNationalities')
    },
  },
}
</script>

<style lang="scss" scoped>
.headline {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .options_button {
    display: flex;
    align-items: center;

    .v-input {
      margin-right: 1rem;
      width: 244px;
    }
  }

  ::v-deep button {
    margin: 0 0.4rem;
    &:last-child {
      margin-right: 0;
    }
  }

  .headline_title {
    display: flex;
    flex-direction: column;

    h6 {
      line-height: 5px;
      font-size: 1rem !important;
      font-weight: 500;
    }
  }

  ::v-deep .v-input {
    margin-right: 1rem;
    .v-input__control {
      .v-input__slot {
        fieldset {
          border: 1px solid #d2d6da;
          background: var(--v-shape-lighten1);
        }

        .v-select__slot .v-select__selections {
          color: var(--v-sub-text-base);
          font-weight: 500 !important;
          font-size: 1rem;
        }

        i {
          color: var(--v-primary-base);
        }
      }
    }
  }
}
</style>
