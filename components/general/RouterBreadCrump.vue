<template>
  <div class="router_breadcrumbs">
    <v-breadcrumbs :items="crumps" class="pa-0">
      <template v-slot:item="{ item }">
        <v-breadcrumbs-item
          nuxt
          exact
          :to="goToPath(item)"
        >
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <span v-if="item.title === 'Home'" v-bind="attrs" v-on="on">
                <i class="material-symbols-rounded v-icon" style="font-size: 16px">
                  home
                </i>
              </span>
            </template>
            <span>{{ item.title }}</span>
          </v-tooltip>
          <v-tooltip v-if="item.title.length >= 36" top class="tooltip">
            <template v-slot:activator="{ on, attrs }">
              <span v-if="item.title !== 'Home'" v-bind="attrs" v-on="on" >
                {{ item.title.toLowerCase() }}
              </span>
            </template>
            <span>{{ item.title.toLowerCase() }}</span>
          </v-tooltip>
          <span v-else-if="item.title !== 'Home'">
            {{ item.title.toLowerCase() }}
          </span>
        </v-breadcrumbs-item>
      </template>
    </v-breadcrumbs>
    <div class="d-flex align-center">      
      <v-tooltip content-class="router-breadcrumb-tooltip" v-if="currentTitle && currentTitle.length >= 27" bottom>
        <template v-slot:activator="{ on, attrs }">
          <p v-bind="attrs" v-on="on" class="mb-0 pointer">
            {{ currentTitle }}
          </p>
          <slot />
        </template>
        <span>{{ pageTitle }}</span>
      </v-tooltip>
      <span v-else class="d-flex align-center">
        <p  class="mb-0 d-flex align-center">        
        {{ pageTitle }}       
        </p>
      <slot />
    </span>     
      <v-btn
        v-if="enableCopy"
        fab 
        text
        data-test="btnPageTitleCopy"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
              Copiar
            </div>
            `,
          placement: 'bottom-center'
        }"
        @click.stop="copyToClipboard(pageTitle)"
      >
        <v-icon class="material-icons-round" size="20">
          copy
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import { useRoutes } from '../../utils/translateRoutes'
export default {
  data: () => ({
    businessItemName: '',
    categoryName: '',
    businessOpportunityItemName: 'business-opportunity-item',
    businessCompaniesItemName: 'business-companies-item',
    businessCompaniesBureauPath: '/business-companies/bureau',
    businessOpportunityBureauPath: '/business-opportunity/bureau',
    companyRepositoryPath: '/company/repository',
    companyPath: '/company',
    endpointBusinessItem: '/business/business-item'
  }),
  props: {
    activeCrumbText: String,
    matchUrl: String,
    showMatchUrl: {
      type: Boolean,
      default: true
    },
    hasTitle: {
      type: Boolean,
      default: false
    },
    pageName: {
      type: String,
      default: ''
    },
    pageGroup: {
      type: String,
      default: ''
    },
    enableCopy: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    pageTitle() {
      return this.pageGroup ? `${this.pageGroup} - ${this.currentTitle}` : this.currentTitle
    },
    crumps() {
      const currentRouteName = this.$route.name
      const routes = this.$route.path.split('/').slice(1)

      const crumbs = [{ title: 'Home', path: '/home' }]
      let path = ''
      if(this.showMatchUrl) {
        routes.forEach((param) => {
          path = `${path}/${param}`
          const match = this.$router.match(path)

          if (match.name !== null && match.name !== currentRouteName) {
            let title = this.activeCrumbText && match.matched.some((url) => url.path === this.matchUrl)
              ? this.activeCrumbText
              : useRoutes.translateRoutes(param.replaceAll('-', ' '))

            if(currentRouteName === 'business-opportunity-item-id' || currentRouteName === 'business-companies-item-identifier') {
              if(param && param === title) {
                this.getBusinessItem(param)
                title = this.businessItemName
              }
            }

            if(title && path !== '/company') {
              crumbs.push({ title: title, ...match })
            }
          }
        })
      }
      return crumbs
    },
    currentTitle() {
      const currentRoute = this.$route
      let title
      if (currentRoute.meta && currentRoute.meta.title) {
        title = this.hasTitle ? this.pageName : useRoutes.translateRoutes(currentRoute.meta.title)
      } else {
        title = this.hasTitle ? this.pageName : useRoutes.translateRoutes(currentRoute.name.replace('-', ' '))
      }
      return title
    },
  },
  methods: {
    goToPath(router) {
      const { query, params } = this.$route
      const { path, name } = router
      if (path === this.businessCompaniesBureauPath  || path === this.companyPath) {
        return this.companyRepositoryPath
      }
      if (path !== this.businessCompaniesBureauPath && name === this.businessCompaniesItemName) {
        return `/business-companies/${params['item']}?category=${query['category']}`
      }
      if (name === this.businessOpportunityItemName && path !== this.businessOpportunityBureauPath) {
        return `/business-opportunity/${params['item']}?category=${query['category']}&pipeline-id=${query['pipeline-id']}`
      }
      if(path === this.businessOpportunityBureauPath) {
        return this.companyRepositoryPath
      }
      return path
    },
    async getBusinessItem(id) {
      const { name } = await this.getItem(this.endpointBusinessItem, `id=${id}&includes=business_category`)
      this.businessItemName = name
    }
  }
}
</script>

<style lang="scss">
.router_breadcrumbs {
  .v-breadcrumbs {
    max-width: 279px;
    flex-wrap: nowrap;
    .v-breadcrumbs__divider {
      padding: 0 6px !important;
    }
  }

  i {
    margin-bottom: 2px;
    &:hover, &:active {
      color: var(--v-primary-darken3);
      font-weight: 400;
    }
  }
  span {
    font-size: 12px;
    font-weight: 400;
    color: var(--v-grey-lighten3);

    &:hover, &:active {
      color: var(--v-primary-darken3);
      font-weight: 400;
    }
  }

  p {
    font-size: 24px;
    font-weight: 400;
    line-height: 32px;
    color: var(--v-default-text-base);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis; 
    
    &.pointer {
      cursor: pointer;
    }
  }

  .tooltip {
    p { max-width: 200px; }
  }
}

.router-breadcrumb-tooltip {  
  max-width: 22vw !important;
  word-break: break-word;
}
</style>