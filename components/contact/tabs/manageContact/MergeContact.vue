<template>
  <div class="manage_contact_wrapper">
    <v-row class="contact_info_wrapper" v-if="similarContacts.length >= 1">
      <v-col
        lg="4"
        class="py-0"
        v-for="(contact, contact_index) in similarContacts"
        :key="contact.id"
      >
        <v-list-item>
          <v-checkbox v-model="contact.select" hide-details />
          <v-avatar color="primary" size="36" class="mr-3">
            <span class="white--text body-3">
              {{ getInitials('Ana Maria') }}
            </span>
          </v-avatar>

          <v-list-item-title
            class="name text-capitalize"
            v-text="'Ana Maria - 0' + (contact_index + 1)"
          />
        </v-list-item>

        <v-list-item>
          <i class="material-symbols-rounded v-icon pr-2">person</i>
          <h6 class="info_title">Dados Pessoais</h6>
        </v-list-item>

        <div
          class="list_item"
          v-for="item in contactMergeItems"
          :key="item.text"
        >
          <span v-if="item.text">{{ item.text }}</span>

          <span :class="!contact[`${item.value}`] ? 'empty' : ''">
            {{
              contact[`${item.value}`]
                ? item.text === 'Data Nascimento'
                  ? formatDate(contact[`${item.value}`])
                  : contact[`${item.value}`]
                : 'Não informado'
            }}
          </span>
        </div>

        <v-list-item class="mt-3">
          <i class="material-symbols-rounded v-icon pr-2">domain</i>
          <h6 class="info_title">Empresas relacionadas (1)</h6>
        </v-list-item>

        <span>NOME DA EMPRESA - XX.XXX.XXX/0001-XX</span>
      </v-col>
    </v-row>

    <div class="empty_similar" v-if="similarContacts.length < 1">
      <i class="material-symbols-rounded">task_alt</i>

      <span>Este contato não possui similares</span>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    contactOption: [
      { id: 0, icon: 'switch_account', text: 'Mesclar e Corrigir' },
      { id: 1, icon: 'delete', text: 'Excluir' },
    ],
    similarContacts: [
      { select: false, value: '' },
      { select: false, value: '' },
    ],
    contactMergeItems: [
      { text: 'Nome', value: '' },
      { text: 'Nome Social', value: '' },
      { text: 'CPF', value: '' },
      { text: 'Nacionalidade', value: '' },
      { text: 'Gênero', value: '' },
      { text: 'Data Nascimento', value: '' },
      { text: 'Cor/Raça', value: '' },
      { text: 'Deficiência', value: '' },
    ],
    selectedOption: 0,
    nameRegex: new RegExp(/(\p{L}{1})\p{L}+/, 'gu'),
  }),
  methods: {
    getInitials(name) {
      if (name) {
        let initials = [...name.matchAll(this.nameRegex)] || []
        return (initials = (
          (initials.shift()?.[1] || '') + (initials.pop()?.[1] || '')
        ).toUpperCase())
      }
      return ''
    },
    formatDate(date) {
      return date ? this.$moment(date).format('DD/MM/yyyy') : ''
    },
  },
}
</script>

<style lang="scss" scoped>
.manage_contact_wrapper {
  .contact_info_wrapper {
    border: 1px solid var(--v-stroke-base);
    border-radius: 8px;
    max-height: 42vh;
    color: var(--v-default-text-base);

    .v-list-item {
      padding: 0 !important;

      .name {
        font-size: 1rem;
        color: var(--v-default-text-base);
        font-weight: 400;
      }

      ::v-deep .v-input--checkbox {
        margin: 0 !important;
        padding: 0 !important;

        i {
          color: var(--v-stroke-base);
        }
      }
    }
    .empty_similar {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      padding-top: 2rem;

      i {
        color: var(--v-default-text-base);
        opacity: 0.16;
        font-size: 4.4rem;
        padding-bottom: 0.6rem;
      }

      span {
        color: var(--v-sub-text-base);
      }
    }
  }
}
</style>
