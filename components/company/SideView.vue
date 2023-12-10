<template>
  <div>
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      right
      width="552"
      @input="handleDrawerChange"
      class="v-navigation-drawer-hide-scroll-bar"
    >
      <v-app-bar
        dense
        fixed
        elevation="1"
        color="shape lighten-1"
      >
        <div class="w-100 d-flex justify-space-between align-center">
          <v-btn
            data-test="btnBureauSideViewRedirectToCompany"
            @click="redirectToCompany()"
            icon
            small
            v-tooltip="{
              content: `
                <div class='v-btn-tooltip'>
                  Ir para a Empresa
                </div>
                `,
              placement: 'right-center'
            }"
          >
            <span class="material-symbols-rounded">
              expand_content
            </span>
          </v-btn>
          <div class="d-flex justify-space-between align-center">
            <v-btn
              data-test="btnBureauSideViewChangeDataPrev"
              @click="changeData('prev')"
              :disabled="itemIndex == 0"
              icon
              small
             class="mr-2">
              <v-icon class="material-symbols-rounded">
                arrow_back
              </v-icon>
            </v-btn>
            <p class="mb-0 mr-2">Informações da Empresa</p>
            <v-btn
              data-test="btnBureauSideViewChangeDataNext"
              @click="changeData('next')"
              :disabled="itemIndex == listLength"
              icon
              small
            >
              <v-icon class="material-symbols-rounded">
                arrow_forward
              </v-icon>
            </v-btn>
          </div>
          <v-btn data-test="btnBureauSideViewClose" @click="drawer = false" icon small>
            <v-icon class="material-symbols-rounded">
              close
            </v-icon>
          </v-btn>
        </div>
      </v-app-bar>
      <section class="v-navigation-drawer-custom text-left px-4">
        <v-row>
          <v-col class="d-flex justify-space-between align-center flex-wrap mt-3">
            <div class="d-flex justify-start align-center">
              <v-avatar rounded color="meeting-icon-bg" size="42" class="mr-2">
                <v-icon class="material-symbols-rounded primary--text text-darken-1">domain</v-icon>
              </v-avatar>
              <div class="pt-1">
                <a href="#" @click.prevent="redirectToCompany()" class="font-weight-bold mb-0">
                  {{ company.name | truncate(25) }}
                </a>
                <p class="mb-0">
                  {{ maskCnpj(identifier) }}
                  <v-btn data-test="btnBureauSideViewCopyCnpj" @click.native.stop="copyToClipboard(identifier)" icon small color="primary">
                    <v-icon small class="material-symbols-rounded">
                      content_copy
                    </v-icon>
                  </v-btn>
                </p>
              </div>
            </div>
            <div class="d-flex justify-start align-center">
              <v-btn
                data-test="btnBureauSideViewRedirectToWebsite"
                v-if="company.website"
                icon
                link
                color="primary"
                class="mr-1"
                :href="company.website.includes('http') ? company.website : 'https://' + company.website"
                target="_blank"
              >
                <v-icon class="material-symbols-rounded" size="24">public</v-icon>
              </v-btn>
              <v-tooltip v-else left>
                <template v-slot:activator="{ on, attrs }">
                  <div v-on="on">
                    <v-btn
                      data-test="btnBureauSideViewRedirectToWebsite"
                      v-bind="attrs"
                      disabled
                      icon
                      color="primary"
                      class="mr-1"
                    >
                      <v-icon class="material-symbols-rounded" size="24">public</v-icon>
                    </v-btn>
                  </div>
                </template>
                <span>Site não informado.</span>
              </v-tooltip>
              <v-chip 
                :color="available == 'Sim' ? 'success': 'stroke darken-1'"
                outlined
                small
                v-tooltip="{
                  content: `
                    <div class='v-btn-tooltip'>
                      ${available == 'Sim' ? 'Disponível' : 'Indisponível'}
                    </div>
                    `,
                  placement: 'left'
                }"
              >
                {{ available == 'Sim' ? 'Disponível' : 'Indisponível' }}
              </v-chip>
            </div>
          </v-col>
        </v-row>
        <v-row>
          <v-col xl="4" lg="4">
            <p
              v-for="item in detailLabel"
              :key="item.value"
              class="sub-text--text"
            >
              {{ item.label }}
            </p>
          </v-col>
          <v-col xl="8" lg="8">
            <p>{{ companyData.status ? companyData.status : '--' }}</p>
            <p>{{ companyData.segment | truncate(30) }}</p>
            <div>
              <p v-if="companyData.cnae_primary.length">
                <span v-for="(item, index) in companyData.cnae_primary" :key="index">
                  {{ item.cnae_code }} - {{ item.cnae.description | truncate(30) }}
                </span>
              </p>
              <p v-else>Não possui</p>
            </div>
            <div>
              <p v-if="companyData.cnae_secondary.length">
                <span v-for="(item, index) in companyData.cnae_secondary" :key="index">
                  <span v-if="index == 0">
                    {{ item.cnae_code }} - {{ item.cnae.description | truncate(30) }} <span v-if="companyData.cnae_secondary.length >= 2">(...)</span>
                  </span>
                </span>
              </p>
              <p v-else>Não possui</p>
            </div>
            <div>
              <p v-if="companyData.city_state">{{ companyData.city_state | truncate(30) }}</p>
              <p v-else>Não informado</p>
            </div>
            <div>
              <p v-if="companyData.address">{{ companyData.address | truncate(30) }}</p>
              <p v-else>Não informado</p>
            </div>
            <div>
              <p v-if="companyData.size">{{ companyData.size | truncate(30) }}</p>
              <p v-else>Não informado</p>
            </div>
            <div>
              <p v-if="companyData.foundation_date">{{ $moment(companyData.foundation_date).format('DD/MM/YYYY') }}</p>
              <p v-else>Não informado</p>
            </div>
          </v-col>
        </v-row>
        <v-divider></v-divider>
        <v-row>
          <v-col>
            <TabComponent :tab-items="tabItems">
              <template v-slot:contact>
                <v-list dense color="px-0">
                  <v-list-item
                    v-for="(contact, index) in contacts"
                    @click="redirectToContactPage(contact)"
                    :key="index"
                    :class="!contact.id ? 'remove-pointer': ''"
                    class="pb-2 px-0"
                  >
                    <v-list-item-avatar rounded color="grey lighten-1" size="42" class="ml-2">
                      <v-icon class="material-symbols-rounded grey--text text--darken-1">business_center</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <p class="mb-0">
                        {{ contact.name | truncate(20) }}
                        <span v-if="contact.position" class="sub-text--text ml-1">{{ contact.position | truncate(20) }}</span>
                        <span v-else class="sub-text--text ml-1">Não informado</span>
                      </p>
                      <div class="d-flex justify-start align-center">
                        <span
                          v-for="(media, index) in contact.medias"
                          :key="index"
                          class="sub-text--text"
                        >
                          <span v-if="index <= 1">
                            {{ media.value.toLowerCase() | truncate(15) }}
                            <v-btn data-test="btnBureauSideViewCopyMedia" v-if="media.value" @click.native.stop="copyToClipboard(media.value)" icon small color="primary" class="mr-1">
                              <v-icon small class="material-symbols-rounded">
                                content_copy
                              </v-icon>
                            </v-btn>
                          </span>
                        </span>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </template>
              <template v-slot:opportunity>
                <v-list dense olor="px-0">
                  <v-list-item
                    v-for="item in opportunities"
                    @click="redirectToOpportunityPage(item)"
                    :key="item.id"
                    class="mb-2 px-0"
                  >
                    <v-list-item-avatar rounded color="grey lighten-1" size="42" class="ml-2">
                      <v-icon class="material-symbols-rounded grey--text text--darken-1">business_center</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <p class="mb-0">{{ `Oportunidade #${item.id}` }}</p>
                      <p v-if="item.team" class="mb-0 sub-text--text">{{ item.team.name }}</p>
                    </v-list-item-content>
                    <v-list-item-action class="mt-0 pt-0 pr-2">
                      <v-chip
                        :color="item.status == 'Perdida' ? 'error' : 'success'"
                        outlined
                        small
                      >
                        {{ item.status ? item.status : '--' }}
                      </v-chip>
                    </v-list-item-action>
                  </v-list-item>
                </v-list>
              </template>
            </TabComponent>
          </v-col>
        </v-row>
      </section>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    openDrawer: {
      type: Boolean
    },
    data: {
      type: [Array, Object]
    }
  },
  data: () => ({
    drawer: false,
    removeSpecialChars: /[^a-zA-Z0-9 ]/g,
    detailLabel: [
      { value: 'status', label: 'Status'},
      { value: 'segment', label: 'Segmento'},
      { value: 'cnae_primary', label: 'CNAE Primária'},
      { value: 'cnae_secondary', label: 'CNAE Secundária'},
      { value: 'city_state', label: 'Cidade/Estado'},
      { value: 'address', label: 'Endereço'},
      { value: 'size', label: 'Porte'},
      { value: 'foundation_date', label: 'Criada em'},
    ],
    companyQuery:
      'translateEnums=true' +
      '&also=association_l.right_side,association_l.association_type' +
      ',addresses,medias,cnaes.cnae.cnae_class.group.division,memberships.team' +
      '&includes=contacts.contact_positions,contacts.contact.medias,contacts.contact.companies.contact_medias,opportunities.team,opportunities.assigned_to,opportunities.stage,opportunities.products.product',
    link: {
      opportunity: '/business-opportunity',
      company: '/business-companies/bureau',
      contact: '/contact'
    }
  }),
  computed: {
    ...mapGetters({
      company: 'Company/item'
    }),
    itemIndex() {
      if(this.data) {
        const { index } = this.data
        return index
      }
      return null
    },
    listLength() {
      if(this.data) {
        const { length } = this.data
        return length - 1
      }
      return null
    },
    identifier() {
      if(this.data) {
        const identifier = this.data.item.cnpj.replace(this.removeSpecialChars, '')
        if(identifier) {
          return identifier
        }
      }
      return null
    },
    companyId() {
      if(this.data) {
        const local_company_id = this.data.item.local_company_id
        if(local_company_id) {
          return local_company_id
        }
      }
      return null
    },
    available() {
      if(this.data) {
        const available = this.data.item.available
        if(available) {
          return available
        }
      }
      return null
    },
    status() {
      if(this.data) {
        const status = this.data.item.status
        if(status) {
          return status
        }
      }
      return null
    },
    segment() {
      if(this.company) {
        const cnaes = this.company?.cnaes || []
        if(cnaes.length) {
          return cnaes[0]?.cnae?.cnae_class?.group?.division?.description
        }
      }
      return null
    },
    city_state() {
      if(this.company) {
        const { addresses } = this.company || {}
        return addresses && `${addresses[0]?.city}/${addresses[0]?.state}`
      }
      return null
    },
    address() {
      if(this.company) {
        const { addresses } = this.company || {}
        return addresses && `${addresses[0]?.location}, ${addresses[0]?.number}`
      }
      return null
    },
    cnae_primary() {
      if(this.company) {
        const cnaes = this.company?.cnaes || []
        const result = cnaes.filter(cnae => cnae.is_main_cnae == true)
        if(result) {
          return result
        }
      }
      return []
    },
    cnae_secondary() {
      if(this.company) {
        const cnaes = this.company?.cnaes || []
        const result = cnaes.filter(cnae => cnae.is_main_cnae == false)
        if(result) {
          return result
        }
      }
      return []
    },
    contacts() {
      if(this.company) {
        return (
          this.company.contacts &&
          this.company.contacts.map(contact => {
            const contactItem = contact.contact
            let formatedContact = null
            let medias = [
              ...(contactItem && contactItem.medias ? contactItem.medias : []),
              ...(contactItem && contactItem.companies && contactItem.companies[0] && contactItem.companies[0].contact_medias ? contactItem.companies[0].contact_medias : [])
            ]
            medias = medias.filter(media => media.value)
            formatedContact = {
              ...contactItem,
              medias: medias
            }
            if(contact.contact_positions) {
              return {
                ...formatedContact,
                ...contact.contact_positions?.at(-1)
              }
            }
            return {
              ...formatedContact
            }
          })
        )
      }
      return null
    },
    opportunities() {
      if(this.company) {
        const { opportunities } = this.company || {}
        return opportunities && opportunities
      }
      return null
    },
    companyData() {
      if(this.company) {
        const data = this.company
        if(this.companyId) {
          return {
            available: this.available,
            status: this.status,
            segment: this.segment,
            cnae_primary: this.cnae_primary,
            cnae_secondary: this.cnae_secondary,
            city_state: this.city_state,
            address: this.address,
            size: data.size,
            foundation_date: data.foundation,
          }
        }else {
          let size = null
          switch(data.size) {
          case 'small':
            size = 'Pequena'
            break
          case 'medium':
            size = 'Média'
            break
          case 'large':
            size = 'Grande'
            break
          default:
            size = null
          }
          return {
            available: this.available,
            status: this.status,
            segment: this.segment,
            cnae_primary: this.cnae_primary,
            cnae_secondary: this.cnae_secondary,
            city_state: this.city_state,
            address: this.address,
            size: size,
            foundation_date: data.foundation,
          }
        }
      }
      return null
    },
    url() {
      if(this.companyId) {
        return 'customer/company'
      }
      return '/customer/official-data-by-identifier'
    },
    query() {
      if(this.companyId) {
        return `${this.companyQuery}&id=${this.companyId}&contact.companies.company_id=${this.companyId}`
      }
      return `identifier=${this.identifier}`
    },
    tabItems(){
      var list = []
      const opportunityLabel = `Oportunidades (${this.opportunities ? this.opportunities.length : 0})`
      const contactLabel = `Contatos (${this.contacts ? this.contacts.length : 0})`
      if(this.opportunities) {
        list.push({
          name: opportunityLabel,
          value: 'opportunity'
        })
      }else {
        list.push({
          name: opportunityLabel,
          value: 'opportunity',
          disabled: true
        })
      }
      if(this.contacts) {
        list.push({
          name: contactLabel,
          value: 'contact'
        })
      }else {
        list.push({
          name: contactLabel,
          value: 'contact',
          disabled: true
        })
      }
      return list
    }
  },
  watch: {
    openDrawer(newValue) {
      this.drawer = newValue
    },
    async drawer(newValue) {
      if(newValue) {
        await this.getData()
      }else if(!newValue) {
        this.handleCancel()
      }
    },
    async data(newValue) {
      if(newValue) {
        await this.getData()
      }
    }
  },
  methods: {
    ...mapActions({
      getCompany: 'Company/fetchItem',
    }),
    clearScrollbar() {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    },
    handleDrawerChange(value) {
      if(value) {
        window.scrollTo(0, 0)
        document.documentElement.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
      }else {
        this.clearScrollbar()
      }
    },
    async getData() {
      if(this.data) {
        if(this.companyId) {
          await Promise.all([
            this.getCompany({ url: this.url, query: this.query }),
            this.getOpportunities()
          ])
        }else {
          await this.getCompany({ url: this.url, query: this.query })
        }
      }
    },
    async getOpportunities() {
      await this.$store.dispatch(
        'Opportunity/fetchInitialOpportunitys',
        `also=tasks.type.media_type,op_log.owner,op_log.stage,products.product&includes=team,customer,contact,stage&customer_id=${this.companyId}`
      )
    },
    redirectToCompany() {
      this.clearScrollbar()
      const identifier = this.identifier.replace(/[^A-Z0-9]/ig, '')
      const id = this.companyId
      if(id) {
        this.$router.push(`${this.link.company}/${identifier}?company_id=${id}`)
      }else {
        this.$router.push(`${this.link.company}/${identifier}`)
      }
    },
    redirectToOpportunityPage(item) {
      this.clearScrollbar()
      var { id } = item
      this.$router.push(`${this.link.opportunity}/router/${id}`)
    },
    redirectToContactPage(item) {
      this.clearScrollbar()
      var { id } = item
      if(id) {
        this.$router.push(`${this.link.contact}/${id}`)
      }
    },
    changeData(action) {
      const obj = {
        action: action,
        identifier: this.identifier
      }
      this.$emit('changeData', obj)
    },
    handleCancel() {
      this.$emit('closeDrawer')
      this.clearScrollbar()
    }
  }
}
</script>

<style scoped lang="scss">
.v-navigation-drawer {
  border-right: none !important;
  &.v-navigation-drawer__border {
    display: none;
  }
}
.v-navigation-drawer-hide-scroll-bar {
  height: 100vh !important;
  overflow-y: hidden !important;
}
.v-navigation-drawer-custom {
  height: calc(100vh - 100px);
  overflow-y: scroll;
  margin-top: 3.5em;
}
.remove-pointer {
  cursor: default !important;
}
</style>