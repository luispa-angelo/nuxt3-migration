<template>
  <v-row>
    <v-col xl="6">
      <h6 class="bordered-title mb-3 pl-3">Empresa</h6>
      <div class="ml-3">
        <p class="mb-2">
          <b>CNPJ:</b>
          <span>{{
            company.identifier | VMask(this.mask_cnpj)
          }}</span>
        </p>
        <p class="mb-2">
          <b>BIOGRAFIA:</b>
          <span>{{
            company.description
          }}</span>
        </p>
        <p class="mb-2">
          <b>ENDEREÇO:</b>
          <span>{{
            companyAddress
          }}</span>
        </p>
        <p class="mb-2">
          <b>CNAE:</b>
          <span>{{
            cnae
          }}</span>
        </p>
      </div>
      <v-spacer class="py-3"></v-spacer>
      <h6 class="bordered-title mb-3 pl-3">Contatos fornecidos</h6>
      <article
        v-for="contact in userContacts"
        :key="contact.id"
        class="w-50 mb-4 ml-3"
      >
        <ContactItem :contact="contact" />
      </article>
      <v-spacer class="py-3"></v-spacer>
      <h6 class="bordered-title mb-3 pl-3">Contatos enriquecidos</h6>
      <article
        v-for="contact in enhancementContacts"
        :key="contact.id"
        class="w-50 mb-4 ml-3"
      >
        <ContactItem :contact="contact" />
      </article>
    </v-col>
    <v-col xl="6">
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    enhancementContacts: [],
    userContacts: [],
    companyAddress: '',
    contactHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Nome do contato', value: 'name' }
    ],
    cnae: ''
  }),
  computed: {
    ...mapGetters({
      opportunity: 'Opportunity/opportunity',
      company: 'Company/company'
    })
  },
  async mounted() {
    const { contact } = this.opportunity
    const { addresses: [address], cnaes: [cnae] } = this.company
    this.getContacts(contact)
    this.getAddress(address)
    this.getCnae(cnae)
  },
  methods: {
    getAddress(address) {
      if (address) {
        const { location, number, complement, neighborhood, city, state, zipcode } = address
        this.companyAddress = `${location}, ${number}, ${complement} - ${neighborhood} - ${city} - ${state} - ${zipcode}`
      }
    },
    getCnae(cnae) {
      if (cnae) {
        this.cnae = cnae.cnae_code
      }
    },
    getContacts(contact) {
      if (contact) {
        const contacts = [contact]
        this.enhancementContacts = contacts.filter((contact) => contact.origin == 'enhancement')
        this.userContacts = contacts.filter((contact) => contact.origin != 'enhancement')

      }
    }
  }
}
</script>

