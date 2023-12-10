<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Grupos e Empresas ({{ counter }})</p>
        </div>
      </template>
      <template v-slot:actions>
        <OpportunityGroupForm
          v-if="showForm"
          :isEditing='false'
          :company-id="companyId"
          :company-tenant-id="companyTenantId"
          @update="updateGroup"
        />
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-treeview
        v-if="list.length"
        dense
        hoverable
        :items="list"
      >
        <template v-slot:label="{ item }">
          <div v-if="item.isChildren">
            <NuxtLink :to="redirectPage(item)">
              {{ item.name }}
            </NuxtLink>
          </div>
          <div v-else class="d-flex justify-space-between align-center">
            <p class="mb-0">
              {{ item.name }}
            </p>
            <v-menu left :offset-x="true">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  icon
                  small
                  v-bind="attrs"
                  v-on="on"
                  :disabled="opportunityActivated"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list>
                <v-list-item>
                  <v-list-item-title>
                    <v-btn text @click="handleDelete(item.obj)" >
                      Deletar
                    </v-btn>
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-treeview>
      <p v-else class="text-center mb-0">Nenhum registro encontrado.</p>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    companyId: Number,
    associationL: Array,
    associationR: Array,
    showForm: Boolean,
    companyTenantId: Number,
  },
  data: () => ({
    deleteAction: 'deleteAssociation',
    counter: 0,
    list: [],
    companyList: [],
    groupEditing: false,
    groupAddition: false,
    items: [],
    formData: {
      id: null,
      association_type_id: null,
      left_side_id: null,
      right_side_id: null
    },
    redirectTo: 'business-companies-item-identifier',
  }),
  validations: {
    formData: {
      association_type_id: { required },
      left_side_id: { required }
    },
  },
  computed: mapGetters(['groups', 'associations', 'associationType']),
  watch: {
    companyId(newValue) {
      if(newValue) {
        this.updateGroup()
      }
    },
    list(newValue) {
      if(newValue) {
        return this.counter = this.list.length
      }
    }
  },
  methods: {
    updateGroup() {
      this.$store.dispatch('fetchGroups')
      this.$store.dispatch('fetchAssociationType', 'category=group')
      this.getGroup(this.companyId)
    },
    async getGroup(id) {
      this.list = []
      const { data: { data } } =  await this.$axios.get(`/customer/association?includes=left_side,association_type&association_type.category=group&right_side_id=${id}`)
      this.getItems(data)
    },
    async getItems(associations) {
      for(const association of associations) {
        if(association.association_type.category == 'group') {
          const leftId = association.left_side_id
          const children = await this.asyncgetCompany(leftId)
          this.list.push({
            obj: association.id,
            id: association.left_side_id,
            name: association.left_side.name,
            isChildren: false,
            children
          })
        }
      }
    },
    async asyncgetCompany(id) {
      const { data: { data } } =  await this.$axios.get(`/customer/association?includes=right_side&left_side_id=${id}`)
      const companys = data.map(company => ({
        id: company.right_side.id,
        identifier: company.right_side.identifier,
        name: company.right_side.legalName,
        isChildren: true,
      }))
      return companys
    },
    getGroupAssociations(associations) {
      this.list = associations.filter(association => {
        return association.association_type.category == 'group'
      })
    },
    async getCompanyAssociations(id){
      this.companyList = null
      const { data: { data } } =  await this.$axios.get(`/customer/association?includes=right_side&left_side_id=${id}`)

      this.companyList = data.filter(company => {
        return company.right_side_id != this.routeId
      })
    },
    async handleDelete(item) {
      await this.$store.dispatch(this.deleteAction, item)
      this.getGroup(this.companyId)
    },
    redirectPage(item) {
      const { identifier, id } = item
      const { params } = this.$route
      return { name: `${this.redirectTo}`, params: { ...params, identifier }, query: { company_id: id } }
    }
  }
}
</script>

<style scoped lang="scss">
  .v-expansion-panel-no-shadow::before {
    box-shadow: none !important;
  }
  .list-children {
    margin-top: -20px;
    & li a {
      text-decoration: none !important;
    }
  }
</style>