<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450">
      <v-card>
        <DialogHeader :elevation="0" :title="title" @onCancel="handleCancel" />
        <v-card-text class="pt-3">
          <v-row>
            <p>{{text}}</p>
          </v-row>
          <v-row class="d-flex flex-column mb-2">
          <span v-if="!isActualDay" class="mb-2">{{slotSuggestions.length > 0 && this.$moment(slotSuggestions[0]).format('dddd [(]L[)]')}}</span>
          <div>
            <v-chip
              v-for="time, index in timeSuggestions"
              class="mr-2"
              color="primary"
              :outlined="selectedIndex ? (selectedIndex !== index + 1) : true"
              :key="index"
              @click="setTaskMediaType(time, index + 1)"
            >
              {{time}}
            </v-chip>
          </div>
        </v-row>
        </v-card-text>
        <DialogAction
          @cancel="handleCancel"
          @submit="handleSubmit"
        />
      </v-card>
    </v-dialog>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    propDialog: Boolean,
    slotSuggestions: Array,
    userId: Number,
  },
  data: () => ({
    dialog: false,
    scheduleTo: null,
    selectedIndex: null,
  }),
  computed: {
    ...mapGetters({ userInfo: 'userInfo' }),
    timeSuggestions: function() {
      const slots = this.slotSuggestions
      return slots
        .sort((a, b) => this.$moment(a).diff(this.$moment(b)))
        .map((slot) => this.$moment(`${slot}Z`).format('HH:mm'))
    },
    isActualDay: function() {
      if (this.slotSuggestions.length > 0) {
        const now = new Date()
        const actualDay = this.$moment(now).format('YYYY-MM-DD')
        const slotDay = this.$moment(`${this.slotSuggestions[0]}Z`).format('YYYY-MM-DD')
        if (this.$moment(actualDay).isSame(slotDay)) {
          return slotDay
        }
      }
      return false
    },
    isOtherUser: function() {
      if (this.userId === this.userInfo.id) {
        return false
      }
      return true
    },
    title: function() {
      if (this.isActualDay) {
        return 'Conflito de horários'
      }
      return 'Sem horário disponível'
    },
    text: function() {
      if (this.isActualDay) {
        if (this.isOtherUser) {
          return 'O usuário atribuído já possui uma tarefa agendada para esse horário. Selecione o próximo horário disponível:'
        }
        return 'Você já possui uma tarefa agendada para esse horário. Selecione o próximo horário disponível:'
      }
      if (this.isOtherUser) {
        return 'O usuário atribuído não possui mais horário disponível para agendar uma tarefa. Selecione a próxima data com horário livre:'
      }
      return 'Hoje você não possui mais horário disponível para agendar uma tarefa. Selecione a próxima data com horário livre:'
    },

  },
  watch: {
    propDialog(newValue) {
      this.scheduleTo = null
      this.selectedIndex = null
      this.dialog = newValue
    }
  },
  methods: {
    handleSubmit() {
      this.dialog = false
      this.$emit('onTimeChosen', this.scheduleTo)
    },
    handleCancel() {
      this.dialog = false
      this.$emit('onTimeChosen', false)
    },
    setTaskMediaType(datetime, index) {
      this.scheduleTo = datetime
      this.selectedIndex = index
    },
  }
}
</script>

<style>

</style>