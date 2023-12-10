<template>
	<v-sheet color="shape lighten-1" class="v-sheet-menu" min-height="calc(100vh - 180px)">
    <v-list color="transparent" class="py-8 px-8">
      <section
        v-for="(group, index) in menu"
        :key="index"
      >
        <v-subheader class="mt-3 body-1">
          {{ group.header }}
        </v-subheader>
        <v-list-item-group>
          <v-list-item
            v-for="item in group.items"
            :key="item.label"
            :to="`${item.path}`"
            router
            dense
            class="mb-1"
            data-test="itemSideMenuConfigPath"
          >
            <v-list-item-content>
              <v-list-item-title class="py-1 body-2">
                {{ item.label }}
              </v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-item-group>
      </section>
		</v-list>
	</v-sheet>
</template>

<script>
export default {
  data: () => ({
    tenantId: null,
  }),
  computed: {
    menu() {
      return [
        {
          header: 'Geral',
          items: [
            {
              label: 'Negócios',
              path: `/configure/${this.tenantId}/business`
            },
            {
              label: 'Tarefas',
              path: `/configure/${this.tenantId}/task`
            },
            {
              label: 'Templates',
              path: `/configure/${this.tenantId}/template`
            }
          ]
        },
        {
          header: 'Ecossistema',
          items: [
            {
              label: 'Times',
              path: `/configure/${this.tenantId}/team`
            },
            {
              label: 'Usuários',
              path: `/configure/${this.tenantId}/user`
            },
            {
              label: 'Cargos',
              path: `/configure/${this.tenantId}/role`
            },
            {
              label: 'Permissões',
              path: `/configure/${this.tenantId}/permission-group`
            }
          ]
        },
        {
          header: 'Outros',
          items: [
            {
              label: 'Entidades de apoio',
              path: `/configure/${this.tenantId}/support-entities`
            },
            {
              label: 'CSC',
              path: `/configure/${this.tenantId}/user`
            }
          ]
        }
      ]
    }
  },
  methods: {
    menuRedirect(path) {
      path && this.$router.push(`${path}`)
    },
    getParams() {
      const { tenant_id } = this.$route.params
      this.tenantId = tenant_id
    }
  },
  created() {
    this.getParams()
  }
}
</script>

<style scoped lang="scss">
  $border-radius-menu: 8px;

  .v-sheet-menu {
    border-radius: $border-radius-menu;
    .v-subheader {
      color: var(--v-grey-base);
      font-weight: 600;
      height: 36px;
      padding: 0 16px 0 4px;
    }
    .v-list-item--link:before {
      border-radius: $border-radius-menu;
    }
    .v-list-item:before {
      border-radius: $border-radius-menu;
    }
    .v-list-item__title {
      color: var(--v-grey-lighten3);
    }
    .v-list-item--active {
      color: var(--v-white-darken1);
      background-color: var(--v-white-darken1);
      border-radius: $border-radius-menu;
    }
  }
</style>