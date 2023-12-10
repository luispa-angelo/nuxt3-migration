<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="btnIcon == true"
          icon
          x-small
          v-bind="attrs"
          v-on="on"
          absolute
          class="ajust-button"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
        <v-btn v-else text v-bind="attrs" v-on="on">
          {{ list.length > 1 ? 'Deletar selecionados' : 'Deletar' }}
        </v-btn>
      </template>
      <v-card>
        <DialogHeader title="Atenção!" @onCancel="dialog = false" />
        <v-card-text class="text-center py-8">
          <section v-if="list.length > 1">
            <h6 class="subtitle-2">
              Você está apagando os registros listados abaixo. Deseja continuar?
            </h6>
            <GenericTable :headers="headers" :items="list" />
          </section>
          <section v-else>
            <h6 class="subtitle-2">
              Você está apagando o registro <b>{{ itemName }}</b
              >. Deseja continuar?
            </h6>
          </section>
        </v-card-text>
        <DialogAction
          submit-color="error"
          submit-text="Apagar Registro"
          @submit="deleteItem(itemId, itemName, deleteAction)"
          @cancel="dialog = false"
        />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    btnIcon: Boolean,
    deleteUrl: String,
    itemId: Number,
    itemName: {
      type: [String, Number],
    },
    deleteAction: String,
    multipleSelected: {
      type: Array,
    },
    url: {
      type: String,
      default: undefined,
    },
    refreshAction: {
      type: Function,
      default: null,
    },
    headers: [
      { text: 'Id', value: 'id' },
      { text: 'Título', value: 'name' },
    ],
    callbackMethod: Boolean,
  },
  data: () => ({
    dialog: false,
  }),
  computed: {
    list() {
      if (this.multipleSelected) {
        var list = this.multipleSelected.map((item) => ({
          id: item.id,
          name: item.name ? item.name : item.title,
        }))
        return list
      }
      return []
    },
  },
  methods: {
    async deleteItem(id, name, deleteAction) {
      // Return emit for delete handler and stops action call
      if (this.callbackMethod) return this.$emit('deleteItem')

      if (this.url) {
        if (this.list.length > 1) {
          for (const item of this.list) {
            const obj = {
              id: item.id,
              url: this.url,
            }
            await this.$store.dispatch(deleteAction, obj)
            this.$emit('clear-selected')
          }
        } else {
          await this.$store.dispatch(deleteAction, { id, url: this.url })
        }
      } else {
        if (this.list.length > 1) {
          for (const item of this.list) {
            const obj = {
              id: item.id,
              url: this.url,
            }

            await this.$store.dispatch(deleteAction, obj)
            this.$emit('clear-selected')
          }
        } else {
          await this.$store.dispatch(deleteAction, id)
        }
      }
      this.refreshAction && this.refreshAction(true)
      this.dialog = false
      this.$emit('hasDeleted', id)
    },
  },
}
</script>

<style scoped>
.ajust-button {
  top: 3px;
  right: 3px;
}
</style>
