<template>
  <v-dialog v-model="dialog" scrollable persistent max-width="450">
      <v-card>
        <DialogHeader :elevation="0" @onCancel="handleCancel" />
        <v-card-text class="pt-3">
          <v-row class="text-center align-center justify-center mb-4">
            <v-icon class="mr-2" :color="hasPartner ? 'success' : 'warning'">{{icon}}</v-icon>
            <h6>{{title}}</h6>
          </v-row>
          <v-row class="d-flex flex-column mb-2 align-center justify-center text-center">
          <span class="mb-2">{{text}}</span>
          <span v-if="hasPartner && partner" class="mb-2">{{`${partner.name} - ${maskCnpj(partner.identifier)}`}}</span>
        </v-row>
        </v-card-text>
        <DialogAction
          actions-align="center"
          cancel-text="Não, cancelar"
          submit-text="Sim, confirmar"
          :show-divider="false"
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
    partnerId: Number,
    opportunityPartner: Object,
  },
  data: () => ({
    dialog: false,
    newPartner: null,
  }),
  computed: {
    hasPartner: function() {
      if (this.partnerId) {
        return true
      }
      return false
    },
    icon: function() {
      if (this.hasPartner) {
        return 'check_circle_outline'
      }
      return 'warning_amber'
    },
    title: function() {
      if (this.hasPartner) {
        return 'Confirmação de Parceiro'
      }
      return 'Oportunidade sem Parceiro'
    },
    text: function() {
      if (this.hasPartner) {
        return 'Por favor, revise o parceiro da Oportunidade antes de seguir para Ativação:'
      }
      return 'Você tem certeza que a oportunidade não possui um parceiro relacionado?'
    },
    partner: function() {
      if (this.newPartner) {
        return  this.newPartner
      }
      if (this.opportunityPartner) {
        return  this.opportunityPartner
      }
      return null
    }
  },
  watch: {
    propDialog(newValue) {
      this.dialog = newValue
    },
    async partnerId(newValue) {
      if (newValue) {
        this.newPartner = await this.getItem('/customer/company', `id=${newValue}`)
      }
    }
  },
  methods: {
    handleCancel() {
      this.dialog = false
      this.$emit('onClose', false)
    },
    handleSubmit() {
      this.dialog = false
      this.$emit('onClose', true)
    },
  }
}
</script>

<style>

</style>