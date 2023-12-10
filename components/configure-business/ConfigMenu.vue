<template>
  <main class="containerMenu">
    <section class="contentText">
      <h6 class="titleStep">
        Menu
      </h6>
      <p style="font-size: 14px">
        Crie as abas disponíveis no Menu
      </p>
    </section>
    <section class="mb-5">
      <div class="d-flex justify-start">
        <p class="subtitleList">Nome do Menu</p>
      </div>
      <v-divider></v-divider>
        <v-progress-linear
          v-if="isLoading"
          indeterminate
          color="primary"
        />
      <v-form v-if="menu.length <= 0 && !isLoading" ref="formMenu" class="d-flex mt-4 ml-7">
        <v-text-field
          v-model="formDataCategory.name"
          label="Escreva o nome do Menu"
          outlined
          dense
          class="control-field-width mr-3"
          @keydown.enter.prevent="submitMenu"
          data-test="inputConfigMenuName"
        />
        <v-btn
          @click="submitMenu"
          :disabled="$v.formDataCategory.name.$invalid"
          color="secondary"
          class="mr-2"
          data-test="btnConfigMenuSubmitMenu"
        >
          Adicionar
        </v-btn>
      </v-form>
      <v-draggable-treeview
        v-else
        v-model="menu"
        expand-icon=""
        @input="updateMenu"
      >
        <template v-slot:label="{ item, open }">
          <div
            @click="changeMenu(item)"
            @mouseenter="showFormButton(item.id)"
            @mouseleave="enabledFormButton = null"
            class="d-flex align-center"
          >
            <v-container>
              <v-row>
                <v-col class="pa-0 my-3">
                  <v-icon v-show="(item.children && item.children.length) && !open" class="material-symbols-rounded" color="primary">mdi-chevron-right</v-icon>
                  <v-icon v-show="(item.children && item.children.length) && open" class="material-symbols-rounded" color="primary">mdi-chevron-down</v-icon>
                  <v-icon x-small class="material-symbols-rounded" :style="item.children && !item.children.length ? 'margin-left: 8px' : ''">drag_indicator</v-icon>
                  <span class="menuName">{{ item.name }}</span>
                  <v-btn 
                    v-show="enabledFormButton == `btnMenu${item.id}` && enabledForm != `formMenu${item.id}` && item.children"
                    :ref="`btnMenu${item.id}`"
                    @click.stop="showForm(item.id)"
                    fab
                    x-small
                    color="secondary"
                    max-width="24"
                    max-height="24"
                    v-tooltip="{ content: `<div class='v-btn-tooltip'>Criar submenu</div>` }"
                    data-test="btnConfigMenuAddSubMenu"
                  >
                    <v-icon class="material-symbols-rounded">add</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
              <v-row
                v-show="enabledForm == `formMenu${item.id}`"
                class="ma-0"
              >
                <v-col class="pa-0">
                  <v-form :ref="`formMenu${item.id}`" class="d-flex mt-4">
                    <v-text-field
                      v-model="formDataItem.name"
                      label="Escreva o nome do submenu"
                      outlined
                      hide-details
                      dense
                      class="control-field-width mr-3"
                      @keydown.enter.prevent="submitSubMenu(item)"
                      @click.stop
                      data-test="inputConfigMenuNameSubMenu"
                    />
                    <v-btn
                      @click.stop="submitSubMenu(item)"
                      :disabled="$v.formDataItem.name.$invalid"
                      color="secondary"
                      class="mr-2"
                      data-test="btnConfigMenuSubmitSubMenu"
                    >
                      Adicionar
                    </v-btn>
                    <v-btn @click.stop="enabledForm = null" color="secondary" data-test="btnConfigMenuCancelSubMenu">
                      Cancelar
                    </v-btn>
                  </v-form>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </template>
        <template v-slot:append="{ item }">
          <div
            @click="changeMenu(item)"
            class="d-flex justify-space-between align-center align-column-width pl-3"
          >
            <v-menu offset-y :close-on-content-click="true">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-show="item.children >= 0 || !item.children"
                  fab
                  icon
                  v-bind="attrs"
                  v-on="on"
                  data-test="btnConfigMenuOptionsMenu"
                >
                  <v-icon class="material-symbols-rounded">more_vert</v-icon>
                </v-btn>
              </template>
              <v-list nav dense min-width="150">
                <v-list-item-group>
                  <div v-show="!item.children">
                    <BusinessModalConfigType
                      :dataItem="item"
                      :isEdit="isEdit"
                      :tenantId="tenantId"
                      @createPipeline="$emit('goToPipeline')"
                      data-test="modalConfigMenuConfigType"
                    />
                  </div>
                  <DeleteModal :item-id="item.id" :endpoint="endpoint(item)" @update-parent="setMenu" data-test="modalConfigMenuDeleteSubMenu">
                    <template v-slot:title>Excluir {{ `"${item.name}"` }}</template>
                    <template v-slot:sub-title-1>Esta ação é irreversível, você tem certeza que <br> deseja excluir?</template>
                  </DeleteModal>
                </v-list-item-group>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-draggable-treeview>
      <v-form v-if="enabledCreateForm" ref="formMenu" class="d-flex ml-10">
        <v-text-field
          v-model="formDataCategory.name"
          label="Escreva o nome do Menu"
          outlined
          dense
          class="control-field-width mr-3"
          @keydown.enter.prevent="submitMenu"
          data-test="inputConfigMenuCategoryName"
        />
        <v-btn
          @click="submitMenu"
          :disabled="$v.formDataCategory.name.$invalid"
          color="secondary"
          class="mr-2"
          data-test="btnConfigMenuSubmitCategory"
        >
          Adicionar
        </v-btn>
        <v-btn @click="enabledCreateForm = !enabledCreateForm" color="secondary" data-test="btnConfigMenuCancelCategory">
          Cancelar
        </v-btn>
      </v-form>
      <v-btn
        v-else-if="menu.length"
        @click="enabledCreateForm = !enabledCreateForm"
        color="primary"
        class="ml-10 mt-2"
        data-test="btnConfigMenuCreateOtherMenu"
      >
        Criar outro Menu
      </v-btn>
    </section>
  </main>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  data: () => ({
    formDataItem: {
      name: '',
      business_category_id: 0,
    },
    formDataCategory: {
      name: '',
      business_id: null,
    },
    menu: [],
    treeviewKey: 0,
    selectedMenu: [],
    enabledFormButton: null,
    enabledCreateForm: false,
    enabledForm: false,
    endpointBusiness: '/business/business',
    endpointCategory: '/business/business-category',
    endpointItem: '/business/business-item',
    isLoading: false,
    isSubmitted: false,
    isEdit: false,
    categories: []
  }),
  props: {
    tenantId: {
      type: Number,
      default: 0
    },
    stepData: {
      type: Object,
      default: () => ({})
    },
    businessId: {
      type: Number,
      default: null
    },
  },
  validations: {
    formDataCategory: {
      name: { required }
    },
    formDataItem: {
      name: { required }
    }
  },
  computed: {
    handleBusinessId() {
      return this.businessId || this.formDataCategory.business_id  || this.stepData.business_id || null
    }
  },
  methods: {
    endpoint(item) {
      return item.children ? this.endpointCategory : this.endpointItem
    },
    showFormButton(id) {
      this.enabledFormButton = `btnMenu${id}`
    },
    showForm(id) {
      this.enabledForm = `formMenu${id}`
    },
    changeMenu(item) {
      this.selectedMenu = item
    },
    async submitMenu() {
      const lastItem = this.menu.at(-1)
      const index = lastItem ? lastItem.index + 1 : 0
      const payload = {
        index: index,
        name: this.formDataCategory.name,
        business_id: this.businessId
      }
      await this.createItem(this.endpointCategory, payload)
      this.isSubmitted = true
      await this.setMenu()
      this.formDataCategory.name = ''
      this.enabledCreateForm = false
    },
    async submitSubMenu(parent) {
      const payload = {
        name: this.formDataItem.name,
        business_category_id: parent.id,
      }
      await this.createItem(this.endpointItem, payload)
      this.isSubmitted = true
      await this.setMenu()
      this.formDataItem.name = ''
      this.enabledForm = false
    },
    async setMenu() {
      this.isLoading = true
      const query = `includes=items&business_id=${this.handleBusinessId}&order=index`
      const { data } = await this.getList(this.endpointCategory, query)
      this.menu = data.map((category, index) => ({
        id: category.id,
        index: index,
        name: category.name,
        business_id: category.business_id,
        children: category.items.map((item) => ({
          ...item,
          index: item.index
        })).sort((a, b) => a.index - b.index),
      }))
      this.isLoading = false
      if(this.menu.length > 0) this.isSubmitted = true
      this.$emit('submitForm', { ...this.menu, isSubmitted: this.isSubmitted })
    },
    async updateMenu(menu) {
      let menuChanged = false
      
      const updateCategory = menu.map((category, index) => ({
        id: category.id,
        index: index
      }))
      
      const updateItem = []

      for (let i = 0; i < menu.length; i++) {
        const category = menu[i]
        const categoryStepData = this.stepData[i]

        if(category !== categoryStepData) {
          menuChanged = true
        }

        if (category.children && category.children.length > 0) {
          const item = category.children.map((child, index) => ({
            id: child.id,
            index: index,
            pipeline_id: child.pipeline_id
          }))
          updateItem.push(...item)
        }
      }

      if(menuChanged) {
        await this.updateData('/business/bulk/business-category', updateCategory)
        await this.updateData('/business/bulk/business-item', updateItem)
      }
      await this.setMenu()
    },
    getParams() {
      if(this.$route.query.isEdit) this.isEdit = true
      this.formDataCategory.business_id = parseInt(this.$route.query.id)
    },
    async getCategories() {
      const { categories } = await this.getItem('business/business', `includes=categories.items&id=${this.handleBusinessId}`)
      this.categories = categories 
    }
  },
  watch: {
    enabledForm(value) {
      if(value) {
        this.enabledFormCreate = false
      }
    },
    enabledFormCreate(value) {
      if(value) {
        this.enabledForm = false
      }
    },
    async categories(value, oldValue) {
      if(value !== oldValue) await this.setMenu()
    },
  },
  async mounted() {
    this.getParams()
    if(this.isEdit) await this.getCategories()
    await this.setMenu()
  }
}
</script>
<style lang="scss">
.containerMenu {
  display: flex;
  flex-direction: column;
  padding: 0 16px;

  .contentText {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding-bottom: 32px;
    .titleStep {
      padding-bottom: 8px;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .subtitleList {
    font-size: 14px;
    font-weight: 600;
    margin-left: 40px;
  }

  .formMenu {
    display: flex;
    margin: 8px 0 0 40px;
    .inputText {
      margin-right: 8px;
      max-width: 362px;
    }
  }

  .menuName {
    margin-right: 20px;
    color: rgba(37, 47, 64, 1);
  }

  .v-treeview-node__root {
    display: flex;
    align-items: center;
    min-height: 40px;
    padding-left: 8px;
    padding-right: 8px;
    position: relative;
    user-select: none;
    cursor: pointer;

    &::before {
      bottom: 0;
      content: '';
      left: 0;
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
    }

    &::after {
      content: '';
      font-size: 0;
      min-height: inherit;
    }

    &:hover {
      background-color: var(--v-white-darken1);
    }

    .v-treeview-node__toggle {
      display: none !important;
    }

    .v-treeview-node__toggle--open {
      display: none !important;
      transform: none;
    }
  }

  .v-treeview-node__level {
    width: 20px;
  }

  .v-treeview-node__root.v-treeview-node--active {
    background-color: var(--v-white-darken1);
  }

  .ajust-section-margin {
    margin-top: -25px;
  }
  .control-field-width {
    max-width: 400px;
  }
  .v-treeview-node__label {
    flex: 1;
    font-size: inherit;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100% !important;
  }
}
</style>