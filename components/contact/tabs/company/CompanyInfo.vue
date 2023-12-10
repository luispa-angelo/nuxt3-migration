<template>
  <div class="company_info_container">
    <v-row class="contact_info_wrapper company_min_width" v-if="!pending">
      <v-col lg="4">
        <h6 class="info_title">Informações Corporativas</h6>

        <div class="list_item pb-2">
          <a
            v-if="activeCompany"
            :href="`/business-companies/bureau/${activeCompany.company.identifier}?company_id=${activeCompany.company_id}`"
            target="_blank"
            >{{ activeCompany.company.identifier }}
          </a>
        </div>

        <div class="list_item">
          <span>Empresa Principal</span>
          <span>
            {{ activeCompany && activeCompany.primary_company ? 'Sim' : 'Não' }}
          </span>
        </div>

        <div class="list_item">
          <span>Departamento</span>
          <span
            :class="
              !activeCompany || !activeCompany.contact_positions[0]
                ? 'empty'
                : ''
            "
          >
            {{
              activeCompany &&
              activeCompany.contact_positions &&
              activeCompany.contact_positions[0]
                ? activeCompany.contact_positions[0].department
                : 'Não informado'
            }}
          </span>
        </div>

        <div class="list_item">
          <span>Cargo</span>
          <span
            :class="
              !activeCompany || !activeCompany.contact_positions[0]
                ? 'empty'
                : ''
            "
          >
            {{
              activeCompany &&
              activeCompany.contact_positions &&
              activeCompany.contact_positions[0]
                ? activeCompany.contact_positions[0].position
                : 'Não informado'
            }}
          </span>
        </div>
      </v-col>

      <v-col lg="4">
        <h6 class="info_title">Liderança</h6>

        <span
          v-for="leader_related in contactLeaders"
          :key="'leader_' + leader_related.id"
        >
          <div class="list_item">
            <span>Nome</span>

            <a
              :href="`/contact/${leader_related.contact.id}`"
              target="_blank"
              v-if="leader_related.contact.name !== 'Não informado'"
            >
              {{ leader_related.contact.name }}
            </a>

            <span class="empty" v-else>{{ leader_related.contact.name }}</span>
          </div>
        </span>
      </v-col>

      <v-col lg="4">
        <h6 class="info_title">Relacionamentos</h6>

        <span
          v-for="worker_related in contactRelated"
          :key="'worker_' + worker_related.id"
        >
          <div class="list_item">
            <span>Nome</span>

            <a
              :href="`/contact/${worker_related.contact.id}`"
              target="_blank"
              v-if="worker_related.contact.name !== 'Não informado'"
            >
              {{ worker_related.contact.name }}
            </a>

            <span class="empty" v-else>{{ worker_related.contact.name }}</span>
          </div>
        </span>
      </v-col>

      <v-col lg="4" class="mt-4">
        <h6 class="info_title">Contato Corporativo</h6>

        <div
          class="list_item truncate"
          v-for="(item, media_index) in companyContactMedia"
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
      </v-col>
    </v-row>

    <v-row class="contact_info_wrapper" v-if="pending">
      <v-col lg="4">
        <h6 class="info_title">Informações Corporativas</h6>

        <v-row>
          <v-col cols="12" v-if="addCompany">
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
                  item.name + ' - ' + maskCnpj(item.cnpj) + ` (${item.cnpj})`
              "
              :length-to-start-search="4"
              @valueSelected="(value) => handleSelectCompanyAutoComplete(value)"
              class="pb-2"
            />
          </v-col>
          <v-col cols="12">
            <v-select
              attach
              :items="primaryCompanyOptions"
              item-text="text"
              item-value="value"
              hide-details
              dense
              label="Empresa Principal"
              outlined
              v-model="companyInfo.company.primary_company"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              attach
              :items="departments"
              hide-details
              item-text="name"
              item-value="name"
              dense
              clearable
              label="Departamento"
              outlined
              v-model="companyInfo.contactPosition.department"
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
              v-model="companyInfo.contactPosition.position"
              item-text="name"
              item-value="name"
              label="Cargo"
              :items="positions"
            />
          </v-col>
        </v-row>

        <h6 class="info_title pt-4">Contato Corporativo</h6>

        <v-row>
          <v-col cols="12">
            <span
              v-for="(email, email_index) in companyInfo.addedCompanyEmails"
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
                    email_index < companyInfo.addedCompanyEmails.length - 1
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
              v-for="(phone, phone_index) in companyInfo.addCompanyPhones"
              :key="'phone_index' + phone_index"
              class="action_button_wrapper"
            >
              <template v-if="phone.active">
                <v-text-field
                  hide-details="auto"
                  dense
                  :label="phone_index >= 1 ? 'Telefone' : 'Telefone Principal'"
                  outlined
                  v-mask="maskPhone(phone.value)"
                  :class="
                    phone_index < companyInfo.addCompanyPhones.length - 1
                      ? 'pb-2'
                      : 'pb-0'
                  "
                  v-model="phone.value"
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
      </v-col>

      <v-col lg="4">
        <h6 class="info_title">Liderança</h6>

        <span
          v-for="(
            leader_relation, leader_relation_index
          ) in companyInfo.addedLeaderShip"
          :key="'leader_relation_index_' + leader_relation_index"
        >
          <template v-if="leader_relation.active">
            <v-row :class="leader_relation_index >= 1 ? 'pt-3' : ''">
              <v-col cols="12">
                <span class="action_button_wrapper">
                  <NewCombobox
                    :ref="`comboBoxInput-leader-${leader_relation_index}`"
                    enable-creation
                    outlined
                    dense
                    hide-details="auto"
                    label="Nome"
                    endpoint="/customer/contact"
                    item-text="name"
                    query="includes=companies.contact_positions"
                    clearable
                    @change="
                      (value) =>
                        handleAddContactRelation(
                          value,
                          leader_relation_index,
                          'leader'
                        )
                    "
                    :value="leader_relation.contact.name"
                    v-if="leader_relation.contact"
                  >
                    <template v-slot:creationSlot="props">
                      <v-btn
                        text
                        block
                        @click="
                          handleAddContactRelation(
                            null,
                            leader_relation_index,
                            'leader',
                            true,
                            props.search
                          )
                        "
                      >
                        <v-icon class="mr-2 material-icons-round"
                          >person</v-icon
                        >
                        <span>Cadastrar contato</span>
                      </v-btn>
                    </template>
                  </NewCombobox>

                  <i
                    class="material-symbols-rounded v-icon"
                    @click="
                      handleDeleteRelations(leader_relation_index, 'leader')
                    "
                  >
                    delete
                  </i>
                </span>
              </v-col>
            </v-row>
          </template>
        </span>

        <span
          class="action_link d-block pt-2"
          @click="handleAddRelations('leader')"
        >
          + Adicionar liderança
        </span>
      </v-col>

      <v-col lg="4">
        <h6 class="info_title">Relacionamentos</h6>

        <span
          v-for="(
            relation, contact_relation_index
          ) in companyInfo.addedRelations"
          :key="'contact_relation_index_' + contact_relation_index"
        >
          <template v-if="relation.active">
            <v-row :class="contact_relation_index >= 1 ? 'pt-3' : ''">
              <v-col cols="12">
                <span class="action_button_wrapper">
                  <NewCombobox
                    :ref="`comboBoxInput-coworker-${contact_relation_index}`"
                    enable-creation
                    outlined
                    dense
                    hide-details="auto"
                    label="Nome"
                    endpoint="/customer/contact"
                    item-text="name"
                    query="includes=companies.contact_positions"
                    clearable
                    :value="relation.contact.name"
                    @change="
                      (value) =>
                        handleAddContactRelation(
                          value,
                          contact_relation_index,
                          'coworker'
                        )
                    "
                    v-if="relation.contact"
                  >
                    <template v-slot:creationSlot="props">
                      <v-btn
                        text
                        block
                        @click="
                          handleAddContactRelation(
                            null,
                            contact_relation_index,
                            'coworker',
                            true,
                            props.search
                          )
                        "
                      >
                        <v-icon class="mr-2 material-icons-round"
                          >person</v-icon
                        >
                        <span>Cadastrar contato</span>
                      </v-btn>
                    </template>
                  </NewCombobox>

                  <i
                    class="material-symbols-rounded v-icon"
                    @click="
                      handleDeleteRelations(contact_relation_index, 'coworker')
                    "
                  >
                    delete
                  </i>
                </span>
              </v-col>
            </v-row>
          </template>
        </span>
        <span
          class="action_link d-block pt-2"
          @click="handleAddRelations('coworker')"
        >
          + Adicionar relacionamento
        </span>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    selectedCompany: Number,
    addCompany: Boolean,
    pending: Boolean,
  },
  data: () => ({
    loaded: false,
    userID: 0,
    newCompany: null,
    companyInfo: {
      company: {
        contact_id: 0,
        company_id: null,
        preferential: false,
        active: true,
        primary_company: false,
        financial_responsible: false,
        project_responsible: false,
      },
      addedCompanyEmails: [],
      addCompanyPhones: [],
      addedRelations: [],
      addedLeaderShip: [],
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
    },
    auxCompanyInfo: null,
    primaryCompanyOptions: [
      { text: 'Sim', value: true },
      { text: 'Não', value: false },
    ],
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
      departments: 'Contact/departments',
      pendingChanges: 'Global/pendingChanges',
      positions: 'Contact/positions',
      mediaTypes: 'Global/mediaTypes',
    }),
    activeCompany() {
      return this.contact?.companies?.find(
        (company) =>
          company?.company_id === this.selectedCompany && company?.active
      )
    },
    companyContactMedia() {
      if (this.activeCompany?.contact_medias?.length >= 1)
        return this.activeCompany.contact_medias
          ?.filter(
            (media) =>
              media?.active &&
              (media?.media_type?.base === 'mail' ||
                media?.media_type?.base === 'mobile' ||
                media?.media_type?.base === 'landline')
          )
          .sort((a, b) => a.media_type?.base.localeCompare(b.media_type?.base))
      else return []
    },
    contactLeaders() {
      let leader = this.contact?.contact_related?.filter(
        (contact) => contact.relation_type === 'leader' && contact.active
      )

      if (leader?.length < 1)
        leader = [{ contact: { name: 'Não informado', origin: '' } }]

      return leader
    },
    contactRelated() {
      let related = this.contact?.contact_related?.filter(
        (contact) => contact.relation_type === 'coworker' && contact.active
      )

      if (related.length < 1)
        related = [{ contact: { name: 'Não informado', origin: '' } }]

      return related
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
  watch: {
    async selectedCompany() {
      this.loaded = false

      // Selected company change
      await this.mergeMedias()
      await this.mergeRelations()

      if (this.activeCompany) {
        await this.mergeCompanyData()
        await this.$nextTick()
        await this.mergeContactPosition()
      }

      this.auxCompanyInfo = structuredClone(this.companyInfo)
      this.loaded = true
    },
    async pending() {
      this.loaded = false

      // Edit item
      if (this.pending && this.activeCompany && !this.addCompany) {
        await this.mergeCompanyData()
        await this.mergeMedias()
        await this.mergeRelations()
        await this.$nextTick()
        await this.mergeContactPosition()
      }

      // Create new item
      else if (this.pending && this.addCompany) {
        await this.clearFields()
        await this.handleAddRelations('leader')
        await this.handleAddRelations('coworker')
        await this.handleAddMedias('email')
        await this.handleAddMedias('phone')
      }

      this.auxCompanyInfo = structuredClone(this.companyInfo)
      this.loaded = true
    },
    companyInfo: {
      handler() {
        if (this.loaded && this.pending) {
          if (
            JSON.stringify(this.auxCompanyInfo) !==
            JSON.stringify(this.companyInfo)
          )
            this.$store.dispatch('Global/setPendingChanges', true)
          else this.$store.dispatch('Global/setPendingChanges', false)
        }
      },
      deep: true,
    },
  },
  mounted() {
    const { id } = this.$route.params
    this.userID = id
  },
  methods: {
    copyContent(content) {
      navigator.clipboard.writeText(content)
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

        this.newCompany = companyID
      }
    },
    async handleAddContactRelation(
      contact,
      index,
      type,
      addContact = false,
      contactName = ''
    ) {
      let contactID = contact?.id ? contact.id : 0

      if (addContact && contactName !== '') {
        try {
          const { id, success } = await this.createItem('customer/contact', {
            name: contactName,
            origin: 'user',
          })

          success && (contactID = id)
        } catch (error) {
          console.log(error)
        }

        // Close ComboBox
        this.$refs[`comboBoxInput-${type}-${index}`][0]?.closeButton()
      }

      if (contactID > 0) {
        if (type === 'leader') {
          this.companyInfo.addedLeaderShip[index].contact_id = contactID
          this.companyInfo.addedLeaderShip[index].contact_related_id =
            this.userID
        } else if (type === 'coworker') {
          this.companyInfo.addedRelations[index].contact_id = contactID
          this.companyInfo.addedRelations[index].contact_related_id =
            this.userID
        }
      }
    },
    getContactPosition(contactArray) {
      if (contactArray) {
        const primaryCompany = contactArray?.contact?.companies?.find(
          (company) => company?.primaryCompany
        )

        if (primaryCompany) return primaryCompany.contact_positions[0].position
        else if (
          contactArray?.contact?.companies?.length >= 1 &&
          contactArray?.contact?.companies[0]?.contact_positions
        )
          return contactArray?.contact?.companies[0]?.contact_positions[0]
            ?.position
      }
    },
    mergeCompanyData() {
      this.companyInfo.company.contact_id = this.activeCompany?.contact_id
      this.companyInfo.company.company_id = this.activeCompany?.company_id
      this.companyInfo.company.preferential = this.activeCompany?.preferential
      this.companyInfo.company.active = this.activeCompany?.active
      this.companyInfo.company.primary_company =
        this.activeCompany?.primary_company
      this.companyInfo.company.financial_responsible =
        this.activeCompany?.financial_responsible
      this.companyInfo.company.project_responsible =
        this.activeCompany?.project_responsible
    },
    mergeRelations() {
      this.companyInfo.addedLeaderShip = this.contact?.contact_related?.filter(
        (contact) => contact.relation_type === 'leader'
      )

      this.companyInfo.addedRelations = this.contact?.contact_related?.filter(
        (contact) => contact.relation_type === 'coworker'
      )

      if (this.companyInfo.addedLeaderShip.length < 1)
        this.handleAddRelations('leader')
      if (this.companyInfo.addedRelations.length < 1)
        this.handleAddRelations('coworker')
    },
    mergeMedias() {
      this.companyInfo.addedCompanyEmails = Object.assign(
        [],
        this.activeCompany?.contact_medias?.filter(
          (media) => media?.media_type?.base === 'mail' && media?.active
        )
      )
      this.companyInfo.addCompanyPhones = Object.assign(
        [],
        this.activeCompany?.contact_medias?.filter(
          (media) =>
            (media?.media_type?.base === 'mobile' ||
              media?.media_type?.base === 'landline') &&
            media?.active
        )
      )

      // Populate the first value when they not exist
      if (this.companyInfo.addedCompanyEmails?.length < 1)
        this.handleAddMedias('email')
      if (this.companyInfo.addCompanyPhones?.length < 1)
        this.handleAddMedias('phone')
    },
    async mergeContactPosition() {
      if (this.activeCompany?.contact_positions?.length >= 1) {
        this.companyInfo.contactPosition = Object.assign(
          {},
          this.activeCompany.contact_positions[0]
        )

        await this.$nextTick()
        if (this.$refs.searchPosition) {
          this.$refs.searchPosition.search =
            this.companyInfo.contactPosition.position
          this.$refs.searchPosition.value =
            this.companyInfo.contactPosition.position
        }
      }
    },
    handleAddMedias(type) {
      if (type === 'email') {
        this.companyInfo.addedCompanyEmails.push({
          id: 0,
          company_contact_id: !this.addCompany ? this.activeCompany?.id : 0,
          active: true,
          type_id: this.emailMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      } else if (type === 'phone') {
        this.companyInfo.addCompanyPhones.push({
          id: 0,
          company_contact_id: !this.addCompany ? this.activeCompany?.id : 0,
          active: true,
          type_id: this.phoneMediaType,
          origin: 'user',
          value: '',
          extra: '',
        })
      }
    },
    handleDeleteMedias(index, type) {
      if (type === 'email')
        this.companyInfo.addedCompanyEmails[index].active = false
      else if (type === 'phone')
        this.companyInfo.addCompanyPhones[index].active = false
    },
    handleAddRelations(type) {
      if (type === 'leader') {
        this.companyInfo.addedLeaderShip.push({
          id: 0,
          contact: { name: '' },
          contact_id: 0,
          contact_related_id: this.userID,
          relation_type: 'leader',
          active: true,
        })
      } else if (type === 'coworker') {
        this.companyInfo.addedRelations.push({
          id: 0,
          contact: { name: '' },
          contact_id: 0,
          contact_related_id: this.userID,
          relation_type: 'coworker',
          active: true,
        })
      }
    },
    handleDeleteRelations(index = 0, type) {
      if (type === 'leader')
        this.companyInfo.addedLeaderShip[index].active = false
      else if (type === 'coworker')
        this.companyInfo.addedRelations[index].active = false
    },
    clearFields() {
      this.companyInfo.addedCompanyEmails = []
      this.companyInfo.addCompanyPhones = []
      this.companyInfo.addedRelations = []
      this.companyInfo.addedLeaderShip = []

      this.companyInfo.contactPosition = {
        id: 0,
        company_contact_id: 0,
        active: true,
        sector: '',
        position: '',
        department: '',
        reason: 'job_change',
      }

      this.companyInfo.company = {
        contact_id: 0,
        company_id: null,
        preferential: false,
        active: true,
        primary_company: false,
        financial_responsible: false,
        project_responsible: false,
      }
    },
  },
}
</script>

<style lang="scss">
.contact_tab_wrapper {
  .company_min_width {
    .list_item span:first-child {
      min-width: 12vw !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.company_info_container {
  .contact_info_wrapper {
    max-height: 40vh;

    .col {
      .info_title {
        padding-bottom: 1rem;
        margin: 0 !important;
      }
    }
  }
}
</style>
