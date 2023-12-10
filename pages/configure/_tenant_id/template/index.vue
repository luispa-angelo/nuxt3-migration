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
            title="Adicionar template"
        >
          <template v-slot="{ dialog }">
            <TemplateConfigForm
              ref="myForm"
              :isEditing="false"
              :dialog="dialog"
              @refresh="handleRefresh"
            />
          </template>
        </Dialog>
			</v-col>
		</v-row>
		<GenericTable
			action-options
			delete-action="deleteTemplate"
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
          title="Editar template"
      >
        <template v-slot="{ dialog }">
          <TemplateConfigForm 
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
    // templates: [],
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Time', value: 'team.name' },
      { text: 'Media', value: 'media_type.name' }
    ],
    defaultQuery: 'order=id_desc&includes=media_type,team',
    setDetailsMutation: 'SET_TEMPLATES_DETAILS',
    fetchData: 'fetchTemplates',
  }),
  computed: {
    ...mapGetters({
      list: 'templates',
      listDetails: 'templatesDetails',
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
