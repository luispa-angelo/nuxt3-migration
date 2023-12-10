<template>
  <v-form ref="form">
    <h6 class="bordered-title mb-3 pl-2">Dados gerais</h6>
    <v-text-field
      readonly
      label="Nome completo"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.name"
      :error="$v.formData.name.$error"
      :error-messages="
        $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-text-field>
    <v-text-field
      readonly
      label="E-mail"
      type="email"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.email"
      :error="$v.formData.email.$error"
      :error-messages="
        $v.formData.email.$error ? 'Esse campo é obrigatório' : ''
      "
    ></v-text-field>
    <v-text-field
      label="Ramal"
      type="number"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model="formData.phone_extension"
    ></v-text-field>
    <h6 class="bordered-title mb-3 pl-2">Login softphone</h6>
    <v-text-field
      label="Login"
      placeholder="Digite aqui..."
      outlined
      dense
      v-model.trim="softPhone.login"
    ></v-text-field>
    <v-text-field
			:type="showPassword ? 'text' : 'password'"
      label="Senha"
      placeholder="Digite aqui..."
      outlined
			:append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      dense
      v-model.trim="softPhone.password"
    >
			<v-icon
				@click="showPassword = !showPassword"
				slot="append"
				color="primary"
			>
				{{showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'}}
			</v-icon>
		</v-text-field>
		<v-select
      attach
			v-model="softPhone.provider"
			:items="providers"
			label="Telefonia"
			outlined
      dense
		>
		</v-select>
    <ManageVueEditor
      class="mb-3"
      title="Editar assinatura"
      :is-editing="isEditing"
      :text-content="signature"
      @getContent="handleSignature"
    >
    </ManageVueEditor>
    <v-btn :text="textButton" block v-if="isDarkTheme" @click="deactivateDarkTheme">
          Desativar modo escuro (esta alteração não poderá ser desfeita)
    </v-btn>
    <v-btn block v-if="disabledOpportunityMessage" @click="enableOpportunityMessage">
          Habilitar mensagem de confirmação de avanço de estágio
    </v-btn>
  </v-form>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    userInfo: Object,
  },
  data: () => ({
    tabItems: [
      { name: 'Turno', value: 'shift' },
      { name: 'Folga', value: 'slack' }
    ],
    showPassword: false,
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Razão', value: 'reason' },
      { text: 'Observação', value: 'observations' }
    ],
    search: '',
    slackList: [],
    selectedWeekdays: [],
    formData: {
      name: '',
      email: '',
      start: '',
      end: '',
      is_admin: false,
      extra: ''
    },
    providers : ['utech', 'voixtel'],
    signature: '',
    softPhone: {
      login: null,
      password: null,
      provider: null
    },
    isDarkTheme: false,
    disabledOpportunityMessage: false,
  }),
  validations: {
    formData: {
      name: { required },
      email: { required }
    }
  },
  computed: mapGetters(['meta']),
  mounted() {
    this.loadForm(this.userInfo.id)
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.userInfo.id)
      }
    }
  },
  methods: {
    loadForm(id) {
      this.getUser(id)
      this.getLocalPreferences()
    },
    getLocalPreferences() {
      if (localStorage?.theme == 'dark') {
        this.isDarkTheme = true
      }
      this.disabledOpportunityMessage = !!localStorage?.remove_opportunity_message
    },
    deactivateDarkTheme() {
      localStorage.removeItem('theme')
      window.location.reload()
    },
    enableOpportunityMessage() {
      localStorage.removeItem('remove_opportunity_message')
      this.getLocalPreferences()
    },
    async getUser(itemId) {
      const { created_at, updated_at, ...content } = await this.getItem('/ecosystem/user', `id=${itemId}`)
      this.formData = { ...content, id: itemId }
      this.getSoftphone(content.extra)
      this.getEmailSignature(content.extra)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      this.formData.id = this.userInfo.id
      const { extra, ...payload } = this.formData
      await this.$store.dispatch('User/updUser', payload)

      this.handleSoftphone()
      this.handleCancel()
    },
    async handleSoftphone() {
      const softPhone = {
        login: this.softPhone.login.trim(),
        password: this.softPhone.password.trim(),
        provider: this.softPhone.provider
      }
      console.log(softPhone)

      const { extra, id } = this.formData
      const softphonePayload = { id, extra: '' }
      if(extra) {
        const extraPayload = JSON.stringify({ ...JSON.parse(extra), softPhone })
        softphonePayload.extra = extraPayload
      }else{
        softphonePayload.extra = JSON.stringify({ softPhone })
      }
      await this.$store.dispatch('User/updUser', softphonePayload)
      this.updateLocalStorage(softphonePayload.extra)
    },
    async handleSignature(signature) {
      const { extra, id } = this.formData
      const signaturePayload = { id, extra: '' }
      if (extra) {
        const extraPayload = JSON.stringify({ ...JSON.parse(extra), signature })
        signaturePayload.extra = extraPayload
      } else {
        signaturePayload.extra = JSON.stringify({ signature })
      }
      await this.$store.dispatch('User/updUser', signaturePayload)
      this.signature = signature
      this.formData.extra = signaturePayload.extra
      this.updateLocalStorage(signaturePayload.extra)
    },
    getSoftphone(extra) {
      if (extra) {
        const extraObject = JSON.parse(extra)
        if (extraObject.softPhone) {
          this.softPhone = { ...extraObject.softPhone }
        }
      }
    },
    getEmailSignature(extra) {
      if (extra) {
        const extraObject = JSON.parse(extra)
        if (extraObject.signature) {
          this.signature = extraObject.signature
        }
      }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    },
    updateLocalStorage(extra) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const updateExtra = { ...userInfo, extra }
      localStorage.setItem('userInfo', JSON.stringify(updateExtra))
      this.$store.commit('SET_USERINFO', updateExtra)
    },
  }
}
</script>
