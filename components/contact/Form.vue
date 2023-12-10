<template>
  <div>
    <v-form ref="form">
      <v-row>
        <v-col
          xl="2"
          lg="2"
          md="4"
          sm="4"
          cols="12"
          class="d-flex justify-center py-3"
        >
          <FormAvatar />
        </v-col>
        <v-col xl="5" lg="5" md="4" sm="4" cols="12" class="pb-0">
          <v-text-field
            data-test="inputContactName"
            label="Nome do contato"
            v-model="formData.name"
            required
            outlined
            dense
            :error="$v.formData.name.$error"
            :error-messages="
              $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
            "
          ></v-text-field>
          <v-text-field
            data-test="inputContactCpf"
            label="Número do documento"
            v-model="formData.document_value"
            v-mask="this.mask_cpf"
            required
            outlined
            dense
          ></v-text-field>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <v-row>
            <v-col class="pt-0">
              <p class="subtitle-2 font-weight-bold bordered-title mb-3 pl-3">
                Detalhes do contato
              </p>
              <v-autocomplete
                attach
                ref="searchPosition"
                dense
                outlined
                hide-details
                clearable
                v-model="contactPosition.position"
                item-text="name"
                item-value="name"
                data-test="selectContactCargo"
                label="Cargo"
                :items="positions"
                class="pb-6"
              />

              <v-select
                attach
                clearable
                :items="departments"
                item-text="name"
                item-value="name"
                hide-details
                dense
                data-test="selectContactDepto"
                label="Departamento"
                outlined
                v-model="contactPosition.department"
              />
            </v-col>
            <v-col class="pt-0">
              <p class="subtitle-2 font-weight-bold bordered-title mb-3 pl-3">
                Mídias sociais
              </p>
              <v-text-field
                data-test="inputContactFacebook"
                label="Facebook"
                v-model="formData.facebook"
                required
                outlined
                dense
              />
              <v-text-field
                data-test="inputContactLinkedin"
                label="Linkedin"
                v-model="formData.linkedin"
                required
                outlined
                dense
              />
              <v-text-field
                data-test="inputContactInstagram"
                label="Instagram"
                v-model="formData.instagram"
                required
                outlined
                dense
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-form>

    <div v-if="!onCompanyCreate">
      <v-row>
        <v-col class="pt-0">
          <p class="subtitle-2 font-weight-bold bordered-title pl-3">
            Empresas relacionadas
          </p>
        </v-col>
      </v-row>

      <v-row>
        <v-col xl="3">
          <Autocomplete
            data-test="selectContactNewCompany"
            label="Associar nova empresa"
            outlined
            clearable
            endpoint="/customer/company"
            @valueSelected="
              (value) => {
                companyContact.company_id = value
              }
            "
          />
        </v-col>

        <v-col xl="1">
          <v-btn color="secondary" fab small @click="handleCompanyContacts">
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <GenericTable
        :headers="companyContactsHeaders"
        :items="companyList"
        :delete-action="deleteCompany"
        action-options
        @removeItem="removeCompany"
        :empty-slot="true"
        v-slot:default="slotProps"
      >
        <ManageContact
          isEditing
          title="Editar Contato"
          :item-name="slotProps.itemName"
          :item-id="slotProps.itemId"
        />
      </GenericTable>
    </div>

    <v-row>
      <v-col class="pt-0">
        <p class="subtitle-2 font-weight-bold bordered-title pl-3 mt-6">
          Canais de contato
        </p>
      </v-col>
    </v-row>

    <v-form ref="contactMedia-form">
      <v-row>
        <v-col xl="3">
          <v-select
            attach
            data-test="selectContactMediaType"
            label="Tipo de canal"
            v-model="contactMedia.type_id"
            :items="mediaType"
            item-value="id"
            item-text="name"
            @change="alterMedia"
            required
            outlined
            dense
            :rules="mediaRules"
          />
        </v-col>
        <v-col xl="5" class="d-flex">
          <div
            v-if="contactMedia.type_id != null && contactMedia.type_id != ''"
            class="w-75"
          >
            <v-text-field
              v-if="showMail"
              required
              outlined
              dense
              label="E-mail"
              type="email"
              v-model="contactMedia.value"
              :rules="emailRules"
            />
            <v-text-field
              v-if="showPhone"
              required
              outlined
              dense
              label="Telefone"
              v-model="contactMedia.value"
              v-mask="maskPhone(contactMedia.value)"
              :rules="phoneRules"              
              :messages="phoneValidationMessages"
            />
          </div>
          <v-btn
            data-test="btnContactMedia"
            color="secondary"
            class="ml-5"
            fab
            small
            @click="handleMediaList"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </v-col>
      </v-row>
    </v-form>

    <GenericTable
      :headers="mediaListHeaders"
      :items="mediaList"
      action-options
      hasActions
      :empty-slot="false"
      v-slot:default="slotProps"
    >
      <DeleteItem
        callbackMethod
        @deleteItem="removeMedia(slotProps.index, slotProps.item)"
      />

      <ManageContact
        isEditing
        title="Editar Contato"
        :item-name="slotProps.itemName"
        :item-id="slotProps.itemId"
        v-if="showEditOption"
      />
    </GenericTable>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    itemId: Number,
    sheet: Boolean,
    isEditing: Boolean,
    title: String,
    byDetails: Boolean,
    associatedCompanyId: Number,
    onCompanyCreate: Boolean,
    item: Object,
  },
  data: () => ({
    showEditOption: false,
    mediaRules: [(v) => v != null || 'Esse campo é obrigatório'],
    mediaListHeaders: [
      { text: 'Tipo', value: 'typeName' },
      { text: 'Contato', value: 'value' },
    ],
    companyContactsHeaders: [
      { text: 'id', value: 'id' },
      { text: 'Empresa', value: 'companyName' },
    ],
    contact: {},
    relationalId: null,
    searching: false,
    companies: [],
    companyList: [],
    mediaList: [],
    mediaTypes: [],
    mediaType: [],
    idMediaFacebook: null,
    idMediaInstagram: null,
    idMediaLinkedin: null,
    noData: false,
    searchDone: false,
    showPhone: false,
    showMail: false,
    deleteCompany: 'delete',
    formData: {
      id: 0,
      name: '',
      prioridadeContato: '',
      objetivoTrial: '',
      position: '',
      department: '',
      company_id: null,
      facebook: '',
      linkedin: '',
      instagram: '',
      document_value: '',
      document_type: 'cpf',
      origin: 'user',
    },
    contactPosition: {
      id: 0,
      company_contact_id: 0,
      active: true,
      sector: '',
      position: '',
      department: '',
      reason: 'job_change',
      creator_id: 0,
    },
    contactMedia: {
      contact_id: 0,
      type_id: null,
      value: '',
    },
    socialMedia: {
      contact_id: 0,
      type_id: null,
      value: '',
    },
    companyContact: {
      contact_id: null,
      company_id: null,
      companyName: '',
    },
  }),
  validations: {
    formData: {
      name: { required },
    },
  },
  async mounted() {
    this.$root.$on('bureauCompanyCreated', (id) => {
      this.formData.company_id = id
      this.companyContact.company_id = id
    })

    await this.checkIfHasId()
    await this.loadForm()

    await this.$store.dispatch('Contact/fetchDepartments')
    await this.$store.dispatch('Contact/fetchPositions')
  },
  computed: {
    ...mapGetters({
      contactsMedia: 'Contact/contactsMedia',
      companyContacts: 'Contact/companyContacts',
      enhance: 'enhance',
      meta: 'meta',
      departments: 'Contact/departments',
      positions: 'Contact/positions',
      userInfo: 'userInfo',
    }),
    listMedia: function () {
      if (this.meta) {
        var list = []
        this.meta.mediaBase.forEach((base) => {
          if (
            base.value == 'mail' ||
            base.value == 'mobile' ||
            base.value == 'landline'
          ) {
            list.push({
              name: base.name,
              value: base.value,
            })
          }
        })
      }
      return list
    },
    companyRelationalID() {
      return this.contact?.companies?.find(
        (company) => company.company_id === this.associatedCompanyId
      )?.id
    },
  },
  watch: {
    async contactsMedia(newValue) {
      if (newValue) {
        this.mediaList = []

        // Add contact medias
        for (const media of this.contactsMedia) {
          if (
            media.type_id != this.idMediaFacebook &&
            media.type_id != this.idMediaInstagram &&
            media.type_id != this.idMediaLinkedin
          ) {
            const typeName = this.getTypeName(media.type_id)
            this.mediaList.push({
              id: media.id,
              type_id: media.type_id,
              typeName: typeName,
              value: media.value,
            })
          }
          if (media.type_id == this.idMediaFacebook)
            this.formData.facebook = media.value
          else if (media.type_id == this.idMediaInstagram)
            this.formData.instagram = media.value
          else if (media.type_id == this.idMediaLinkedin)
            this.formData.linkedin = media.value
        }

        // Add Company medias
        const companyMedias = this.contact?.companies
          ?.find((company) => company.company_id === this.associatedCompanyId)
          ?.contact_medias?.map(
            (media) =>
              media && {
                id: media.id,
                company_contact_id: media.company_contact_id,
                type_id: media.type_id,
                typeName: this.getTypeName(media.type_id),
                value: media.value,
              }
          )

        if (companyMedias?.length >= 1) this.mediaList?.push(...companyMedias)
      }
    },
    companyContacts(newValue) {
      this.companyList = newValue.map((company) => {
        const companyName = company?.company?.name
        return { ...company, companyName }
      })
    },
    async sheet(newValue) {
      if (newValue) {
        await this.loadForm()
      }
    },
  },
  methods: {
    async checkIfHasId() {
      this.$emit('checkIfHasId')
    },
    getTypeName(id) {
      if (this.mediaType) {
        return this.mediaTypes?.find((media) => media.id == id)?.name
      }
    },
    alterMedia(newValue) {
      if (newValue && this.mediaTypes) {
        const { base } = this.mediaTypes.find((media) => media.id == newValue)
        if (base == 'landline' || base == 'mobile') {
          this.showPhone = true
          this.showMail = false
        }
        if (base == 'mail') {
          this.showMail = true
          this.showPhone = false
        }
        this.contactMedia.value = ''
      }
    },
    async submitForm() {
      this.$v.formData.name.$touch()
      if (this.$v.formData.$error) return
      let contactId = null

      if (!this.onCompanyCreate) {
        if (this.isEditing) {
          contactId = this.itemId
          this.formData.id = this.itemId
          this.formData.document_value = this.formData.document_value ?? ''

          await this.$store.dispatch('Contact/updContact', this.formData)
          await this.createSocialMedia(contactId)

          // Update company contact position
          await this.handleContactPositions(this.companyRelationalID)
        } else {
          const newUserPayload = {
            company_id: this.formData.company_id,
            origin: 'user',
            name: this.formData.name,
            document_type: this.formData.document_type,
            document_value: this.formData.document_value ?? '',
            active: true,
          }

          const { id } = await this.createItem(
            '/customer/contact',
            newUserPayload
          )
          contactId = id

          // Get relational ID
          const relationalResponse = await this.getItem(
            '/customer/company-contact',
            `contact_id=${contactId}`
          )

          this.relationalId = relationalResponse.id

          await this.createSocialMedia(id)
          await this.createMedias(relationalResponse?.id, this.mediaList)
          await this.handleContactPositions(relationalResponse?.id)
          await this.createCompanyContacts(id)
          this.$store.commit('Contact/CONTACTS_API', { dataUpdate: true })
        }
      }

      if (this.isEditing) {
        const {id, name, document_value, origin, companies } = this.formData
        const preferential = companies.find(company => company.company_id === this.associatedCompanyId)?.preferential

        const payload = {
          id,
          name,
          position: this.contactPosition.position,
          document_value,        
          origin,
          preferential
        }
        this.$emit('updateData', payload)
      }

      else this.createContact(contactId, this.relationalId)
      
      this.$refs?.form?.reset()
      this.$v.$reset()
      this.mediaList = []
      this.companyList = []
      this.$emit('closeForm')
    },
    async getContact(itemId) {
      if (!this.onCompanyCreate) {
        this.contact = await this.getItem(
          '/customer/contact',
          `includes=companies.company,companies.contact_positions,companies.contact_medias&id=${itemId}`
        )

        if (this.contact) {
          const { created_at, updated_at, ...content } = this.contact
          this.formData = { ...content }

          // Contact positions
          const contactPosition = this.contact?.companies?.find(
            (company) => company.company_id === this.associatedCompanyId
          )?.contact_positions

          if (contactPosition?.length >= 1) {
            this.formData.id = contactPosition.at(-1).id
            this.formData.position = contactPosition.at(-1).position
            this.formData.department = contactPosition.at(-1).department

            this.contactPosition = contactPosition.at(-1)
          }
        }

        await this.$store.dispatch(
          'Contact/fetchCompanyContacts',
          `includes=company,media_type&contact_id=${itemId}`
        )
        await this.$store.dispatch(
          'Contact/fetchContactsMedia',
          `includes=type,media_type&contact_id=${itemId}`
        )
      } else {
        const {
          emails,
          telefones: { fixos, moveis },
          ...content
        } = this.item
        this.formData = { ...content }
        let emailType = this.mediaTypes?.find((media) => media.base == 'mail')
        let mobileType = this.mediaTypes?.find(
          (media) => media.base == 'mobile'
        )
        let landlineType = this.mediaTypes?.find(
          (media) => media.base == 'landline'
        )
        const formattedEmails =
          emailType.id &&
          emails.map(({ email }) => ({ type_id: emailType.id, value: email }))
        const formattedFixos =
          landlineType.id &&
          fixos.map(({ telefone }) => ({
            type_id: landlineType.id,
            value: telefone,
          }))
        const formattedMoveis =
          mobileType.id &&
          moveis.map(({ telefone }) => ({
            type_id: mobileType.id,
            value: telefone,
          }))
        this.mediaList = [
          ...formattedEmails,
          ...formattedFixos,
          ...formattedMoveis,
        ]
      }
    },
    resetValidation() {
      setTimeout(() => {
        this.$v.$reset()
      }, 1200)
    },
    async handleMediaList() {
      if (
        !this.$refs['contactMedia-form'].validate() ||
        this.contactMedia.type_id == null ||
        this.contactMedia.type_id == ''
      ) {
        this.resetValidation()
        return
      }
      const mediasToCreate = []
      const { contact_id, ...content } = this.contactMedia
      mediasToCreate.push(content)
      if (this.isEditing && !this.onCompanyCreate) {
        await this.createMedias(this.companyRelationalID, mediasToCreate)
      } else {
        const media_type = this.mediaType.find(
          (type) => type.id == content.type_id
        )

        this.mediaList.push({
          ...content,
          type_id: media_type.id,
          typeName: media_type.name,
        })
      }
      this.contactMedia.type_id = ''
      this.contactMedia.value = ''
    },
    async createSocialMedia(contactId) {
      const list = [
        { name: 'Facebook', value: this.formData.facebook },
        { name: 'Instagram', value: this.formData.instagram },
        { name: 'Linkedin', value: this.formData.linkedin },
      ]

      for (const item of list) {
        var typeId = null

        if (item.name == 'Facebook') typeId = this.idMediaFacebook
        else if (item.name == 'Instagram') typeId = this.idMediaInstagram
        else if (item.name == 'Linkedin') typeId = this.idMediaLinkedin

        const payload = {
          contact_id: contactId,
          type_id: typeId,
          value: item.value == null ? '' : item.value,
        }

        const exists = await this.getItem(
          '/customer/contact-media',
          `contact_id=${contactId}&type_id=${typeId}`
        )
        if (exists) {
          payload.id = exists.id
          await this.updateData('/customer/contact-media', payload, {
            fireSuccessAlert: false,
          })
        } else {
          await this.createItem('/customer/contact-media', payload, {
            fireSuccessAlert: false,
          })
        }
      }
    },
    async createMedias(relationalID, medias) {
      if (relationalID > 0) {
        const createMedias = medias?.map((media) => {
          media.company_contact_id = relationalID
          return media
        })

        if (createMedias.length > 0) {
          await this.createItem(
            '/customer/bulk/contact-company-media',
            createMedias,
            { fireSuccessAlert: false }
          )
          await this.getContact(this.itemId)
        }
      }
    },
    async handleCompanyContacts() {
      const { contact_id, ...content } = this.companyContact
      const { name } = await this.getItem(
        'customer/company',
        `id=${this.companyContact.company_id}`
      )
      const existentCompanyContact = this.companyList?.find(
        (item) => item.company_id == this.companyContact.company_id
      )

      if (existentCompanyContact) {
        this.$swal({
          icon: 'warning',
          title: 'Empresa já associada',
          showConfirmButton: false,
          timer: 1500,
        })
      } else {
        this.companyList.push({ ...content, companyName: name })
      }

      if (this.isEditing) {
        if (!existentCompanyContact)
          await this.createCompanyContacts(this.itemId)
      }
    },
    async createCompanyContacts(contactId) {
      for (const company of this.companyList) {
        if (!company.contact_id) {
          const companyContact = { contact_id: contactId, ...company }
          if (companyContact.company_id != this.formData.company_id) {
            const { id } = await this.createItem(
              '/customer/company-contact',
              companyContact,
              { fireSuccessAlert: false }
            )

            this.relationalId = id
          }
        }

        await this.$store.dispatch(
          'Contact/fetchCompanyContacts',
          `includes=company&contact_id=${contactId}`
        )
      }
    },
    async handleContactPositions(relationalID) {
      const contactPosition = Object.assign({}, this.contactPosition)

      if (contactPosition.position || contactPosition.department) {
        contactPosition.creator_id = this.userInfo.id

        delete contactPosition.updated_at
        delete contactPosition.resignation_date
        delete contactPosition.created_at

        // Insert && Update contact positions
        if (contactPosition.id >= 1) {
          await this.updateData('/customer/contact-position', contactPosition, {
            fireSuccessAlert: false,
          })
        } else if (contactPosition.id < 1) {
          delete contactPosition.id
          contactPosition.company_contact_id = relationalID

          await this.createItem('/customer/contact-position', contactPosition, {
            fireSuccessAlert: false,
          })
        }
      }
    },
    async loadForm() {
      const facebook = await this.getItem(
        '/ecosystem/media-type',
        'base=social&name=Facebook'
      )
      const instagram = await this.getItem(
        '/ecosystem/media-type',
        'base=social&name=Instagram'
      )
      const linkedin = await this.getItem(
        '/ecosystem/media-type',
        'base=social&name=Linkedin'
      )
      this.idMediaFacebook = facebook.id
      this.idMediaInstagram = instagram.id
      this.idMediaLinkedin = linkedin.id

      const {
        data: { data },
      } = await this.$axios.get('/ecosystem/media-type')
      this.mediaTypes = data
      data.forEach((media) => {
        if (media.extra) {
          const { displayContact } = JSON.parse(media.extra)
          if (displayContact == true) {
            this.mediaType.push(media)
          }
        }
      })
      this.searching = false

      if (this.associatedCompanyId) {
        this.companyContact.company_id = this.associatedCompanyId
        this.formData.company_id = this.associatedCompanyId
      }

      if (this.isEditing) {
        this.deleteCompany = 'Contact/deleteCompanyContact'
        await this.getContact(this.itemId)
      } else {
        this.handleCompanyContacts()
      }
      this.$v.$reset()
    },
    handleCancel() {
      this.$refs?.form?.reset()
      this.$v.$reset()
      this.mediaList = []
      this.companyList = []
    },
    async removeMedia(itemIndex, item) {
      if (item.id > 0) {
        if (item.company_contact_id) {
          await this.$store.dispatch(
            'Contact/deleteCompanyContactMedia',
            item.id
          )
        } else {
          await this.$store.dispatch('Contact/deleteContactMedia', item.id)
        }

        await this.getContact(this.itemId)
      } else this.mediaList.splice(itemIndex, 1)
    },
    removeCompany(value) {
      this.companyList = this.companyList.filter(
        (company, index) => index != value
      )
    },
    companySelected(id) {
      this.companyContact.company_id = id
    },
    createContact(id, relationalId) {
      const { name, document_value, origin } = this.formData
      const telefones = {
        fixos: [],
        moveis: [],
      }
      let emailType = this.mediaTypes?.find((media) => media.base == 'mail')
      let phoneType = this.mediaTypes?.find((media) => media.base == 'mobile')
      let landlineType = this.mediaTypes?.find(
        (media) => media.base == 'landline'
      )

      const emails =
        emailType.id &&
        this.mediaList
          .filter((media) => media.type_id == emailType.id)
          .map((media) => ({ email: media.value }))
      telefones.fixos =
        landlineType &&
        this.mediaList
          .filter((media) => media.type_id == landlineType.id)
          .map((media) => ({ telefone: media.value }))
      telefones.moveis =
        phoneType.id &&
        this.mediaList
          .filter((media) => media.type_id == phoneType.id)
          .map((media) => ({ telefone: media.value }))

      const payload = {
        name,
        position: this.contactPosition.position,
        document_value,
        emails,
        telefones,
        origin,
        preferential: false,
      }

      id && (payload.id = id)
      relationalId && (payload.relationalId = relationalId)
      !origin && (payload.origin = 'user')
      this.$emit('onContactCreate', payload)
    },
  },
}
</script>
