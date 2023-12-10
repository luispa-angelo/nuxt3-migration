<template>
  <div>
    <v-row>
      <v-col>
        <v-text-field
          placeholder='Busca rápida'
          class='fix-vertical-align mx-2'
          outlined
          dense
          append-icon='mdi-magnify'
          v-model='search'
        ></v-text-field>
      </v-col>
      <v-col class='d-flex justify-end align-center'>
        <Dialog
          :isEditing='false'
          @submit='$refs.myForm.submitForm()'
          @cancel='$refs.myForm.handleCancel()'
          @dataUpdate="getData"
          title='Adicionar Grupo de permissão'
        >
          <template v-slot='{ dialog, submitted }'>
            <PermissionGroupConfigForm
              :isEditing='false'
              :dialog='dialog'
              @formSubmitted="submitted"
              ref='myForm'
            />
          </template>
        </Dialog>
      </v-col>
    </v-row>
    <GenericTable
      :isLoading='isLoading'
      :search='search'
      :items='permissionGroups'
      :headers='headers'
      @dataUpdate="getData"
      @removeItem="removeItem"
      delete-action='delete'
      action-options
      v-slot:default='slotProps'
    >
      <Dialog
        isEditing
        @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
        @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
        @dataUpdate="slotProps.dataUpdate"
        :item-id='slotProps.itemId'
        :item-name='slotProps.itemName'
        title='Editar Grupo de permissão'
      >
        <template v-slot='{ dialog, submitted }'>
          <PermissionGroupConfigForm
            isEditing
            :dialog='dialog'
            :item-id='slotProps.itemId'
            :item-name='slotProps.itemName'
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
  layout: 'side-menu-configure',
  data: () => ({
    isLoading: null,
    permissionGroups: [],
    search: '',
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Nível', value: 'level' }
    ]
  }),
  computed: mapGetters(['roles']),
  async mounted() {
    this.isLoading = true
    await this.getData()
    this.isLoading = false
  },
  methods: {
    async getData() {
      const { data } = await this.getList('/ecosystem/permission-group')
      this.permissionGroups = data
    },
    async removeItem(value) {
      const group = this.permissionGroups.find((group, index) => index == value)
      this.permissionGroups = this.permissionGroups.filter((media, index) => index != value)
      group && await this.removeItem('/ecosystem/permission-group', group.id)
    }
  }
}
</script>
