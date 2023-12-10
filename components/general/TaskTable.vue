<template>
    <div>
        <v-data-table
            class="data-table transparent"
            locale="pt"
            v-sortable-data-table="sortable"
            v-bind="$attrs"
            v-on="$listeners"
            :headers="tableHeaders"
            :items="items"
            :search="search"
            :show-select="isMultiple ? true : false"
            @sorted="saveOrder"
            @update:options="updatePagination"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-row>
                    <v-col class="d-flex justify-center align-center">
                        <v-menu left :offset-x="true">
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    icon
                                    v-bind="attrs"
                                    v-on="on"
                                    style="margin-left: -15px"
                                >
                                    <v-icon>mdi-dots-vertical</v-icon>
                                </v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-if="!emptySlot">
                                    <v-list-item-title>
                                        <slot
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
                                <v-list-item>
                                    <v-list-item-title>
                                        <v-btn
                                            v-if="deleteAction == 'delete'"
                                            text
                                            @click="handleDelete(item)"
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
                    </v-col>
                </v-row>
            </template>
            <template v-slot:[`item.priority`]="{ item }">
                <v-chip :color="priorityColors[item.priority]">{{
                    item.priority
                }}</v-chip>
            </template>
            <template v-slot:[`item.type.name`]="{ item }">
                <TaskModal
                    has-button
                    :icon-button="checkModalType(item)"
                    :item-id='item.id'
                />
            </template>
            <template v-slot:[`item.scheduling`]="{ item }">
                <v-chip :color="schedulingColors[item.scheduling]">{{
                    item.scheduling
                }}</v-chip>
            </template>
            <template v-slot:[`item.checkbox`]="{ item }">
                <v-simple-checkbox
                    v-model="item.preferential"
                    :ripple="false"
                    @input="checkboxInput($event, item)"
                ></v-simple-checkbox>
            </template>
            <template v-slot:[`footer.page-text`]="props">
                {{ props.pageStart }}-{{ props.pageStop }} de
                {{ totalItems ? totalItems : props.itemsLength }}
            </template>
        </v-data-table>
    </div>
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
    teste: {
      itemsLength: 100,
    },
    priorityColors: {
      Alta: 'error',
      Media: 'warning',
      Baixa: 'success',
    },
    schedulingColors: {
      Atrasada: 'error',
      Agendada: 'warning',
      Concluída: 'success',
    },
  }),
  mounted() {
    if (this.items.length > 0) {
      this.generateHeaders()
    }
  },
  methods: {
    checkModalType(task) {
      const { type } = task

      if (type?.extra) {
        const { modal } = JSON.parse(type.extra)
        switch (modal) {
        case 'mail':
          return 'mail'
        case 'call':
          return 'call'
        case 'chat':
          return 'chat'
        default:
          return 'default'
        }
      }
      return 'default'
    },
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
      if (this.redirectTo) {
        if (target.partnership == 'partner') {
          this.$router.push({
            name: 'partner-id',
            params: { id: target.id },
          })
        } else {
          this.$router.push({
            name: `${this.redirectTo}`,
            params: { id: target.id },
          })
        }
      }
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
      this.$emit('removeItem', index)
    },
    dataUpdate() {
      this.$emit('dataUpdate', true)
    },
    checkboxInput(value, item) {
      const index = this.items.indexOf(item)
      this.$emit('onCheck', { value, index, id: item.relationalId })
    },
  },
  watch: {
    items(newValue) {
      if (newValue.length > 0) {
        this.generateHeaders()
      }
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
          Sortable.create(
            el.getElementsByTagName('tbody')[0],
            options
          )
        }
      },
    },
  },
}
</script>

<style scoped>
.sort-header {
    text-align: left;
    color: gainsboro;
}
.data-table {
    cursor: pointer !important;
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
