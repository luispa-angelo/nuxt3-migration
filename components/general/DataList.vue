<template>
  <div>
    <v-list v-if="checkList" two-line dense>
      <v-list-item v-for="(item, index) in list" :key="index">
        <v-list-item-content>
            <v-list-item-title class="font-body-large mb-1">
              <span
                :class="redirectOnClick ? 'click-pointer text-center' : 'text-center'"
                @click="handleClick(index)"
              >
                {{ item.title_1 | truncate(21) }} {{ item.title_2 ? `(${item.title_2})` : ''}}
              </span>
              <v-chip v-if="item.tag && item.tag != 'presente'" small>
                <span>{{item.tag}}</span> 
              </v-chip>
            </v-list-item-title>
            <v-list-item-subtitle class="font-body-medium">
              <span>
                {{ item.subtitle_1 }}
              </span>
              <span v-if="item.subtitle_1 && item.subtitle_2" class="mx-2">|</span>
              <span>{{ item.subtitle_2 }}</span>
            </v-list-item-subtitle>
        </v-list-item-content>
        <v-list-item-action v-if="hasMenu" :class="item.link ? 'd-flex align-center' : ''">
          <v-menu left :offset-x="true" v-if="!item.link">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                class="mb-2"
              > 
                <v-icon>mdi-dots-vertical</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-if="hasSlot">
                <v-list-item-title>
                  <slot
                    v-bind="{
                      isEditing,
                      itemId: item.id,
                      itemName: item.title_1,
                      item: item,
                      dataUpdate
                    }"
                  />
                </v-list-item-title>
              </v-list-item>
              <v-list-item v-if="hasDelete">
                <v-list-item-title>
                  <v-btn v-if="deleteAction == 'delete'" text @click="handleDelete(item)" >
                    Deletar
                  </v-btn>
                  <DeleteItem
                    v-else
                    :url="url"
                    :item-id="item.id"
                    :item-name="item.title_1"
                    :delete-action="deleteAction"
                    @hasDeleted="handleDeleteAction"
                  />
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          <a v-else :href="item.link" target="_blank">Visualizar</a>
        </v-list-item-action>
      </v-list-item>
    </v-list>
    <p v-else class="text-center">{{noDataText}}</p>
  </div>
</template>

<script>
export default {
  props: {
    isEditing: Boolean,
    hasMenu: Boolean,
    hasSlot: Boolean,
    hasDelete: Boolean,
    list: Array,
    deleteAction: String,
    url: {
      type: String,
      default: undefined
    },
    noDataText: {
      type: String,
      default: 'Nenhum registro encontrado.'
    },
    redirectOnClick: {
      type: Boolean,
      default: false
    },
  },
  data: () => ({}),
  computed: {
    checkList: function() {
      if(this.list.length > 0) {
        return true
      }
      return false
    }
  },
  methods: {
    dataUpdate() {
      this.$emit('dataUpdate', true)
    },
    handleDeleteAction(id) {
      const item = this.list.find((item) => item.id == id)
      this.handleDelete(item)
    },
    handleDelete(item) {
      const index = this.list.indexOf(item)
      this.$emit('removeItem', index)
    },
    handleClick(index) {
      this.$emit('onClick', index)
    }
  }
}
</script>

<style scoped>
  .click-pointer {
    cursor: pointer !important;
  }
</style>

