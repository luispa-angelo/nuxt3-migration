<template>
  <v-dialog v-model="dialog" persistent max-width="806">
    <v-card min-height="70vh" class="d-flex flex-column justify-space-between">
        <div>
          <DialogHeader title="Report - Importação de Leads" @onCancel="handleCancel()"/>
            <v-card-text class="pa-0 mr-5 shape lighten-2 fill-height">
              <v-data-table
                :headers="reportHeaders"
                :items="leadsReport"
              />
            </v-card-text>
        </div>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: {
    openDialog: Boolean,
    leads: Array
  },
  data: () => ({
    reportHeaders: [
      { name: 'CNPJ', value: 'cnpj' },
      { name: 'Status', value: 'details' },
    ],
  }),
  computed: {
    leadsReport: function () {
      return this.leads.map((lead) => {
        lead.details = this.translateDetails(lead?.details)
        return lead
      })
    },
    dialog: function() {
      return this.openDialog
    }
  },
  methods: {
    translateDetails(details) {
      if (details) {
        if (details.includes('lead not available')) {
          return 'Lead está sendo trabalhado'
        } else if (details.includes('error checking elegibility')) {
          return 'Erro na validação'
        } else if (details.includes('error persisting company')) {
          return 'Erro interno do sistema'
        }else if (details.includes('imported')) {
          return 'Lead importado!'
        }else {
          return 'Erro ao importar lead'
        }
      }
      else {
        return 'Erro ao importar lead'
      }
      return details
    },
    handleCancel() {
      this.$store.commit('Alert/SET_ALERTS_REFRESH', { dataUpdateByLeadImport: true })
      this.$emit('closeDialog')
    }
  }
}
</script>

<style>

</style>