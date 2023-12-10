<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
    </v-form>
    <div v-if="isEditing">
      <Dialog
        :isEditing="false"
        @submit="$refs.myForm.submitForm()"
        @cancel="$refs.myForm.handleCancel()"
        title="Adicionar Item"
        class="my-4"
      >
        <template v-slot="{ dialog }">
          <BusinessItemsForm
            :isEditing="false"
            :dialog="dialog"
            :category-id="itemId"
            @formSubmitted="updateContent"
            ref="myForm"
          />
        </template>
      </Dialog>
      <GenericTable
        action-options
        delete-action="delete"
        :headers="itemsHeaders"
        :items="businessItems"
        :sortable="true"
        :sort-desc="false"
        :sort-by="null"
        @removeItem="deleteItem"
        @sortItems="sortCategories($event)"
        v-slot:default="slotProps"
      >
        <Dialog
          isEditing
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
          :item-id="slotProps.itemId"
          :item-name="slotProps.itemName"
          title="Editar Item"
        >
          <template v-slot="{ dialog }">
            <BusinessItemsForm
              isEditing
              :dialog="dialog"
              :item-id="slotProps.itemId"
              :item-name="slotProps.itemName"
              :category-id="itemId"
              @formSubmitted="updateContent"
              ref="myForm"
            />
          </template>
        </Dialog>
      </GenericTable>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String,
    businessId: Number,
  },
  data: () => ({
    endpoint: '/business/business-category',
    businessItems: [],
    sortableItems: [],
    nextIndex: 0,
    itemsHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Tipo', value: 'type' },
    ],
    formData: {
      index: null,
      name: '',
      business_id: null,
    },
  }),
  validations: {
    formData: {
      name: { required },
    },
  },
  mounted() {
    this.getNextIndex()
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.getNextIndex()
        if (this.isEditing) {
          this.loadForm(this.itemId)
        }
      }
    },
    sortableItems(newValue) {
      newValue.forEach(item => {
        const businessItem = this.businessItems.find(businessItem => businessItem.id === item.id)
        if (businessItem.index !== item.index) {
          this.updateData('/business/business-item', item)
        }
      })
    }
  },
  methods: {
    loadForm(id) {
      if (this.isEditing) {
        this.getContent(id)
      }
    },
    async submitForm() {
      this.formData.business_id = this.businessId
      this.$v.$touch()
      if (this.$v.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.updateData(this.endpoint, this.formData)
      } else {
        this.formData.index = this.nextIndex
        await this.createItem(this.endpoint, this.formData)
      }
      this.$emit('formSubmitted')
      this.handleCancel()
    },
    async getContent(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem(this.endpoint, `id=${itemId}`)
      this.updateContent()
      this.formData = { ...content }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    },
    sortCategories(items) {
      this.sortableItems = items
    },
    async deleteItem(value) {
      const item = this.businessItems.find((item, index) => index == value)
      this.businessItems = this.businessItems.filter((item, index) => index != value)
      item && await this.removeItem('/business/business-item', item.id)
    },
    async updateContent() {
      const { data: items } = await this.getList('/business/business-item', `order=index&business_category_id=${this.itemId}`)
      this.businessItems = items
    },
    async getNextIndex() {
      const { total } = await this.getList('/business/business-category', `&business_id=${this.businessId}`)
      this.nextIndex = total
    }
  }
}
</script>
