<template>
  <div>
    <v-row class="mr-2">
      <v-col class="pt-0">
        <h6 class="bordered-title pl-3">CNAEs</h6>
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
          <!-- <Dialog
            :isEditing="false"
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            @dataUpdate="getData"
            title="Adicionar CNAE"
          >
            <template v-slot="{ dialog, submitted }">
              <SupportEntitiesCnaeForm
                :isEditing="false"
                :dialog="dialog"
                @formSubmitted="submitted"
                ref="myForm"
              />
            </template>
          </Dialog> -->
        </v-col>
    </v-row>
    <GenericTable
      action-options
      empty-slot
      class="mx-3"
      delete-action="delete"
      :isLoading="isLoading"
      :search="search"
      :items="entityList"
      :total-items="apiConfig.total"
      :headers="headers"
      @dataUpdate="getData"
      @removeItem="deleteItem"
      @pagination="handlePagination"
      v-slot:default="slotProps"
    >
      <Dialog
        isEditing
        @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
        @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
        @dataUpdate="slotProps.dataUpdate"
        :item-id="slotProps.itemId"
        :item-name="slotProps.itemName"
        title="Editar CNAE"
      >
        <template v-slot="{ dialog, submitted }">
          <SupportEntitiesCnaeForm
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
    endpoint: '/customer/cnae',
    query: 'order=id_desc',
    apiConfig: {
      page: 0,
      hasNext: false,
      total: 0,
    },
    entityList: [],
    headers: [
      { text: 'Código', value: 'code' },
      { text: 'Descrição', value: 'description' },
    ],
  }),
  computed: mapGetters(['meta']),
  async mounted() {
    await this.getInitialData()
  },
  methods: {
    async getInitialData() {
      this.isLoading = true
      this.apiConfig.page = 0
      const { data, hasNext, total } = await this.getList(this.endpoint)
      this.entityList = data
      this.apiConfig.hasNext = hasNext
      this.apiConfig.total = total
      this.isLoading = false
    },
    async getData() {
      this.isLoading = true
      const { data, hasNext, total } = await this.getList(this.endpoint, this.query, this.apiConfig.page)
      this.entityList = [ ...this.entityList, ...data]
      this.apiConfig.hasNext = hasNext
      this.apiConfig.total = total
      this.isLoading = false
    },
    async deleteItem(value) {
      const item = this.entityList.find((item, index) => index == value)
      this.entityList = this.entityList.filter((item, index) => index != value)
      item && await this.removeItem(this.endpoint, item.id)
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.apiConfig.hasNext) {
          this.apiConfig.page += 1
          await this.getData()
        }
      }
    },
  }
}
</script>