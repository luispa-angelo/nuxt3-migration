<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome do time"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
      <v-select
        attach
        label="Canal"
        v-model="formData.parent_id"
        :items="channels"
        item-text="name"
        item-value="id"
        outlined
        dense
        :disabled="parentId"
        :error="$v.formData.parent_id.$error"
        :error-messages="
          $v.formData.parent_id.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-select>
      <v-checkbox
        label="Time de Arquitetura"
        dense
        hide-details
        v-model="formData.architecture"
        class="mb-4"
      ></v-checkbox>
    </v-form>
    <div v-if="isEditing">
      <TabComponent :tab-items="tabItems">
        <template v-slot:users>
          <section class="w-100 d-flex justify-end">
            <CapabilityManage
              title="Adicionar"
              class="mb-3"
              :isEditing="false"
              :team-id="itemId"
              :user-list="userList"
            />
          </section>
          <GenericTable
            :headers="capabilitiesHeaders"
            :items="capabilityList"
            delete-action="deleteCapability"
            action-options
            v-slot:default="slotProps"
          >
            <CapabilityManage
              isEditing
              title="Editar estagio"
              :item-name="slotProps.itemName"
              :item-id="slotProps.itemId"
              :team-id="itemId"
            />
          </GenericTable>
        </template>
        <template v-slot:permission>
          <section class="w-100 d-flex justify-end">
            <TeamEligible
              title="Adicionar"
              class="mb-3"
              :isEditing="false"
            />
          </section>
          <GenericTable
            :headers="eligibleHeaders"
            :items="eligibleTeamList"
            delete-action="deleteEligibleTeam"
            action-options
            v-slot:default="slotProps"
          >
            <TeamEligible
              isEditing
              title="Editar permissão"
              :item-name="slotProps.itemName"
              :item-id="slotProps.itemId"
              :team-id="itemId"
            />
          </GenericTable>
        </template>
      </TabComponent>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String,
    parentId: Number,
  },
  data: () => ({
    capabilityList: [],
    formData: {
      parent_id: null,
      name: '',
      architecture: false
    },
    tabItems: [
      { name: 'Relacionar usuário', value: 'users' },
      { name: 'Permissões', value: 'permission' }
    ],
    eligibleHeaders: [
      { text: 'Solicitante', value: 'submitter' },
      { text: 'Atendente', value: 'attendant' },
      { text: 'Tipo', value: 'type_id' },
    ],
    capabilitiesHeaders: [
      { text: 'Usuário', value: 'user.name' },
      { text: 'Papel', value: 'role.name' }
    ]
  }),
  validations: {
    formData: {
      name: { required },
      parent_id: { required }
    },
  },
  computed: {
    ...mapGetters(['teams', 'capabilities', 'channels', 'eligibleTeams', 'requests']),
    userList() {
      const userList = this.capabilities.map((capability) => capability.user_id)
      return userList
    },
    eligibleTeamList() {
      if(this.eligibleTeams && this.requests) {
        var list = []
        for (const item of this.eligibleTeams) {
          if(item.submitter_team_id == this.itemId || item.attendant_team_id == this.itemId) {
            const submitter = this.teams.find(team => team.id == item.submitter_team_id)
            const attendant = this.teams.find(team => team.id == item.attendant_team_id)
            const type = this.requests.find(type => type.id == item.type_id)
            list.push({
              submitter: submitter?.name,
              attendant: attendant?.name,
              type_id: type?.name
            })
          }
        }
      }
      return list
    }
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.parent_id = this.parentId
        if (this.isEditing) {
          this.capabilityList = []
          this.loadForm(this.itemId)
        }
      }
    },
    capabilities(newValue) {
      this.capabilityList = newValue
    }
  },
  methods: {
    async loadForm(id) {
      !this.parentId && await this.$store.dispatch('fetchChannels')
      this.formData.parent_id = this.parentId
      if (id) {
        this.getTeam(id)
        this.getCapability(id)
        this.getEligible(id)
        this.getRequestType(id)
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      
      this.formData.extra = JSON.stringify({ isArchitecture: this.formData.architecture })

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updTeam', this.formData)
      } else {
        await this.$store.dispatch('addTeam', this.formData)
      }
      if (this.parentId) {
        await this.$store.dispatch('fetchTeams', `parent_id=${this.parentId}`)
        this.$emit('refresh')
      } else {
        this.$emit('refresh')
      }

      this.handleCancel()
    },
    async getTeam(itemId) {
      const { created_at, updated_at, extra, ...content } = await this.getItem('/ecosystem/team', `id=${itemId}`)
      this.formData = { ...content, id: itemId }

      if (extra) {
        const { isArchitecture } = JSON.parse(extra)
        if (isArchitecture) {
          this.formData.architecture = true
        }
      }

    },
    async getCapability(itemId) {
      await this.$store.dispatch(
        'fetchCapabilities',
        `includes=user,role&team_id=${itemId}`
      )
    },
    async getEligible() {
      await this.$store.dispatch('fetchEligibleTeams')
    },
    async getRequestType() {
      await this.$store.dispatch('fetchRequests')
    },
    async handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    }
  }
}
</script>

