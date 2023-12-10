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
      <Autocomplete
        label="Tenant"
        outlined
        endpoint="/ecosystem/tenant"
        :initial-value="formData.tenant_id"
        @valueSelected="(value) => {formData.tenant_id = value}"
      ></Autocomplete>
    </v-form>
    <div v-if="isEditing">
      <TabComponent :tab-items="tabItems">
        <template v-slot:BusinessCategory>
          <Dialog
            :isEditing="false"
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            title="Adicionar Categoria"
            class="my-4"
          >
            <template v-slot="{ dialog }">
              <BusinessCategoryForm
                :isEditing="false"
                :dialog="dialog"
                :business-id="itemId"
                @formSubmitted="updateContent"
                ref="myForm"
              />
            </template>
          </Dialog>
          <GenericTable
            action-options
            delete-action="delete"
            :headers="categoriesHeaders"
            :items="businessCategories"
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
              title="Editar Categoria"
            >
              <template v-slot="{ dialog }">
                <BusinessCategoryForm
                  isEditing
                  :dialog="dialog"
                  :item-id="slotProps.itemId"
                  :item-name="slotProps.itemName"
                  :business-id="itemId"
                  @formSubmitted="updateContent"
                  ref="myForm"
                />
              </template>
            </Dialog>
          </GenericTable>
        </template>
        <template v-slot:businessMembers>
          <Dialog
            :isEditing="false"
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            title="Adicionar Membro do Negócio"
            class="my-4"
          >
            <template v-slot="{ dialog }">
              <BusinessMembersForm
                :isEditing="false"
                :dialog="dialog"
                :business-id="itemId"
                @formSubmitted="updateContent"
                ref="myForm"
              />
            </template>
          </Dialog>
          <GenericTable
            action-options
            delete-action="delete"
            :headers="businessMembersHeaders"
            :items="businessMembers"
            @removeItem="deleteMember"
            v-slot:default="slotProps"
          >
            <Dialog
              isEditing
              @submit="$refs.myForm.submitForm()"
              @cancel="$refs.myForm.handleCancel()"
              :item-id="slotProps.itemId"
              :item-name="slotProps.itemName"
              title="Editar membro do Negócio"
            >
              <template v-slot="{ dialog }">
                <BusinessMembersForm
                  isEditing
                  :dialog="dialog"
                  :item-id="slotProps.itemId"
                  :item-name="slotProps.itemName"
                  :business-id="itemId"
                  @formSubmitted="updateContent"
                  ref="myForm"
                />
              </template>
            </Dialog>
          </GenericTable>
        </template>
      </TabComponent>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    endpoint: '/business/business',
    sortableItems: [],
    formData: {
      name: '',
      tenant_id: null,
    },
    businessCategories: [],
    businessMembers: [],
    tabItems: [
      { name: 'Categorias de Negócio', value: 'BusinessCategory' },
      { name: 'Membros do Negócio', value: 'businessMembers' }
    ],
    categoriesHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
    businessMembersHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Membros do Negócio', value: 'team.name' },
    ],
  }),
  validations: {
    formData: {
      name: { required },
    }
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  computed: mapGetters(['meta']),
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.itemId)
      }
    },
    sortableItems(newValue) {
      newValue.forEach(item => {
        const category = this.businessCategories.find(category => category.id === item.id)
        if (category.index !== item.index) {
          this.updateData('/business/business-category', item)
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
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.updateData(this.endpoint, this.formData)
      } else {
        await this.createItem(this.endpoint, this.formData)
      }
      this.$emit('formSubmitted')
      this.handleCancel()
    },
    async getContent(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem(this.endpoint, `&id=${itemId}`)
      this.updateContent()
      this.formData = { ...content }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    },
    async deleteItem(value) {
      const item = this.businessCategories.find((item, index) => index == value)
      this.businessCategories = this.businessCategories.filter((item, index) => index != value)
      item && await this.removeItem('/business/business-category', item.id)
    },
    async deleteMember(value) {
      const item = this.businessMembers.find((item, index) => index == value)
      this.businessMembers = this.businessMembers.filter((item, index) => index != value)
      item && await this.removeItem('/business/business-team', item.id)
    },
    async updateContent() {
      const { data: items } = await this.getList('/business/business-category', `order=index&business_id=${this.itemId}`)
      const { data: teams } = await this.getList('/business/business-team', `includes=team&business_id=${this.itemId}`)
      this.businessCategories = items
      this.businessMembers = teams
    },
    sortCategories(items) {
      this.sortableItems = items
    },
  }
}
</script>
