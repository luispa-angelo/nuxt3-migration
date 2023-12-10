<template>
	<v-row>
    <v-col>
      <Panel>
        <template v-slot:panel>
          <v-expansion-panel @change="getData(opportunityId)">
            <v-expansion-panel-header disable-icon-rotate expand-icon="">
              <template v-slot:default>
                <div class="w-100 d-flex justify-start align-center">
                  <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
                  <p class="mb-0">Relacionamentos</p>
                </div>
              </template>
              <template v-slot:actions>
                <v-menu v-if="!opportunityActivated" v-model="relationshipMenu" offset-y offset-x :close-on-content-click="false">
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      color="secondary"
                      x-small
                      fab
                      v-bind="attrs"
                      v-on="on"
                      @click="handleAssign"
                    >
                      <v-icon color="primary">mdi-plus</v-icon>
                    </v-btn>
                  </template>
                  <v-card width="350px" elevation="0">
                    <v-card-title>Adicionar relacionamento</v-card-title>
                    <v-card-text>
                      <v-form ref="form">
                        <Autocomplete
                          label="Time"
                          outlined
                          dense
                          endpoint="/ecosystem/any-team"
                          query="order=level,id&strict=true"
                          :item-text="(item) => item && item.name? item.name : ''"
                          :postProcess="traverseFilter"
                          @valueSelected="(value) => {team_id = value}"
                          clearable
                        ></Autocomplete>
                        <v-autocomplete
                          attach
                          label="Função"
                          v-model="roleFilter"
                          :items="roleList"
                          item-value="role"
                          item-text="role"
                          required
                          outlined
                          dense
                          clearable
                        ></v-autocomplete>
                        <v-autocomplete
                          attach
                          label="Usuário"
                          v-model="assign_to"
                          :items="coworkersList"
                          item-value="id"
                          item-text="name"
                          required
                          outlined
                          dense
                          clearable
                        ></v-autocomplete>
                      </v-form>
                    </v-card-text>
                    <v-divider></v-divider>
                    <v-card-actions class="px-4 d-flex justify-start">
                      <v-btn
                        color="secondary"
                        :disabled="!assign_to"
                        @click="confirmAssign"
                      >
                        Confirmar
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-menu>
              </template>
            </v-expansion-panel-header>
            <v-expansion-panel-content>
              <article
                v-for="rel in relationship"
                :key="rel.owner"
                class="d-flex justify-space-between align-center mb-4 ml-3"
              >
                <div>
                  <p class="subtitle-2 primary--text mb-0">
                    <span>{{ `Responsável: ${rel.owner}` }}</span>
                  </p>
                  <p class="mb-0">{{ `Equipe: ${rel.team}` }}</p>
                  <p class="mb-0">{{ `Função: ${rel.role}` }}</p>
                  <p class="mb-0">
                    {{ `Atribuído em: ${formatDate(rel.created_at)}` }}
                  </p>
                </div>
              </article>
            </v-expansion-panel-content>
          </v-expansion-panel>
          <AssociationAccordion :opportunity-id="opportunityId" :company-id="companyId" :opportunity-activated="opportunityActivated" />
        </template>
      </Panel>
    </v-col>
	</v-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    opportunityActivated: Boolean,
    opportunity: Object,
  },
  data: () => ({
    relationshipMenu: false,
    assign: false,
    assign_to: null,
    roleFilter: null,
    team_id: null,
    roleList: [],
    coworkersList: [],
    accountingList: [],
    partnersList: [],
    relationship: [],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome da empresa', value: 'name' }
    ],
    showMenu: false,
  }),
  computed: {
    ...mapGetters({
      functionalAreas: 'functionalAreas',
      associations: 'associations',
      coworkers: 'coworkers',
      userTeam: 'userTeam',
      opportunityLog: 'Opportunity/opportunityLog'
    }),
    accounting: function () {
      return this.opportunity?.company?.accounting || null
    },
    companyId: function () {
      return this.opportunity?.customer_id || null
    },
    opportunityId: function () {
      return this.opportunity?.id || null
    }
  },
  watch: {
    associations(newValue) {
      if(newValue) {
        const { partner } = this.opportunity

        let list = newValue.filter(association => association.associatin_type && association.association_type.category && association.left_side && association.left_side.name)
        list = newValue.map(association => ({
          id: association.left_side_id,
          category: association.association_type.category,
          name: association.left_side?.name
        }))
        if (partner) {
          this.partnersList = []
          this.partnersList.push(partner)
        }
        this.accountingList = list.filter(el => el.category == 'accountant')
      }
    },
    opportunityLog() {
      this.getRelationship()
    },
    coworkers(newValue) {
      if (this.team_id) {
        this.coworkersList = newValue
        this.roleList = this.removeDuplicate(newValue, 'role')
      }
    },
    roleFilter(newValue) {
      if (newValue) {
        this.coworkersList = this.coworkers.filter(
          coworker => coworker.role == newValue
        )
      } else {
        this.coworkersList = this.coworkers
      }
    },
    'team_id': async function(newValue) {
      if (newValue) {
        await this.$store.dispatch('fetchCoworkers', `team_id=${newValue}`)
        this.coworkersList.find((user) => user.id == this.assign_to)
        if (!this.coworkersList.find((user) => user.id == this.assign_to)) {
          this.assign_to = null
        }
      }
      else {
        this.coworkersList = []
        this.roleList = []
        this.assign_to = null
      }
    },
    relationshipMenu(newValue) {
      if(!newValue) {
        this.$refs.form.reset()
      }
    }
  },
  methods: {
    traverse(children, full, prefix='') {
      for (let el of children) {
        el.name = prefix + el.name
        full.push(el)
        this.traverse(el.children, full, el.name + ' - ')
      }
    },
    traverseFilter(items) {
      let hierarchy = {}
        
      let heads = []
      for (let el of items) {
        if (!(el.id in hierarchy)) {
          hierarchy[el.id] = el
          el['children'] = []
        }
        if (el.parent_id in hierarchy) {
          hierarchy[el.parent_id].children.push(el)
        }
        else {
          heads.push(el)
        }
      }

      items = []
      this.traverse(heads, items)
    
      return items
    },
    async getArea() {
      await this.$store.dispatch('fetchFunctionalAreas', 'includes=children.children')
    },
    getRelationship() {
      this.relationship = []
      const relationship = this.opportunityLog
        .filter(log => (log.type == 'ownership' || log.type == 'new') && log.team && log.team.name && log.owner && log.owner.name && log.owner.capabilities && log.owner.capabilities.length)
        .map(log => ({
          team: log.team.name,
          owner: log.owner.name,
          created_at: log.created_at,
          role: log.owner.capabilities[0].role.name
        }))
      relationship.forEach(rel => {
        if (
          !this.relationship.find(el => {
            return JSON.stringify(el) == JSON.stringify(rel)
          })
        ) {
          this.relationship.push(rel)
        }
      })
      this.relationship.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )
    },
    async handleAssign() {
      this.assign_to = null
      this.roleFilter = null
      await this.$store.dispatch('fetchCoworkers', `team_id=${this.opportunity.team_id}`)
      this.assign = true
      this.getArea()
    },
    async confirmAssign() {
      const payload = {
        id: this.opportunity.id,
        assigned_to_id: this.assign_to,
        team_id: this.team_id
      }
      await this.$store.dispatch('Opportunity/updOpportunity', payload)
      this.$refs.form.reset()
      this.assign = false
      this.showMenu = false
      this.getData(this.opportunityId)
    },
    removeDuplicate(list, prop) {
      const map = Object.create(null)
      for (const item of list) {
        const id = item[prop]
        if (!map[id]) {
          map[id] = item
        }
      }
      return Object.values(map)
    },
    async getOpportunityLog() {
      await this.$store.dispatch(
        'Opportunity/fetchOpportunityLog',
        `includes=owner.capabilities.role,team&opportunity_id=${this.opportunityId}`
      )
    },
    async getData(opportunityId) {
      if(opportunityId) {
        await this.$store.dispatch(
          'fetchAssociations',
          `includes=left_side,association_type&right_side_id=${this.opportunity.customer_id}`
        )
        this.getOpportunityLog()
        this.getRelationship()
      }
    }
  }
}
</script>

