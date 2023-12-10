<template>
  <v-dialog v-model="dialog" max-width="700">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        small
        icon
        :data-test="`btn${baseDataTest}Open`"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
                ${isEditing ? 'Editar Responsável' : 'Adicionar Responsável'}
            </div>
            `,
          placement: 'bottom-center',
        }"
      >
        <v-icon v-if="isEditing">mdi-account-edit</v-icon>
        <v-icon v-else>mdi-account-plus</v-icon>
      </v-btn>
    </template>
    <v-card :data-test="`dialog${baseDataTest}`">
      <DialogHeader title="Cadastrar Responsável" @onCancel="cancel" />
      <v-card-text class="pt-5">
        <v-form ref="form" :disabled="isDisabled">
          <div>
            <span>Contato</span>
            <Autocomplete
              outlined
              dense
              clearable
              :data-test="`select${baseDataTest}Contact`"
              class="mt-5"
              label="Procurar contato existente"
              item-text="name"
              returnObject
              endpoint="/customer/contact"
              :query="`includes=companies&companies.company_id=in(${companyList.join()})`"
              @valueSelected="
                (value) => {
                  handleSelectContact(value)
                }
              "
            />
            <div class="d-flex">
              <v-text-field
                outlined
                dense
                :data-test="`input${baseDataTest}Name`"
                label="Contato"
                class="mr-2"
                v-model="formData.name"
                :error="$v.formData.name.$error"
                :error-messages="
                  $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
                "
              />
              <v-text-field
                :key="phoneInputKey"           
                outlined
                dense
                :data-test="`input${baseDataTest}Phone`"
                label="Telefone"
                class="ml-2"
                v-model="formData.phone"
                v-mask="maskPhone(formData.phone)"
                :rules="phoneRules"                
                :messages="phoneValidationMessages"
                :error="$v.formData.phone.$error"
                :error-messages="
                  $v.formData.phone.$error ? 'Esse campo é obrigatório' : ''
                "
              />
            </div>

            <v-text-field
              outlined
              dense
              :data-test="`input${baseDataTest}Email`"
              label="E-mail"
              v-model="formData.email"
              :rules="emailRules"
              :error="$v.formData.email.$error"
              :error-messages="
                $v.formData.email.$error ? 'Esse campo é obrigatório' : ''
              "
            />
          </div>

          <div v-if="financial">
            <span>Dados para Faturamento</span>
            <v-radio-group
              row
              dense
              :data-test="`radio${baseDataTest}Type`"
              label="Pessoa"
              v-model="formData.type"
              :error="$v.formData.type.$error"
              :error-messages="
                $v.formData.type.$error ? 'Esse campo é obrigatório' : ''
              "
            >
              <v-radio label="Física" value="fisica"></v-radio>
              <v-radio label="Jurídica" value="juridica"></v-radio>
            </v-radio-group>

            <div class="d-flex">
              <v-text-field
                outlined
                dense
                :data-test="`input${baseDataTest}Identifier`"
                :class="formData.type == 'juridica' ? 'mr-2' : ''"
                :label="formData.type == 'juridica' ? 'CNPJ' : 'CPF'"
                v-model="formData.identifier"
                :error="$v.formData.identifier.$error"
                :error-messages="
                  $v.formData.identifier.$error
                    ? 'Esse campo é obrigatório'
                    : ''
                "
              />

              <v-text-field
                v-if="formData.type == 'juridica'"
                outlined
                dense
                :data-test="`input${baseDataTest}LegalName`"
                label="Razão Social"
                class="ml-2"
                :disabled="companyType"
                v-model="formData.legalName"
                :error="$v.formData.legalName.$error"
                :error-messages="
                  $v.formData.legalName.$error ? 'Esse campo é obrigatório' : ''
                "
              />
            </div>

            <div class="d-flex">
              <v-text-field
                v-if="formData.type == 'juridica'"
                outlined
                dense
                :data-test="`input${baseDataTest}FantasyName`"
                label="Nome Fantasia"
                class="mr-2"
                :disabled="companyType"
                v-model="formData.fantasyName"
                :error="$v.formData.fantasyName.$error"
                :error-messages="
                  $v.formData.fantasyName.$error
                    ? 'Esse campo é obrigatório'
                    : ''
                "
              />
              <v-text-field
                outlined
                dense
                :data-test="`input${baseDataTest}Zipcode`"
                label="CEP"
                :class="formData.type == 'juridica' ? 'ml-2' : ''"
                v-model="formData.zipcode"
                :error="$v.formData.zipcode.$error"
                :error-messages="
                  $v.formData.zipcode.$error ? 'Esse campo é obrigatório' : ''
                "
                @change="cepSearch"
              />
            </div>

            <v-text-field
              outlined
              dense
              label="Endereço"
              :data-test="`input${baseDataTest}Address`"
              v-model="formData.location"
              :disabled="disableFields"
              :error="$v.formData.location.$error"
              :error-messages="
                $v.formData.location.$error ? 'Esse campo é obrigatório' : ''
              "
            />
            <div class="d-flex">
              <v-text-field
                outlined
                dense
                :data-test="`input${baseDataTest}Number`"
                label="Número"
                class="mr-2"
                v-model="formData.number"
                :error="$v.formData.number.$error"
                :error-messages="
                  $v.formData.number.$error ? 'Esse campo é obrigatório' : ''
                "
              />
              <v-text-field
                outlined
                dense
                :data-test="`input${baseDataTest}Complement`"
                label="Bairro"
                class="ml-2"
                v-model="formData.neighborhood"
                :disabled="disableFields"
                :error="$v.formData.neighborhood.$error"
                :error-messages="
                  $v.formData.neighborhood.$error
                    ? 'Esse campo é obrigatório'
                    : ''
                "
              />
            </div>
            <div class="d-flex">
              <v-row class="mx-0 px-0">
                <v-col class="mx-0 px-0">
                  <v-select
                    attach
                    outlined
                    dense
                    :data-test="`input${baseDataTest}State`"
                    label="Estado"
                    class="mr-2"
                    v-model="formData.state"
                    :disabled="disableFields"
                    :items="brStates"
                    :error="$v.formData.state.$error"
                    :error-messages="
                      $v.formData.state.$error ? 'Esse campo é obrigatório' : ''
                    "
                  ></v-select>
                </v-col>
                <v-col class="mx-0 px-0">
                  <v-text-field
                    outlined
                    dense
                    :data-test="`input${baseDataTest}City`"
                    label="Cidade"
                    class="ml-2"
                    v-model="formData.city"
                    :disabled="disableFields"
                    :error="$v.formData.city.$error"
                    :error-messages="
                      $v.formData.city.$error ? 'Esse campo é obrigatório' : ''
                    "
                  />
                </v-col>
              </v-row>
            </div>
          </div>
        </v-form>
      </v-card-text>
      <DialogAction
        :disable-submit="isDisabled"
        @submit="submitForm"
        @cancel="cancel"
      />
    </v-card>
  </v-dialog>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators'

import { mapGetters } from 'vuex'

export default {
  props: {
    financial: Boolean,
    isEditing: Boolean,
    isDisabled: Boolean,
    companyId: Number,
    responsible: String,
    companyList: Array,
  },
  data: () => ({
    phoneInputKey: null,
    dialog: false,
    selectedContactId: null,
    identifierPersist: null,
    companyType: false,
    formData: {
      name: null,
      phone: null,
      email: null,
      type: 'juridica',
      identifier: null,
      legalName: null,
      fantasyName: null,
      zipcode: null,
      location: null,
      number: null,
      neighborhood: null,
      state: null,
      city: null,
    },
    companyAddresses: [],
    company: {},
    disableFields: true,
    brStates: [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ],
  }),
  computed: {
    ...mapGetters({
      opportunity: 'Opportunity/opportunity',
    }),
    phoneMask() {
      return this.maskPhone(this.formData.phone)
    },
    baseDataTest() {
      return this.financial ? 'FinancialResponsibleForm' : 'ResponsibleForm'
    },
  },
  validations: {
    formData: {
      name: { required },
      phone: { required },
      email: { required },
      type: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      identifier: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      legalName: {
        required: requiredIf(function () {
          return this.financial && this.formData.type === 'juridica'
        }),
      },
      fantasyName: {
        required: requiredIf(function () {
          return this.financial && this.formData.type === 'juridica'
        }),
      },
      zipcode: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      location: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      number: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      neighborhood: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      state: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
      city: {
        required: requiredIf(function () {
          return this.financial
        }),
      },
    },
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.type = 'juridica'
        this.financial && this.getCompany(this.companyId)
        if (this.isEditing) {
          this.disableFields = false
          this.getData()
        }
      }
    },
    'formData.type': function (newValue) {
      if (newValue === 'fisica') {
        this.companyType = true
        this.identifierPersist = this.formData.identifier
        this.formData.identifier = null
      }
      if (newValue === 'juridica') {
        this.companyType = false
        this.formData.identifier = this.identifierPersist
      }
    },
  },
  methods: {
    async handleSelectContact(value) {
      this.selectedContactId = value?.id
      this.formData.name = value?.name

      await this.getContactInfo(value?.id)
    },
    getData() {
      if (this.responsible) {
        const fromData = JSON.parse(this.responsible)
        this.formData = structuredClone(fromData)
      }
    },
    async getContactInfo(id) {
      this.$set(this.formData, 'phone', null)
      this.$set(this.formData, 'email', null)
      this.phoneInputKey = null

      const contact = await this.getList(
        '/customer/all-medias-contact',
        `base=in(landline,mobile,mail)&contact_id=in(${id})&company_id=in(${this.opportunity.customer_id})&includes=media_type`
      )

      if (contact?.data?.length > 0) {
        const email = contact.data.find(
          (media) => media?.media_type?.base === 'mail'
        )
        const phone = contact.data.find(
          (media) =>
            media?.media_type?.base === 'mobile' ||
            media?.media_type?.base === 'landline'
        )

        if (email) {
          this.$set(this.formData, 'email', email.value)
        }
        if (phone) {
          this.$set(this.formData, 'phone', phone.value)
          this.phoneInputKey = phone.value
        }
      }
    },
    submitForm() {
      this.$v.formData.$touch()
      if (!this.$refs.form.validate()) return
      if (this.$v.formData.$error) return
      if (this.financial && this.formData.type === 'juridica') {
        this.checkAddress()
      }
      this.$emit('onSubmit', JSON.stringify(this.formData))
      this.dialog = !this.dialog
    },
    cancel() {
      this.$v.$reset()
      this.$refs.form.reset()
      this.dialog = !this.dialog
    },
    cepSearch(searchedCep) {
      searchedCep = this.onlyNumbers(searchedCep)
      this.$viaCep
        .buscarCep(searchedCep)
        .then(({ logradouro, localidade, uf, bairro }) => {
          this.formData.location = logradouro.toUpperCase()
          this.formData.city = localidade.toUpperCase()
          this.formData.state = uf.toUpperCase()
          this.formData.neighborhood = bairro.toUpperCase()
        })
      this.disableFields = false
    },
    async getCompany(id) {
      const company = await this.getItem(
        '/customer/company',
        `includes=addresses&id=${id}`
      )
      if (company) {
        this.company = company
        this.companyAddresses = company.addresses
        this.formData.identifier = company.identifier
        if (this.formData.type === 'juridica' && !this.isEditing) {
          this.formData.fantasyName = company.name
          this.formData.legalName = company.legalName
          this.setDefaultAddress()
        }
      }
    },
    checkAddress() {
      if (
        !this.companyAddresses.some(
          (address) =>
            address.zipcode &&
            this.onlyNumbers(address.zipcode) ===
              this.onlyNumbers(this.formData.zipcode)
        )
      ) {
        const newAddress = {
          company_id: this.companyId,
          city: this.formData.city,
          location: this.formData.location,
          neighborhood: this.formData.neighborhood,
          number: this.formData.number,
          state: this.formData.state,
          zipcode: this.formData.zipcode,
          type: 'customer_address',
        }
        if (this.formData.identifier === this.company.identifier) {
          this.createItem('/customer/customer-address', newAddress)
        }
      }
    },
    setDefaultAddress() {
      if (this.companyAddresses.length > 0) {
        const [address] = this.companyAddresses
        this.formData.city = address.city
        this.formData.location = address.location
        this.formData.neighborhood = address.neighborhood
        this.formData.number = address.number
        this.formData.state = address.state
        this.formData.zipcode = address.zipcode
        this.disableFields = false
      }
    },
  },
}
</script>
