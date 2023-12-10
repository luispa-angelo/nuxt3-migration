<template>
  <v-data-table
    v-bind="$attrs"
    v-on="$listeners"
    class="data-table"
    locale="pt"
    v-sortable-data-table="sortable"
    :headers="tableHeaders"
    :items="items"
    :search="search"
    :loading="isLoading"
    :show-select="isMultiple ? true : false"
    :sort-desc="sortDesc"
    :sort-by="sortBy"
    :hide-default-header="sortHeaders"
    :footer-props="footerProps"
    :headerProps="headerProps"
    :options="{ multiSort: multiSort }"
    @sorted="saveOrder"
    @click:row="handleClick"
    @update:options="updatePagination"
  >
    <!-- Header tooltip -->
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

    <template v-slot:[`item.actionsIcons`]="{ item }">
        <slot
          v-if="actionsIcons"
          name="actionsIconsSlot"
          v-bind="{
            isEditing,
            itemId: item.id,
            itemName: item.name,
            item: item,
            dataUpdate,
          }"
        />
      </template>

    <template v-slot:[`item.actions`]="{ item, index }">
      <v-menu
        v-if="hasMenu"
        left
        :offset-x="true"
        :close-on-content-click="false"
        @click.native.stop
        attach
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-if="iconDelete" text icon @click="handleDelete(item)">
            <v-icon dense>mdi-trash-can-outline</v-icon>
          </v-btn>
          <v-btn v-else-if="!actionsIcons" icon v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list>
          <v-list-item class="text-center" v-if="showOpenAction">
            <v-list-item-title>
              <v-btn text @click="handleClick(item)"> Abrir </v-btn>
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="!emptySlot">
            <v-list-item-title>
              <slot
                v-bind="{
                  isEditing,
                  itemId: item.id,
                  itemName: item.name,
                  index: index,
                  item: item,
                  dataUpdate,
                }"
              />
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="hasTaskBtn">
            <v-list-item-title>
              <slot
                class="mx-0"
                name="editTask"
                v-bind="{
                  isEditing,
                  itemId: item.id,
                  itemName: item.name,
                  item: item,
                  dataUpdate,
                }"
              />
            </v-list-item-title>
          </v-list-item>

          <v-list-item v-if="deleteAction">
            <v-list-item-title>
              <v-btn
                v-if="deleteAction == 'delete'"
                text
                @click.stop="handleDelete(item)"
              >
                Deletar
              </v-btn>

              <DeleteItem
                v-else
                :item-id="item.id"
                :item-name="item.name"
                :delete-action="deleteAction"
                @hasDeleted="handleDeleteAction"
              />
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <section v-else class="mr-4">
        <slot
          v-bind="{
            isEditing,
            itemId: item.id,
            itemName: item.name,
            item: item,
            dataUpdate,
          }"
        />
      </section>
    </template>

    <!-- eslint-disable-next-line vue/valid-v-slot -->
    <template v-slot:item.associatedItems="{ item }">
      <v-tooltip v-if="item.associatedItems !== 'Não associado'" top>
        <template v-slot:activator="{ on, attrs }">
          <v-chip
            v-bind="attrs"
            v-on="on"
            outlined
            label
            color="green"
            class="associatedItemsChip"
          >
            {{ item.associatedItems }}
          </v-chip>
        </template>
        <p v-for="(item, index) in item.itemName" :key="index">
          {{ item }}
        </p>
      </v-tooltip>
      <v-chip
        v-else
        label
        disabled
        class="associatedItemsChip"
        outlined
      >
        {{ item.associatedItems }}
      </v-chip>
    </template>

    <template v-slot:[`item.checkbox`]="{ item }">
      <v-simple-checkbox
        v-model="item.preferential"
        :ripple="false"
        @input="checkboxInput($event, item)"
      ></v-simple-checkbox>
    </template>

    <template v-slot:[`footer.page-text`]="props">
      {{ props.pageStart }}-{{ props.pageStop }}
    </template>
  </v-data-table>
</template>

<script>
import Sortable from 'sortablejs'

export default {
  inheritAttrs: false,
  props: {
    isMultiple: Boolean,
    isLoading: Boolean,
    search: String,
    redirectTo: String,
    headers: Array,
    items: Array,
    actionOptions: Boolean,
    checkboxOption: String,
    isEditing: Boolean,
    deleteAction: String,
    totalItems: Number,
    showMultipleEmails: Boolean,
    showMultiplePhones: Boolean,
    showNameTooltip: Boolean,
    showOpenAction: Boolean,
    iconDelete: {
      type: Boolean,
      default: false,
    },
    actionsIcons: {
      type: Boolean,
      default: false
    },
    dateFormat: String,
    tableItemMaxWidth: {
      type: String,
      default: '18vw',
    },
    multiSort: {
      type: Boolean,
      default: true,
    },
    hasMenu: {
      type: Boolean,
      default: true,
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
    hasTaskBtn: {
      type: Boolean,
      default: false,
    },
    sortable: {
      type: Boolean,
      default: false,
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
  },
  data: () => ({
    tableHeaders: [],
    sortHeaders: false,
    sortableItems: [],
    footerProps: {
      'items-per-page-options': [2, 5, 10, 15],
    },
    headerProps: {
      'sort-icon': 'mdi-swap-vertical',
    },
  }),
  watch: {
    items(newValue) {
      if (newValue.length > 0) {
        this.generateHeaders()
      }
    },
  },
  computed: {
    cssProps() {
      return {
        '--maxWidth': this.tableItemMaxWidth,
      }
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
      this.generateActionButtons()
      this.generateActionsIconsButton()
    },
    generateActionButtons() {
      const hasActions = this.tableHeaders.find(
        (header) => header.value === 'actions'
      )
      if (this.actionOptions && !hasActions) {
        this.tableHeaders.push({
          text: 'Ações',
          value: 'actions',
          align: 'right',
          sortable: false,
        })
      }
    },
    generateActionsIconsButton() {
      const hasActions = this.tableHeaders.find(
        (header) => header.value === 'actionsIcons'
      )
      if (this.actionsIcons && !hasActions) {
        this.tableHeaders.push({
          text: 'Ações',
          value: 'actionsIcons',
          align: 'right',
          class: 'pr-8',
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
        })
      }
    },
    handleClick(target) {
      this.$emit('onRowClick', target)
    },
    updateHeaderOrder(evt) {
      let headers = this.headers
      let old_index = evt.oldIndex
      let new_index = evt.newIndex
      if (new_index >= headers.length) {
        var k = new_index - headers.length + 1
        while (k--) {
          headers.push(undefined)
        }
      }
      headers.splice(new_index, 0, headers.splice(old_index, 1)[0])
      // eslint-disable-next-line vue/no-mutating-props
      this.headers = headers
      this.id++
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
    updatePagination({ page, itemsPerPage }) {
      const length = this.items.length
      if (length > 0 && page * itemsPerPage >= length) {
        this.$emit('pagination', true)
      }
    },
    handleDeleteAction(id) {
      const item = this.items.find((item) => item.id == id)
      this.handleDelete(item)
    },
    handleDelete(item) {
      const index = this.items.indexOf(item)
      this.$emit('removeItem', index, item)
    },
    dataUpdate() {
      this.$emit('dataUpdate', true)
    },
    checkboxInput(value, item) {
      const index = this.items.indexOf(item)
      this.$emit('onCheck', { value, index, id: item.relationalId })
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
}
</script>

<style scoped lang="scss">
.sort-header {
  text-align: left;
  color: gainsboro;
}

.data-table {
  cursor: pointer !important;
  color: var(--v-default-text-base);
  position: relative;

  ::v-deep .v-data-table-header {
    th,
    th.sortable {
      span {
        font-size: 0.9rem;
        color: var(--v-default-text-base);
        font-weight: 600;

        &.v-data-table-header__sort-badge {
          display: none;
        }
      }

      &.active .v-data-table-header__icon {
        color: var(--v-primary-base);
      }
      .v-data-table-header__icon {
        opacity: 1 !important;
        margin-left: 8px;
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

    td .menu_wrapper {
      .empty {
        color: var(--v-sub-text-base);
      }
    }

    .v-badge {
      float: right;
    }

    .associatedItemsChip {
      display: flex;
      justify-content: center;
      align-items: center;
      > span {
        font-weight: 500;
      }
    }
  }

  ::v-deep .v-data-footer {
    i {
      height: 19px;
      font-size: 19px !important;
      width: 19px;
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
