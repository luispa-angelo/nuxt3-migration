<template>
  <v-row class="table_content">
    <v-col>
      <v-row>
        <v-col>
          <DataTableWrapper
            ref="dataContactTableWrapper"
            :url="'/customer/contact'"
            :hideSelect="true"
            :default-query="apiConfig.query"
            :list="contactsList"
            :initial-headers="headers"
            :main-entity="'contact'"
            :usedEntities="{
              contact: '',
              company: 'companies.company',
              positions: 'companies.contact_positions',
            }"
            :mutation="'Contact/SET_LIST_DETAILS'"
            header-config="contactHeaders"
            :delete-action="'delete'"
            :hideAddIcon="true"
            :list-details="listDetails"
            :refresh-data="refreshData"
            :fetchList="fetchList"
            :refreshAction="refresh"
            :item-key="'id'"
            :sort-by="'name'"
            :sort-desc="false"
            @onRowClick="handleRowClick"
            @tableLoading="handleLoading"
          >
            <template v-slot:actionsSlot="actionsProps">
              <v-list-item-title>
                <v-btn text @click="handleRowClick(actionsProps.item, 'view')">
                  Abrir
                </v-btn>
              </v-list-item-title>

              <v-list-item-title>
                <v-btn
                  text
                  @click="handleRowClick(actionsProps.item, 'delete')"
                >
                  Excluir
                </v-btn>
              </v-list-item-title>
            </template>
          </DataTableWrapper>
        </v-col>
      </v-row>
    </v-col>

    <!-- Loading -->
    <Loading :isLoading="isLoading" />
  </v-row>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  data: () => ({
    apiConfig: {
      query:
        'includes=companies.company,companies.contact_medias.media_type,companies.contact_positions',
      action: 'Contact/fetchContacts',
      initialAction: 'Contact/fetchInitialContacts',
    },
    isLoading: null,
    amount: 0,
    contactsList: [],
    headers: [
      {
        text: 'Nome',
        value: 'name',
        entity: 'contact',
        filterable: true,
        filterType: null,
        filterValue: null,
        pos: 7,
      },
      {
        text: 'Nome Social',
        value: 'social_name',
        entity: 'contact',
        filterable: true,
        filterType: null,
        filterValue: null,
        pos: 6,
      },
      {
        text: 'E-mail',
        value: 'email.value',
        entity: 'companies.contact_medias.value',
        filterable: true,
        filterType: null,
        filterValue: null,
        multipleFields: true,
        useEntities: true,
        pos: 5,
      },
      {
        text: 'Telefone',
        value: 'phone.value',
        entity: 'companies.contact_medias.value',
        filterable: true,
        filterType: null,
        filterValue: null,
        multipleFields: true,
        useEntities: true,
        pos: 4,
      },
      {
        text: 'Documento',
        value: 'document_value',
        entity: 'contact',
        filterable: true,
        filterType: null,
        filterValue: null,
        pos: 3,
      },
      {
        text: 'Empresa',
        value: 'company',
        entity: 'companies.company.name',
        filterable: true,
        filterType: null,
        filterValue: null,
        useEntities: true,
        pos: 2,
      },
      {
        text: 'Cargo',
        value: 'position',
        entity: 'companies.contact_positions.position',
        filterable: true,
        filterType: null,
        filterValue: null,
        useEntities: true,
        pos: 1,
      },
      {
        text: 'Departamento',
        value: 'department',
        entity: 'companies.contact_positions.department',
        filterable: true,
        filterType: null,
        filterValue: null,
        useEntities: true,
        pos: 0,
      },
    ],
  }),
  async mounted() {
    this.isLoading = true
  },
  computed: {
    ...mapGetters({
      list: 'Contact/list',
      listDetails: 'Contact/listDetails',
      refreshData: 'Contact/refreshData',
    }),
  },
  watch: {
    list(newValue) {
      this.contactsList = this.formatData(newValue)
      this.isLoading = false
    },
  },
  methods: {
    ...mapActions({
      fetchList: 'Contact/fetchList',
      refresh: 'Contact/refresh',
    }),
    handleLoading(loading) {
      this.isLoading = loading
    },
    formatData(data) {
      this.isLoading = true
      const headers = this.$refs.dataContactTableWrapper.headers

      const dataArray = data.map((contact) => {
        let document_value = ''
        let email = ''
        let phone = ''
        let company = ''
        let position = ''
        let department = ''

        const { opportunities, medias, ...content } = contact
        const { companies } = contact

        // Contact document
        if (contact?.document_value) {
          if (contact?.document_value?.includes('*') || !contact?.document_type)
            document_value = contact.document_value
          else if (contact?.document_type === 'cpf')
            document_value = this.maskCpf(contact.document_value)          
        }

        // Company info
        if (companies?.length > 0) {
          const primaryCompany = companies?.find(
            (companyArray) =>
              companyArray?.primary_company && companyArray?.active
          )

          // Company name
          if (primaryCompany?.company?.name)
            company = primaryCompany?.company?.name
          else if (headers.find((el) => el?.text === 'Empresa')?.filterValue)
            company = { isEmpty: true }
          else company = ''

          // Company positions
          if (primaryCompany?.contact_positions?.at(-1)?.position)
            position = primaryCompany?.contact_positions.at(-1).position
          else if (headers.find((el) => el?.text === 'Cargo')?.filterValue)
            position = { isEmpty: true }
          else position = ''

          // Company departments
          if (primaryCompany?.contact_positions?.at(-1)?.department)
            department = primaryCompany?.contact_positions.at(-1).department
          else if (
            headers.find((el) => el?.text === 'Departamento')?.filterValue
          )
            department = { isEmpty: true }
          else department = ''

          // Company medias email
          if (
            primaryCompany?.contact_medias?.filter(
              (media) => media?.media_type?.base === 'mail' && media?.active
            )?.length >= 1
          )
            email = primaryCompany?.contact_medias?.filter(
              (media) => media?.media_type?.base === 'mail' && media?.active
            )
          else if (headers.find((el) => el?.text === 'E-mail')?.filterValue) {
            email = [{ isEmpty: true }]
          } else email = ''

          // Company medias phone
          if (
            primaryCompany?.contact_medias?.filter(
              (media) => media?.media_type?.base === 'mobile' && media?.active
            )?.length >= 1
          )
            phone = primaryCompany?.contact_medias?.filter(
              (media) => media?.media_type?.base === 'mobile' && media?.active
            )
          else if (headers.find((el) => el?.text === 'Telefone')?.filterValue) {
            phone = [{ isEmpty: true }]
          } else phone = ''
        }

        return {
          ...content,
          document_value,
          email,
          phone,
          company,
          position,
          department,
        }
      })

      return dataArray
    },
    async handleRowClick(row, mode = 'open') {
      this.$emit('selectContact', row)
      this.$emit('changeViewMode', mode)

      await this.$nextTick()
      this.$router.push(`/contact/${row.id}`)
    },
  },
}
</script>
