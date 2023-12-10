<template>
  <v-dialog
    v-model="showDialog"
    content-class="addContactDialog"
    scrollable
    persistent
    max-width="64vw"
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
        criar Contato
      </v-btn>
    </template>

    <v-card v-if="showDialog">
      <v-card-title>
        <span>
          <i class="material-symbols-rounded v-icon pr-2">person_add</i>Criar
          Contato
        </span>

        <i
          class="material-symbols-rounded v-icon"
          style="color: var(--v-primary-base); cursor: pointer"
          @click="handleCloseModal()"
        >
          close
        </i>
      </v-card-title>

      <v-card-text>
        <v-tabs v-model="activeTab" color="primary" background-color="white">
          <v-tab v-for="tab in tabs" :key="tab">
            {{ tab }}
          </v-tab>
        </v-tabs>

        <v-tabs-items class="form_content" v-model="activeTab">
          <v-tab-item>
            <v-row>
              <v-col lg="6">
                <v-text-field
                  hide-details="auto"
                  dense
                  label="Nome Completo"
                  outlined
                  class="pb-0"
                  v-model="contactInfo.name"
                  :error-messages="
                    $v.contactInfo.name.$error ? 'Esse campo é obrigatório' : ''
                  "
                />

                <span
                  class="action_link"
                  @click="addSocialName = !addSocialName"
                  v-if="!addSocialName"
                >
                  + Adicionar nome social</span
                >

                <span class="action_button_wrapper pb-2" v-if="addSocialName">
                  <v-text-field
                    hide-details
                    dense
                    label="Nome Social"
                    outlined
                    v-model="contactInfo.social_name"
                    class="pt-2"
                  />

                  <i
                    class="material-symbols-rounded v-icon"
                    @click="addSocialName = !addSocialName"
                  >
                    delete
                  </i>
                </span>
              </v-col>

              <v-col lg="6">
                <Autocomplete
                  ref="searchCompany"
                  outlined
                  dense
                  clearable
                  return-object
                  custom-criteria
                  hide-details
                  label="Empresa"
                  endpoint="/bureau/company-by-name-or-identifier"
                  no-data-text="digite o CNPJ ou nome da Empresa"
                  :item-text="
                    (item) =>
                      item.name +
                      ' - ' +
                      maskCnpj(item.cnpj) +
                      ` (${item.cnpj})`
                  "
                  :length-to-start-search="4"
                  :filter="filteredCompany"
                  @valueSelected="
                    (value) => handleSelectCompanyAutoComplete(value)
                  "
                  @change="(value) => handleSelectCompanyAutoComplete(value)"
                  class="pb-2"
                />
              </v-col>

              <v-col lg="6">
                <v-row>
                  <v-col cols="12" class="mt-2">
                    <v-select
                      attach
                      :items="departments"
                      item-text="name"
                      item-value="name"
                      hide-details
                      dense
                      clearable
                      label="Departamento"
                      outlined
                      v-model="addedCompany.position.department"
                      :disabled="addedCompany.company_id < 1"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-autocomplete
                      attach
                      ref="searchPosition"
                      dense
                      outlined
                      hide-details
                      clearable
                      class="pb-2"
                      v-model="addedCompany.position.position"
                      item-text="name"
                      item-value="name"
                      label="Cargo"
                      :items="positions"
                      :disabled="addedCompany.company_id < 1"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Company Phone && Email -->
              <v-col lg="6">
                <v-row>
                  <v-col lg="12" class="mt-2">
                    <span
                      v-for="(
                        email, email_index
                      ) in addedCompany.addedCompanyEmails"
                      :key="
                        'company_email_' + addedCompany.company_id + email_index
                      "
                      class="action_button_wrapper"
                    >
                      <v-text-field
                        dense
                        :label="
                          email_index >= 1 ? 'E-mail' : 'E-mail Principal'
                        "
                        outlined
                        v-model="email.value"
                        :class="
                          email_index <
                          addedCompany.addedCompanyEmails.length - 1
                            ? 'pb-2'
                            : 'pb-0'
                        "
                        :rules="emailRules"
                        hide-details="auto"
                        :disabled="addedCompany.company_id < 1"
                      />

                      <i
                        class="material-symbols-rounded v-icon"
                        @click="handleDeleteCompanyMedias(email_index, 'email')"
                        v-if="email_index >= 1"
                      >
                        delete
                      </i>
                    </span>

                    <span
                      class="action_link"
                      @click="handleAddCompanyMedias('email')"
                    >
                      + Adicionar e-mail
                    </span>
                  </v-col>

                  <v-col lg="12">
                    <span
                      v-for="(
                        phone, phone_index
                      ) in addedCompany.addedCompanyPhones"
                      :key="
                        'company_phone_' + addedCompany.company_id + phone_index
                      "
                      class="action_button_wrapper"
                    >
                      <v-text-field
                        hide-details="auto"
                        dense
                        :label="
                          phone_index >= 1 ? 'Telefone' : 'Telefone Principal'
                        "
                        outlined
                        v-model="phone.value"
                        v-mask="maskPhone(phone.value)"
                        :rules="phoneRules"
                        :messages="phoneValidationMessages"
                        :class="
                          phone_index <
                          addedCompany.addedCompanyPhones.length - 1
                            ? 'pb-2'
                            : 'pb-0'
                        "
                        :disabled="addedCompany.company_id < 1"
                      />

                      <i
                        class="material-symbols-rounded v-icon"
                        @click="handleDeleteCompanyMedias(phone_index, 'phone')"
                        v-if="phone_index >= 1"
                      >
                        delete
                      </i>
                    </span>

                    <span
                      class="action_link"
                      @click="handleAddCompanyMedias('phone')"
                    >
                      + Adicionar telefone
                    </span>
                  </v-col>
                </v-row>
              </v-col>

              <div class="ml-auto">
                <v-btn
                  :disabled="addedCompany.company_id === 0"
                  text
                  color="primary"
                  @click="handleAddCompany()"
                >
                  Adicionar empresas
                </v-btn>
              </div>
            </v-row>

            <v-divider class="mt-5" v-if="contactInfo.companies.length >= 1" />

            <div
              class="companies_list"
              v-if="contactInfo.companies.length >= 1"
            >
              <div class="header">
                <span>
                  Empresas relacionadas ({{ contactInfo.companies.length }})
                </span>
                <div class="actions">
                  <span>Principal</span>
                  <span>Excluir</span>
                </div>
              </div>

              <span
                v-for="(company, company_index) in contactInfo.companies"
                :key="company_index"
                class="list_items"
              >
                <span class="company_identifier">{{ company.identifier }}</span>
                <div
                  class="actions"
                  :class="
                    contactInfo.companies.length < 2 ? 'disabled_click' : ''
                  "
                >
                  <i
                    class="material-symbols-rounded"
                    :class="company.primary_company ? 'active' : ''"
                    @click="
                      handleChangePrimaryCompany(
                        company.primary_company,
                        company_index
                      )
                    "
                  >
                    {{ company.primary_company ? 'stars' : 'star' }}</i
                  >
                  <i
                    class="material-symbols-rounded"
                    @click="handleDeleteCompany(company_index)"
                  >
                    delete</i
                  >
                </div>
              </span>
            </div>
          </v-tab-item>

          <v-tab-item>
            <v-row>
              <v-col lg-6>
                <v-row>
                  <v-col cols="12">
                    <span class="title_wrapper">
                      <i class="material-symbols-rounded"> description</i>
                      Sobre
                    </span>
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      hide-details
                      dense
                      label="CPF"
                      outlined
                      v-mask="this.mask_cpf"
                      v-model="contactInfo.document_value"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      outlined
                      dense
                      label="Data de Nascimento"
                      type="date"
                      v-model="contactInfo.birthdate"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-autocomplete
                      attach
                      ref="searchNationality"
                      dense
                      outlined
                      hide-details
                      clearable
                      class="pb-2"
                      v-model="contactInfo.nationality"
                      item-text="name"
                      item-value="name"
                      label="Nacionalidade"
                      :items="nationalities"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-select
                      attach
                      :items="skinColorOptions"
                      item-text="text"
                      item-value="value"
                      hide-details
                      dense
                      label="Cor/Raça"
                      outlined
                      v-model="contactInfo.color_race"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-select
                      attach
                      :items="genderOptions"
                      item-text="text"
                      item-value="value"
                      hide-details
                      dense
                      label="Gênero"
                      outlined
                      v-model="contactInfo.gender"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-select
                      attach
                      :items="deficiencyOptions"
                      item-text="text"
                      item-value="value"
                      hide-details
                      dense
                      label="Deficiência"
                      outlined
                      v-model="addDeficiency"
                    />
                  </v-col>

                  <v-col cols="12" v-if="addDeficiency">
                    <v-text-field
                      hide-details
                      dense
                      label="Deficiência"
                      outlined
                      v-model="contactInfo.deficiency"
                    />
                  </v-col>

                  <v-col cols="12">
                    <span class="title_wrapper mt-4">
                      <i class="material-symbols-rounded"> phone_enabled</i>
                      Contato Pessoal
                    </span>
                  </v-col>

                  <v-col cols="12">
                    <span
                      v-for="(email, email_index) in addedEmails"
                      :key="'email_index_' + email_index"
                      class="action_button_wrapper"
                    >
                      <v-text-field
                        dense
                        :label="
                          email_index >= 1 ? 'E-mail' : 'E-mail Principal'
                        "
                        outlined
                        v-model="email.value"
                        :class="
                          email_index < addedEmails.length - 1 ? 'pb-2' : 'pb-0'
                        "
                        :rules="emailRules"
                        hide-details="auto"
                      />

                      <i
                        class="material-symbols-rounded v-icon"
                        @click="handleDeleteMedias(email_index, 'email')"
                        v-if="email_index >= 1"
                      >
                        delete
                      </i>
                    </span>

                    <span class="action_link" @click="handleAddMedias('email')">
                      + Adicionar e-mail
                    </span>
                  </v-col>

                  <v-col cols="12">
                    <span
                      v-for="(phone, phone_index) in addedPhones"
                      :key="'phone_index' + phone_index"
                      class="d-flex align-center action_button_wrapper"
                    >
                      <v-text-field
                        hide-details="auto"
                        dense
                        :label="
                          phone_index >= 1 ? 'Telefone' : 'Telefone Principal'
                        "
                        outlined
                        :class="
                          phone_index < addedPhones.length - 1 ? 'pb-2' : 'pb-0'
                        "
                        v-model="phone.value"
                        v-mask="maskPhone(phone.value)"
                        :rules="phoneRules"
                        :messages="phoneValidationMessages"
                      />

                      <i
                        class="material-symbols-rounded v-icon"
                        @click="handleDeleteMedias(phone_index, 'phone')"
                        v-if="phone_index >= 1"
                      >
                        delete
                      </i>
                    </span>
                    <span class="action_link" @click="handleAddMedias('phone')">
                      + Adicionar telefone</span
                    >
                  </v-col>
                </v-row>
              </v-col>

              <v-col lg="6">
                <v-row
                  v-for="(
                    address, address_index
                  ) in contactInfo.contact_address"
                  :key="address_index"
                >
                  <v-col cols="12" :class="address_index >= 1 ? 'mt-4' : ''">
                    <span class="d-flex">
                      <span class="title_wrapper">
                        <i class="material-symbols-rounded"> home</i>
                        {{
                          address_index >= 1
                            ? 'Endereço'
                            : 'Endereço Residencial'
                        }}
                      </span>
                      <span
                        v-if="address_index >= 1"
                        class="material-symbols-rounded action_button_wrapper"
                        @click="handleDeleteAddress()"
                        >delete</span
                      >
                    </span>
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      label="CEP"
                      required
                      outlined
                      dense
                      v-mask="'#####-###'"
                      :rules="cepRules"
                      @keydown.enter="cepSearch(address.zipCode, address_index)"
                      @click:append="cepSearch(address.zipCode, address_index)"
                      @blur="cepSearch(address.zipCode, address_index)"
                      hide-details="auto"
                      v-model="address.zipCode"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      hide-details
                      dense
                      label="Logradouro"
                      outlined
                      v-model="address.location"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      hide-details
                      dense
                      label="Número"
                      outlined
                      v-model="address.number"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      hide-details
                      dense
                      label="Complemento"
                      outlined
                      v-model="address.complement"
                    />
                  </v-col>

                  <v-col cols="12">
                    <v-text-field
                      hide-details
                      dense
                      label="Bairro"
                      outlined
                      v-model="address.neighborhood"
                    />
                  </v-col>

                  <v-col cols="6" class="pb-0">
                    <v-text-field
                      hide-details
                      dense
                      label="Estado"
                      outlined
                      v-model="address.state"
                    />
                  </v-col>

                  <v-col cols="6" class="pb-0">
                    <v-text-field
                      hide-details
                      dense
                      label="Cidade"
                      outlined
                      v-model="address.city"
                    />
                  </v-col>

                  <v-col cols="12" class="py-0">
                    <span
                      class="action_link"
                      @click="handleAddAddress()"
                      v-if="contactInfo.contact_address.length < 2"
                    >
                      + Adicionar endereço
                    </span>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-tab-item>
        </v-tabs-items>
      </v-card-text>

      <v-divider />

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
import { required } from 'vuelidate/lib/validators'

import { mapGetters } from 'vuex'

export default {
  data: () => ({
    datePicker: false,
    userInfo: '',
    showDialog: false,
    activeTab: 0,
    tabs: ['Dados de contato', 'Outras informações'],
    contactInfo: {},
    addedCompany: {},
    addSocialName: false,
    addedEmails: '',
    addedPhones: '',
    socialNetworks: [
      {
        active: true,
        type_id: 6,
        contact_id: '',
        value: '',
        created_at: new Date(),
        label: 'Facebook',
      },
      {
        active: true,
        type_id: 7,
        contact_id: '',
        value: '',
        created_at: new Date(),
        label: 'Instagram',
      },
      {
        active: true,
        type_id: 8,
        contact_id: '',
        value: '',
        created_at: new Date(),
        label: 'Linkedin',
      },
      {
        active: true,
        type_id: 9,
        contact_id: '',
        value: '',
        created_at: new Date(),
        label: 'TikTok',
      },
    ],
    skinColorOptions: [
      { text: 'Indígena', value: 'indigenous ' },
      { text: 'Branca', value: 'white ' },
      { text: 'Preta', value: 'black ' },
      { text: 'Amarela', value: 'yellow ' },
      { text: 'Parda', value: 'dun ' },
      { text: 'Não informado', value: 'na ' },
    ],
    genderOptions: [
      { text: 'Homem', value: 'man ' },
      { text: 'Mulher', value: 'women ' },
      { text: 'Mulher Trans', value: 'trans_woman ' },
      { text: 'Homem Trans', value: 'trans_man ' },
      { text: 'Travesti', value: 'transvestite ' },
      { text: 'Transexual', value: 'transsexual ' },
      { text: 'Queer', value: 'queer ' },
      { text: 'Não-binário', value: 'non_binary ' },
      { text: 'Gênero fluído', value: 'fluid_genre ' },
      { text: 'Transgênero', value: 'transgender' },
      { text: 'Prefiro não responder', value: 'rather_not_answer ' },
      { text: 'Outro(s)', value: 'others ' },
    ],
    deficiencyOptions: [
      { text: 'Sim', value: true },
      { text: 'Não', value: false },
    ],
    addDeficiency: false,
  }),
  validations: {
    contactInfo: {
      name: { required },
    },
  },
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      departments: 'Contact/departments',
      pendingChanges: 'Global/pendingChanges',
      positions: 'Contact/positions',
      nationalities: 'Contact/nationalities',
      mediaTypes: 'Global/mediaTypes',
    }),
    cepRules() {
      return [(v) => (v && v.length === 9) || 'CEP Inválido']
    },
    emailMediaType() {
      return this.mediaTypes?.find((media) => media.base === 'mail')?.id
    },
    phoneMediaType() {
      return this.mediaTypes?.find(
        (media) => media.base === 'mobile' || media.base === 'landline'
      )?.id
    },
  },
  mounted() {
    this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
    this.handleSetInitialData()
  },
  methods: {
    filteredCompany(element) {
      if (this.contactInfo?.companies?.length >= 1) {
        if (
          !this.contactInfo?.companies.some(
            (company) =>
              company.identifier === `${element?.name} - ${element?.cnpj}`
          )
        )
          return element
        else return
      }

      return element
    },
    openOnNewTab(url) {
      var a = document.createElement('a')
      a.href = url
      var evt = document.createEvent('MouseEvents')
      evt.initMouseEvent(
        'click',
        true,
        true,
        window,
        0,
        0,
        0,
        0,
        0,
        true,
        false,
        false,
        false,
        0,
        null
      )
      a.dispatchEvent(evt)
    },
    formatDate(date) {
      return date ? this.$moment(date).format('DD/MM/yyyy') : ''
    },
    async cepSearch(zipCode, index) {
      if (zipCode?.length === 9) {
        const searchZipCode = this.onlyNumbers(zipCode)
        if (searchZipCode.length === 8) {
          const { bairro, logradouro, localidade, uf } =
            await this.$viaCep.buscarCep(searchZipCode)

          this.contactInfo.contact_address[index].city = localidade
          this.contactInfo.contact_address[index].state = uf
          this.contactInfo.contact_address[index].neighborhood = bairro
          this.contactInfo.contact_address[index].location = logradouro
        }
      }
    },
    async handleSubmit() {
      this.$v.contactInfo.$touch()

      if (this.$v.contactInfo.$error) return

      if (this.addedCompany.company_id > 0) {
        await this.handleAddCompany()
        await this.$nextTick()
      }

      // Create contact
      const contact = {
        external_id: '',
        external_hs_id: '',
        origin: 'user',
        superior_id: 14,
        name: this.contactInfo.name,
        social_name: this.contactInfo.social_name,
        document_type: 'cpf',
        document_value: this.contactInfo.document_value
          ? this.onlyNumbers(this.contactInfo.document_value)
          : '',
        color_race: this.contactInfo.color_race,
        gender: this.contactInfo.gender,
        deficiency: this.addDeficiency ? this.contactInfo.deficiency : '',
        nationality: this.contactInfo.nationality,
        created_at: new Date(),
        updated_at: new Date(),
        birthdate:
          this.contactInfo.birthdate &&
          !isNaN(new Date(this.contactInfo.birthdate))
            ? new Date(this.contactInfo.birthdate)
            : null,
        active: true,
      }

      const response = await this.createItem('/customer/contact', contact)

      if (response?.success && response?.id) {
        await this.createContactMedias(response.id)
        await this.createContactAddress(response.id)
        await this.createCompanyContact(response.id)

        await this.handleCloseModal()

        // Open contact on new tab
        const route = this.$router.resolve({
          path: `/contact/${response.id}`,
        })

        // Call table update
        if (this.$route.path === '/contact') this.$emit('addContact')

        this.openOnNewTab(route?.href)
      }
    },
    async handleSelectCompanyAutoComplete(companyData) {
      if (companyData) {
        let companyID = ''
        // Create company from bureau
        if (!companyData?.local_company_id) {
          const identifier = companyData?.cnpj.replace(/[^A-Z0-9]/gi, '')
          const {
            data: { data },
          } = await this.$axios.put(
            `/customer/official-data-by-identifier?identifier=${identifier}`
          )

          companyID = data[0].id
        } else companyID = companyData?.local_company_id

        this.addedCompany.company_id = companyID
        this.addedCompany.identifier =
          companyData?.name + ' - ' + companyData?.cnpj
      } else {
        this.resetAddedCompany()
      }
    },
    async createContactMedias(id) {
      const contactMedias = [
        ...this.addedEmails,
        ...this.addedPhones,
        ...this.socialNetworks,
      ]
        .filter((item) => item.value !== '')
        .map((media) => {
          media.contact_id = id
          return media
        })

      if (contactMedias.length >= 1)
        await this.createItem('/customer/bulk/contact-media', contactMedias, {
          fireSuccessAlert: false,
        })
    },
    async createContactAddress(id) {
      if (this.contactInfo.contact_address[0].zipCode?.length >= 8) {
        const contactAddress = this.contactInfo.contact_address
          .filter((item) => this.onlyNumbers(item.zipCode).length === 8)
          .map((address) => {
            address.contact_id = id
            return address
          })

        if (contactAddress.length >= 1)
          await this.createItem(
            '/customer/bulk/contact-address',
            contactAddress,
            { fireSuccessAlert: false }
          )
      }
    },
    async createCompanyContact(id) {
      const contactCompanies = this.contactInfo.companies.map((company) => {
        company.contact_id = id

        const companyList = Object.assign({}, company)

        delete companyList.position
        delete companyList.identifier
        delete companyList.addedCompanyEmails
        delete companyList.addedCompanyPhones
        delete companyList.contact_medias

        return companyList
      })

      if (contactCompanies.length >= 1) {
        const response = await this.createItem(
          '/customer/bulk/company-contact',
          contactCompanies,
          { fireSuccessAlert: false }
        )

        if (response?.success && response?.data) {
          await this.createCompanyContactPositions(response?.data)
          await this.createContactCompanyMedias(response?.data)
        }
      }
    },
    async createContactCompanyMedias(companiesArray) {
      const companyContactMedias = this.contactInfo.companies.map(
        (company, index) =>
          company.contact_medias
            .filter((m) => m.value !== '')
            .map((media) => {
              media.company_contact_id = companiesArray[index].id
              return media
            })
      )

      if (companyContactMedias && companyContactMedias.flat(1).length >= 1) {
        await this.createItem(
          '/customer/bulk/contact-company-media',
          companyContactMedias.flat(1),
          { fireSuccessAlert: false }
        )
      }
    },
    async createCompanyContactPositions(companiesArray) {
      const contactPositions = this.contactInfo.companies.map(
        (company, index) => {
          company.position.company_contact_id = companiesArray[index].id
          company.position.creator_id = this.userInfo.id
          return company.position
        }
      )

      if (contactPositions.length >= 1) {
        await this.createItem(
          '/customer/bulk/contact-position',
          contactPositions,
          { fireSuccessAlert: false }
        )
      }
    },
    handleAddMedias(type) {
      if (type === 'email') {
        this.addedEmails.push({
          contact_id: 0,
          active: true,
          type_id: this.emailMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }
      if (type === 'phone') {
        this.addedPhones.push({
          contact_id: 0,
          active: true,
          type_id: this.phoneMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }
    },
    handleDeleteMedias(index, type) {
      if (type === 'email' && index) this.addedEmails.splice(index, 1)
      else if (type === 'phone' && index) this.addedPhones.splice(index, 1)
    },
    handleAddCompanyMedias(type) {
      if (type === 'email') {
        this.addedCompany.addedCompanyEmails.push({
          company_contact_id: 0,
          active: true,
          type_id: this.emailMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }

      if (type === 'phone') {
        this.addedCompany.addedCompanyPhones.push({
          company_contact_id: 0,
          active: true,
          type_id: this.phoneMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }
    },
    handleDeleteCompanyMedias(index, type) {
      if (type === 'email' && index)
        this.addedCompany.addedCompanyEmails.splice(index, 1)
      else if (type === 'phone' && index)
        this.addedCompany.addedCompanyPhones.splice(index, 1)
    },
    handleAddAddress() {
      this.contactInfo.contact_address.push({
        contact_id: 0,
        origin: 'user',
        location: '',
        number: '',
        neighborhood: '',
        complement: '',
        city: '',
        state: '',
        zipcode: '',
        created_at: new Date(),
        updated_at: new Date(),
        type: 'contact_address ',
      })
    },
    handleDeleteAddress() {
      this.contactInfo.contact_address.splice(1, 1)
    },
    handleAddCompany() {
      this.contactInfo.companies.push({
        contact_id: this.addedCompany.contact_id,
        company_id: this.addedCompany.company_id,
        preferential: this.contactInfo.companies.length < 1 ? true : false,
        active: true,
        primary_company: this.contactInfo.companies.length < 1 ? true : false,
        position: this.addedCompany.position,
        contact_medias: [
          ...this.addedCompany.addedCompanyEmails,
          ...this.addedCompany.addedCompanyPhones,
        ],
        identifier: this.addedCompany.identifier,
        financial_responsible: this.addedCompany.financial_responsible,
        project_responsible: this.addedCompany.project_responsible,
      })

      this.resetAddedCompany()
      this.$refs.searchCompany.clearCachedItems()
    },
    handleDeleteCompany(index) {
      this.contactInfo.companies.splice(index, 1)

      if (
        this.contactInfo.companies?.length >= 1 &&
        !this.contactInfo.companies?.some((company) => company.primary_company)
      )
        this.contactInfo.companies[0].primary_company = true
    },
    handleChangePrimaryCompany(isPrimary, index) {
      if (!isPrimary) {
        const primaryCompanyIndex = this.contactInfo.companies.findIndex(
          (item) => item.primary_company
        )

        this.contactInfo.companies[primaryCompanyIndex].primary_company = false
        this.contactInfo.companies[index].primary_company = true
      }
    },
    handleCloseModal() {
      this.showDialog = false
      this.activeTab = 0
      this.handleSetInitialData()

      this.$v.contactInfo.$reset()
    },
    resetAddedCompany() {
      this.addedCompany = {
        contact_id: 0,
        company_id: 0,
        preferential: false,
        active: true,
        primary_company: false,
        financial_responsible: false,
        project_responsible: false,
        position: {
          company_contact_id: 0,
          active: true,
          sector: '',
          position: '',
          department: '',
          reason: 'inclusion',
          creator_id: 0,
          resignation_date: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
        addedCompanyEmails: [
          {
            company_contact_id: 0,
            active: true,
            type_id: this.emailMediaType,
            origin: 'user',
            value: '',
            extra: '',
          },
        ],
        addedCompanyPhones: [
          {
            company_contact_id: 0,
            active: true,
            type_id: this.phoneMediaType,
            origin: 'user',
            value: '',
            extra: '',
          },
        ],
      }
    },
    handleSetInitialData() {
      // AddedCompany initial Data
      this.resetAddedCompany()

      // Contact info initial Data
      this.contactInfo = {
        active: '',
        companies: [],
        created_at: '',
        document_type: 'cpf',
        document_value: '',
        external_hs_id: '',
        external_id: '',
        id: '',
        medias: [],
        name: '',
        social_name: '',
        origin: '',
        superior_id: '',
        updated_at: '',
        birthdate: '',
        color_race: '',
        gender: '',
        deficiency: '',
        nationality: 'Brasileiro',
        financial_responsible: false,
        responsible_project: false,
        contact_address: [
          {
            contact_id: 0,
            origin: 'user',
            location: '',
            number: '',
            neighborhood: '',
            complement: '',
            city: '',
            state: '',
            zipcode: '',
            created_at: new Date(),
            updated_at: new Date(),
            type: 'contact_address',
            primary_company: true,
          },
        ],
      }

      this.addedEmails = [
        {
          contact_id: 0,
          active: true,
          type_id: this.emailMediaType,
          origin: 'user',
          value: '',
          extra: '',
        },
      ]
      this.addedPhones = [
        {
          contact_id: 0,
          active: true,
          type_id: this.phoneMediaType,
          origin: 'user',
          value: '',
          extra: '',
        },
      ]
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

      .v-tabs {
        .v-tab {
          letter-spacing: initial !important;
          font-size: 1rem !important;
          text-transform: initial !important;
          font-weight: 500;
        }

        .v-tab--active {
          color: var(--v-primary-base);
        }

        .v-item-group .active_menu {
          font-weight: 600;
          opacity: 1;
        }

        .v-slide-group__wrapper::after {
          content: '';
          width: 100%;
          height: 2px;
          border-bottom: 2px solid var(--v-default-text-base) !important;
          position: absolute;
          bottom: 0;
          opacity: 0.3;
        }
      }

      .form_content {
        padding: 3rem 0 2rem !important;

        .companies_list {
          width: 100%;
          max-height: 25vh;
          padding: 1rem 0;

          @include thin-scrollbar;

          .header {
            display: flex;
            justify-content: space-between;
            font-weight: 600;
            font-size: 1rem;
            color: var(--v-default-text-base);
            width: 100%;

            .actions {
              display: flex;
              justify-content: space-between;

              position: relative;

              span {
                position: absolute;

                &:first-child {
                  right: 5vw;
                }

                &:last-child {
                  right: 0;
                }
              }
            }
          }

          .list_items {
            display: flex;
            justify-content: space-between;
            align-items: center;

            width: 100%;
            color: var(--v-sub-text-base);
            font-weight: 400;
            padding: 0.4rem 2rem;

            .actions {
              display: flex;
              justify-content: space-between;
              align-items: center;

              text-align: center;
              position: relative;

              &.disabled_click > i:first-child {
                cursor: default !important;
              }

              i {
                position: absolute;
                cursor: pointer;

                &:first-child {
                  right: 4.2vw;
                }

                &:last-child {
                  right: -1rem;
                }
              }

              .active {
                color: var(--v-primary-base);
              }
            }
          }
        }
      }

      .title_wrapper {
        display: flex;
        align-items: center;

        font-size: 1rem;
        font-weight: 600;

        i {
          color: var(--v-primary-base);
          padding-right: 0.3rem;
        }
      }

      .col {
        padding: 4px 12px;

        .v-input {
          &:hover {
            fieldset {
              border: 1px solid var(--v-stroke-darken1) !important;
            }
          }

          fieldset {
            border: 1px solid var(--v-stroke-base);
          }

          input,
          .v-select__selections {
            color: var(--v-default-text-base);
          }

          .v-label {
            font-size: 0.9rem !important;
          }
        }

        .action_link {
          color: var(--v-primary-base);
          font-weight: 600;
          font-size: 12px;
          cursor: pointer;
        }

        .action_button_wrapper {
          display: flex;
          align-items: center;

          i,
          &.material-symbols-rounded {
            color: var(--v-sub-text-base);
            cursor: pointer;
            padding-left: 0.4rem;
          }
        }
      }
    }
  }
}
</style>
