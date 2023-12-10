<template>
  <v-dialog
    v-model="showDialog"
    content-class="addContactDialog"
    scrollable
    max-width="44vw"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        color="primary"
        v-tooltip="{
          content: `
                <div class='v-btn-tooltip'>
                  Criar contato
                </div>
              `,
          placement: 'bottom-center',
        }"
      >
        Movimentar Contato
      </v-btn>
    </template>

    <v-card v-if="showDialog && contact">
      <v-card-title class="d-flex justify-center">
        <span>
          <i class="material-symbols-rounded v-icon pr-2">swap_vert</i>
          Movimentar Contato
        </span>
      </v-card-title>

      <v-card-text v-if="contact.companies.length >= 1">
        <v-row>
          <v-col cols="12">
            <v-select
              attach
              :items="contact.companies"
              item-text="company.name"
              item-value="id"
              hide-details
              dense
              clearable
              label="Selecione a empresa"
              outlined
              v-model="addMovement.company_contact_id"
              no-data-text="Não há empresas disponíveis para esse usuário"
              disabled
            />
          </v-col>

          <v-col cols="12">
            <v-select
              attach
              :items="reasonsOptions"
              item-text="text"
              item-value="value"
              hide-details
              dense
              clearable
              label="Selecione o motivo"
              outlined
              v-model="addMovement.reason"
              no-data-text="Não há cargos disponíveis para esse usuário"
            />
          </v-col>

          <v-col
            cols="12"
            v-if="
              addMovement.reason === 'job_change' ||
              addMovement.reason === 'inclusion'
            "
          >
            <v-text-field
              hide-details
              dense
              label="Selecione o cargo"
              outlined
              v-model="addMovement.position"
            />
          </v-col>

          <v-col
            cols="12"
            v-if="
              addMovement.reason === 'department_change' ||
              addMovement.reason === 'inclusion'
            "
          >
            <v-text-field
              hide-details
              dense
              label="Selecione o departamento"
              outlined
              v-model="addMovement.department"
            />
          </v-col>

          <v-col
            cols="12"
            v-if="
              addMovement.reason === 'sector_change' ||
              addMovement.reason === 'inclusion'
            "
          >
            <v-text-field
              hide-details
              dense
              label="Selecione a área"
              outlined
              v-model="addMovement.sector"
            />
          </v-col>
        </v-row>
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn color="secondary" @click="handleCloseModal()" class="mr-3 px-5">
          Cancelar
        </v-btn>
        <v-btn color="primary" @click="handleSubmit()" class="px-5">
          Salvar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    selectedCompany: Number,
  },
  data: () => ({
    showDialog: false,
    userInfo: '',
    reasonsOptions: [
      { value: 'job_change', text: 'Mudança de cargo' },
      { value: 'department_change', text: 'Mudança De Departamento' },      
      { value: 'resignation', text: 'Desligamento' },
      { value: 'inclusion', text: 'Inclusão' },
    ],
    addMovement: {
      company_contact_id: 0,
      active: true,
      sector: '',
      position: '',
      department: '',
      reason: '',
      creator_id: 0,
    },
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      pendingChanges: 'Global/pendingChanges',
    }),
    activeCompany() {
      return this.contact?.companies?.find(
        (company) => company?.company_id === this.selectedCompany
      )
    },
  },
  watch: {
    showDialog() {
      this.addMovement.company_contact_id = this.activeCompany?.id
    },
  },
  mounted() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
  },
  methods: {
    resetAddMovement() {
      this.addMovement = {
        company_contact_id: 0,
        active: true,
        sector: '',
        position: '',
        department: '',
        reason: '',
        creator_id: 0,
      }
    },
    handleCloseModal() {
      this.showDialog = !this.showDialog
    },
    async handleSubmit() {
      let department = ''
      let position = ''

      if (this.activeCompany?.contact_positions?.length >= 1) {
        department = this.activeCompany.contact_positions.at(-1).department
        position = this.activeCompany.contact_positions.at(-1).position
      }

      this.addMovement.position =
        this.addMovement.position !== '' ? this.addMovement.position : position
      this.addMovement.department =
        this.addMovement.department !== ''
          ? this.addMovement.department
          : department
      this.addMovement.creator_id = this.userInfo.id

      const response = await this.createItem(
        '/customer/contact-position',
        this.addMovement
      )

      if (response?.success) {
        this.$emit('update')
        this.handleCloseModal()
        this.resetAddMovement()
      }
    },
  },
}
</script>

<style lang="scss">
.addContactDialog {
  .v-card {
    .v-card__title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      font-size: 1.125rem !important;
      color: var(--v-default-text-base);
    }

    .v-card__text {
      padding-top: 1rem;
      color: var(--v-default-text-base);

      @include thin-scrollbar;
    }
  }
}
</style>
