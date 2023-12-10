<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          placeholder="Busca rápida"
          class="fix-vertical-align mx-2"
          outlined
          dense
          append-icon="mdi-magnify"
          v-model="search"
        ></v-text-field>
      </v-col>
      <v-col class="d-flex justify-end align-center">
        <Dialog
          :isEditing="false"
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
          title="Adicionar tarefa"
        >
          <template v-slot="{ dialog }">
            <TypeConfigForm :isEditing="false" :dialog="dialog" ref="myForm" @refresh="handleRefresh" />
          </template>
        </Dialog>
      </v-col>
    </v-row>
    <GenericTable
      action-options
      delete-action="deleteTask"
      v-slot:default="slotProps"
      :isLoading="isLoading"
      :search="search"
      :headers="headers"
      :items="taskList"
      @pagination="handlePagination"
    >
      <Dialog
        isEditing
        @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
        @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
        :item-id="slotProps.itemId"
        :item-name="slotProps.itemName"
        title="Editar tarefa"
      >
        <template v-slot="{ dialog }">
          <TypeConfigForm
            isEditing
            :dialog="dialog"
            :item-id="slotProps.itemId"
            :item-name="slotProps.itemName"
            :ref="`config-${slotProps.itemId}`"
            @refresh="handleRefresh"
          />
        </template>
      </Dialog>
    </GenericTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    deleteUrl: 'cash/task-type/',
    search: '',
    headers: [
      {
        text: 'ID',
        align: 'start',
        value: 'id',
      },
      { text: 'Nome', value: 'name' },
      { text: 'Time', value: 'team.name' },
      { text: 'Media', value: 'media_type.name' },
      { text: 'Interface', value: 'modalType' },
    ],
    defaultQuery: 'order=id_desc&includes=team,media_type',
    setDetailsMutation: 'SET_TASKS_DETAILS',
    fetchData: 'fetchTasks',
    taskList: [],
    modalTypes: {
      call: 'Telefonia',
      chat: 'Chat',
      mail: 'E-mail',
      meeting: 'Reunião',
    },
  }),
  computed: {
    ...mapGetters({
      list: 'tasks',
      listDetails: 'tasksDetails',
    }),
    query: function() {
      if (this.listDetails.page > 0) {
        return `${this.defaultQuery}&page=${this.listDetails.page}`
      }
      return `${this.defaultQuery}`
    }
  },
  watch: {
    list(newValue) {
      this.taskList = newValue.map((task) => {
        let modalType = 'Default'
        if(task.extra) {
          const { modal } = JSON.parse(task.extra)
          if (modal) {
            modalType = this.modalTypes[modal]
          }
        }
        return {
          ...task,
          modalType
        }
      })
    }
  },
  async mounted() {
    this.$store.commit(this.setDetailsMutation, { page: 0 })
    await this.getData()
  },
  methods: {
    async getData() {
      this.isLoading = true
      await this.$store.dispatch(this.fetchData, this.query)
      this.isLoading = false
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit(this.setDetailsMutation, { page })
          await this.getData()
        }
      }
    },
    async handleRefresh() {
      this.$store.commit(this.setDetailsMutation, { page: 0 })
      await this.getData()
    }
  }
}
</script>