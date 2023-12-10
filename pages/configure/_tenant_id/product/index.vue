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
                    title="Adicionar produto"
                >
                  <template v-slot="{ dialog }">
                    <ProductConfigForm
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
            :items="products"
            :headers="headers"
            delete-action="deleteProduct"
            action-options
            v-slot:default="slotProps"
        >
            <Dialog
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                title="Editar produto"
            >
              <template v-slot="{ dialog }">
                <ProductConfigForm 
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
    productsList: [],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Estado', value: 'state' },
      { text: 'Tipo', value: 'type' },
      { text: 'Valor(R$)', value: 'value' },
    ],
  }),
  computed: mapGetters(['products', 'meta']),
  mounted() {
    this.isLoading = true
    this.$store.dispatch('fetchProducts')
    this.isLoading = false
  },
  watch: {
    products(newValue) {
      this.productsList = newValue.map((product) => {
        const { state, type } = product
        product.state = this.getEnum(state, this.meta.productState)
        product.type = this.getEnum(type, this.meta.productType)
        return product
      })
    }
  }
}
</script>