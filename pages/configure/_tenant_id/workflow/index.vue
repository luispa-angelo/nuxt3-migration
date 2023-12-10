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
                    title="Adicionar workflow"
                >
                  <template v-slot="{ dialog }">
                    <WorkflowConfigForm
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
            :items="workflows"
            delete-action="deleteWorkflow"
            action-options
            v-slot:default="slotProps"
        >
            <Sheet
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                title="Editar workflow"
            >
              <template v-slot="{ sheet }">
                <WorkflowConfigForm
                  isEditing
                  :sheet="sheet"
                  :item-id="slotProps.itemId"
                  :item-name="slotProps.itemName"
                  :ref="`config-${slotProps.itemId}`"
                />
              </template>
            </Sheet>
        </GenericTable>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    deleteUrl: 'cash/cadence/',
    search: '',
    headers: [
      {
        text: 'ID',
        align: 'start',
        value: 'id',
      },
      { text: 'Nome', value: 'name' },
      { text: '', value: '' },
    ],
  }),
  computed: mapGetters(['workflows']),
  async mounted() {
    this.isLoading = true
    await this.$store.dispatch('fetchWorkflows')
    this.isLoading = false
  }
}
</script>