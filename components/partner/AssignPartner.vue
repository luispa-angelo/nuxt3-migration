<template>
  <v-form ref="form">
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
        isXsmall
        standardSecondary
        standardSecondaryButtonText="Adicionar"
      >
        <template v-slot='{ sheet }'>
          <!-- <PartnerForm :sheet='sheet' ref='myForm' :itemId="company.id" :identifierFromAddParterForm="searchedCompany.identifier"/> -->
          <CompanyForm :sheet='sheet' ref='myForm' :itemId="company.id" :identifierFromAddParterForm="searchedCompany.identifier"/>
        </template>
      </Sheet>
    </v-row>

    <v-expansion-panel class="mb-3 rounded-0" v-if="searchedCompany.exists">
      <v-expansion-panel-header color="shape lighten-1" style="border-left: 3px solid #00E2F4 !important; border-top: 0px !important;">
        Associações atuais
      </v-expansion-panel-header>
      <v-expansion-panel-content v-for="association in associations" :key="association.id" class="pt-4">
          <AssociationItem :association="association.left_side" :type="association.association_type" redirect-to="partner"/>                    
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-form>
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
      { text: 'Empresa', value: 'left_side.name' },
      { text: 'Tipo de associação', value: 'association_type.name' }
    ],
    associationList: [],
    associationTypeList: [],
    association: {
      left_side_id: null,
      right_side_id: null,
      association_type_id: null
    },
  }),
  validations: {
    association: {
      association_type_id: { required }
    }
  },
  computed: mapGetters([  
    'company',
    'fetchAssociations',
    'associations',
    'associationType'
  ]),
  methods: {
    async getAssociations() {
      await this.$store.dispatch('fetchAssociationType')    
      const ignoredCategories = ['group']
      if (this.associations.some(association => association.association_type.category == 'accountant')) {
        ignoredCategories.push('accountant')
      }
      this.associationTypeList = this.associationType.filter(association => {
        return !ignoredCategories.includes(association.category)
      })
    },
    async handleSearch() {
      console.log('associations', this.associations)
      this.getAssociations()

      this.resultSearch = true
      this.searchedCompany.exists = false
      const identifier = this.searchedCompany.identifier
        .replaceAll('.', '')
        .replaceAll('/', '')
        .replaceAll('-', '')

      const response = await this.$axios.get(`/customer/company?identifier=${identifier}`)
      console.log('response', response)
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
      
      this.association.left_side_id = this.searchedCompany.id,
      this.association.right_side_id = this.itemId
      await this.$store.dispatch('addAssociation', this.association)
      await this.$store.dispatch(
        'fetchAssociations',
        `includes=left_side,association_type&right_side_id=${this.association.right_side_id}`
      )
      this.searchedCompany.identifier = ''
      this.handleCancel()
    },
    handleCancel() {
      this.$refs.form.reset()
      this.searchedCompany.exists = null
      this.resultSearch = true
      this.$emit('closeForm')
    },  
  }
}
</script>

<style>

</style>