<template>
  <div>
    <div class="d-flex justify-space-between align-center pb-3 px-3">
      <v-text-field
        placeholder="Pesquisar negócio"
        class="fix-vertical-align mx-2 search"
        outlined
        dense
        append-icon="mdi-magnify"
        v-model="search"
        data-test="inputConfigBusinessSearch"
      />
        <v-btn
          color="primary"
          dense
          @click="createBusiness"
          data-test="btnConfigBusinessCreate"
        >
          Criar negócio
        </v-btn>
    </div>
    <GenericTable
      action-options
      class="mx-3"
      delete-action="delete"
      :isLoading="isLoading"
      :search="search"
      :items="entityList"
      :headers="headers"
      multiSort
      @dataUpdate="getData"
      @removeItem="deleteItem"
      @onRowClick="handleEdit"
      @pagination="handlePagination"
      v-slot:default="slotProps"
      data-test="tableConfigBusiness"
    >
      <v-btn
        text
        @click.stop="handleEdit(slotProps.item)"
        @dataUpdate="slotProps.dataUpdate"
        data-test="btnActionConfigBusinessEdit"
      >
        Editar
      </v-btn>
    </GenericTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    search: '',
    endpoint: '/business/business',
    query: '',
    entityList: [],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
    apiConfig: {
      page: 0,
      hasNext: false,
      total: 0,
    },
    isEdit: false,
  }),
  computed: {
    ...mapGetters(['meta']),
    tenantId() {
      const { tenant_id } = this.$route.params
      return tenant_id
    },
  },
  async mounted() {
    await this.getData()
  },
  methods: {
    createBusiness() {
      this.$router.push(`/configure/${this.tenantId}/business/create-business`)
    },
    async getData() {
      this.isLoading = true
      this.query = `tenant_id=${this.tenantId}&order=id_desc`
      const { data, hasNext, total } = await this.getList(this.endpoint, this.query, this.apiConfig.page)
      this.entityList = [ ...this.entityList, ...data]
      this.entityList = this.formatData(this.entityList)
      this.apiConfig.hasNext = hasNext
      this.apiConfig.total = total
      this.isLoading = false
    },
    async deleteItem(value) {
      const item = this.entityList.find((item, index) => index == value)
      this.entityList = this.entityList.filter((item, index) => index != value)
      item && await this.removeItem(this.endpoint, item.id)
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.apiConfig.hasNext) {
          this.apiConfig.page += 1
          await this.getData()
        }
      }
    },
    formatData(list) {
      const entityList = list.map(({ id, name }) => ({
        id,
        name,
      }))
      return entityList
    },
    handleEdit(item) {
      this.isEdit = true
      this.$router.push(`/configure/${this.tenantId}/business/create-business?id=${item.id}&isEdit=${this.isEdit}`)
    }
  },
}
</script>
<style lang="scss" scoped>
.search {
  max-width: 286px;
}
</style>