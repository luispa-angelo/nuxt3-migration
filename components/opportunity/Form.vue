<template>
  <v-form ref="form">
    <v-row>
      <v-col
        xl="2"
        lg="2"
        md="4"
        sm="4"
        cols="12"
        class="d-flex justify-center py-3"
      >
        <v-avatar
          color="cyan darken-2"
          class="mt-6"
          rounded
          min-width="120"
          min-height="120"
        >
          <div class="circle-avatar">
            <v-icon size="65">mdi-diamond-stone</v-icon>
          </div>
        </v-avatar>
      </v-col>

      <v-col xl="5" lg="5" md="4" sm="4" cols="12" class="pb-0">
        <Autocomplete
          label="Empresa"
          clearable
          outlined
          endpoint="/customer/company"
          :initial-value="formData.customer_id"
          :load="sheet"
          :disabled="companyId ? true : false"
          :validate="$v.formData.customer_id"
          @valueSelected="
            (value) => {
              formData.customer_id = value
            }
          "
        />

        <Autocomplete
          v-if="companySelected"
          outlined
          label="Contato"
          item-text="contact[name]"
          item-value="contact[id]"
          endpoint="/customer/company-contact"
          v-model="formData.contact_id"
          :query="`includes=contact&company_id=${formData.customer_id}`"
          :initial-value="formData.contact_id"
          :load="formData.customer_id"
          :validate="$v.formData.contact_id"
          :items="contactList"
          @valueSelected="
            (value) => {
              formData.contact_id = value
            }
          "
          ref="contact"
        />

        <div
          v-if="companySelected"
          align="start"
          class="d-flex justify-center align-center"
        >
          <Autocomplete
            outlined
            clearable
            ref="partnerRef"
            label="Parceiro"
            item-text="left_side[name]"
            item-value="left_side_id"
            endpoint="/customer/association"
            v-model="formData.partner_id"
            :query="`includes=left_side,association_type&right_side_id=${formData.customer_id}&left_side.partnership=partner`"
            :filter="partnerAssociationsFilter"
            :initial-value="formData.partner_id"
            :items="associations"
            :disabled="noPartner"
            :load="formData.customer_id"
            @valueSelected="
              (value) => {
                formData.partner_id = value
              }
            "
          />
          <v-checkbox
            class="ml-3 mt-0 pt-0"
            v-model="noPartner"
            label="Sem parceiro"
          ></v-checkbox>
        </div>
      </v-col>
      <v-col xl="5" lg="5" md="4" sm="4" cols="12" class="pb-0">
        <Autocomplete
          v-if="companySelected"
          label="Times"
          outlined
          dense
          endpoint="/ecosystem/any-team"
          query="strict=true&limit=1000"
          :items="teams"
          item-text="pretty"
          item-value="id"
          :postProcess = "loadTeams"
          v-model="formData.team_id"
          :error="$v.formData.team_id.$error"
          :error-messages="
            $v.formData.team_id.$error ? 'Esse campo é obrigatório' : ''
          "
        />
        <v-select
          attach
          v-if="companySelected"
          label="Atribuído"
          outlined
          dense
          :items="coworkers"
          item-text="name"
          item-value="id"
          v-model="formData.assigned_to_id"
          :error="$v.formData.assigned_to_id.$error"
          :error-messages="
            $v.formData.assigned_to_id.$error ? 'Esse campo é obrigatório' : ''
          "
        ></v-select>
        <v-select
          attach
          v-if="companySelected"
          label="Pipeline"
          outlined
          dense
          :items="pipelineList"
          item-text="name"
          item-value="id"
          v-model="formData.pipeline_id"
          :error="$v.formData.pipeline_id.$error"
          :error-messages="
            $v.formData.pipeline_id.$error ? 'Esse campo é obrigatório' : ''
          "
        ></v-select>
      </v-col>
    </v-row>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    title: String,
    itemId: Number,
    itemName: String,
    isEditing: Boolean,
    sheet: Boolean,
    companyId: Number,
  },
  data: () => ({
    dialog: false,
    noPartner: false,
    companySelected: false,
    contactList: [],
    pipelineList: [],
    formData: {
      assigned_to_id: null,
      customer_id: null,
      partner_id: null,
      contact_id: null,
      team_id: null,
      value: 0,
      pipeline_id: null,
    },
    teams: [],
  }),
  validations() {
    if (!this.companySelected) {
      return {
        formData: {
          customer_id: { required },
        },
      }
    } else {
      return {
        formData: {
          assigned_to_id: { required },
          pipeline_id: { required },
          customer_id: { required },
          contact_id: { required },
          team_id: { required },
        },
      }
    }
  },
  async mounted() {
    await this.loadForm()
  },
  computed: {
    ...mapGetters([
      'stages',
      'opportunity',
      'companies',
      'associations',
      'userInfo',
      'coworkers',
    ]),
    ...mapGetters({
      companyContacts: 'Contact/companyContacts',
      opportunity: 'Opportunity/opportunity',
    }),
  },
  watch: {
    'formData.customer_id': async function (newValue, oldValue) {
      if (newValue) {
        // get contacts
        this.contactList = []
        this.resetContact()
        await this.$store.dispatch(
          'Contact/fetchCompanyContacts',
          `includes=company&company_id=${newValue}`
        )
        if (this.companyContacts?.length > 0) {
          this.formData.contact_id = null
          this.contactList = this.companyContacts.map((e) => e.contact)
          let preferentialContacts = this.companyContacts.filter(
            (c) => c.preferential == true
          )
          let idPreferential = preferentialContacts.length
            ? preferentialContacts[preferentialContacts.length - 1].contact_id
            : this.companyContacts[0].id
          this.formData.contact_id = idPreferential
        } else {
          this.contactList = []
          this.formData.contact_id = null
        }

        // get associations
        this.cleanPartner()
        await this.$store.dispatch(
          'fetchAssociations',
          `includes=left_side,association_type&right_side_id=${newValue}`
        )
        if (this.associations.length > 0) {
          let partnership = this.associations.filter(
            (a) => a.left_side && a.left_side.partnership == 'partner'
          )
          if (partnership.length > 0 && partnership[0].left_side) {
            this.formData.partner_id = partnership[0].left_side.id
            this.noPartner = false
          } else {
            this.cleanPartner()
          }
        } else {
          this.cleanPartner()
        }
        oldValue && (this.formData.contact_id = null)

        this.companySelected = true
      } else {
        this.formData.contact_id = null
      }
    },
    'formData.team_id': async function (newValue) {
      if (newValue) {
        await this.$store.dispatch('fetchCoworkers', `team_id=${newValue}`)
        if (
          !this.coworkers.find(
            (user) => user.id == this.formData.assigned_to_id
          )
        ) {
          this.formData.assigned_to_id = null
        }
        const { data } = await this.$axios.get(
          '/cash/team-pipelines?team_id=' + newValue
        )
        const pipelines = data
        if (pipelines) {
          this.pipelineList = pipelines.map(({ id, name }) => ({
            id,
            name,
          }))
        } else {
          this.formData.pipeline_id = null
          this.pipelineList = []
        }
      }
    },

    async sheet(newValue) {
      if (newValue) {
        await this.loadForm()
      }
    },
    noPartner(newValue) {
      newValue && (this.formData.partner_id = null)
    },
  },
  methods: {
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('Opportunity/updOpportunity', this.formData)
        this.$store.dispatch('Opportunity/refresh', true)
      } else {
        await this.$store.dispatch('Opportunity/addOpportunity', this.formData)
        this.$store.dispatch('Opportunity/refresh', true)
      }
      if (!this.companyId) {
        this.$refs.form.reset()
        this.companySelected = false
      } else {
        this.$refs.contact.setList(
          '/customer/company-contact',
          `includes=contact&company_id=${this.formData.customer_id}`,
          true
        )
        this.noPartner = true
        this.formData.partner_id = null
        this.formData.pipeline_id = null
      }
      this.$v.$reset()
      this.$emit('closeForm')
    },
    async resetContact() {
      if (this.$refs['contact']) {
        this.$refs.contact.clearCachedItems()
      }
    },
    async getData() {
      await this.getUsers()
      let teams = (
        await this.getList('/ecosystem/any-team', 'strict=true&limit=1000')
      ).data
      this.teams = this.loadTeams(teams)
    },
    async getOpportunity(itemId) {
      await this.$store.dispatch(
        'Opportunity/fetchOpportunity',
        `includes=stage&id=${itemId}`
      )
      const {
        created_at,
        updated_at,
        stage,
        runtime,
        stage_id,
        state,
        ...content
      } = this.opportunity
      this.formData = { ...content, id: itemId }
      this.formData.pipeline_id = stage.pipeline_id
    },
    async getUsers() {
      if (this.userTeam) {
        await this.$store.dispatch('fetchCoworkers', `team_id=${this.userTeam}`)
      }
    },
    async loadForm() {
      await this.getData()
      this.formData.team_id = this.teams[0].id
      this.formData.assigned_to_id = this.userInfo.id
      if (this.companyId) {
        this.formData.customer_id = this.companyId
      }
      if (this.isEditing) {
        await this.getOpportunity(this.itemId)
      }
    },
    handleCancel() {
      this.companySelected = false
      this.$refs.form.reset()
      this.$v.$reset()
    },
    cleanPartner() {
      this.formData.partner_id = null
      this.noPartner = true
    },
    partnerAssociationsFilter(element) {
      return element.association_type.category != 'group'
    },
    traverse(children, full, prefix = '') {
      for (let el of children) {
        el.pretty = prefix + el.name
        full.push(el)
        this.traverse(el.children, full, prefix + ' ')
      }
    },
    loadTeams(data) {
      let teams = []
      let map = {}

      for (let el of data) {
        teams.push({ name: el.name, value: el.id })
        map[el.id] = el.name
      }

      let heads = []
      let hierarchy = {}
      for (let i = 0; i < data.length; i++) {
        let el = data[i]
        if (!(el.id in hierarchy)) {
          hierarchy[el.id] = el
          el['children'] = []
        }
        if (el.parent_id in hierarchy) {
          hierarchy[el.parent_id].children.push(el)
        } else {
          heads.push(el)
        }
      }

      let values = []
      this.traverse(heads, values)
      return values
    },
  },
}
</script>
