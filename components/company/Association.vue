<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">
            Empresas da Carteira
          </p>
        </div>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <GenericTable
        :headers="headers"
        :items="list"
        @onRowClick="redirectPage"
      >
      </GenericTable>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    associations: {
      type: Array
    }
  },
  data: () => ({
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'CNPJ', value: 'identifier' },
      { text: 'Tipo', value: 'type' },
    ],
  }),
  computed: {
    list: function() {
      var list = []
      if(this.associations) {
        this.associations.forEach(association => {
          const cnpj = this.maskCnpj(association?.right_side?.identifier)
          list.push({
            id: association?.right_side?.id,
            name: association?.right_side?.name,
            identifier: cnpj,
            type: association?.association_type?.name
          })
        })
      }
      return list
    }
  },
  methods: {
    redirectPage(item) {
      const { identifier, id } = item
      const { name, params, query } = this.$route
      this.$router.push({
        name: name,
        params: { ...params, identifier },
        query: { ...query, company_id: id }
      })
    },
  }
}
</script>