<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="700">
      <v-card>
        <DialogHeader :elevation="0" :title="title" @onCancel="handleCancel" />
        <v-card-text class="pt-3">
          <p class="mb-0">
            {{text}}
            <a href="" @click="handleRedirectForm($event)">{{textLink}}</a>
          </p>
        </v-card-text>
        <DialogAction
          :submit-text="buttonText"
          @cancel="handleCancel"
          @submit="handleSubmit"
        />
      </v-card>
    </v-dialog>
</template>

<script>
export default {
  props: {
    propDialog: Boolean,
    scheduling: Boolean,
  },
  data: () => ({
    dialog: false
  }),
  computed: {
    title: function() {
      if (this.scheduling) {
        return 'Notamos que você gostaria de registrar uma tarefa'

      }
      return 'Notamos que você gostaria de agendar uma tarefa'
    },
    text: function() {
      if (this.scheduling) {
        return 'Na aba Agendar tarefa você inclui uma tarefa futura. Já para registrar tarefas realizadas, você precisa acessar a aba Registrar tarefa.'
      }
      return 'Na aba Registrar tarefa você inclui tarefas realizadas. Já para agendar uma tarefa futura, você precisa acessar a aba'
    },
    textLink: function() {
      if (this.scheduling) {
        return 'Registrar tarefa.'
      }
      return 'Agendar tarefa.'
    },
    buttonText: function() {
      if (this.scheduling) {
        return 'Ir para registro'
      }
      return 'Ir para agendamento'
    }
  },
  watch: {
    propDialog(newValue) {
      this.dialog = newValue
    }
  },
  methods: {
    handleSubmit() {
      const tab = this.scheduling ? 1 : 3
      this.dialog = false
      this.$emit('changeToTab', tab)
    },
    handleCancel() {
      this.dialog = false
      this.$emit('changeToTab', false)
    },
    handleRedirectForm(event) {
      event.preventDefault()
      this.handleSubmit()
    }
  }
}
</script>

<style>

</style>