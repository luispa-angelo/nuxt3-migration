<template>
  <div v-if="loaded">
    <PageHeadline title="Empresas" />
    <v-row>
      <v-col xl="5" lg="6">
        <v-row>
          <v-col>
            <AccountInfo :info="company" :company-page="companyPage">
              <Sheet
                isEditing
                @submit="$refs.myForm.submitForm()"
                @cancel="$refs.myForm.handleCancel()"
                title="Editar Empresa"
              >
                <template v-slot="{ sheet, closed }">
                  <CompanyForm
                    ref="myForm"
                    isEditing
                    :sheet="sheet"
                    @closeForm="closed"
                    :item-id="company.id"
                  />
                </template>
              </Sheet>
            </AccountInfo>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <HealthScore :info="company" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <Panel>
              <v-expansion-panel class="mb-3 rounded-0">
                <v-expansion-panel-header
                  color="shape lighten-1"
                  style="border-left: 3px solid #00e2f4 !important"
                >
                  <div class="d-flex justify-space-between align-center w-100">
                    <p class="subtitle-2 mb-0">Grupos Atribuídos</p>
                    <Dialog
                      :isEditing="false"
                      isXsmall
                      @submit="$refs.myForm.submitForm()"
                      @cancel="$refs.myForm.handleCancel()"
                      title="Adicionar grupo"
                      class="mr-2"
                    >
                      <template v-slot="{ dialog }">
                        <GroupConfigForm
                          :isEditing="false"
                          :dialog="dialog"
                          ref="myForm"
                        />
                      </template>
                    </Dialog>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content class="pt-4">
                  <CompanyGroupAssign />
                </v-expansion-panel-content>
              </v-expansion-panel>
              <v-expansion-panel class="mb-3 rounded-0">
                <v-expansion-panel-header
                  color="shape lighten-1"
                  style="border-left: 3px solid #00e2f4 !important"
                >
                  Contatos
                  <div style="display: flex; justify-content: flex-end">
                    <Sheet
                      :isEditing="false"
                      @submit="$refs.myForm.submitForm()"
                      @cancel="$refs.myForm.handleCancel()"
                      title="Criar contato"
                      isXsmall
                    >
                      <template v-slot="{ sheet, closed }">
                        <ContactForm
                          :sheet="sheet"
                          @closeForm="closed"
                          ref="myForm"
                          :associatedCompanyId="company.id"
                        />
                      </template>
                    </Sheet>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content v-if="!contacts.length" class="pt-4">
                  <p class="text-center mb-0 subtitle-2">
                    Nenhum contato associado.
                  </p>
                </v-expansion-panel-content>
                <v-expansion-panel-content
                  v-for="contact in contacts"
                  :key="contact.id"
                  class="pt-4"
                >
                  <ContactItem :contact="contact" />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel class="mb-3 rounded-0">
                <v-expansion-panel-header
                  color="shape lighten-1"
                  style="border-left: 3px solid #00e2f4 !important"
                >
                  Parceiros Associados
                  <div style="display: flex; justify-content: flex-end">
                    <Sheet
                      :isEditing="false"
                      @cancel="$refs.myForm.handleCancel()"
                      title="Criar Parceria"
                      isXsmall
                      supressCheckButton
                    >
                      <template v-slot="{ sheet, closed }">
                        <PartnerAssignPartner
                          :sheet="sheet"
                          @closeForm="closed"
                          ref="myForm"
                          :itemId="company.id"
                        />
                      </template>
                    </Sheet>
                  </div>
                </v-expansion-panel-header>
                <v-expansion-panel-content
                  v-if="!associations.length"
                  class="pt-4"
                >
                  <p class="text-center mb-0 subtitle-2">
                    Nenhum parceiro associado.
                  </p>
                </v-expansion-panel-content>
                <v-expansion-panel-content
                  v-for="association in partnerList"
                  :key="association.id"
                  class="pt-4"
                >
                  <AssociationItem
                    :association="association.left_side"
                    :type="association.association_type"
                    redirect-to="partner"
                  />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel class="mb-3 rounded-0">
                <v-expansion-panel-header
                  color="shape lighten-1"
                  style="border-left: 3px solid #00e2f4 !important"
                >
                  Oportunidades
                  <div style="display: flex; justify-content: flex-end">
                    <Sheet
                      :isEditing="false"
                      @submit="$refs.myForm.submitForm()"
                      @cancel="$refs.myForm.handleCancel()"
                      title="Criar oportunidade"
                      isXsmall
                    >
                      <template v-slot="{ sheet, closed }">
                        <OpportunityForm
                          :sheet="sheet"
                          @closeForm="closed"
                          ref="myForm"
                          :companyId="company.id"
                        />
                      </template>
                    </Sheet>
                  </div>
                </v-expansion-panel-header>

                <v-expansion-panel-content
                  v-if="!opportunitys.length"
                  class="pt-4"
                >
                  <p class="text-center mb-0 subtitle-2">
                    Nenhuma oportunidade criada.
                  </p>
                </v-expansion-panel-content>
                <v-expansion-panel-content
                  v-for="opportunity in opportunitys"
                  :key="opportunity.id"
                  class="pt-4"
                >
                  <OpportunityItem :opportunity="opportunity" />
                </v-expansion-panel-content>
              </v-expansion-panel>

              <v-expansion-panel class="mb-3 rounded-0">
                <v-expansion-panel-header
                  color="shape lighten-1"
                  style="border-left: 3px solid #00e2f4 !important"
                >
                  Produtos
                </v-expansion-panel-header>
                <v-expansion-panel-content v-if="!products.length" class="pt-4">
                  <p class="text-center mb-0 subtitle-2">
                    Nenhum produto em negociação.
                  </p>
                </v-expansion-panel-content>
                <v-expansion-panel-content
                  v-for="product in products"
                  :key="product.id"
                  class="pt-4"
                >
                  <ProductItem :product="product" />
                </v-expansion-panel-content>
              </v-expansion-panel>
            </Panel>
          </v-col>
        </v-row>
      </v-col>
      <v-col xl="7" lg="6">
        <Timeline />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    loaded: false,
    companyPage: true,
    products: [],
    contacts: [],
  }),
  computed: {
    ...mapGetters({
      company: 'Company/company',
      opportunitys: 'Opportunity/opportunitys',
      associations: 'associations',
      opportunities_api: 'Opportunity/opportunities_api',
      contacts_api: 'Contact/contacts_api',
      companies_api: 'Company/companies_api',
      meta: 'meta',
    }),
    ...mapGetters({ assignedTasks_api: 'Task/assignedTasks_api' }),
    partnerList: function () {
      return this.associations.filter(
        ({ association_type: { category } }) => category != 'group'
      )
    },
  },
  async mounted() {
    const { id } = this.$route.params
    this.itemId = id
    await this.getData()
  },
  watch: {
    company(newValue) {
      const { contacts } = newValue
      this.contacts = contacts.map(({ contact, preferential }) => ({
        preferential,
        ...contact,
      }))
    },
    opportunitys(newValue) {
      newValue.forEach((opp) => {
        const { products } = opp
        this.products = [...this.products, ...products]
      })
    },
    opportunities_api(newValue) {
      if (newValue.dataUpdate) {
        this.getOpportunities()
        this.$store.commit('Opportunity/OPPORTUNITIES_API', {
          dataUpdate: false,
        })
      }
    },
    assignedTasks_api(newValue) {
      if (newValue.dataUpdate) {
        this.getOpportunities()
        this.$store.commit('Task/ASSIGNED_TASKS_API', { dataUpdate: false })
      }
    },
    async contacts_api(newValue) {
      if (newValue.dataUpdate) {
        await this.getData()
        this.$store.commit('Contact/CONTACTS_API', { dataUpdate: false })
      }
    },
    async companies_api(newValue) {
      if (newValue.dataUpdate) {
        await this.getData()
        this.$store.commit('Company/COMPANIES_API', { dataUpdate: false })
      }
    },
  },
  methods: {
    async getData() {
      await this.$store.dispatch(
        'Company/fetchCompany',
        `includes=medias,opportunities,contacts.contact.medias&id=${this.itemId}`
      )
      await this.$store.dispatch(
        'fetchAssociations',
        `includes=left_side,association_type&right_side_id=${this.itemId}`
      )
      this.getOpportunities()
      this.loaded = true
    },
    async getOpportunities() {
      await this.$store.dispatch(
        'Opportunity/fetchInitialOpportunitys',
        `includes=tasks.type.media_type,op_log.owner,op_log.stage,team,customer,contact,products.product,stage&customer_id=${this.itemId}`
      )
    },
  },
}
</script>
