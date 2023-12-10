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
          title="Adicionar área"
          :isEditing="false"
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
        >
          <template v-slot="{ dialog }">
            <AreaConfigForm :isEditing="false" :dialog="dialog" ref="myForm" @refresh="handleRefresh" />
          </template>
        </Dialog>
      </v-col>
    </v-row>
    <GenericTable
      :isLoading="isLoading"
      :search="search"
      :items="list"
      :headers="headers"
      delete-action="deleteFunctionalArea"
      action-options
      v-slot:default="slotProps"
    >
      <Dialog
        isEditing
        @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
        @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
        :item-id="slotProps.itemId"
        :item-name="slotProps.itemName"
        title="Editar área"
      >
        <template v-slot="{ dialog }">
          <AreaConfigForm
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
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
    defaultQuery: 'order=id_desc',
    setDetailsMutation: 'SET_FUNCTIONALAREA_DETAILS',
    fetchData: 'fetchFunctionalAreas',
  }),
  computed: {
    ...mapGetters({
      list: 'functionalAreas',
      listDetails: 'functionalAreasDetails',
    }),
    query: function() {
      if (this.listDetails.page > 0) {
        return `${this.defaultQuery}&page=${this.listDetails.page}`
      }
      return `${this.defaultQuery}`
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
