<template>
  <main class="container pa-0">
    <section class="contentText">
      <h6 class="titleStep">
        Informações
      </h6>
      <p style="font-size: 14px">
        Insira os dados do Negócio
      </p>
    </section>
    <v-form ref="formBusiness" @submit.prevent="submitBusiness">
      <div class="d-flex">
        <v-text-field
          class="pr-4 inputText"
          dense
          outlined
          filled
          disabled
          :placeholder="tenant.name"
          data-test="inputConfigInfoTenantName"
        />
        <v-text-field
          v-model="formBusiness.name"
          :error="$v.formBusiness.name.$error"
          :error-messages="$v.formBusiness.name.$error ? 'Esse campo é obrigatório' : ''"
          required
          dense
          outlined
          label="Nome do Negócio"
          class="inputText"
          data-test="inputConfigInfoBusinessName"
        />
      </div>
      <div v-if="showSubmitBusiness" class="d-flex justify-end">
        <v-btn
          v-show="showSubmitBusiness"
          color="primary"
          type="submit"
          :disabled="$v.formBusiness.name.$invalid"
          data-test="btnConfigInfoSubmitForm"
        >
          {{ textBtnSubmit }}
        </v-btn>
      </div>
    </v-form>
    <section v-show="showSelectedTeams">
      <v-form ref="formTeams">
        <v-autocomplete
          attach
          class="select"
          label="Time"
          placeholder="Comece a digitar para pesquisar"
          dense
          outlined
          item-text="name"
          item-value="id"
          v-model="formTeams.team"
          :items="teams"
          :search-input.sync="search"
          :loading="isLoading"
          return-object
          cache-items
          no-data-text="Comece a digitar para pesquisar"
          :error="$v.formTeams.team.$error"
          :error-messages="$v.formTeams.team.$error ? 'Esse campo é obrigatório' : ''"
          data-test="selectConfigInfoSelectTeam"
        />
      </v-form>
      <p>Times selecionados:</p>
      <GenericTable
        action-options
        iconDelete
        sortBy="name"
        sortDesc
        :headers="businessMembersHeaders"
        :items="businessMembers"
        @removeItem="deleteMember"
        data-test="tableConfigInfoTeams"
      >
      </GenericTable>
    </section>
  </main>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  data: () => ({
    endpointBusiness: '/business/business',
    initialName: '',
    formBusiness: {
      name: '',
      tenant_id: null,
    },
    formTeams: {
      team: null
    },
    businessMembers: [],
    endpointTeams: '/ecosystem/any-team',
    endpointBusinessTeam: '/business/business-team',
    businessTeam_id: null,
    isEdit: false,
    businessId: null,
    teams: [],
    isLoading: false,
    search: null
  }),
  props: {
    tenant: {
      type: Object,
      default: () => {}
    },
    stepData: {
      type: Object,
      default: () => ({})
    },
  },
  validations: {
    formBusiness: {
      name: { required }
    },
    formTeams: {
      team: { required }
    }
  },
  computed: {
    businessMembersHeaders() {
      return [
        { text: 'Time', value: 'team.name' },
      ]
    },
    isEditName() {
      return this.initialName !== this.formBusiness.name ? true : false
    },
    textBtnSubmit() {
      return this.isEditName && this.formBusiness.id || this.isEdit ? 'Alterar nome' : 'Inserir times'
    },
    showSubmitBusiness() {
      return this.isEditName || !this.businessId
    },
    showSelectedTeams() {
      return !this.showSubmitBusiness
    }
  },
  methods: {
    async submitBusiness() {
      this.$v.formBusiness.name.$touch()
      if(this.$v.formBusiness.$error) return
      if(this.isEdit || this.isEditName && this.formBusiness.id) {
        await this.updateBusiness()
      } else {
        const { id } = await this.createItem(this.endpointBusiness, this.formBusiness)
        this.businessId = id
      }
      this.initialName = this.formBusiness.name
    },
    async updateBusiness() {
      const id = this.isEdit ? this.businessId : this.stepData.business.id
      const payload = { ...this.formBusiness, id: id }
      await this.updateData(this.endpointBusiness, payload)
    },
    async submitTeam(team) {
      const payload = {
        business_id: this.businessId,
        team_id: this.formTeams.team.id
      }
      const { id } = await this.createItem(this.endpointBusinessTeam, payload)
      await this.setBusinessMembers(team, id)

      this.submitUpdatedForm()
    },
    async deleteMember(indexItem, team) {
      const item = this.businessMembers.find((item, index) => {
        return index === indexItem
      })
      this.businessMembers = this.businessMembers.filter((item, index) => index !== indexItem)
      item && await this.removeItem(this.endpointBusinessTeam, team.id)
    },
    getParams() {
      if(this.$route.query.isEdit) this.isEdit = true
      this.isEdit ? this.businessId = parseInt(this.$route.query.id) : this.businessId = this.formBusiness.id
    },
    async getData() {
      const { name, teams } = await this.getItem(this.endpointBusiness, `includes=teams.team&id=${this.businessId}`)
      const teamsMapped = teams.map((item) => ({
        id: item.id,
        team: item.team
      }))
      this.formBusiness.name = name
      this.businessMembers = teamsMapped

      this.submitUpdatedForm()
    },
    getInitialData() {
      if(this.stepData.business && this.stepData.team) {
        this.formBusiness = this.stepData.business
        this.businessMembers = this.stepData.team
      }
    },
    hasTeam(teamId) {
      for(let i = 0; i < this.businessMembers.length; i++) {
        if(this.businessMembers[i].team.id === teamId) {
          return true
        }
      }
    },
    async setBusinessMembers(team, id) {
      const name = team.name.trim()
      this.businessMembers.push({
        id: id,
        team: {
          name: name,
          id: team.id
        }
      })
    },
    submitUpdatedForm() {
      const businessHasMembers = !!this.businessMembers.length
      const updatedData = {
        business: { ...this.formBusiness, id: this.businessId },
        team: [...this.businessMembers],
        isSubmitted: businessHasMembers,
      }
      this.$emit('submitForm', updatedData)
    }
  },
  watch: {
    'formTeams.team': {
      async handler(value) {
        if(value && !this.hasTeam(value.id)) {
          await this.submitTeam(value)
        }
      },
      immediate: true,
      deep: true
    },
    'businessMembers': {
      handler(value) {
        if(value) {
          this.submitUpdatedForm()
        }
      },
      immediate: true,
      deep: true
    },
    async search(value) {
      if(value) {
        if(this.isLoading) return
        this.isLoading = true

        const { data } = await this.getList(
          '/ecosystem/any-team',
          `order=level,id&includes=parent.parent&load_only=name,parent.name&name=like(${value})`
        )
        const teams = data.map((team) => ({
          name: `${team.parent?.parent ? team.parent.parent.name + ' - ' : ''} ${team.parent ? team.parent.name + ' - ' : ''} ${team.name}`,
          id: team.id
        }))
        this.teams = teams
        this.isLoading = false
      }
    }
  },
  async created() {
    this.formBusiness.tenant_id = parseInt(this.tenant.id)
    this.getInitialData()
    this.getParams()
    if(this.isEdit) {
      await this.getData()
    }
    this.initialName = this.formBusiness.name
  }
}
</script>
<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .contentText {
    text-align: center;
    padding-bottom: 32px;

    .titleStep {
      padding-bottom: 8px;
      font-size: 20px;
      font-weight: 600;
    }
  }

  .inputText {
    width: 362px;
  }

  .select {
    width: 724px;
  }
}
</style>