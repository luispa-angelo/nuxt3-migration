<template>
  <div>
    <v-form ref="form">
      <h3 class="bordered-title mb-3 pl-2">Dados gerais</h3>
      <v-text-field
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
      <h3 class="bordered-title mb-3 pl-2">Configuração extra</h3>
      <v-text-field
        label="Login"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model.trim="softPhone.login"
      ></v-text-field>
      <v-text-field
        label="Senha"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model.trim="softPhone.password"
      ></v-text-field>
      <v-select
      attach
      v-model="softPhone.provider"
      :items="providers"
      label="Telefonia"
      outlined
      dense
      ></v-select>
      <v-checkbox
        v-model="formData.is_admin"
        :label="'Usuário Administrador'"
        class="mt-0"
      ></v-checkbox>
    </v-form>
    <ManageVueEditor
      v-if="isEditing"
      class="mb-3"
      title="Editar assinatura"
      :is-editing="isEditing"
      :text-content="signature"
      @getContent="handleSignature"
    >
    </ManageVueEditor>
    <TabComponent v-if="isEditing" :tab-items="tabItems">
      <template v-slot:shift>
        <v-form ref="shiftForm">
          <div class="w-100 d-flex justify-space-between align-center">
            <v-checkbox
              v-model="selectedWeekdays"
              label="Dom"
              value="sunday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Seg"
              value="monday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Ter"
              value="tuesday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Qua"
              value="wednesday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Qui"
              value="thursday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Sex"
              value="friday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
            <v-checkbox
              v-model="selectedWeekdays"
              label="Sab"
              value="saturday"
              class="mb-2"
              :error="hasWeekdayError"
            ></v-checkbox>
          </div>
          <v-row>
            <v-col>
              <v-text-field
                type="time"
                label="Inicio"
                outlined
                dense
                v-model="shiftFormData.start"
                :error="$v.shiftFormData.start.$error"
                :error-messages="
                  $v.shiftFormData.start.$error ? 'Esse campo é obrigatório' : ''
                "
              ></v-text-field>
            </v-col>
            <v-col>
              <v-text-field
                type="time"
                label="Fim"
                outlined
                dense
                v-model="shiftFormData.end"
                :error="$v.shiftFormData.end.$error"
                :error-messages="
                  $v.shiftFormData.end.$error ? 'Esse campo é obrigatório' : ''
                "
              ></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </template>
      <template v-slot:slack>
        <Dialog
          :isEditing="false"
          defaultButton
          isSmall
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
          title="Adicionar folga"
          class="text-right mt-3"
        >
          <template v-slot="{ dialog }">
            <CalendarSlackForm
              :isEditing="false"
              :dialog="dialog"
              :user-id="itemId"
              :item-name="itemName"
              ref="myForm"
            />
          </template>
        </Dialog>
        <GenericTable
          :search="search"
          :headers="headers"
          :items="slackList"
          delete-action="deleteSlack"
          action-options
          v-slot:default="slotProps"
          class="mt-3"
        >
          <Dialog
            isEditing
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            :item-id="slotProps.itemId"
            :item-name="slotProps.itemName"
            title="Editar folga"
          >
            <template v-slot="{ dialog }">
              <CalendarSlackForm
                isEditing
                :dialog="dialog"
                :user-id="itemId"
                :item-id="slotProps.itemId"
                :item-name="slotProps.itemName"
                ref="myForm"
              />
            </template>
          </Dialog>
        </GenericTable>
      </template>
    </TabComponent>
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
    itemName: String
  },
  data: () => ({
    tabItems: [
      { name: 'Turno', value: 'shift' },
      { name: 'Folga', value: 'slack' }
    ],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Razão', value: 'reason' },
      { text: 'Observação', value: 'observations' }
    ],
    search: '',
    slackList: [],
    hasWeekdayError: false,
    oldselectedWeekdays: [],
    oldStart: null,
    oldEnd: null,
    selectedWeekdays: [],
    userShift: null,
    userShiftWeekdays: [],
    shiftFormData: {
      start: null,
      end: null
    },
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
      login: '',
      password: '',
      provider: ''
    }
  }),
  validations: {
    formData: {
      name: { required },
      email: { required }
    },
    shiftFormData: {
      start: { required },
      end: { required }
    },
  },
  computed: mapGetters(['shifts', 'weekdays', 'slacks', 'meta']),
  mounted() {
    this.loadForm(this.itemId)
    if(!this.isEditing) {
      this.setShiftToNewUser()
    }
  },
  watch: {
    dialog(newValue) {
      if(!this.isEditing && newValue) {
        this.setShiftToNewUser()
      } else if (this.isEditing && newValue) {
        this.slackList = []
        this.loadForm(this.itemId)
      }
    },
    slacks(newValue){
      if (this.isEditing && newValue) {
        this.slackList = this.slacks.map((slack) => ({
          ...slack,
          reason: this.getEnum(slack.reason, this.meta.slackReason)
        }))
      }
    },
    selectedWeekdays(newValue) {
      if(this.dialog == true) {
        this.weekdaysIsEmpty(newValue)
      }
    }
  },
  methods: {
    setShiftToNewUser() {
      this.selectedWeekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
      this.shiftFormData.start = '08:00'
      this.shiftFormData.end = '18:00'
    },
    weekdaysIsEmpty(value) {
      if(value.length === 0) {
        this.$swal({
          icon: 'warning',
          title: 'Selecione ao menos um dia para o turno',
          showCloseButton: false,
          showConfirmButton: false,
          backdrop: false,
          timer: 2000
        })
        this.selectedWeekdays = this.oldselectedWeekdays
      }
    },
    loadForm(id) {
      this.getUser(id)
      this.oldselectedWeekdays = this.selectedWeekdays
      this.oldStart = this.shiftFormData.start
      this.oldEnd = this.shiftFormData.end
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (this.isEditing) {
        await this.handleShift(this.itemId)
        this.formData.id = this.itemId
        const { extra, ...payload } = this.formData
        await this.$store.dispatch('User/updUser', payload)
        this.handleSoftphone()
      }else {
        const { id } = await this.createItem('/ecosystem/user', this.formData)
        await this.handleShift(id)
      }

      // await this.$store.dispatch('User/fetchUsers')
      this.$store.dispatch('User/refresh', true)
      this.handleCancel()
    },
    async handleShift(_userId) {
      let shiftId = null
      if (this.userShift) {
        shiftId = this.userShift.id
        const { data } = await this.getList('/ecosystem/shift-weekdays', `shift_id=${shiftId}`)
        this.userShiftWeekdays = data
      }
      this.selectedWeekdays.forEach((day) => {
        const formWeekday = {
          weekday: day,
          start: this.shiftFormData.start,
          end: this.shiftFormData.end,
          shift_id: shiftId,
        }
        const existingDay = this.userShiftWeekdays.find(({ weekday }) => weekday == day)
        if (existingDay) {
          formWeekday.id = existingDay.id
          this.updateData('/ecosystem/shift-weekdays', formWeekday, { fireSuccessAlert: false })
        } else {
          this.createItem('/ecosystem/shift-weekdays', formWeekday, { fireSuccessAlert: false })
        }
      })
      const shiftToDelete = this.userShiftWeekdays.filter(
        ({ weekday }) => !this.selectedWeekdays.some(
          (day) => weekday == day
        )
      )
      shiftToDelete.forEach((shift) => {
        this.removeItem('/ecosystem/shift-weekdays', shift.id, { fireSuccessAlert: false })
      })
    },
    async getShift(id) {
      const data = await this.getItem('/ecosystem/shift', `user_id=${id}`)
      if (data) {
        this.userShift = data
        const startShiftData = data.created_at
        const { data: { data: { shift } } } = await this.$axios.get(`cash/user-schedule?user_id=${id}&start=${startShiftData}`)
        const weekdays = shift[shift.length - 1].weekdays
        if (weekdays.length > 0) {
          for (const item of weekdays) {
            this.selectedWeekdays.push(item.weekday)
          }
          let { start, end } = weekdays[weekdays.length - 1]
          this.shiftFormData.start = start.replace(/:[^:]*$/,'')
          this.shiftFormData.end = end.replace(/:[^:]*$/,'')
        }
      }
    },
    async getUser(itemId) {
      const { ...content } = await this.getItem('/ecosystem/user', `id=${itemId}`)
      await this.getShift(itemId)
      await this.$store.dispatch('fetchSlacks', `user_id=${itemId}`)
      this.formData = { ...content, id: itemId }
      this.getSoftphone(content.extra)
      this.getEmailSignature(content.extra)
    },
    handleCancel() {
      this.$refs.form.reset()
      if(this.isEditing) {
        this.$refs.shiftForm.reset()
      }
      this.$v.$reset()
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
      await this.updateData('ecosystem/user', softphonePayload, { fireSuccessAlert: false })
    },
    async handleSignature(signature) {
      const { extra, id } = this.formData
      const signaturePayload = { id, extra: '' }
      if (extra) {
        const extraPayload = JSON.stringify({ ...JSON.parse(extra), signature })
        signaturePayload.extra = extraPayload
        this.formData.extra = extraPayload
      } else {
        signaturePayload.extra = JSON.stringify({ signature })
        this.formData.extra = JSON.stringify({ signature })
      }
      await this.$store.dispatch('User/updUser', signaturePayload)
      this.signature = signature
      this.formData.extra = signaturePayload.extra
      this.updateLocalStorage(signaturePayload.extra)
      this.getEmailSignature(this.formData.extra)
    },
    getSoftphone(extra) {
      if (extra) {
        const extraObject = JSON.parse(extra)
        if (extraObject.softPhone) {
          this.softPhone = extraObject.softPhone
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
    updateLocalStorage(extra) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      const updateExtra = { ...userInfo, extra }
      localStorage.setItem('userInfo', JSON.stringify(updateExtra))
      this.$store.commit('SET_USERINFO', updateExtra)
    },
  }
}
</script>