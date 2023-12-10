<template>
  <v-dialog v-model="dialog" hide-overlay max-width="650px">
      <v-card>
          <v-toolbar
            class="d-flex justify-end px-2"
            color="blue-grey lighten-5"
            dark
            flat
            dense
          >
              {{ selectedDate }}
          </v-toolbar>
          <v-card-text>
            <v-menu
              v-model="datePicker"
              :close-on-content-click="false"
              min-width="450"
              max-width="550"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  :value="dateFormatted"
                  clearable
                  label="Data selecionada"
                  readonly
                  dense
                  v-bind="attrs"
                  v-on="on"
                  @click:clear="date = null"
                  prepend-icon="mdi-clock-outline"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @change="datePicker = false"
                no-title
              ></v-date-picker>
            </v-menu>
            <v-text-field
              type="time"
              label="Horário"
              v-model="startHour"
              dense
            ></v-text-field>
            <v-text-field
              type="time"
              label="Horário"
              v-model="endHour"
              dense
            ></v-text-field>
          </v-card-text>
          <v-card-actions class="px-6">
              <v-spacer></v-spacer>
              <v-btn text large @click="dialog = !dialog"> Cancelar </v-btn>
              <v-btn color="primary" large @click="handleSubmit">
                  Salvar
              </v-btn>
          </v-card-actions>
      </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    openDialog: Boolean,
    selectedDate: String,
  },
  data: () => ({
    dialog: false,
    datePicker: false,
    date: null,
    startHour: null,
    endHour: null,
  }),
  computed: {
    dateFormatted() {
      return this.selectedDate ? this.$moment(this.selectedDate).format('dddd, DD [de] MMMM') : ''
    }
  },
  watch: {
    openDialog(newValue) {
      if (newValue) {
        this.date = this.selectedDate
        this.dialog = true
      }
    },
    selectedDate(newValue) {
      if(newValue) {
        this.checkHours(newValue)
      }
    }
  },
  methods: {
    checkHours(date) {
      console.log(date)
      // const { data: { data: { tasks, slacks, shift, user } } } = await this.$axios.get(`cash/user-schedule?user_id=in(${date})&start=${date}`)
      // console.log(user.name, tasks)
      // console.log(user.name, slacks)
      // console.log(user.name, shift)
    }
  }
}
</script>