<template>
  <v-expansion-panel>
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Matriz e Filial</p>
        </div>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-treeview
        v-if="list"
        dense
        hoverable
        open-on-click
        :items="list"
        class="mb-2"
        @update:open="isOpened = !isOpened"
      >
        <template v-slot:label="{ item }">
          <div v-if="item.isChildren">
            <NuxtLink :to="redirectPage(item)" class="remove-text-decoration">
              {{ item.name }}
              <span v-show="item.identifier" class="mx-3">|</span>
              {{ item.identifier | VMask('##.###.###/####-##') }}
            </NuxtLink>
          </div>
          <div v-else class="d-flex justify-start align-center">
            <!-- <p class="mb-0">
              {{ item.name }}
              <span v-show="item.identifier" class="mx-3">|</span>
              {{ item.identifier | VMask('##.###.###/####-##') }}
            </p> -->
            <NuxtLink :to="redirectPage(item)" class="remove-text-decoration">
              {{ item.name }}
              <span v-show="item.identifier" class="mx-3">|</span>
              {{ item.identifier | VMask('##.###.###/####-##') }}
            </NuxtLink>
          </div>
        </template>
      </v-treeview>
      <p v-else class="text-center mb-0">Nenhum registro encontrado.</p>
      <v-btn v-if="isOpened && apiConfig.hasNext" @click="getData" class="btn-load-more" color="secondary" small>Carregar mais ...</v-btn>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>

export default {
  data: () => ({
    counter: 0,
    list: [],
    children: [],
    isOpened: true,
    endpoint: '/bureau/company',
    apiConfig: {
      page: 0,
      hasNext: false,
      total: 0,
    },
    redirectTo: 'business-companies-item-identifier',
  }),
  computed: {
    identifier: function() {
      const identifier = this.$route.params.identifier
      const formatedIdentifier = identifier.replace(/[^A-Z0-9]/ig, '')
      let filtered = formatedIdentifier.substring(0, 8)

      return filtered
    }
  },
  mounted() {
    this.getInitialData()
  },
  watch: {
    list(newValue) {
      if(newValue) {
        if(this.children.length > 0) {
          return this.counter = this.children.length
        }else {
          return this.counter = this.list.length
        }
      }
    }
  },
  methods: {
    teste(val) {
      alert(val)
    },
    async getInitialData() {
      const { data, hasNext, total } = await this.getList(this.endpoint, `cnpj=like(${this.identifier})`)
      this.getChildren(data)
      this.getCompany(data)
      this.apiConfig.hasNext = hasNext
      this.apiConfig.total = total
    },
    async getData() {
      this.apiConfig.page += 1

      const { data, hasNext, total } = await this.getList(this.endpoint, `cnpj=like(${this.identifier})`, this.apiConfig.page)
      this.getChildren(data)
      this.apiConfig.hasNext = hasNext
      this.apiConfig.total = total
    },
    async getCompany(data) {
      for(const [index, company] of data.entries()) {
        if(index === 0) {
          const children = this.children
          this.list.push({
            name: company.name,
            local_company_id: company.local_company_id,
            identifier: company.cnpj,
            isChildren: false,
            children
          })
        }
      }
    },
    async getChildren(data) {
      for(const [index, company] of data.entries()) {
        if(index != 0) {
          this.children.push({
            local_company_id: company.local_company_id,
            identifier: company.cnpj,
            name: company.name,
            isChildren: true
          })
        }
      }
    },
    redirectPage(item) {
      const { identifier, local_company_id } = item
      const { params } = this.$route
    
      return { name: `${this.redirectTo}`, params: { ...params, identifier }, query: { company_id: local_company_id } }
    }
  }
}

</script>

<style scoped>
  .btn-load-more {
    margin-left: 5.6em;
  }
  .remove-text-decoration {
    text-decoration: none !important;
  }
</style>