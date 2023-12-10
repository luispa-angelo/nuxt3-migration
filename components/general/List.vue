<template>
  <DataTable
    show-select
    action-options
    v-model="selected"
    v-slot:default="slotProps"
    :url="url"
    :main-entity="mainEntity"
    :redirect-to="redirectTo"
    :delete-action="deleteAction"
    :loading="isLoading"
    :headers="headers"
    :fields="fields"
    :items="list"
    :total-items="listDetails.total"
    @pagination="handlePagination"
    @onFilterApplied="handleColumnFilter"
    @onFieldChange="handleFields"
    @onColumnReorder="handleColumnReorder"
    @onRowClick="handleRowClick"
  >
    <Sheet
      isEditing
      title="Editar Parceiro"
      @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
      @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
    >
      <template v-slot="{ sheet, closed }">
        <!-- <PartnerForm
          v-if="formControl == 'partner'"
          isEditing
          :sheet="sheet"
          :item-id="slotProps.itemId"
          :ref="`config-${slotProps.itemId}`"
          @closeForm="closed"
        /> -->
        <CompanyForm
          v-if="formControl == 'company' || formControl == 'partner'"
          isEditing
          :sheet="sheet"
          :item-id="slotProps.itemId"
          :ref="`config-${slotProps.itemId}`"
          @closeForm="closed"
        />
        <OpportunityForm
          v-else-if="formControl == 'opportunity'"
          isEditing
          :sheet="sheet"
          :item-id="slotProps.itemId"
          :ref="`config-${slotProps.itemId}`"
          @closeForm="closed"
        />
      </template>
    </Sheet>
  </DataTable>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    url: String,
    mutation: String,
    mainEntity: String,
    redirectTo: String,
    formControl: String,
    usedEntities: String,
    defaultQuery: String,
    headerConfig: String,
    deleteAction: String,
    refreshData: Boolean,
    list: Array,
    initialHeaders: Array,
    fetchList: Function,
    refreshAction: Function,
    listDetails: Object,
  },
  data: () => ({
    filteredQuery: '',
    pageQuery: null,
    isLoading: null,
    headers: [],
    fields: [],
    selected: [],
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      meta: 'meta'
    }),
    resetList: function() {
      if (this.pageQuery) {
        return false
      }
      return true
    },
    finalQuery: function() {
      const queries = [this.defaultQuery, this.filteredQuery, this.pageQuery]
      const validQueries = queries.filter((query) => {
        if (query || query?.length > 0) {
          return true
        }
        return false
      })
      if (validQueries.length > 0) {
        return validQueries.join('&')
      }
      return null
    }
  },
  async mounted() {
    this.isLoading = true
    this.setHeaders()
    this.getEntitiesFields()
    this.getInitialData(this.finalQuery)
  },
  watch: {
    list() {
      this.isLoading = false
    },
    refreshData(newValue) {
      if (newValue) {
        this.getInitialData(this.finalQuery)
        this.refreshAction(false)
      }
    },
    defaultQuery() {
      this.resetPagination()
    },
    filteredQuery() {
      this.resetPagination()
    },
    finalQuery(newValue) {
      this.getData(newValue)
    }
  },
  methods: {
    async getInitialData(query) {
      this.isLoading = true
      this.resetPagination()
      this.fetchList({ url: this.url, query, reset: true })
    },
    async getData(query) {
      this.isLoading = true
      this.fetchList({ url: this.url, query, reset: this.resetList })
    },
    async getEntitiesFields() {
      let fields = []
      const entities = await this.getList('/meta/entity-dictionary', `entity=in(${this.usedEntities})`)
      entities.forEach((entity) => {
        fields = [ ...fields, ...entity.data.map((field) => ({ ...field, entity: entity.entity }))]
      })
      this.fields = fields
    },
    handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit(this.mutation, { page })
          this.pageQuery = `page=${page}`
        }
      }
    },
    resetPagination() {
      this.$store.commit(this.mutation, { page: 0 })
      this.pageQuery = null
    },
    handleColumnFilter(headers) {
      let query = ''
      headers.forEach(({ value, filterType, filterValue, meta }) => {
        let columnFilter = ''
        if (meta && filterValue) {
          filterType = 'equal'
        }
        if (filterType != null && filterValue) {
          if (filterType == 'equal') {
            columnFilter = `${value}=${filterValue}`
          } else {
            columnFilter = `${value}=${filterType}(${filterValue})`
          }
        } else {
          columnFilter = ''
        }
        if (query.length > 0 && columnFilter) {
          query += `&${columnFilter}`
        } else {
          query += columnFilter
        }
      })
      this.filteredQuery = query
    },
    handleFields(event) {
      const { action, field } = event
      if (field) {
        let value = field.field
        field.entity != this.mainEntity && (value = `${field.entity}.${value}`)
        if (action == 'include') {
          const lastPos = this.headers.length
          this.headers.push({
            text: field.label,
            entity: field.entity,
            meta: field.meta,
            value,
            filterable: true,
            filterType: field.meta ? 'equal': null,
            filterValue: null
          })
          this.headers.splice(lastPos, 0, this.headers.splice(lastPos-1, 1)[0])
          this.saveHeaders(this.headers)
        } else {
          this.headers = this.headers.filter((header) => header.value != value)
          this.saveHeaders(this.headers)
        }
      }
    },
    handleColumnReorder(headers) {
      this.saveHeaders(headers)
    },
    handleRowClick(id) {
      this.$emit('onRowClick', id)
    },
    setHeaders() {
      this.headers = this.initialHeaders
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      if (pageSettings) {
        if (pageSettings[`${this.headerConfig}`]) {
          this.headers = pageSettings[`${this.headerConfig}`]
        }
      }
    },
    saveHeaders(headers) {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      const formattedHeaders = headers.map((header) => ({
        ...header,
        filterType: null,
        filterValue: null
      })).sort((a, b) => a.pos < b.pos)
      localStorage.setItem('page_settings', JSON.stringify({
        ...pageSettings,
        [`${this.headerConfig}`]: formattedHeaders
      }))
    },
  }
}
</script>