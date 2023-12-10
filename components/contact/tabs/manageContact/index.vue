<template>
  <div class="company_container">
    <!-- <v-chip-group v-model="selectedView" mandatory>
      <v-chip
        class="borderless_ship"
        medium
        pill
        active-class="borderless_ship_active"
        color="var(--v-sub-text-base)"
        v-for="option in viewOptions"
        :key="option.text"
        :disabled="pendingChanges"
      >
        <i class="material-symbols-rounded v-icon pr-3">
          {{ option.icon }}
        </i>
        {{ option.text }}
      </v-chip>
    </v-chip-group> -->

    <div class="headline_container py-4 px-4">
      <div class="info_wrapper py-2" v-if="selectedView === 0">
        <div class="info_content pl-2">
          <span class="body-3">Mesclar contatos similares (0)</span>
          <small>Não há contatos com informações similares</small>
        </div>

        <v-btn style="min-width: 100px" color="primary"> Mesclar tudo </v-btn>
      </div>

      <div class="info_wrapper" v-if="selectedView === 1">
        <div class="info_content">
          <span class="body-3">Excluir Contato</span>
          <small>
            Ao realizar essa ação o contato será excluído do sistema. Por favor,
            revise os dados e certifique-se que o contato selecionado é o
            correspondente, pois a exclusão é irreversível.
          </small>
        </div>

        <v-btn
          color="primary"
          @click="handleDeleteContact()"
          v-tooltip="{
            content: `
                <div class='v-btn-tooltip'>
                    Excluir contato
                </div>
              `,
            placement: 'bottom-center',
          }"
        >
          Excluir contato
        </v-btn>
      </div>
    </div>

    <component :is="activeComponent" ref="activeCompanyTab" v-if="contact" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import { baseAlert } from '@/plugins/mixins/alerts'

// Async import
const DeleteContact = () => import('./DeleteContact.vue')
const MergeContact = () => import('./MergeContact.vue')

export default {
  props: {
    viewMode: String,
  },
  data: () => ({
    selectedView: 1,
    viewOptions: [
      { id: 0, icon: 'switch_account', text: 'Mesclar e Corrigir' },
      { id: 1, icon: 'delete', text: 'Excluir' },
    ],
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      pendingChanges: 'Global/pendingChanges',
    }),
    activeComponent() {
      if (this.selectedView === 1) return DeleteContact
      return MergeContact
    },
  },
  mounted() {
    if (this.viewMode === 'delete') this.selectedView = 1
  },
  methods: {
    async handleDeleteContact() {
      const result = await baseAlert(
        'Excluir Contato',
        'Essa ação é irreversível, você tem certeza que deseja excluir esse contato?',
        'Sim, excluir',
        'não, cancelar',
        'warning',
        'danger',
        'danger'
      )

      if (result) {
        const { data } = await this.removeItem(
          '/customer/contact',
          this.contact.id
        )

        if (data.success) {
          this.$router.push('/contact')
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
    .info_wrapper {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      .info_content {
        display: flex;
        align-items: flex-start;
        flex-direction: column;

        max-width: 56vw;

        span {
          font-size: 1rem;
          line-height: 20px;
        }

        small {
          color: var(--v-sub-text-base);
        }
      }
    }
  }
}
</style>
