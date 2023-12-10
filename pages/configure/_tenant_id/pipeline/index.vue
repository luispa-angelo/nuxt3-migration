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
                    title="Adicionar pipeline"
                >
                  <template v-slot="{ dialog }">
                    <PipelineConfigForm
                      :isEditing="false"
                      :dialog="dialog"
                      ref="myForm"
                      @refresh="handleRefresh"
                    />
                  </template>
                </Dialog>
            </v-col>
        </v-row>
        <v-row>
            <v-col>
                <GenericTable
                    action-options
                    delete-action="deletePipeline"
                    v-slot:default="slotProps"
                    :isLoading="isLoading"
                    :search="search"
                    :headers="headers"
                    :items="list"
                    @pagination="handlePagination"
                >
                  <Dialog
                      isEditing
                      @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                      @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                      :item-id="slotProps.itemId"
                      :item-name="slotProps.itemName"
                      title="Editar pipeline"
                  >
                    <template v-slot="{ dialog }">
                      <PipelineConfigForm 
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
            </v-col>
        </v-row>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
    
export default {
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    deleteUrl: 'cash/pipeline/',
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
    defaultQuery: 'order=id_desc',
    setDetailsMutation: 'SET_PIPELINES_DETAILS',
    fetchData: 'fetchPipelines',
  }),
  computed: {
    ...mapGetters({
      list: 'pipelines',
      listDetails: 'pipelinesDetails',
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
