<template>
  <div class="company_info_container">
    <v-row class="contact_info_wrapper">
      <GenericTable
        class="data-table"
        :items="companyHistory"
        :headers="headers"
        :hasMenu="false"
        :sortable="true"
        :sort-desc="true"
        sort-by="id"
        tableItemMaxWidth="18vw"
        no-data-text="Nenhum histórico de movimentações"
        v-if="companyHistory"
      />
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    selectedCompany: Number,
  },
  data: () => ({
    headers: [
      {
        text: 'Cargo',
        value: 'position',
      },
      {
        text: 'Departamento',
        value: 'department',
      },
      {
        text: 'Motivo',
        value: 'reasonChange',
      },
      {
        text: 'Criado por',
        value: 'creator.name',
      },
      {
        text: 'Data',
        value: 'date',
      },
    ],
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
    }),
    companyHistory() {
      const historyData = this.contact?.companies.find(
        (company) => company?.company_id === this.selectedCompany
      )?.contact_positions

      historyData?.map((item) => {
        item.reasonChange = this.handleReason(item.reason)
        item.date = this.$moment(item.created_at).format('DD/MM/YYYY')
        return item
      })

      return historyData && historyData.length >= 1 ? historyData : []
    },
  },
  methods: {
    handleReason(reason) {
      switch (reason) {
      case 'job_change':
        return 'Mudança de cargo'
      case 'department_change':
        return 'Mudança De Departamento'
      case 'sector_change':
        return 'Mudança De Área'
      case 'resignation':
        return 'Desligamento'
      case 'inclusion':
        return 'Inclusão'
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.company_info_container {
  .contact_info_wrapper {
    width: 100%;
    max-height: 40vh;

    .data-table {
      width: 100%;
    }
  }
}
</style>
