<template>
  <div>
    <v-data-table
      class="data-table"
      locale="pt"
      ref="data-table"
      v-bind="$attrs"
      v-on="$listeners"
      v-model="selectedRows"
      v-sortable-headers="{ onEnd: updateHeaderOrder }"
      :footer-props="footerProps"
      :sort-desc="sortDesc"
      :sort-by="sortBy"
      :headerProps="headerProps"
      :headers="tableHeaders"
      :items="items"
      :key="anIncreasingNumber"
      :showHeaderConfig="headerConfig"
      :options="{ multiSort: multiSort }"
      @sorted="saveOrder"
      @click:row="handleClick"
      @toggle-select-all="handleSelect"
    >
      <!-- Header filter -->
      <template v-slot:[`body.prepend`]="{ headers }">
        <tr>
          <th v-for="header in headers" :key="header.text">
            <div
              v-if="header.filterable"
              class="d-flex align-center flex-row flex-wrap"
            >
              <v-autocomplete
                attach
                v-if="header.meta"
                hide-details
                clearable
                dense
                class="w-25"
                v-model="header.filterValue"
                :items="meta[header.meta]"
                :data-test="header.value"
                item-text="name"
                item-value="value"
                @change="setFilter"
              />

              <div v-else class="d-flex align-center flex-row flex-wrap">
                <v-text-field
                  class="w-25 mb-1 mr-1"
                  :hint="header.filterName"
                  persistent-hint
                  dense
                  v-model="header.filterValue"
                  :data-test="header.value"
                  @change="setFilter"
                />

                <ColumnFilterMenu
                  @onFilterSelected="
                    (filterType) => {
                      header.filterType = filterType.value
                      header.filterName = filterType.name
                      if (!filterType) {
                        header.filterValue = null
                      }
                      $emit('onFilterApplied', tableHeaders)
                    }
                  "
                />
              </div>
            </div>
          </th>
        </tr>
      </template>

      <!-- Header name tooltip -->
      <template v-slot:[`header.name`]="{ header }" v-if="showNameTooltip">
        <v-tooltip top>
          <template v-slot:activator="{ on, attrs }">
            <span>
              {{ header.text }}
              <v-icon
                dark
                v-bind="attrs"
                v-on="on"
                size="16"
                style="color: var(--v-sub-text-base); margin: 0 4px"
              >
                mdi-information-outline
              </v-icon>
            </span>
          </template>
          <span>Inclui o nome social</span>
        </v-tooltip>
      </template>

      <!-- Header check-box -->
      <template v-if="showHeaderConfig" v-slot:[`header.actions`]="{ header }">
        <v-menu
          v-if="header"
          max-height="500px"
          origin="bottom-left"
          eager
          offset-y
          :close-on-content-click="false"
        >
          <template v-slot:activator="{ on, attrs }" v-if="!hideAddIcon">
            <v-icon v-bind="attrs" v-on="on" small>mdi-plus</v-icon>
          </template>

          <v-list>
            <v-list-item v-for="(field, index) in fields" :key="index">
              <v-checkbox
                v-model="selectedFields"
                :label="field.label"
                :value="field"
              />
            </v-list-item>
          </v-list>
        </v-menu>
      </template>

      <!-- Multiple fields -->
      <template
        v-for="slot_item in tableHeaders"
        v-slot:[`item.${slot_item.value}`]="{ item }"
      >
        <div :key="slot_item.value" :style="cssProps">
          <v-menu
            :key="slot_item.value"
            top
            offset-y
            open-on-hover
            content-class="multipleFields"
          >
            <template v-slot:activator="{ on, attrs }">
              <span class="menu_wrapper">
                <v-tooltip
                  bottom
                  :z-index="999"
                  :disabled="
                    handleItemMultiValues(item, slot_item) &&
                    (handleItemMultiValues(item, slot_item).isEmpty ||
                      handleItemMultiValues(item, slot_item).length <= 13)
                      ? true
                      : false
                  "
                >
                  <template v-slot:activator="{ on, attrs }">
                    <span
                      class="truncate_text"
                      :class="
                        handleItemMultiValues(item, slot_item) &&
                        handleItemMultiValues(item, slot_item).isEmpty
                          ? 'empty'
                          : ''
                      "
                      v-bind="attrs"
                      v-on="on"
                    >
                      {{
                        handleItemMultiValues(item, slot_item) &&
                        handleItemMultiValues(item, slot_item).isEmpty
                          ? 'Contém'
                          : handleItemMultiValues(item, slot_item)
                      }}
                    </span>
                  </template>
                  <span> {{ handleItemMultiValues(item, slot_item) }}</span>
                </v-tooltip>

                <div
                  class="badge_wrapper"
                  v-bind="attrs"
                  v-on="on"
                  v-if="
                    slot_item.multipleFields &&
                    handleItemMultiValues(item, slot_item) &&
                    !handleItemMultiValues(item, slot_item).isEmpty
                  "
                >
                  <v-badge
                    color="primary"
                    :content="
                      handleItemMultiValues(item, slot_item, true).length > 9
                        ? '9+'
                        : handleItemMultiValues(item, slot_item, true).length
                    "
                    :value="handleItemMultiValues(item, slot_item, true).length"
                    inline
                    v-bind="attrs"
                    v-on="on"
                  />
                </div>
              </span>
            </template>

            <v-list
              style="display: flex; flex-direction: column"
              v-if="slot_item.multipleFields"
            >
              <span>{{ slot_item.text }}</span>

              <v-divider class="mt-1" />
              <div class="list_wrapper">
                <v-list-item
                  v-for="(slot_value, index) in handleItemMultiValues(
                    item,
                    slot_item,
                    true
                  )"
                  :key="index"
                >
                  <v-list-item-subtitle
                    v-text="slot_value[`${slot_item.value.split('.')[1]}`]"
                  />
                </v-list-item>
              </div>
            </v-list>
          </v-menu>
        </div>
      </template>

      <!-- Actions -->
      <template v-slot:[`item.actions`]="{ item }">
        <v-row>
          <v-col class="d-flex justify-center align-center">
            <v-menu left :offset-x="true" :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" style="margin-left: -15px">
                  <v-icon class="material-symbols-rounded v-icon"
                    >more_vert</v-icon
                  >
                </v-btn>
              </template>

              <v-list>
                <slot
                  name="actionsSlot"
                  v-bind="{
                    isEditing,
                    itemId: item.id,
                    itemName: item.name,
                    item: item,
                    dataUpdate,
                  }"
                />
              </v-list>
            </v-menu>
          </v-col>
        </v-row>
      </template>

      <template v-slot:[`item.sideView`]="{ item }">
        <slot
          name="sideViewSlot"
          v-bind="{
            isEditing,
            itemId: item.id,
            itemName: item.name,
            item: item,
            dataUpdate,
          }"
        />
      </template>

      <!-- eslint-disable-next-line vue/valid-v-slot -->
      <template v-slot:item.expire="{ item }">
        <v-chip :color="getExpireColor(item.expire)" dark>
          {{ item.expire }}
        </v-chip>
      </template>

      <!-- Check-box -->
      <template v-slot:[`item.checkbox`]="{ item }">
        <v-simple-checkbox
          :ripple="false"
          @input="checkboxInput($event, item)"
        />
      </template>

      <!-- created_at -->
      <template v-slot:[`item.created_at`]="{ item }">
        <span>{{ $moment(`${item.created_at}Z`).format('DD/MM/yyyy [às] HH:mm') }}</span>
      </template>

      <!-- updated_at -->
      <template v-slot:[`item.updated_at`]="{ item }">
        <span>{{ $moment(`${item.updated_at}Z`).format('DD/MM/yyyy [às] HH:mm') }}</span>
      </template>

      <!-- scheduled_to -->
      <template v-slot:[`item.scheduled_to`]="{ item }">
        <span>{{ $moment(`${item.scheduled_to}Z`).format('DD/MM/yyyy [às] HH:mm') }}</span>
      </template>

      <!-- Footer props -->
      <template v-slot:[`footer.page-text`]="props">
        {{ totalItems > 0 ? `${props.pageStart}-${props.pageStop}` : '' }}
      </template>
    </v-data-table>
  </div>
</template>

<script>
import Sortable from 'sortablejs'

import { mapGetters } from 'vuex'

function watchClass(targetNode, classToWatch) {
  let lastClassState = targetNode.classList.contains(classToWatch)
  const observer = new MutationObserver((mutationsList) => {
    for (let i = 0; i < mutationsList.length; i++) {
      const mutation = mutationsList[i]
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class'
      ) {
        const currentClassState =
          mutation.target.classList.contains(classToWatch)
        if (lastClassState !== currentClassState) {
          lastClassState = currentClassState
          if (!currentClassState) {
            mutation.target.classList.add('sortable')
          }
        }
      }
    }
  })
  observer.observe(targetNode, { attributes: true })
}

export default {
  inheritAttrs: false,
  props: {
    showNameTooltip: Boolean,
    hideAddIcon: Boolean,
    redirectTo: String,
    headers: Array,
    fields: Array,
    items: Array,
    actionOptions: Boolean,
    checkboxOption: String,
    mainEntity: String,
    isEditing: Boolean,
    deleteAction: String,
    totalItems: Number,
    multiSort: Boolean,
    showSelectOption: Boolean,
    tableItemMaxWidth: {
      type: String,
      default: '10vw',
    },
    showHeaderConfig: {
      type: Boolean,
      default: true,
    },
    url: {
      type: String,
      default: undefined,
    },
    sortDesc: {
      type: Boolean,
      default: true,
    },
    sortBy: {
      type: String,
      default: 'id',
    },
    emptySlot: {
      type: Boolean,
      default: false,
    },
    sortable: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    tableHeaders: [],
    sortHeaders: false,
    sortableItems: [],
    anIncreasingNumber: 1,
    selectedFields: [],
    selectedRows: [],
    headerConfig: true,
    filterLabel: '',
    filter: {},
    footerProps: {
      'items-per-page-options': [5, 10, 15],
    },
    headerProps: {
      'sort-icon': 'mdi-swap-vertical',
    },
  }),
  computed: {
    ...mapGetters({ meta: 'meta' }),
    cssProps() {
      return {
        '--maxWidth': this.tableItemMaxWidth,
      }
    },
  },
  watch: {
    items(newValue) {
      if (newValue.length > 0) {
        this.generateHeaders()
      }
    },
    headers(newValue) {
      if (newValue.length > 0) {
        this.generateHeaders()
      }
    },
    selectedFields(newValue, oldValue) {
      if (oldValue.length > 0) {
        if (newValue.length > oldValue.length) {
          const [field] = newValue.filter((field) => !oldValue.includes(field))
          this.$emit('onFieldChange', { action: 'include', field })
        } else {
          const [field] = oldValue.filter((field) => !newValue.includes(field))
          this.tableHeaders = this.tableHeaders.filter(
            (header) => header.value != field
          )
          this.$emit('onFieldChange', { action: 'remove', field })
        }
      }
    },
    fields(newValue) {
      if (newValue.length > 0) {
        this.generateSelectedFields()
      }
    },
    showHeaderConfig(newValue) {
      this.headerConfig = newValue
    },
  },
  mounted() {
    if (this.items.length > 0) {
      this.generateHeaders()
    }
  },
  methods: {
    generateHeaders() {
      if (!this.headers) {
        const model = this.items[0]
        const keys = Object.keys(model)
        const defaultHeaders = keys.map((key) => ({
          text: key,
          value: key,
        }))
        this.tableHeaders = defaultHeaders
      } else {
        this.tableHeaders = this.headers
      }
      this.generateCheckbox()
      this.generateSideButton()
      this.generateActionButtons()
    },
    generateActionButtons() {
      const hasActions = this.tableHeaders.find(
        (header) => header.value === 'actions'
      )
      if (this.actionOptions && !hasActions) {
        this.tableHeaders.push({
          text: 'Ações',
          value: 'actions',
          align: 'center',
          sortable: false,
        })
      }
    },
    generateSideButton() {
      const hasActions = this.tableHeaders.find(
        (header) => header.value === 'sideView'
      )
      if (this.actionOptions && !hasActions) {
        this.tableHeaders.push({
          text: '',
          value: 'sideView',
          align: 'center',
          sortable: false,
        })
      }
    },
    generateCheckbox() {
      const hasCheck = this.tableHeaders.find(
        (header) => header.value === 'checkbox'
      )
      if (this.checkboxOption && !hasCheck) {
        this.tableHeaders.push({
          text: this.checkboxOption,
          value: 'checkbox',
          align: 'center',
          width: '5%',
          class: 'd-flex justify-space-between align-center flex-wrap',
        })
      }
    },
    generateSelectedFields() {
      this.selectedFields = this.tableHeaders
        .map((header) => {
          if (header.entity == this.mainEntity) {
            return this.fields.find((field) => field.field == header.value)
          } else {
            return this.fields.find(
              (field) =>
                (field.entity
                  ? `${field.entity}.${field.field}`
                  : `${field.field}`) == header.value
            )
          }
        })
        .filter((field) => field)
    },
    handleClick(target) {
      this.$emit('onRowClick', target)
    },
    updateHeaderOrder(event) {
      const headersTmp = this.headers
      const oldIndex = this.showSelectOption
        ? event.oldIndex - 1
        : event.oldIndex
      const newIndex = this.showSelectOption
        ? event.newIndex - 1
        : event.newIndex
      headersTmp.splice(newIndex, 0, headersTmp.splice(oldIndex, 1)[0])
      this.tableHeaders = headersTmp.map((header, index) => ({
        ...header,
        pos: index,
      }))
      this.anIncreasingNumber += 1
      this.$emit('onColumnReorder', this.tableHeaders)
    },
    saveOrder(event) {
      const { oldIndex, newIndex } = event
      // eslint-disable-next-line vue/no-mutating-props
      const movedItem = this.items.splice(oldIndex, 1)[0]
      // eslint-disable-next-line vue/no-mutating-props
      this.items.splice(newIndex, 0, movedItem)
      this.sortableItems = this.items.map((item, index) => ({
        id: item.id,
        index: index,
      }))
      this.$emit('sortItems', this.sortableItems)
    },
    handleDeleteAction(id) {
      const item = this.items.find((item) => item.id == id)
      this.handleDelete(item)
    },
    handleDelete(item) {
      const index = this.items.indexOf(item)
      this.$emit('removeItem', index)
    },
    dataUpdate() {
      this.$emit('dataUpdate', true)
    },
    checkboxInput(value, item) {
      const index = this.items.indexOf(item)
      this.$emit('onCheck', { value, index, id: item.relationalId })
    },
    setFilter() {
      this.$emit('onFilterApplied', this.tableHeaders)
    },
    charValidation({ entity, value, filterValue }) {
      if (!filterValue) {
        return true
      }
      if (filterValue.length == 0) {
        return true
      }
      if (entity == 'bureau-company' && value == 'name') {
        if (filterValue?.length < 4) {
          console.log('nao pode')
          return false
        }
      }
      return true
    },
    handleSelect(event) {
      const selectAll = event.value
      if (!selectAll) {
        this.selectedRows = []
      }
    },
    ResetSelectedItems() {
      this.selectedRows = []
    },
    getExpireColor(expire) {
      var expireNumber = expire.replace(/\D/g, '')
      if (expireNumber > 12) return 'green'
      else if (expireNumber > 6) return 'yellow darken-3'
      else return 'orange darken-3'
    },
    handleItemMultiValues(row, item, asArray = false) {
      return item.value.split('.').reduce(function (o, key) {
        if (asArray && Array.isArray(o)) {
          return o
        } else if (item.multipleFields && Array.isArray(o) && o[0]) {
          return o[0].isEmpty ? o[0] : o[0][key]
        }

        return o ? o[key] : ''
      }, row)
    },
  },
  directives: {
    sortableDataTable: {
      bind(el, binding, vnode) {
        if (binding.value) {
          const options = {
            animation: 150,
            onUpdate: function (event) {
              vnode.child.$emit('sorted', event)
            },
          }
          Sortable.create(el.getElementsByTagName('tbody')[0], options)
        }
      },
    },
    sortableHeaders: {
      inserted: (el, binding) => {
        el.querySelectorAll('th').forEach((draggableEl) => {
          // Need a class watcher because sorting v-data-table rows asc/desc removes the sortHandle class
          watchClass(draggableEl, 'sortable')
          draggableEl.classList.add('sortable')
        })
        Sortable.create(
          el.querySelector('tr'),
          binding.value ? { ...binding.value, handle: '.sortable' } : {}
        )
      },
    },
  },
}
</script>

<style scoped lang="scss">
.sort-header {
  text-align: left;
  color: gainsboro;
}

.v-data-table .v-data-table__wrapper table tbody tr td {
  border-left: 1px solid #d40d0d !important;
}

.data-table {
  cursor: pointer !important;

  ::v-deep .v-data-table-header {
    th,
    th.sortable {
      span {
        font-size: 0.9rem;
        color: var(--v-default-text-base);
        font-weight: 600;
      }

      .v-data-table-header__sort-badge {
        display: none;
      }

      &.active .v-data-table-header__icon {
        color: var(--v-primary-base) !important;
      }
      .v-data-table-header__icon {
        opacity: 1 !important;
        float: right;
      }
    }
  }

  ::v-deep tbody tr {
    &:hover {
      background-color: var(--v-primary-lighten5) !important;
    }

    td .menu_wrapper {
      height: 100%;
      width: 100%;

      display: flex;
      align-items: center;
      justify-content: space-between;

      .empty {
        color: var(--v-sub-text-base);
      }
    }

    td .badge_wrapper {
      display: flex;
      align-content: center;
      height: 100%;
    }

    td,
    span {
      max-width: calc(var(--maxWidth) - 20px);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    span {
      display: inline-block;
    }

    .v-badge {
      float: right;
    }
  }
}

tr:nth-of-type(4n + 3) {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.truncate {
  max-width: 1px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

<style lang="scss">
.multipleFields {
  .v-list {
    .list_wrapper {
      height: auto;
      width: 100%;
      max-height: 40vh;
      overflow-y: auto;

      // Thinner Scrollbar
      @include thin-scrollbar;
    }

    .v-list-item {
      cursor: pointer;

      &:hover {
        background: var(--v-primary-lighten5) !important;

        .v-list-item__subtitle {
          color: var(--v-default-text-base) !important;
          font-weight: 600;
        }
      }
    }

    span,
    .v-list-item__subtitle {
      color: var(--v-sub-text-base) !important;
      font-size: 1rem;
      font-weight: 500;
    }

    span {
      padding: 0.4rem 16px;
    }
  }
}
</style>
