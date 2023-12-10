<template>
  <DataTable
    action-options
    ref="dataTable"
    v-model="selected"
    :show-select="!hideSelect"
    :showSelectOption="!hideSelect"
    :url="url"
    :main-entity="mainEntity"
    :redirect-to="redirectTo"
    :delete-action="deleteAction"
    :loading="isLoading"
    :headers="headers"
    :fields="fields"
    :items="list"
    :total-items="listDetails.total"
    :item-key="itemKey ? itemKey : 'id'"
    :showHeaderConfig="showHeaderConfigMenu"
    :showNameTooltip="false"
    :hideAddIcon="hideAddIcon"
    :sortBy.sync="sort"
    :sortDesc.sync="isSortDesc"
    :page.sync="page"
    @pagination="handlePagination"
    @onFilterApplied="handleColumnFilter"
    @onFieldChange="handleFields"
    @onColumnReorder="handleColumnReorder"
    @onRowClick="handleRowClick"
  >
    <template v-slot:actionsSlot="actionsProps">
      <slot name="actionsSlot" v-bind="actionsProps"></slot>
    </template>
    <template v-slot:sideViewSlot="sideViewProps">
      <slot name="sideViewSlot" v-bind="sideViewProps"></slot>
    </template>
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
    defaultQuery: String,
    headerConfig: String,
    deleteAction: String,
    itemKey: String,
    refreshData: Boolean,
    list: Array,
    initialHeaders: Array,
    fetchList: Function,
    refreshAction: Function,
    listDetails: Object,
    usedEntities: Object,
    showHeaderConfig: String,
    showNameTooltip: Boolean,
    hideSelect: Boolean,
    hideAddIcon: Boolean,
    sortBy: String,
    sortDesc: Boolean,
  },
  data: () => ({
    filteredQuery: '',
    pageQuery: null,
    isLoading: null,
    headers: [],
    fields: [],
    selected: [],
    showHeaderConfigMenu: true,
    sort: '',
    isSortDesc: '',
    page: 1,
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      userTeam: 'userTeam',
      meta: 'meta',
    }),
    resetList: function () {
      if (this.pageQuery) {
        return false
      }
      return true
    },
    finalQuery: function () {
      let sortQuery

      if (this.sort) sortQuery = this.handleTableSort()

      const queries = [
        this.defaultQuery,
        this.filteredQuery,
        this.pageQuery,
        sortQuery,
      ]
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
    },
    entitiesQuery: function () {
      const entities = Object.keys(this.usedEntities)
      return entities.join()
    },
  },
  async mounted() {
    this.isLoading = true
    this.sort = this.sortBy
    this.isSortDesc = this.sortDesc

    await this.setHeaders()
    await this.getEntitiesFields()
    await this.getData(this.finalQuery, true)

    if (this.showHeaderConfig == 'hide') {
      this.showHeaderConfigMenu = false
    }
  },
  watch: {
    list() {},
    async refreshData(newValue) {
      if (newValue && this.finalQuery.includes('page')) {
        this.resetPagination()
      } else if (!this.isLoading) {
        await this.getData(this.finalQuery, true)
        this.refreshAction(false)
      }
    },
    defaultQuery() {
      this.resetPagination()
    },
    filteredQuery() {
      this.resetPagination()
    },
    async finalQuery(newValue) {
      if (!this.isLoading) {
        await this.getData(newValue, this.refreshData)
        if (this.refreshData) this.refreshAction(false)
      }
    },
    async url() {
      if (!this.isLoading) await this.getData(this.finalQuery, true)
    },
    selected(newValue) {
      this.$emit('onItemSelected', newValue)
    },
    async sort() {
      if (!this.isLoading) await this.getData(this.finalQuery, true)
    },
    async isSortDesc() {
      if (!this.isLoading) await this.getData(this.finalQuery, true)
    },
  },
  methods: {
    async getData(query, resetPagination = false) {
      this.handleLoading(true)

      if (resetPagination) this.resetPagination()

      await this.fetchList({
        url: this.url,
        query,
        reset: resetPagination ? resetPagination : this.resetList,
      })

      this.handleLoading(false)
    },
    async getEntitiesFields() {
      let fields = []
      const entities = await this.getList(
        '/meta/entity-dictionary',
        `entity=in(${this.entitiesQuery})`
      )
      entities.forEach((entity) => {
        fields = [
          ...fields,
          ...entity.data.map((field) => ({
            ...field,
            entity: this.usedEntities[entity.entity],
          })),
        ]
      })
      this.fields = fields
    },
    handleLoading(loading) {
      this.isLoading = loading
      this.$emit('tableLoading', loading)
    },
    handleTableSort() {
      const sortValue = this.initialHeaders?.find(
        (head) => head.value === this.sort
      )

      if (sortValue) {
        const order = sortValue?.useEntities
          ? sortValue?.entity
          : sortValue?.value

        return `order=${order}${this.isSortDesc ? '_desc' : ''}`
      }
    },
    handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && page * itemsPerPage >= itemsLength) {
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

      this.page = 1
    },
    handleColumnFilter(headers) {
      let query = ''

      headers.forEach(
        ({ value, filterType, filterValue, meta, entity, useEntities }) => {
          if (entity == 'bureau-company' && value == 'name') {
            if (filterValue?.length < 4) {
              return
            }
          }

          let columnFilter = ''

          if (meta && filterValue) {
            filterType = 'equal'
          }

          if (filterType != null && filterValue) {
            if (filterType == 'equal') {
              columnFilter = `${value}=${filterValue}`
            } else {
              if (useEntities)
                columnFilter = `${entity}=${filterType}(${filterValue})`
              else columnFilter = `${value}=${filterType}(${filterValue})`
            }
          } else {
            columnFilter = ''
          }
          if (query.length > 0 && columnFilter) {
            query += `&${columnFilter}`
          } else {
            query += columnFilter
          }
        }
      )

      this.filteredQuery = query
      this.saveHeaders(this.headers)
    },
    handleFields(event) {
      const { action, field } = event
      if (field) {
        let value = field.field
        field.entity != this.mainEntity &&
          (value = field.entity ? `${field.entity}.${value}` : `${value}`)
        if (action == 'include') {
          const lastPos = this.headers.length
          this.headers.push({
            text: field.label,
            entity: field.entity,
            meta: field.meta,
            value,
            filterable: true,
            filterType: field.meta ? 'equal' : null,
            filterValue: null,
          })
          this.headers.splice(
            lastPos,
            0,
            this.headers.splice(lastPos - 1, 1)[0]
          )
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
    handleRowClick(row) {
      this.$emit('onRowClick', row)
    },
    setHeaders() {
      this.headers = this.initialHeaders
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      if (pageSettings) {
        if (pageSettings[`${this.headerConfig}`]) {
          const headers = pageSettings[`${this.headerConfig}`].map((header) => {
            if (header.value[0] === '.') {
              header.value = header.value.substring(1)
            }
            return header
          })
          this.headers = headers.filter(
            (header) => header.value !== 'company.origin'
          )
        }
      }
    },
    saveHeaders(headers) {
      const pageSettings = JSON.parse(localStorage.getItem('page_settings'))
      const formattedHeaders = headers
        .map((header) => {
          if (header.value[0] === '.') {
            header.value = header.value.substring(1)
          }
          return {
            ...header,
          }
        })
        .sort((a, b) => a.pos < b.pos)
      localStorage.setItem(
        'page_settings',
        JSON.stringify({
          ...pageSettings,
          [`${this.headerConfig}`]: formattedHeaders,
        })
      )
    },
    onResetSelectedItems() {
      this.$refs.dataTable.ResetSelectedItems()
    },
  },
}
</script>
