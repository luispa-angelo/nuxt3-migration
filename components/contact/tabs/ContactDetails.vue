<template>
  <div class="details_container">
    <slot name="action-button" :onCLick="handleActionButtonClick" />

    <v-row class="contact_info_wrapper" v-if="!pending">
      <v-col lg="3" v-for="item in contactDetails" :key="item.id">
        <h6 class="info_title">{{ item.tabName }}</h6>

        <span v-if="item.tabName === 'Dados Pessoais'">
          <div
            class="list_item"
            v-for="(item, item_index) in item.fields"
            :key="'field' + item_index"
          >
            <span v-if="item.text">{{ item.text }}</span>

            <span
              :class="
                !contact[`${item.value}`] || contact[`${item.value}`] === '0'
                  ? 'empty'
                  : ''
              "
            >
              <v-tooltip
                bottom
                :disabled="
                  contact[`${item.value}`] &&
                  contact[`${item.value}`].length >= 24
                    ? false
                    : true
                "
              >
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on">
                    {{
                      handleContactPersonalData(
                        contact[`${item.value}`],
                        item.text
                      )
                    }}
                  </span>
                </template>

                <span>
                  {{
                    item.text === 'CPF'
                      ? maskCpf(contact[`${item.value}`])
                      : contact[`${item.value}`]
                  }}
                </span>
              </v-tooltip>
            </span>
          </div>
        </span>

        <span v-if="item.tabName === 'Contato Pessoal' && contactMedia">
          <div
            class="list_item truncate"
            v-for="(item, media_index) in contactMedia"
            :key="item + '-' + media_index"
          >
            <span class="d-flex align-center flex-start">
              <v-tooltip
                bottom
                :disabled="item.value.length >= 48 ? false : true"
              >
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on"> {{ item.value }} </span>
                </template>

                <span>
                  {{ item.value }}
                </span>
              </v-tooltip>

              <i
                style="color: var(--v-primary-base); cursor: pointer"
                class="material-symbols-rounded v-icon"
                @click="copyContent(item.value)"
                v-tooltip="{
                  content: `
              <div class='v-btn-tooltip'>
                Copiar
              </div>
            `,
                  placement: 'bottom-center',
                }"
              >
                content_copy
              </i>
            </span>
          </div>
        </span>

        <span v-if="item.tabName === 'Endereço Residencial'">
          <div
            class="list_item"
            v-for="(item, item_index) in item.fields"
            :key="'field' + item_index"
          >
            <span>{{ item.text }}</span>

            <span
              :class="
                !contact.addresses ||
                !contact.addresses.at(-1) ||
                !contact.addresses.at(-1)[`${item.value}`]
                  ? 'empty'
                  : ''
              "
            >
              {{
                contact.addresses &&
                contact.addresses[0] &&
                contact.addresses[0][`${item.value}`]
                  ? contact.addresses[0][`${item.value}`]
                  : 'Não informado'
              }}
            </span>
          </div>
        </span>

        <span v-if="item.tabName === 'Social'">
          <div
            class="list_item"
            v-for="(item, item_index) in item.fields"
            :key="'field' + item_index"
          >
            <a
              :href="
                contact.medias.find(
                  (media) => media.media_type.name === item.name
                ).value
              "
              target="_blank"
              v-if="
                contact.medias &&
                contact.medias.find(
                  (media) =>
                    media.media_type.name === item.name &&
                    media.type_id > 0 &&
                    media.value
                )
              "
              >{{ item.text }}</a
            >
          </div>
        </span>
      </v-col>
    </v-row>

    <v-row class="contact_info_wrapper" v-if="pending">
      <v-col lg="4">
        <h6 class="info_title">Dados Pessoais</h6>

        <v-row>
          <v-col cols="12">
            <v-text-field
              hide-details
              dense
              label="Nome Completo"
              outlined
              class="pb-2"
              v-model="contactInfo.name"
            />

            <span
              class="action_link"
              @click="addSocialName = !addSocialName"
              v-if="!addSocialName && !contactInfo.social_name"
            >
              + Adicionar nome social</span
            >

            <span
              class="action_button_wrapper"
              v-if="addSocialName || contactInfo.social_name !== ''"
            >
              <v-text-field
                hide-details
                dense
                label="Nome Social"
                outlined
                v-model="contactInfo.social_name"
              />

              <i
                class="material-symbols-rounded v-icon"
                @click="removeSocialName()"
              >
                delete
              </i>
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
        </v-row>
      </v-col>

      <v-col lg="4">
        <h6 class="info_title">Contato Pessoal</h6>
        <v-row>
          <v-col cols="12">
            <span
              v-for="(email, email_index) in contactInfo.addedEmails"
              :key="'email_index_' + email_index"
              class="action_button_wrapper"
            >
              <template v-if="email.active">
                <v-text-field
                  dense
                  :label="email_index >= 1 ? 'E-mail' : 'E-mail Principal'"
                  outlined
                  v-model="email.value"
                  :class="
                    email_index < contactInfo.addedEmails.length - 1
                      ? 'pb-2'
                      : 'pb-0'
                  "
                  :rules="emailRules"
                  hide-details="auto"
                />

                <i
                  class="material-symbols-rounded v-icon"
                  @click="handleDeleteMedias(email_index, 'email')"
                >
                  delete
                </i>
              </template>
            </span>

            <span class="action_link" @click="handleAddMedias('email')">
              + Adicionar e-mail
            </span>
          </v-col>

          <v-col cols="12">
            <span
              v-for="(phone, phone_index) in contactInfo.addedPhones"
              :key="'phone_index' + phone_index"
              class="action_button_wrapper"
            >
              <template v-if="phone.active">
                <v-text-field
                  hide-details="auto"
                  dense
                  :label="phone_index >= 1 ? 'Telefone' : 'Telefone Principal'"
                  outlined
                  :class="
                    phone_index < contactInfo.addedPhones.length - 1
                      ? 'pb-2'
                      : 'pb-0'
                  "
                  v-model="phone.value"
                  v-mask="maskPhone(phone.value)"
                  :rules="phoneRules"
                  :messages="phoneValidationMessages"
                />

                <i
                  class="material-symbols-rounded v-icon"
                  @click="handleDeleteMedias(phone_index, 'phone')"
                >
                  delete
                </i>
              </template>
            </span>
            <span class="action_link" @click="handleAddMedias('phone')">
              + Adicionar telefone</span
            >
          </v-col>
        </v-row>

        <h6 class="info_title">Social</h6>
        <v-row>
          <v-col
            cols="12"
            v-for="(social, socialIndex) in contactInfo.socialNetworks"
            :key="socialIndex"
          >
            <v-text-field
              hide-details
              dense
              :label="social.label"
              outlined
              v-model="social.value"
              v-if="social.type_id > 0"
            />
          </v-col>
        </v-row>
      </v-col>

      <v-col lg="4">
        <span
          v-for="(address, address_index) in contactInfo.addresses"
          :key="address_index"
        >
          <span class="action_button_wrapper">
            <h6 class="info_title">
              {{ address_index >= 1 ? 'Endereço' : 'Endereço Principal' }}
            </h6>

            <i
              class="material-symbols-rounded v-icon"
              @click="handleDeleteAddress(address.id, address_index)"
            >
              delete
            </i>
          </span>

          <v-row>
            <v-col cols="12">
              <v-text-field
                class="pb-1"
                label="CEP"
                required
                outlined
                dense
                v-mask="'#####-###'"
                :rules="cepRules"
                @keydown.enter="cepSearch(address.zipcode, address_index)"
                @click:append="cepSearch(address.zipcode, address_index)"
                @blur="cepSearch(address.zipcode, address_index)"
                hide-details="auto"
                v-model="address.zipcode"
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

            <v-col cols="6">
              <v-text-field
                hide-details
                dense
                label="Estado"
                outlined
                v-model="address.state"
              />
            </v-col>

            <v-col cols="6">
              <v-text-field
                hide-details
                dense
                label="Cidade"
                outlined
                v-model="address.city"
              />
            </v-col>
          </v-row>
        </span>

        <v-col cols="12" class="pt-4" v-if="contactInfo.addresses.length < 2">
          <span class="action_link" @click="handleAddAddress(1)">
            + Adicionar endereço
          </span>
        </v-col>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'

import { mapGetters } from 'vuex'

export default {
  props: {
    pending: Boolean,
  },
  data: () => ({
    datePicker: false,
    contactDetails: [
      {
        id: 0,
        tabName: 'Dados Pessoais',
        fields: [
          { text: 'Nome', label: 'Nome Completo', value: 'name' },
          { text: 'Nome Social', value: 'social_name' },
          { text: 'CPF', label: 'CPF', value: 'document_value' },
          { text: 'Nacionalidade', value: 'nationality' },
          { text: 'Gênero', value: 'gender' },
          { text: 'Data Nascimento', value: 'birthdate' },
          { text: 'Cor/Raça', value: 'color_race' },
          { text: 'Deficiência', value: 'deficiency' },
        ],
      },
      {
        id: 1,
        tabName: 'Contato Pessoal',
      },
      {
        id: 2,
        tabName: 'Endereço Residencial',
        fields: [
          { text: 'Rua', value: 'location' },
          { text: 'Número', value: 'number' },
          { text: 'Complemento', value: 'complement' },
          { text: 'CEP', value: 'zipcode' },
          { text: 'Bairro', value: 'neighborhood' },
          { text: 'Cidade', value: 'city' },
          { text: 'Estado', value: 'state' },
        ],
      },
      {
        id: 3,
        tabName: 'Social',
        fields: [
          { text: 'Facebook', name: 'Facebook' },
          { text: 'Linkedin', name: 'Linkedin' },
          { text: 'Instagram', name: 'Instagram' },
          { text: 'TikTok', name: 'TikTok' },
        ],
      },
    ],
    contactInfo: {
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
      addresses: [],
      addedEmails: [],
      addedPhones: [],
      socialNetworks: [
        {
          id: 0,
          active: true,
          contact_id: '',
          type_id: 0,
          value: '',
          label: 'Facebook',
        },
        {
          id: 0,
          active: true,
          contact_id: '',
          type_id: 0,
          value: '',
          label: 'Instagram',
        },
        {
          id: 0,
          active: true,
          contact_id: '',
          type_id: 0,
          value: '',
          label: 'Linkedin',
        },
        {
          id: 0,
          active: true,
          contact_id: '',
          type_id: 0,
          value: '',
          label: 'TikTok',
        },
      ],
    },
    addSocialName: false,
    skinColorOptions: [
      { text: 'Indígena', value: 'indigenous' },
      { text: 'Branca', value: 'white' },
      { text: 'Preta', value: 'black' },
      { text: 'Amarela', value: 'yellow' },
      { text: 'Parda', value: 'dun' },
      { text: 'Não informado', value: 'na' },
    ],
    genderOptions: [
      { text: 'Homem', value: 'man' },
      { text: 'Mulher', value: 'women' },
      { text: 'Mulher Trans', value: 'trans_woman' },
      { text: 'Homem Trans', value: 'trans_man' },
      { text: 'Travesti', value: 'transvestite' },
      { text: 'Transexual', value: 'transsexual' },
      { text: 'Queer', value: 'queer' },
      { text: 'Não-binário', value: 'non_binary' },
      { text: 'Gênero fluído', value: 'fluid_genre' },
      { text: 'Transgênero', value: 'transgender' },
      { text: 'Prefiro não responder', value: 'rather_not_answer' },
      { text: 'Outro(s)', value: 'others' },
    ],
    deficiencyOptions: [
      { text: 'Sim', value: true },
      { text: 'Não', value: false },
    ],
    removedAddresses: [],
    addDeficiency: false,
    loaded: false,
    auxContactInfo: null,
  }),
  validations: {
    contactInfo: {
      name: { required },
    },
  },
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      pendingChanges: 'Global/pendingChanges',
      nationalities: 'Contact/nationalities',
      mediaTypes: 'Global/mediaTypes',
    }),
    emailMediaType() {
      return this.mediaTypes?.find((media) => media.base === 'mail')?.id
    },
    phoneMediaType() {
      return this.mediaTypes?.find(
        (media) => media.base === 'mobile' || media.base === 'landline'
      )?.id
    },
    cepRules() {
      return [(v) => (v && v.length === 9) || 'CEP Inválido']
    },
    contactMedia() {
      return this.contact?.medias
        ?.filter(
          (media) =>
            media.active &&
            (media?.media_type?.base === 'mail' ||
              media?.media_type?.base === 'mobile' ||
              media?.media_type?.base === 'landline')
        )
        .sort((a, b) => a.media_type?.base.localeCompare(b.media_type?.base))
    },
    contactSocialMedia() {
      return this.contact?.medias?.filter(
        (media) => media?.active && media?.media_type?.base === 'social'
      )
    },
  },
  watch: {
    contactInfo: {
      handler() {
        if (this.loaded)
          if (
            JSON.stringify(this.auxContactInfo) !==
            JSON.stringify(this.contactInfo)
          )
            this.$store.dispatch('Global/setPendingChanges', true)
          else this.$store.dispatch('Global/setPendingChanges', false)
      },
      deep: true,
    },
  },
  async mounted() {
    if (this.mediaTypes) {
      this.contactInfo.socialNetworks.forEach(
        (media) =>
          (media.type_id = this.mediaTypes?.find(
            (item) => item.name === media.label
          )?.id)
      )
    }
  },
  methods: {
    copyContent(content) {
      navigator.clipboard.writeText(content)
    },
    formatDate(date) {
      return date ? this.$moment(date).format('DD/MM/yyyy') : ''
    },
    removeSocialName() {
      this.addSocialName = false
      this.contactInfo.social_name = ''
    },
    async handleActionButtonClick(pending) {
      if (pending) {
        this.loaded = false

        await this.mergeContactData()

        this.auxContactInfo = structuredClone(this.contactInfo)

        return (this.loaded = true)
      }

      await this.handleSubmit()
    },
    async cepSearch(zipCode, index) {
      if (zipCode?.length === 9) {
        const searchZipCode = this.onlyNumbers(zipCode)

        if (searchZipCode.length === 8) {
          const { bairro, logradouro, localidade, uf } =
            await this.$viaCep.buscarCep(searchZipCode)

          this.contactInfo.addresses[index].city = localidade
          this.contactInfo.addresses[index].state = uf
          this.contactInfo.addresses[index].neighborhood = bairro
          this.contactInfo.addresses[index].location = logradouro
        }
      }
    },
    async handleSubmit() {
      this.$v.contactInfo.$touch()

      if (this.$v.contactInfo.$error) return

      await this.updateContactAddress()
      await this.updateContactMedias()

      const contact = {
        id: this.contactInfo.id,
        external_id: this.contactInfo.external_id,
        external_hs_id: this.contactInfo.external_hs_id,
        origin: this.contactInfo.origin,
        superior_id: this.contactInfo.superior_id,
        name: this.contactInfo.name,
        social_name: this.contactInfo.social_name,
        company_id:
          this.contactInfo?.companies && this.contactInfo?.companies.length >= 1
            ? this.contactInfo.companies[0].company_id
            : null,
        color_race: this.contactInfo.color_race,
        gender: this.contactInfo.gender,
        document_type: this.contactInfo.document_type,
        document_value: this.contactInfo.document_value
          ? this.onlyNumbers(this.contactInfo.document_value)
          : '',
        deficiency: this.addDeficiency ? this.contactInfo.deficiency : '',
        nationality: this.contactInfo.nationality,
        created_at: this.contactInfo.created_at,
        updated_at: this.contactInfo.updated_at,
        birthdate:
          this.contactInfo.birthdate &&
          !isNaN(new Date(this.contactInfo.birthdate))
            ? new Date(this.contactInfo.birthdate)
            : null,
        active: true,
      }

      await this.$store.dispatch('Contact/updContact', contact)

      await this.$emit('updateContactData')
    },
    async updateContactMedias() {
      // Inactive empty values
      const medias = [
        ...this.contactInfo.addedEmails,
        ...this.contactInfo.addedPhones,
      ]
        .filter((media) => media.id > 0)
        .map((el) => {
          if (!el?.value) el.active = false

          return el
        })

      // Medias list
      const contactMedias = [
        ...medias,
        ...this.contactInfo.socialNetworks,
      ].filter((media) => media.id > 0)

      let mediasPayload = structuredClone(contactMedias)

      mediasPayload.map((media) => {
        media.contact_id = this.contact.id
        if (media.label) delete media.label

        return media
      })

      // Insert
      await this.createContactMedias()

      // Update
      if (mediasPayload?.length >= 1) {
        await this.updateData('/customer/bulk/contact-media', mediasPayload, {
          fireSuccessAlert: false,
        })
      }
    },
    async createContactMedias() {
      const contactMedias = [
        ...this.contactInfo.addedEmails,
        ...this.contactInfo.addedPhones,
        ...this.contactInfo.socialNetworks,
      ].filter((media) => media.value !== '' && media.active && media.id < 1)

      let mediasPayload = structuredClone(contactMedias)

      mediasPayload.map((media) => {
        media.contact_id = this.contact.id
        delete media.id
        if (media.label) delete media.label

        return media
      })

      if (mediasPayload?.length >= 1) {
        await this.createItem('/customer/bulk/contact-media', mediasPayload, {
          fireSuccessAlert: false,
        })
      }
    },
    async updateContactAddress() {
      // Delete contact address
      if (this.removedAddresses.length >= 1) {
        for (let address of this.removedAddresses) {
          await this.removeItem('/customer/contact-address', address, {
            fireSuccessAlert: false,
          })
        }

        this.removedAddresses = []
      }

      // Insert
      await this.createContactAddress()

      // Update
      const contactAddress = this.contactInfo.addresses
        .filter((item) => item.id > 0)
        .map((address) => {
          address.contact_id = this.contact.id
          return address
        })

      if (contactAddress.length >= 1)
        await this.updateData(
          '/customer/bulk/contact-address',
          contactAddress,
          {
            fireSuccessAlert: false,
          }
        )
    },
    async createContactAddress() {
      const contactAddress = this.contactInfo.addresses
        .filter(
          (item) => this.onlyNumbers(item.zipcode).length === 8 && item.id < 1
        )
        .map((address) => {
          delete address.id
          return address
        })

      if (contactAddress && contactAddress.length >= 1) {
        await this.createItem(
          '/customer/bulk/contact-address',
          contactAddress,
          {
            fireSuccessAlert: false,
          }
        )
      }
    },
    async mergeContactData() {
      this.contactInfo = Object.assign(this.contactInfo, this.contact)

      // Handle contact birthdate
      if (this.contactInfo.birthdate)
        this.contactInfo.birthdate = this.$moment(
          this.contactInfo.birthdate
        ).format('YYYY-MM-DD')

      // Contact Nationality
      if (this.contact?.nationality) {
        await this.$nextTick()
        if (this.$refs.searchNationality) {
          this.$refs.searchNationality.search = this.contact?.nationality
          this.$refs.searchNationality.value = this.contact?.nationality
        }
      }

      // Contact Emails
      this.contactInfo.addedEmails = Object.assign(
        [],
        this.contact?.medias?.filter(
          (media) => media?.media_type?.base === 'mail' && media?.active
        )
      )

      // Contact Phones
      this.contactInfo.addedPhones = Object.assign(
        [],
        this.contact?.medias?.filter(
          (media) =>
            (media?.media_type?.base === 'mobile' ||
              media?.media_type?.base === 'landline') &&
            media?.active
        )
      )

      // Contact Address
      this.contactInfo.addresses = this.contact?.addresses
        ? structuredClone(this.contact?.addresses)
        : []

      // Populate the first value when they not exist
      if (this.contactInfo.addedEmails.length < 1) this.handleAddMedias('email')
      if (this.contactInfo.addedPhones.length < 1) this.handleAddMedias('phone')
      if (this.contactInfo?.addresses?.length < 1) this.handleAddAddress()

      // Merge social medias
      this.contactInfo.socialNetworks.forEach((item) => {
        const mediaItem = this.contact.medias.find(
          (media) => media.media_type.name === item.label
        )

        if (mediaItem) {
          item.id = mediaItem.id
          item.value = mediaItem.value
        }
      })
    },
    handleAddMedias(type) {
      if (type === 'email') {
        this.contactInfo.addedEmails.push({
          id: 0,
          contact_id: this.contact.id,
          active: true,
          type_id: this.emailMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      } else if (type === 'phone') {
        this.contactInfo.addedPhones.push({
          id: 0,
          contact_id: this.contact.id,
          active: true,
          type_id: this.phoneMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }
    },
    handleDeleteMedias(index, type) {
      if (type === 'email') this.contactInfo.addedEmails[index].active = false
      else if (type === 'phone')
        this.contactInfo.addedPhones[index].active = false
    },
    handleAddAddress() {
      this.contactInfo.addresses.push({
        id: 0,
        contact_id: this.contact.id,
        origin: 'user',
        location: '',
        number: '',
        neighborhood: '',
        complement: '',
        city: '',
        state: '',
        zipcode: '',
        type: 'contact_address',
      })
    },
    async handleDeleteAddress(id, index) {
      if (id) this.removedAddresses.push(id)
      this.contactInfo.addresses.splice(index, 1)
    },
    handleContactPersonalData(data, type) {
      if (!data || data === '0') return 'Não informado'
      else if (type === 'Data Nascimento') return this.formatDate(data)
      else if (type === 'Gênero') {
        return data
          ? this.genderOptions?.find((option) => option.value === data)?.text
          : 'Não informado'
      } else if (type === 'Cor/Raça')
        return data
          ? this.skinColorOptions?.find((option) => option.value === data)?.text
          : 'Não informado'
      else if (type === 'CPF') return this.maskCpf(data)
      return data
    },
  },
}
</script>

<style lang="scss" scoped>
.details_container {
  .contact_info_wrapper {
    max-height: 50vh;
  }
}
</style>
