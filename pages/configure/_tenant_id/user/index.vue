<template>
    <div>
        <v-row>
            <v-col>
                <v-text-field
					placeholder="Busca pelo nome do usuário"
					class="fix-vertical-align mx-2"
					outlined
					dense
					append-icon="mdi-magnify"
					v-model="search"
          @change="handleUserSearch"
				></v-text-field>
            </v-col>
            <v-col class="d-flex justify-end align-center">
                <Dialog
                    :isEditing="false"
                    @submit="$refs.myForm.submitForm()"
                    @cancel="$refs.myForm.handleCancel()"
                    title="Adicionar usuário"
                >
                  <template v-slot="{ dialog }">
                    <UserConfigForm
                      :isEditing="false"
                      :dialog="dialog"
                      ref="myForm"
                    />
                  </template>
                </Dialog>
            </v-col>
        </v-row>
        <GenericTable
            action-options
            delete-action="delete"
            :isLoading="isLoading"
            :items="users"
            :headers="headers"
            v-slot:default="slotProps"
            @pagination="handlePagination"
            @removeItem="deleteItem"
        >
            <Dialog
                isEditing
                @submit="$refs[`config-${slotProps.itemId}`].submitForm()"
                @cancel="$refs[`config-${slotProps.itemId}`].handleCancel()"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                title="Editar usuário"
            >
              <template v-slot="{ dialog }">
                <UserConfigForm 
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
      { text: 'Email', value: 'email' },
    ],
    url: 'ecosystem/user',
    defaultQuery: 'order=id_desc'
  }),
  computed: {
    ...mapGetters({
      users: 'User/list',
      listDetails: 'User/listDetails',
      userRefresh: 'User/refreshData',
    }),
    query: function() {
      let query = this.defaultQuery
      if (this.search.length > 0) {
        query += `&name=like(${this.search})`
      }
      if (this.listDetails.page > 0) {
        query += `&page=${this.listDetails.page}`
      }
      return query
    }
  },
  watch: {
    async userRefresh(newValue) {
      if (newValue) {
        this.$store.commit('User/SET_LIST_DETAILS', { page: 0 })
        await this.getUsers()
        this.$store.dispatch('User/refresh', false)
      }
    },
    // async search() {
    //   this.$store.commit('User/SET_LIST_DETAILS', { page: 0 })
    //   await this.getUsers()
    // }
  },
  async mounted() {
    this.$store.commit('User/SET_LIST_DETAILS', { page: 0 })
    await this.getUsers()
  },
  methods: {
    async getUsers(reset = true) {
      this.isLoading = true
      await this.$store.dispatch('User/fetchList', { url: this.url, query: this.query, reset })
      this.isLoading = false
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if (itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if (this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit('User/SET_LIST_DETAILS', { page })
          await this.getUsers(false)
        }
      }
    },
    async deleteItem(value) {
      const item = this.users.find((item, index) => index == value)
      item && await this.removeItem(this.url, item.id)
      this.$store.commit('User/SET_LIST_DETAILS', { page: 0 })
      await this.getUsers()
    },
    async handleUserSearch() {
      this.$store.commit('User/SET_LIST_DETAILS', { page: 0 })
      await this.getUsers()
    }
  }
}
</script>