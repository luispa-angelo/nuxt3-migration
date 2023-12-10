<template>
  <div>
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="isEditing"
          text
          v-bind="attrs"
          v-on="on"
        >
          Editar
        </v-btn>
        <v-btn
          v-else
          color="secondary"
          x-small
          fab
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="primary" small>mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Agregar Empresa" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-form ref="form">
            <Autocomplete
              outlined
              dense
              clearable
              return-object
              custom-criteria
              ref="aggregateAutocomplete"
              label="Empresa"
              endpoint="/bureau/company-by-name-or-identifier"
              no-data-text="digite o CNPJ ou nome da Empresa"
              :item-text="item => item.name +' - '+ maskCnpj(item.cnpj) + ` (${item.cnpj})`"
              :length-to-start-search="4"
              @valueSelected="(value) => {aggregateCompany = value}"
            ></Autocomplete>
          </v-form>
        </v-card-text>
        <DialogAction @submit="handleSubmit" @cancel="cancel" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>

export default {
  props: {
    isEditing: Boolean,
    opportunityId: Number,
  },
  data: () => ({
    dialog: false,
    aggregateCompany: {},
    formData: {
      opportunity_id: null,
      customer_id: null,
    },
  }),
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.opportunity_id = this.opportunityId
      }
    }
  },
  methods: {
    async handleSubmit() {
      const { local_company_id = null, cnpj = null } = this.aggregateCompany || {}
      if (local_company_id) {
        this.formData.customer_id = local_company_id
      } else {
        if (cnpj) {
          try {
            const { data: { data } } = await this.$axios.put(`/customer/official-data-by-identifier?identifier=${cnpj}`)
            const [companyCreated] = data
            this.formData.customer_id = companyCreated.id
          } catch (error) {
            this.$swal({
              icon: 'error',
              title:
                'Não foi possível completar a ação'
            })
          }
        }
      }
      if (this.formData.customer_id) {
        try {
          await this.createItem('/cash/opportunity-aggregate', this.formData, { throwError: true })
          this.aggregateCompany = {}
          this.formData.customer_id = null
          this.formData.opportunity_id = null
          this.$refs.aggregateAutocomplete.clearCachedItems()
          this.$emit('onCompanyAggregate')
          this.cancel()
        } catch (error) {
          this.$swal({
            icon: 'error',
            title:
              'Não foi possível completar a ação'
          })
        }
      }
    },
    cancel() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>