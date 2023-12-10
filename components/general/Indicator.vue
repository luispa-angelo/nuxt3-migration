<template>
  <div>
    <v-card
      color="shape lighten-1"
      class="w-100"
      disabled
    >
      <ComingSoon />
      <v-card-title :class="color ? `${color}--text` : ''" class="d-flex justify-space-between align-center pt-3 pb-1 px-1">
        <span class="ml-3">{{ title }}</span>
        <v-btn icon x-small class="align-dots-on-top" @click="dialog = true">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col xl="7" lg="7" md="12" sm="7" cols="7">
            <span>{{ indicator }}</span>
          </v-col>
          <v-col xl="5" lg="5" md="12" sm="5" cols="5" class="d-flex justify-center">
            <v-progress-circular
              :rotate="-90"
              :size="90"
              :width="8"
              :value="25"
              color="primary"
            >
              <b>
                --
              </b>
            </v-progress-circular>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    <v-dialog v-model="dialog" max-width="600">
      <v-card>
        <DialogHeader title="Alterar indicadores" @onCancel="cancel" />
        <v-card-text class="pt-5">
          <v-list two-line>
            <v-list-item-group
              v-model="selected"
              active-class="primary--text"
              multiple
            >
              <v-list-item v-for="n in 6" :key="n">
                <template v-slot:default="{ active }">
                  <v-list-item-action>
                    <v-checkbox :input-value="active"></v-checkbox>
                  </v-list-item-action>

                  <v-list-item-content>
                    <v-list-item-title class="font-body-large">Indicador {{ n }}</v-list-item-title>
                    <v-list-item-subtitle class="font-body-medium">Lorem ipsum dolor sit amet consectetur, adipisicing elit.</v-list-item-subtitle>
                  </v-list-item-content>
                </template>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-card-text>
        <DialogAction @submit="submit" @cancel="cancel" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    color: String,
    title: String,
    indicator: String
  },
  data: () => ({
    dialog: false,
    selected: []
  }),
  methods: {
    submit() {
      alert('foi!')
    },
    cancel() {
      this.dialog = !this.dialog
    }
  }
}
</script>

<style scoped>
  .v-card__title {
    font-weight: 600;
  }
  .align-dots-on-top {
    position: relative;
    top: -12px;
    right: -2px;
  }
  .v-progress-circular {
    margin-top: -30px;
  }
</style>