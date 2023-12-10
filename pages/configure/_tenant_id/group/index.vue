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
                    title="Adicionar grupo"
                >
                  <template v-slot="{ dialog }">
                    <GroupConfigForm
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
            :items="groups"
            :headers="headers"
            delete-action="deleteGroup"
            action-options
            v-slot:default="slotProps"
        >
            <Dialog
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                title="Editar grupo"
            >
              <template v-slot="{ dialog }">
                <GroupConfigForm 
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
export default {
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Tipo', value: 'type' },
    ],
  }),
  computed: mapGetters(['groups']),
  mounted() {
    this.isLoading = true
    this.$store.dispatch('fetchGroups')
    this.isLoading = false
  }
}
</script>