<template>
  <div>
    <v-form ref="form">
      <v-row>
        <v-col class="mt-4 pt-0">
          <h3 class="bordered-title pl-3">Unitário</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col xl="6" lg="6" class="pt-0 mt-3">
          <v-text-field
            label="Pesquise pelo CNPJ da empresa"
            v-model="searchedCompany.identifier"
            v-mask="this.mask_cnpj"
            required
            outlined
            dense
          ></v-text-field>
        </v-col>

        <v-col xl="2" lg="2" class="pt-0 mt-3">
          <v-btn
            color="secondary"
            @click="handleSearch"
            >Pesquisar
          </v-btn>
        </v-col>
      </v-row>

      <v-row class="mb-5" v-if="searchedCompany.exists">
        <v-col xl="6" lg="6" class="pt-0 mt-3">
          <h2>Empresa já existente</h2>
          <p class="mb-1">{{ searchedCompany.legalName }}</p>
        </v-col>

        <v-col>
        <v-select
          attach
          label="Tipo de associação"
          v-model="association.association_type_id"
          :items="associationTypeList"
          item-value="id"
          item-text="name"
          required
          outlined
          dense
          :error="$v.association.association_type_id.$error"
          :error-messages="$v.association.association_type_id.$error ? 'Esse campo é obrigatório' : ''"   
        ></v-select>
        </v-col>

        <v-col xl="2" lg="2" class="pt-0 mt-3">
          <v-btn
            color="secondary"
            @click="handleAddAssociation"
            >Associar
          </v-btn>
        </v-col>
      </v-row>

      
      <v-row class="mb-5" v-if="!resultSearch">
        <v-col xl="6" lg="6" class="pt-0 mt-3">
          <h2>Empresa inexistente na base - adicionar parceiro</h2>
        </v-col>

        <Sheet
          :isEditing='false'
          title='Criar Parceria'
          @submit='$refs.myForm.submitForm()'
          @cancel='$refs.myForm.handleCancel()'
          @click="handleClearFields"
          isXsmall
          standardSecondary
          standardSecondaryButtonText="Adicionar"
        >
          <template v-slot="{ sheet, closed }">
            <CompanyForm :sheet='sheet' @closeForm="closed" ref='myForm' :itemId="company.id" :identifierFromAddCompanyForm="searchedCompany.identifier"/>
          </template>
        </Sheet>
      </v-row>

      <v-expansion-panel class="mb-3 rounded-0" v-if="searchedCompany.exists">
        <v-expansion-panel-header color="shape lighten-1" style="border-left: 3px solid #00E2F4 !important; border-top: 0px !important;">
          Associações atuais
        </v-expansion-panel-header>
        <v-expansion-panel-content v-for="association in associations" :key="association.id" class="pt-4">
            <AssociationItem :association="association.right_side" :type="association.association_type" redirect-to="company"/>                    
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-form>
    <v-form ref="import-form">
      <v-row>
        <v-col class="mt-4 pt-0">
          <v-divider class="mb-3"></v-divider>
          <h3 class="bordered-title pl-3">Em massa</h3>
        </v-col>
      </v-row>
      <v-row>
        <v-col xl="6" lg="6" class="pt-0 mt-3">
          <Autocomplete
          label="Tipo de associação"
          outlined
          clearable
          endpoint="/customer/association-type"
          :validate="$v.leadsPayload.association_type_id"
          @valueSelected="(value) => {leadsPayload.association_type_id = value}"
        ></Autocomplete>
        </v-col>
        <v-col xl="2" lg="2" class="pt-0 mt-3">
          <FileImport leads-import @onLeadsImport="uploadLeads"/>
        </v-col>
        <v-col xl="4" lg="4" class="pt-2 mt-3">
          <h3>{{textImportReturn}}</h3>
        </v-col>
      </v-row>
    </v-form>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    itemId: Number,
  },
  data: () => ({
    resultSearch: true,
    searchedCompany: {
      exists: null,
      identifier: null,
      legalName: null,
      id: null
    },
    associationHeaders: [
      { text: 'Empresa', value: 'right_side.name' },
      { text: 'Tipo de associação', value: 'association_type.name' }
    ],
    associationList: [],
    associationTypeList: [],
    association: {
      left_side_id: null,
      right_side_id: null,
      association_type_id: null
    },
    leadsImportPath: 'customer/import-parnter-leads/',
    leadsPayload: {
      partner_id: null,
      association_type_id: null,
      leads: []
    },
    textImportReturn: ''
  }),
  validations: {
    association: {
      association_type_id: { required }
    },
    leadsPayload: {
      association_type_id: { required }
    }
  },
  computed: mapGetters([  
    'company',
    'fetchAssociations',
    'associations',
    'associationType',
  ]),
  mounted() {
    this.$root.$on('clear-field', () => {
      this.handleCancel()
    })
  },
  watch: {
    closed(newValue) {
      console.log('newValue', newValue)
    }
  },
  methods: {
    async getAssociations() {
      await this.$store.dispatch('fetchAssociationType')
      const { data } = await this.getList('/customer/association', `includes=association_type&right_side_id=${this.searchedCompany.id}`)    
      const ignoredCategories = ['group']
      if (data.some(association => association.association_type.category == 'accountant')) {
        ignoredCategories.push('accountant')
      }
      this.associationTypeList = this.associationType.filter(association => {
        return !ignoredCategories.includes(association.category)
      })
    },
    async handleSearch() {
      this.getAssociations()

      this.resultSearch = true
      this.searchedCompany.exists = false
      const identifier = this.searchedCompany.identifier
        .replaceAll('.', '')
        .replaceAll('/', '')
        .replaceAll('-', '')

      const response = await this.$axios.get(`/customer/company?identifier=${identifier}`)
      if (response.data.data.length == 0) {
        this.resultSearch = false
        return
      } else {
        this.searchedCompany.exists = true
        const { id, legalName } = response.data.data[0] 
        this.searchedCompany.identifier = identifier
        this.searchedCompany.id = id
        this.searchedCompany.legalName = legalName
      }

    },
    async handleAddAssociation() {
      this.$v.association.$touch()
      if (this.$v.association.$error) return
      
      this.association.left_side_id = this.itemId 
      this.association.right_side_id = this.searchedCompany.id
      await this.$store.dispatch('addAssociation', this.association)

      await this.$store.dispatch(
        'fetchAssociations',
        `includes=right_side,association_type&left_side_id=${this.association.left_side_id}`
      )

      this.searchedCompany.identifier = ''
      this.handleCancel()
    },
    handleClearFields() {
      this.searchedCompany.exists = null
      this.searchedCompany.identifier = null
      this.searchedCompany.legalName = null
      this.searchedCompany.id = null
    },
    handleCancel() {
      this.handleClearFields()

      this.textImportReturn = ''
      this.leadsPayload = {
        partner_id: null,
        association_type_id: null,
        leads: []
      },
      this.searchedCompany.exists = null
      this.resultSearch = true
      this.$emit('closeForm')
    },
    async uploadLeads(leads) {
      this.$v.leadsPayload.$touch()
      if (this.$v.leadsPayload.$error) return
      this.leadsPayload.partner_id = this.itemId
      this.leadsPayload.leads = leads
      const importReturn = await this.createItem(this.leadsImportPath, this.leadsPayload)      
      if (importReturn) {
        this.textImportReturn = `${leads.length} Lead(s) importados.`
      } else {
        this.textImportReturn = 'Falha na importação, tente novamente!'
      }
      this.$v.$reset()
    }
  }
}
</script>

<style>

</style>