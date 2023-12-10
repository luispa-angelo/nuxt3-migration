<template>
  <main>
    <PageHeadline :page-name="pageName" :page-group="pageGroup">
      <ToggleGroupButtons class="configure_toggle_buttons" v-model="toggleVisualization" :buttons="toggleButtons" placement="left"/>     
    </PageHeadline>
    <section class="d-flex justify-space-between align-center">
      <v-text-field
        label="Pesquisar organização"
        outlined
        dense
        class="control-field-width mt-4"
        append-icon="mdi-magnify"
        v-model="search"
        data-test="inputConfigureSearchTenant"
      ></v-text-field>
      <div class="d-flex mb-2">
        <TenantForm @update-parent="getTenant" />
      </div>
    </section>
    <v-row v-if="!toggleVisualization">
      <v-col xl="3" lg="3" v-for="(tenant, i) in filterItems(tenantList)" :key="i">
        <v-card
          @click="$router.push(`/configure/${tenant.id}/business`)"
          data-test="cardConfigureTenant"
          :disabled="!tenant.active"
        >
          <v-card-title class="d-flex justify-space-between align-center">
            <section class="d-flex justify-start align-center">
              <v-avatar color="v-avatar-1" size="38" class="mr-2">
                <v-icon>mdi-domain</v-icon>
              </v-avatar>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <span
                    class="tenant_name"
                    v-bind="attrs"
                    v-on="on"
                  >
                    {{ tenant.name }}
                  </span>
                </template>
                <span>{{ tenant.name }}</span>
              </v-tooltip>
            </section>
            <v-menu offset-y :close-on-content-click="false">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  icon
                  v-bind="attrs"
                  v-on="on"
                  data-test="btnConfigureCardActionsTenant"
                >
                  <v-icon>mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list nav dense min-width="150">
                <v-list-item-group>
                  <v-list-item :to="`/configure/${tenant.id}/business`" data-test="btnConfigureOpenTenant">
                    <v-list-item-content>
                      <v-list-item-title>
                        Abrir
                      </v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                  <TenantEdit
                    :item-id="tenant.id"
                    :item-name="tenant.name"
                    @update-parent="getTenant"
                    data-test="modalConfigureEditTenant"
                  />
                  <DeleteModal :item-id="tenant.id" @update-parent="getTenant" hasForm :endpoint="endpointTenant" data-test="modalConfigureDeleteTenant">
                    <template v-slot:title>Excluir a Organização</template>
                    <template v-slot:sub-title-1>
                      Esta ação é irreversível, você tem certeza que <br> deseja excluir essa Organização?
                    </template>
                    <template v-slot:sub-title-2>Digite “excluir” para confirmar a ação:</template>
                  </DeleteModal>
                </v-list-item-group>
              </v-list>
            </v-menu>
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col xl="9" lg="9">
                <p class="mb-0">
                  <v-icon class="mb-1">mdi-account-multiple-outline</v-icon>
                  <strong>Total de Usuários</strong>
                  <span>--</span>
                </p>
                <p class="mb-0">
                  <v-icon class="mb-1">mdi-briefcase-variant-outline</v-icon>
                  <strong>Total de Negócios</strong>
                  <span>{{ tenant.total_business }}</span>
                </p>
              </v-col>
              <v-col xl="3" lg="3" class="d-flex justify-end align-end">
                <v-chip :color="tenant.active == true ? 'success' : 'error'">
                  {{ tenant.active == true ? 'Ativa' : 'Inativa' }}
                </v-chip>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <section v-else>
      <GenericTable
        actionsIcons
        :sortDesc="false"
        :headers="tenantHeaders"
        :items="tenantListItems"
        :search="search"
        @onRowClick="goToTenant"
        data-test="tableConfigureTenants"
      >
        <template v-slot:actionsIconsSlot="slotProps">
          <div class="d-flex justify-end">
            <DeleteModal iconDelete :item-id="slotProps.item.id" @update-parent="getTenant" hasForm :endpoint="endpointTenant" data-test="tableConfigureDeleteTenant">
              <template v-slot:title>Excluir a Organização</template>
              <template v-slot:sub-title-1>
                Essa ação é irreversível, você tem certeza que <br> deseja excluir essa Organização?
              </template>
              <template v-slot:sub-title-2>Digite “excluir” para confirmar a ação:</template>
            </DeleteModal>
            <TenantEdit
              icon-edit
              :item-id="slotProps.item.id"
              :item-name="slotProps.item.name"
              @update-parent="getTenant"
              data-test="tableConfigureEditTenant"
            />
          </div>
        </template>
      </GenericTable>
    </section>
  </main>
</template>

<script>
export default {
  data: () => ({
    pageGroup: 'Configurações',
    pageName: 'Organizações',
    endpointAnyTeam: '/ecosystem/any-team',
    endpointTenant: '/ecosystem/tenant',
    endpointBusiness: '/business/business',
    search: '',
    tenantList: [],
    dialog: false,
    toggleVisualization: 0,
    toggleButtons: [ 
      { icon: 'view_week', description: 'Exibir como Coluna', dataTest: 'btnConfigureToggleVisualizationColumn' }, 
      { icon: 'view_list', description: 'Exibir como Lista', dataTest: 'btnConfigureToggleVisualizationList' } 
    ],
    totalBusiness: null
  }),
  computed: {
    tenantListItems() {
      const items = this.tenantList.map((tenant) => {
        return {
          ...tenant,
          active: tenant.active ? 'Ativa' : 'Inativa'
        }
      })
      return items
    },
    tenantHeaders() {
      return [
        { text: 'Id', value: 'id' },
        { text: 'Organização', value: 'name' },
        { text: 'Total de negócios', value: 'total_business' },
        { text: 'Status', value: 'active' }
      ]
    }
  },
  methods: {
    async getTenant() {
      this.tenantList = []
      const query = 'level=0&limit=1000&load_only=id,name'
      const { data: tenants } = await this.getList(this.endpointTenant, query)

      const tenantsId = tenants.map((tenant) => tenant.id)
      await this.countBusiness(tenantsId)

      for (let i = 0; i < tenants.length; i++) {
        const totalBusiness = this.totalBusiness.filter((business) => business.tenant_id === tenants[i].id)

        this.tenantList.push({
          ...tenants[i],
          total_business: totalBusiness.length
        })
      }
    },
    async countBusiness(tenantsId) {
      const { data } = await this.getList(this.endpointBusiness, `tenant_id=in(${tenantsId.join(',')})&limit=1000`)
      this.totalBusiness = data
    },
    filterItems(list) {
      var app = this
      return list.filter(function(item) {
        let regex = new RegExp('(' + app.search + ')', 'i')
        return item.name.match(regex)
      })
    },
    goToTenant(item) {
      this.$router.push(`/configure/${item.id}/business`)
    }
  },
  mounted() {
    this.getTenant()
  }
}
</script>

<style scoped lang="scss">
  .tenant_name {
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 12vw;
    white-space: nowrap;
  }
  .v-icon-vertical-transform {
    transform: rotate(90deg);
  }
  .control-field-width {
    max-width: 288px;
  }
  .v-avatar-1 {
    background-color: rgba(57, 163, 255, 0.2);
    & > .v-icon {
      color: rgba(25, 118, 210, 1);
    }
  }
  .v-avatar-2 {
    background-color: rgba(255, 97, 104, 0.2);
    & > .v-icon {
      color: rgba(255, 97, 104, 1);
    }
  }
  .v-avatar-3 {
    background-color: rgba(111, 0, 140, 0.2);
    & > .v-icon {
      color: rgba(111, 0, 140, 1);
    }
  }
</style>