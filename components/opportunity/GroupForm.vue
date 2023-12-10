<template>
  <div>
    <v-dialog v-model="dialog" max-width="700">
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
          x-small
          fab
          color="secondary"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon color="primary">mdi-plus</v-icon>
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Gerenciar grupos" @onCancel="cancel" />
        <v-card-text class="pt-5 pb-0 px-0">
          <v-form ref="form">
            <v-expansion-panels v-model="openPanels" multiple>
              <v-expansion-panel class="v-expansion-panel-no-shadow">
                <v-expansion-panel-header disable-icon-rotate expand-icon="">
                  <template v-slot:default>
                    <div class="w-100 d-flex justify-start align-center">
                      <v-icon class="mr-2">mdi-chevron-down</v-icon>
                      <p class="mb-0">Infos gerais</p>
                    </div>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="px-2">
                  <v-row>
                    <v-col xl="7" lg="7" class="pt-0">
                      <NewCombobox
                        outlined
                        dense
                        reset-cache-items
                        clearable
                        persistent-hint
                        ref="groupCombobox"
                        label="Grupo econômico"
                        endpoint="/customer/customer-group"
                        hint="Para criar um novo grupo pressione ENTER."
                        item-text="name"
                        v-model="selectedGroup"
                        :query="`order=id_desc${companyGroups.length > 0 ? `&id=not_in(${companyGroups.join(',')})` : '' }`"
                        :error="$v.formData.left_side_id.$error"
                        :error-messages="$v.formData.left_side_id.$error ? 'Esse campo é obrigatório' : ''"
                      >
                      </NewCombobox>
                    </v-col>
                    <v-col xl="5" lg="5" class="pt-0">
                      <v-autocomplete
                        attach
                        outlined
                        dense
                        item-text="name"
                        item-value="id"
                        label="Tipo de associação"
                        v-model="formData.association_type_id"
                        :items="associationType"
                        :error="$v.formData.association_type_id.$error"
                        :error-messages="$v.formData.association_type_id.$error ? 'Esse campo é obrigatório' : ''"
                      >
                      </v-autocomplete>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel class="v-expansion-panel-no-shadow mt-0">
                <v-expansion-panel-header disable-icon-rotate expand-icon="">
                  <template v-slot:default>
                    <div class="w-100 d-flex justify-start align-center">
                      <v-icon class="mr-2">mdi-chevron-down</v-icon>
                      <p class="mb-0">Relacionar outras empresas ao grupo</p>
                    </div>
                  </template>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="px-2">
                  <v-row>
                    <v-col xl="7" lg="7" class="pt-0">
                      <Autocomplete
                        outlined
                        dense
                        clearable
                        return-object
                        custom-criteria
                        ref="companiesAutocomplete"
                        label="Empresa"
                        endpoint="/bureau/company-by-name-or-identifier"
                        no-data-text="digite o CNPJ ou nome da Empresa"
                        :item-text="item => item.name +' - '+ maskCnpj(item.cnpj) + ` (${item.cnpj})`"
                        :length-to-start-search="4"
                        @valueSelected="(value) => {selectedCompany = value}"
                      ></Autocomplete>
                    </v-col>
                    <v-col xl="3" lg="3" class="pt-0">
                      <v-btn @click="addSelectedCompany" color="secondary" block class="fix-align-btn">Adicionar</v-btn>
                    </v-col>
                  </v-row>
                  <v-divider class="mb-3"></v-divider>
                  <v-row>
                    <v-col>
                      <DataList
                        deleteAction="delete"
                        :list="list"
                        :hasSlot="false"
                        @removeItem="deleteItem"
                      >
                      </DataList>
                    </v-col>
                  </v-row>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-form>
        </v-card-text>
        <DialogAction :disable-submit="disableAddBtn" @submit="submitForm" @cancel="cancel" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

export default {
  props: {
    isEditing: Boolean,
    companyId: Number,
    companyTenantId: Number,
  },
  data: () => ({
    dialog: false,
    submitting: false,
    disableAddBtn: true,
    openPanels: [0, 1],
    associationType: [],
    groups: [],
    companyGroups: [],
    selectedGroup: null,
    creatingGroup: false,
    list: [],
    formData: {
      association_type_id: null,
      left_side_id: null,
      right_side_id: null
    },
    groupData: {
      tenant_id: null,
      name: null,
    },
    selectedCompany: {},
  }),
  validations: {
    formData: {
      association_type_id: { required },
      left_side_id: { required }
    },
  },
  watch: {
    async selectedGroup(newValue) {
      if (newValue) {
        const groupExists = this.isObject(newValue)
        if(!groupExists) {
          await this.insertEconomicGroup(newValue)
        } else {
          this.formData.left_side_id = newValue.id
        }
      } else {
        this.formData.left_side_id = null
      }
    },
    'formData.left_side_id': function(newValue) {
      if(newValue) {
        this.disableAddBtn = false
      }else {
        this.disableAddBtn = true
      }
    },
    dialog(newValue) {
      if (newValue) {
        this.list = []
        this.formData.right_side_id = this.companyId
        this.groupData.tenant_id = this.companyTenantId
        this.getCompanyGroups()
        this.getAssociationType()
      }
    }
  },
  methods: {
    async getAssociationType() {
      const { data } = await this.getList('/customer/association-type', 'category=group')
      this.associationType = data
    },
    async getCompanyGroups() {
      const { data } = await this.getList(
        '/customer/association',
        `includes=left_side,association_type&association_type.category=group&right_side_id=${this.companyId}`
      )
      this.companyGroups = data.map((association) => association.left_side_id)
    },
    async deleteItem(value) {
      this.list = this.list.filter((item, index) => index != value)
    },
    isObject(val) {
      return val instanceof Object
    },
    async insertEconomicGroup(groupName) {
      this.groupData.name = groupName
      if(this.groupData.name) {
        this.creatingGroup = true
        const response = await this.createItem('/customer/customer-group', this.groupData)
        this.selectedGroup = this.groups.find((group) => group.id == response.id)
      }
      this.creatingGroup = false
    },
    async addSelectedCompany() {
      const { local_company_id = null, cnpj = null, name } = this.selectedCompany || {}
      if (local_company_id) {
        this.list.push({
          id: local_company_id,
          title_1: name,
          subtitle_1: cnpj,
        })
      } else {
        if (cnpj) {
          try {
            const { data: { data } } = await this.$axios.put(`/customer/official-data-by-identifier?identifier=${cnpj}`)
            const [companyCreated] = data
            this.list.push({
              id: companyCreated.id,
              title_1: companyCreated.legalName,
              subtitle_1: companyCreated.identifier,
            })
          } catch (error) {
            this.$swal({
              icon: 'error',
              title:
                'Não foi possível completar a ação'
            })
          }
        }
      }
      this.$refs.companiesAutocomplete.clearCachedItems()
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      this.submitting = true
      
      if (this.isEditing) {
        await this.$store.dispatch('updAssociation', this.formData)
      } else {
        await this.$store.dispatch('addAssociation', this.formData)
        if(this.list.length > 0) {
          await Promise.all(
            this.list.map((company) =>
              this.addMultipleCompanies(company)
            )
          )
        }
      }
      this.$emit('update')
      this.cancel()

    },
    async addMultipleCompanies(company) {
      const payload = { ...this.formData, right_side_id: company.id }
      await this.$store.dispatch('addAssociation', payload)
    },
    cancel() {
      this.$v.$reset()
      this.$refs.form.reset()
      this.selectedGroup = null
      if (this.$refs['groupCombobox']) {
        this.$refs['groupCombobox'].resetField()
      }
      this.submitting = false
      this.dialog = !this.dialog
    }
  }
}
</script>

<style scoped>
  .v-expansion-panel-no-shadow::before {
    box-shadow: none !important;
  }
  .fix-align-btn {
    margin-top: 1px;
  }
</style>