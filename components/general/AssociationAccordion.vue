<template>
  <v-expansion-panel @change="getData">
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0 mr-6">Associações</p>
        </div>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <section class="d-flex flex-column mb-4">
        <span class="font-weight-bold">{{onOpportunity ? 'Associações e Parceiro da Oportunidade' : 'Incluir associação'}}</span>
        <span v-if="!onOpportunity">{{'Aqui você insere as associações da empresa.'}}</span>
        <span v-else>
          {{
            hasMultipleCompanies
            ? 'Aqui você inclui associações às empresas da oportunidade. Selecione também uma associação uma associação como "Parceiro", finder comissionado pela venda.'
            : 'Aqui você inclui associações à empresa da oportunidade. Selecione também uma associação como "Parceiro”, finder comissionado pela venda.'
          }}
        </span>
      </section>
      <v-form v-if="showForm" ref="form" class="mb-4" :disabled="opportunityActivated">
        <v-row>
          <v-col v-if="onOpportunity && hasMultipleCompanies">
            <v-select
              data-test="selectAssociationAccordionRightSide"
              attach
              hide-details
              dense
              outlined
              item-text="name"
              item-value="id"
              label="Empresa"
              v-model="formData.right_side_id"
              :items="opportunityCompanies"
            >
            </v-select>
          </v-col>
          <v-col>
            <NewAutocomplete
              data-test="selectAssociationAccordionAssociationType"
              attach
              outlined
              dense
              clearable
              hide-details
              return-object
              ref="associationTypeAutocomplete"
              label="Tipo de associação"
              endpoint="/customer/association-type"
              query="category=not_in(group)"
              item-text="name"
              v-model="associationType"
            />
          </v-col>
          <v-col>
            <div>
              <Autocomplete
                data-test="selectAssociationAccordionCompany"
                outlined
                dense
                clearable
                return-object
                custom-criteria
                hide-details
                ref="associationAutocomplete"
                label="Empresa"
                endpoint="/bureau/company-by-name-or-identifier"
                no-data-text="digite o CNPJ ou nome da Empresa"
                :item-text="item => item.name +' - '+ maskCnpj(item.cnpj) + ` (${item.cnpj})`"
                :length-to-start-search="4"
                :disabled="isInternalAccounting"
                @valueSelected="(value) => {companyToAssociate = value}"
              ></Autocomplete>
              <v-checkbox
                data-test="checkboxAssociationAccordionIsOpportunityPartner"
                v-if="onOpportunity"
                dense
                hide-details
                class="mt-0"
                label="Parceiro da Oportunidade"
                v-model="isOpportunityPartner"
                :disabled="checkPartnership(companyToAssociate)"
              ></v-checkbox>
            </div>
          </v-col>
          <v-col v-if="!hasMultipleCompanies" class="d-flex">
            <div>
              <v-btn class="mr-2" color="secondary" :disabled="opportunityActivated" @click="clearForm">Cancelar</v-btn>
              <v-btn
                data-test="btnAssociationAccordionInclude"
                color="primary"
                :loading="sendingRequest"
                :disabled="blockAssociation"
                @click="handleAssociation"
              >
                Incluir
              </v-btn>
            </div>
          </v-col>
        </v-row>
        <v-row v-if="hasMultipleCompanies">
          <v-col class="d-flex justify-end">
            <div>
              <v-btn class="mr-2" color="secondary" :disabled="opportunityActivated" @click="clearForm">Cancelar</v-btn>
              <v-btn
                data-test="btnAssociationAccordionInclude"
                color="primary"
                :loading="sendingRequest"
                :disabled="blockAssociation"
                @click="handleAssociation"
              >
                Incluir
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-form>
      <v-container v-if="!opportunityActivated || isAdmin" class="v-scroll">
        <section v-for="(company, index) in associationsToShow" :key="index" class="mb-4">
          <v-row v-if="hasMultipleCompanies">
            <v-col class="d-flex">
              <v-icon class="mr-4">mdi-store</v-icon>
              <span class="mr-4 font-body-large font-weight-bold">{{company.name | truncate(40)}}</span>
              <span class="mr-4 font-body-large">{{maskCnpj(company.identifier)}}</span>
            </v-col>
          </v-row>
          <v-row class="associations-container px-1 mr-1 mb-2">
            <v-col>
              <v-row>
                <v-col>
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <v-icon class="material-icons-outlined ml-4">handshake</v-icon>
                      <span>Associações com vínculo de Parceria</span>
                    </div>
                    <v-btn v-if="onOpportunity" small color="secondary" :disabled="checkHasPartner(company)" @click="clearPartner">
                      Limpar seleção
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="d-flex align-center py-0">
                  <v-col v-if="onOpportunity" xl="1" lg="1" class="pa-0">
                    <label class="font-weight-bold">Parceiro</label>
                    <v-icon
                      small
                      class="mr-6"
                      v-tooltip="{
                        content: 
                          `<div class='v-btn-tooltip'>
                              Finder comissionado da oportunidade
                          </div>`
                      }"
                    >
                      info
                    </v-icon>
                  </v-col>
                  <v-col xl="2" lg="2" class="py-0">
                    <label class="font-weight-bold">Associação</label>
                  </v-col>
                  <v-col xl="3" lg="3" class="py-0">
                    <label class="font-weight-bold">Empresa</label>
                  </v-col>
                  <v-col :xl="cols" :lg="cols" class="py-0">
                    <label class="font-weight-bold">CNPJ</label>
                  </v-col>
                  <v-col xl="2" lg="2" class="py-0">
                    <label class="font-weight-bold">Time</label>
                    <v-icon
                      small
                      class="mr-6"
                      v-tooltip="{
                        content: 
                          `<div class='v-btn-tooltip'>
                              Time Omie responsável pelo Parceiro
                          </div>`
                      }"
                    >
                      info
                    </v-icon>
                  </v-col>
                  <v-col xl="1" lg="1" class="pa-0">
                  </v-col>
                </v-col>
              </v-row>
              <section>
                <v-divider></v-divider>
                <v-row class="pt-1">
                  <v-col>
                    <v-radio-group
                      data-test="radioAssociationAccordionPartner"
                      v-if="company.partnerAssociations.length > 0"
                      hide-details
                      class="my-1"
                      v-model="opportunityPartnerId"
                      :readonly="!isAdmin && opportunityActivated"
                      @change="handlePartnerSelection"
                    >
                      <v-row v-for="association in company.partnerAssociations" :key="association.id" class="d-flex pa-2 font-body-medium">
                        <v-col
                          v-if="onOpportunity"
                          xl="1"
                          lg="1"
                          class="py-0"
                        >
                          <v-radio
                            data-test="radioAssociationAccordionPartnerCheck"
                            :disabled="checkPartnership(association.left_side)"
                            :value="association.left_side.id"
                          ></v-radio>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>{{association.association_type.name}}</label>
                        </v-col>
                        <v-col :xl="3" :lg="3" class="py-0">
                          <label>
                            {{checkAssociationType(association.association_type, association.left_side.name) | truncate(20)}}
                          </label>
                        </v-col>
                        <v-col :xl="cols" :lg="cols" class="py-0">
                          <label>
                            {{maskCnpj(checkAssociationType(association.association_type, association.left_side.identifier))}}
                          </label>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>
                            {{getResponsibleTeam(association.left_side)}}
                          </label>
                        </v-col>
                        <v-col xl="1" lg="1" class="pa-0">
                          <v-menu
                            left
                            :offset-x="true"
                            :close-on-content-click="false"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                data-test="btnAssociationAccordionPartnerMenu"
                                icon
                                small
                                v-bind="attrs"
                                v-on="on"
                              >
                                <v-icon small>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                          <v-list>
                            <v-list-item v-if="checkAssociationType(association.association_type, association.left_side.identifier) !== '-'">
                              <v-list-item-title>
                                <v-btn data-test="btnAssociationAccordionPartnerOpen" text :disabled="!isAdmin && opportunityActivated" @click="redirectToCompany(association.left_side)">
                                  Abrir
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-title>
                                <v-btn data-test="btnAssociationAccordionPartnerDelete" text :disabled="!isAdmin && opportunityActivated" @click="handleAssociationDelete(association)">
                                  Deletar
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                        </v-col>
                      </v-row>
                    </v-radio-group>
                    <v-radio-group v-else disabled hide-details class="my-1">
                      <div class="d-flex">
                        <v-col v-if="onOpportunity" xl="1" lg="1" class="py-0">
                          <v-radio
                            data-test="radioAssociationAccordionPartnerCheck"
                            disabled
                          ></v-radio>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="3" lg="3" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col :xl="cols" :lg="cols" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>-</label>
                        </v-col>
                      </div>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </section>
            </v-col>
          </v-row>
          <v-row class="associations-container px-1 mr-1 mb-2">
            <v-col>
              <v-row>
                <v-col>
                  <div class="d-flex">
                    <IconOverlay class="ml-4 mr-2" overlay-icon="block" original-icon="handshake" :original-icon-props="{ class: 'material-icons-outlined' }" />
                    <span>Associações sem vínculo de Parceria</span>
                  </div>
                </v-col>
              </v-row>  
              <v-row class="mb-3">
                <v-col class="d-flex align-center py-0">
                  <v-col xl="3" lg="3" class="py-0">
                    <label class="font-weight-bold">Associação</label>
                  </v-col>
                  <v-col xl="4" lg="4" class="py-0">
                    <label class="font-weight-bold">Empresa</label>
                  </v-col>
                  <v-col xl="4" lg="4" class="py-0">
                    <label class="font-weight-bold">CNPJ</label>
                  </v-col>
                  <v-col xl="1" lg="1" class="pa-0">
                  </v-col>
                </v-col>
              </v-row>
              <section>
                <v-divider></v-divider>
                <v-row class="pt-1">
                  <v-col>
                    <div
                      v-if="company.noPartnerAssociations.length > 0"
                      class="my-1"
                    >
                      <v-row v-for="association in company.noPartnerAssociations" :key="association.id" class="d-flex pa-2 font-body-medium">
                        <v-col xl="3" lg="3" class="py-0">
                          <label>{{association.association_type.name}}</label>
                        </v-col>
                        <v-col xl="4" lg="4" class="py-0">
                          <label>
                            {{checkAssociationType(association.association_type, association.left_side.name) | truncate(20)}}
                          </label>
                        </v-col>
                        <v-col xl="4" lg="4" class="py-0">
                          <label>
                            {{maskCnpj(checkAssociationType(association.association_type, association.left_side.identifier))}}
                          </label>
                        </v-col>
                        <v-col xl="1" lg="1" class="pa-0">
                          <v-menu
                            left
                            :offset-x="true"
                            :close-on-content-click="false"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                data-test="btnAssociationAccordionPartnerMenu"
                                icon
                                small
                                v-bind="attrs"
                                v-on="on"
                              >
                                <v-icon small>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                          <v-list>
                            <v-list-item v-if="checkAssociationType(association.association_type, association.left_side.identifier) !== '-'">
                              <v-list-item-title>
                                <v-btn data-test="btnAssociationAccordionPartnerOpen" text :disabled="opportunityActivated" @click="redirectToCompany(association.left_side)">
                                  Abrir
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                            <v-list-item>
                              <v-list-item-title>
                                <v-btn data-test="btnAssociationAccordionPartnerDelete" text :disabled="opportunityActivated" @click="handleAssociationDelete(association)">
                                  Deletar
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                        </v-col>
                      </v-row>
                    </div>
                    <div v-else class="font-body-large">
                      <div class="d-flex">
                        <v-col xl="3" lg="3" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="4" lg="4" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="4" lg="4" class="py-0">
                          <label>-</label>
                        </v-col>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </section>
            </v-col>
          </v-row>
        </section>
      </v-container>
      <v-container v-else class="v-scroll">
        <section class="mb-4">
          <v-row class="associations-container px-1 mr-1 mb-2">
            <v-col>
              <v-row>
                <v-col v-if="opportunity.partner">
                  <v-icon class="material-icons-outlined ml-4">handshake</v-icon>
                  <span>Parceiro da Oportunidade</span>
                </v-col>
                <v-col v-else>
                  <div class="d-flex">
                    <IconOverlay class="ml-4 mr-2" overlay-icon="block" original-icon="handshake" :original-icon-props="{ class: 'material-icons-outlined' }" />
                    <span>Oportunidade sem Parceiro associado</span>
                  </div>
                </v-col>
              </v-row>
              <v-row class="mb-3">
                <v-col class="d-flex align-center py-0">
                  <v-col xl="2" lg="2" class="py-0">
                    <label class="font-weight-bold">Associação</label>
                  </v-col>
                  <v-col xl="3" lg="3" class="py-0">
                    <label class="font-weight-bold">Empresa</label>
                  </v-col>
                  <v-col :xl="cols" :lg="cols" class="py-0">
                    <label class="font-weight-bold">CNPJ</label>
                  </v-col>
                  <v-col xl="2" lg="2" class="py-0">
                    <label class="font-weight-bold">Time</label>
                    <v-icon
                      small
                      class="mr-6"
                      v-tooltip="{
                        content: 
                          `<div class='v-btn-tooltip'>
                              Time Omie responsável pelo Parceiro
                          </div>`
                      }"
                    >
                      info
                    </v-icon>
                  </v-col>
                  <v-col xl="1" lg="1" class="pa-0">
                  </v-col>
                </v-col>
              </v-row>
              <section>
                <v-divider></v-divider>
                <v-row class="pt-1">
                  <v-col>
                    <v-radio-group
                      data-test="radioAssociationAccordionPartnerOpportunity"
                      v-if="opportunity.partner"
                      hide-details
                      class="my-1"
                      v-model="opportunityPartnerId"
                      :readonly="opportunityActivated"
                      @change="handlePartnerSelection"
                    >
                      <div class="d-flex font-body-medium">
                        <v-col xl="2" lg="2" class="py-0">
                          <label>{{getOpportunityPartnerAssociation(opportunity.partner_id)}}</label>
                        </v-col>
                        <v-col :xl="3" :lg="3" class="py-0">
                          <label>
                            {{opportunity.partner.name | truncate(30)}}
                          </label>
                        </v-col>
                        <v-col :xl="cols" :lg="cols" class="py-0">
                          <label>
                            {{maskCnpj(opportunity.partner.identifier)}}
                          </label>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>
                            {{getResponsibleTeam(opportunity.partner)}}
                          </label>
                        </v-col>
                        <v-col xl="1" lg="1" class="pa-0">
                          <v-menu
                            left
                            :offset-x="true"
                            :close-on-content-click="false"
                          >
                            <template v-slot:activator="{ on, attrs }">
                              <v-btn
                                data-test="btnAssociationAccordionPartnerMenu"
                                icon
                                small
                                v-bind="attrs"
                                v-on="on"
                              >
                                <v-icon small>mdi-dots-vertical</v-icon>
                              </v-btn>
                            </template>
                          <v-list>
                            <v-list-item>
                              <v-list-item-title>
                                <v-btn data-test="btnAssociationAccordionPartnerMenuOpen" text @click="redirectToCompany(opportunity.partner)">
                                  Abrir
                                </v-btn>
                              </v-list-item-title>
                            </v-list-item>
                          </v-list>
                        </v-menu>
                        </v-col>
                      </div>
                    </v-radio-group>
                    <v-radio-group v-else disabled hide-details class="my-1">
                      <div class="d-flex">
                        <v-col xl="2" lg="2" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="3" lg="3" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col :xl="cols" :lg="cols" class="py-0">
                          <label>-</label>
                        </v-col>
                        <v-col xl="2" lg="2" class="py-0">
                          <label>-</label>
                        </v-col>
                      </div>
                    </v-radio-group>
                  </v-col>
                </v-row>
              </section>
            </v-col>
          </v-row>
        </section>
      </v-container>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  props: {
    companyId: { type: [Number, String], default: null },
    opportunityId: { type: [Number, String], default: null },
    opportunityActivated: { type: Boolean, default: false },
    showForm: { type: Boolean, default: true },
  },
  data: () => ({
    aggregateCompanies: [],
    company: null,
    isOpportunityPartner: false,
    opportunityPartnerId: null,
    companyToAssociate: {},
    formData: {
      association_type_id: null,
      left_side_id: null,
      right_side_id: null,
    },
    sendingRequest: false,
    associationList: [],
    associationType: null,
    panel: false,
    isAdmin: false
  }),
  computed: {
    ...mapGetters({
      opportunity: 'Opportunity/opportunity',
    }),
    companyAssociations: function() {
      let companies = []
      if (this.company) {
        const associations = this.company.association_r.filter((association) => association?.left_side)
        const partnerAssociations = associations.filter(({ left_side }) => left_side?.partnership === 'partner')
        const noPartnerAssociations = associations.filter(({ left_side, association_type }) => {
          if (left_side?.partnership !== 'partner' && association_type?.category !== 'group') {
            return true
          }
          return false
        })
        companies.push({ ...this.company, partnerAssociations, noPartnerAssociations })
      }
      if (this.opportunityId) {
        const aggregateCompanies = this.aggregateCompanies.map(({ company }) => {
          const associations = company.association_r.filter((association) => association?.left_side)
          const partnerAssociations = associations.filter(({ left_side }) => left_side?.partnership === 'partner')
          const noPartnerAssociations = associations.filter(({ left_side, association_type }) => {
            if (left_side?.partnership !== 'partner' && association_type?.category !== 'group') {
              return true
            }
            return false
          })
          return { ...company, partnerAssociations, noPartnerAssociations }
        })
        companies = [...companies, ...aggregateCompanies]
      }
      return companies
    },
    associationsToShow: function() {
      const companyToShow = this.formData.right_side_id ? this.formData.right_side_id : this.company?.id
      return this.companyAssociations.filter((company) => company.id === companyToShow)
    },
    opportunityCompanies: function() {
      return this.companyAssociations.map(({ name, id }) => ({ name, id }))
    },
    onOpportunity: function() {
      if (this.opportunityId) {
        return true
      }
      return false
    },
    hasMultipleCompanies: function() {
      if (this.aggregateCompanies.length > 0) {
        return true
      }
      return false
    },
    cols: function() {
      if (this.onOpportunity) {
        return '3'
      }
      return '4'
    },
    dataCols: function() {
      if (this.hasMultipleCompanies) {
        return '9'
      }
      return '12'
    },
    isInternalAccounting: function() {
      if (this.associationType?.category === 'internal_accounting') {
        // const association = this.associationList.find((association) => association.id = this.formData.association_type_id)
        // if (association?.category === 'internal_accounting') {
        //   return true
        // }
        return true
      }
      return false
    },
    blockAssociation: function() {
      const company = this.companyAssociations.find((company) => company.id === this.formData.right_side_id)
      if (!company || !this.formData.association_type_id) {
        return true
      } else {
        if (!this.isInternalAccounting && !this.companyToAssociate?.cnpj) {
          return true
        }
        const hasInternalAccounting = company.association_r.some((association) => association.association_type.category === 'internal_accounting')
        if (this.isInternalAccounting && hasInternalAccounting) {
          return true
        }
        const hasAssociation = company.association_r.some((association) => {
          if (
            association.association_type_id === this.formData.association_type_id
            && association.left_side_id === this.companyToAssociate?.local_company_id
          ) {
            return true
          }
          return false
        })
        return hasAssociation
      }
    }
  },
  watch: {
    companyId(newValue) {
      if (newValue) {
        this.getCompany(newValue)
        if (!this.hasMultipleCompanies) {
          this.formData.right_side_id = newValue
        }
      }
    },
    opportunityId(newValue) {
      if (newValue) {
        this.getAggregateCompanies(newValue)
      }
    },
    opportunity(newValue) {
      this.opportunityPartnerId = newValue.partner_id
    },
    associationType(newValue) {
      if (newValue) {
        this.formData.association_type_id = newValue.id
      } else {
        this.formData.association_type_id = null
      }
    },
  },
  mounted() {
    if (!this.hasMultipleCompanies) {
      this.formData.right_side_id = this.companyId
    }
    if (this.companyId) {
      this.getData(true)
    }

    this.isAdmin = this.getUserInfo()?.admin
  },
  methods: {
    ...mapActions({
      refreshOpportunityData: 'Opportunity/refresh',
    }),
    async getAggregateCompanies(id) {
      if (id) {
        const { data } = await this.getList('/cash/opportunity-aggregate', `includes=company.association_r.left_side.memberships.team,company.association_r.association_type&opportunity_id=${id}`)
        this.aggregateCompanies = data
      }
    },
    async getCompany(id) {
      if (id) {
        const company = await this.getItem('/customer/company', `also=association_r.left_side.memberships.team,association_r.association_type&id=${id}`)
        this.company = company
      }
    },
    checkPartnership(company) {
      const partnerString = ['partner', 'Parceiro']
      if (partnerString.includes(company?.partnership)) {
        return false
      }
      return true
    },
    getData(onMounted = false) {
      if (!onMounted) this.getCompany(this.companyId)
      if (this.opportunityId) {
        this.getAggregateCompanies(this.opportunityId)
        this.opportunityPartnerId = this.opportunity.partner_id
      }
    },
    async handlePartnerSelection() {
      if (this.onOpportunity) {
        await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: this.opportunityPartnerId }, { fireSuccessAlert: false })
        this.refreshOpportunityData(true)
      }
    },
    async handleAssociation() {
      this.sendingRequest = true
      const { local_company_id = null, cnpj = null } = this.companyToAssociate || {}
      if (local_company_id) {
        this.formData.left_side_id = local_company_id
      } else {
        if (cnpj) {
          try {
            const { data: { data } } = await this.$axios.put(`/customer/official-data-by-identifier?identifier=${cnpj}`)
            const [companyCreated] = data
            this.formData.left_side_id = companyCreated.id
          } catch (error) {
            return
          }
        }
      }
      if (this.formData.left_side_id || this.isInternalAccounting) {
        if (!this.onOpportunity || !this.hasMultipleCompanies) {
          this.formData.right_side_id = this.companyId
        }
        await this.$store.dispatch('addAssociation', this.formData)
        if (this.onOpportunity && this.isOpportunityPartner) {
          await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: this.formData.left_side_id }, { fireSuccessAlert: false })
          this.refreshOpportunityData(true)
        }
        this.clearForm()
        this.getData()
        this.sendingRequest = false
      }
    },
    async handleAssociationDelete(association) {
      const { id, left_side_id } = association
      await this.removeItem('customer/association', id)
      if (this.onOpportunity) {
        if (left_side_id === this.opportunity.partner_id) {
          await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: null }, { fireSuccessAlert: false })
          this.refreshOpportunityData(true)
        }
      }
      this.getData()
    },
    checkAssociationType(type, value) {
      if (type.category !== 'internal_accounting') {
        return value
      }
      return '-'
    },
    getResponsibleTeam(company) {
      if (company.memberships?.length > 0) {
        return company.memberships.at(-1).team?.name
      }
      return '-'
    },
    checkHasPartner(company) {
      return !company.partnerAssociations.some((association) => association.left_side_id === this.opportunity.partner_id)
    },
    async clearPartner() {
      await this.updateData('/cash/opportunity', { id: this.opportunityId, partner_id: null }, { fireSuccessAlert: false })
      this.refreshOpportunityData(true)
    },
    getOpportunityPartnerAssociation(partnerId) {
      let associationType = '-'
      let association = null
      this.companyAssociations.forEach(company => {
        if (!association) {
          association = company.partnerAssociations.find((association) => association.left_side_id === partnerId)
          if (association) {
            associationType = association.association_type.name
          }
        }
      })
      return associationType
    },
    redirectToCompany(company) {
      const { identifier, id } = company
      const { params } = this.$route
      this.$router.push({ name: 'business-companies-item-identifier', params: { ...params, identifier }, query: { company_id: id } })
    },
    clearForm() {
      if (this.hasMultipleCompanies) {
        this.formData.right_side_id = null
      }
      this.companyToAssociate = {}
      this.formData.left_side_id = null
      this.associationType = null
      this.isOpportunityPartner = false
      this.$refs.associationAutocomplete.clearCachedItems()
    }
  }
}
</script>

<style scoped>
  .v-scroll {
    overflow-y: auto;
    height: 300px;
  }
  * {
    scrollbar-width: auto;
    scrollbar-color: #9e9e9e #c2c2c2;
  }
  *::-webkit-scrollbar {
    width: 5px;
  }
  *::-webkit-scrollbar-track {
    background: #c2c2c2;
    border-radius: 6px;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
    border-radius: 6px;
    border: 3px solid #9e9e9e;
  }
  .associations-container {
    border: 1px solid #9e9e9e;
    border-radius: 8px;
  }
</style>