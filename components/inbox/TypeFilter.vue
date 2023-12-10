<template>
  <v-menu offset-y v-model="isOpened" :close-on-content-click="false">
    <template v-slot:activator="{ on, attrs }">
      <v-btn 
        fab
        x-small
        color="primary"
        class="ml-1"
        v-bind="attrs"
        v-on="on"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
              Outros <br>
              Filtros
            </div>
            `,
          placement: 'bottom-center'
        }"
      >
        <v-icon>mdi-tune</v-icon>
      </v-btn>
    </template>
    <v-card width="420px" elevation="4">
      <v-card-text class="pt-6 pb-0">
        <div class="d-flex justify-space-between">
          <v-text-field
            outlined
            dense
            label="Data Início"
            type="date"
            color="primary"
            class="mt-2 mx-2"
            v-model="inicialDate"
          ></v-text-field>
          <v-text-field
            outlined
            dense
            label="Data Final"
            type="date"
            color="primary"
            class="mt-2 mx-2"
            v-model="finalDate"
          ></v-text-field>
        </div>
        <div class="control-vertical-space d-flex justify-space-between mb-4">
          <v-container fluid class="mx-2">
            <span>Tarefas:</span>
            <v-checkbox
              v-for="(type, i) in taskTypeFilterList"
              dense
              hide-details
              v-model="taskTypeFilterList[i].active"
              :key="type.value"
              :label="type.name"
            ></v-checkbox>
          </v-container>
          <v-container fluid class="mx-2">
            <span>Solicitações internas:</span>
            <v-checkbox
              v-for="(type, i) in requestTypeFilterList"
              dense
              hide-details
              v-model="requestTypeFilterList[i].active"
              :disabled="type.disabled"
              :key="type.value"
              :label="type.name"
            ></v-checkbox>
          </v-container>
        </div>
        <div>
          <v-text-field
            outlined
            dense
            clearable
            label="Contato"
            color="primary"
            class="ma-2"
            v-model="contactFilter"
          ></v-text-field>
          <v-text-field
            disabled
            outlined
            dense
            label="Área"
            color="primary"
            class="ma-2"
          ></v-text-field>
        </div>
      </v-card-text>
      <v-card-actions class="d-flex flex-row-reverse my-0 px-4">
        <v-btn color="primary" class="px-4 mr-2 mb-2" @click="applyFilters">Filtrar</v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    isOpened: false,
    inicialDate: '',
    finalDate: '',
    contactFilter: null,
    taskTypeFilterList: [
      {
        name: 'Email',
        value: 'email',
        active: true,
      },
      {
        name: 'Chat',
        value: 'chat',
        active: true,
      },
      {
        name: 'Lembrete',
        value: 'reminder',
        active: true,
      },
    ],
    requestTypeFilterList: [
      {
        name: 'Oportunidade',
        value: 'partnership_approval',
        disabled: false,
        active: true,
      },
      {
        name: 'Vouchers',
        value: 'csc_voucher',
        disabled: false,
        active: true,
      },
      {
        name: 'Atendimento Suporte',
        value: 'support',
        disabled: true,
        active: true,
      },
      {
        name: 'Transferências',
        value: 'csc_transfer',
        disabled: false,
        active: true,
      },
    ]
  }),
  computed: {
    ...mapGetters({ notificationContacts: 'Notification/contacts' })
  },
  watch: {
    inicialDate(newValue) {
      if (newValue !== '' && this.finalDate === '') {
        this.finalDate = this.$moment(newValue).add(1, 'days').format('YYYY-MM-DD')
      }
    },
    finalDate(newValue) {
      if (newValue !== '' && this.inicialDate === '') {
        this.inicialDate = this.$moment(newValue).subtract(1, 'days').format('YYYY-MM-DD')
      }
    }
  },
  methods: {
    applyFilters() {
      // const requestFilters = this.requestTypeFilterList.map(type => ({...type}))
      // this.$emit('requestFilter', requestFilters)
      console.log('teste', this.taskTypeFilterList)
      console.log('teste 2', this.requestTypeFilterList)
      const typeFilters = [...this.taskTypeFilterList.map((type) => ({...type})), ...this.requestTypeFilterList.map((type) => ({...type}))]
      this.$emit('typeFilter', typeFilters)
      this.$emit('contactFilter', this.contactFilter)
      this.$emit('dateFilter', [this.inicialDate, this.finalDate])
      this.isOpened = false
    }
  }
}
</script>

<style scoped>
  .control-vertical-space {
    margin-top: -15px;
  }
</style>