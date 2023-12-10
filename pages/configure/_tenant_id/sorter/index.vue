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
                    title="Adicionar sorter"
                >
                  <template v-slot="{ dialog }">
                    <SorterConfigForm
                      :isEditing="false"
                      :dialog="dialog"
                      ref="myForm"
                    />
                  </template>
                </Dialog>
            </v-col>
        </v-row>
        <GenericTable
            :isLoading="isLoading"
            :search="search"
            :headers="headers"
            :items="sorters"
            action-options
            delete-action="deleteSorter"
            v-slot:default="slotProps"
        >
            <Dialog
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                title="Editar sorter"
            >
              <template v-slot="{ dialog }">
                <SorterConfigForm 
                    isEditing
                    :dialog="dialog"
                    :item-id="slotProps.itemId"
                    :item-name="slotProps.itemName"
                    :ref="`config-${slotProps.itemId}`"
                />
              </template>
            </Dialog>
        </GenericTable>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'    
import Dialog from '~/components/general/Dialog.vue'
export default {
  components: { Dialog },
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
  }),
  async mounted() {
    this.isLoading = true
    await this.$store.dispatch('fetchSorters')
    this.isLoading = false
  },
  computed: mapGetters(['sorters']),
}
</script>