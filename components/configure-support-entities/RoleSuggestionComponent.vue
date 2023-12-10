<template>
  <div>
    <v-row class="mr-2">
      <v-col class="pt-0">
        <h6 class="bordered-title pl-3">Cargos</h6>
      </v-col>
    </v-row>
    <v-row class="mr-2 mb-1">
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
            @dataUpdate="getData"
            title="Adicionar Cargo"
          >
            <template v-slot="{ dialog, submitted }">
              <SupportEntitiesRoleSuggestionForm
                :isEditing="false"
                :dialog="dialog"
                @formSubmitted="submitted"
                ref="myForm"
              />
            </template>
          </Dialog>
        </v-col>
    </v-row>
    <GenericTable
      action-options
      class="mx-3"
      delete-action="delete"
      :isLoading="isLoading"
      :search="search"
      :items="list"
      :headers="headers"
      @dataUpdate="getData"
      @removeItem="deleteItem"
      v-slot:default="slotProps"
    >
      <Dialog
        isEditing
        @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
        @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
        @dataUpdate="slotProps.dataUpdate"
        :item-id="slotProps.itemId"
        :item-name="slotProps.itemName"
        title="Editar Cargo"
      >
        <template v-slot="{ dialog, submitted }">
          <SupportEntitiesRoleSuggestionForm
            isEditing
            :dialog="dialog"
            :item-id="slotProps.itemId"
            :item-name="slotProps.itemName"
            :ref="`config-${slotProps.itemId}`"
            @formSubmitted="submitted"
          />
        </template>
      </Dialog>
    </GenericTable>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    isLoading: null,
    search: '',
    endpoint: '/ecosystem/role-suggestion',
    list: [],
    headers: [
      { text:'ID', value:'id' },
      { text:'Nome', value: 'name' }
    ],
  }),
  computed: mapGetters(['meta']),
  async mounted() {
    this.isLoading = true
    await this.getData()
    this.isLoading = false
  },
  methods: {
    async getData() {
      const { data } = await this.getList(this.endpoint)
      this.list = data
    },
    async deleteItem(value) {
      const item = this.list.find((item, index) => index == value)
      this.list = this.list.filter((item, index) => index != value)
      item && await this.removeItem(this.endpoint, item.id)
    }
  }
}
</script>
