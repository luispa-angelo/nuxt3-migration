<template>
  <div>
    <v-btn @click="dialog = !dialog">
      Teste
    </v-btn>
    <v-dialog v-model="dialog" persistent max-width="1000">
      <v-card>
        <DialogHeader title="Titulo do modal" />
        <v-card-text class="pt-6">
          <v-text-field
            dense
            outlined
            label="Campo de teste"
          ></v-text-field>
          <v-text-field
            dense
            outlined
            label="Campo de teste 2"
          ></v-text-field>
          <v-text-field
            dense
            outlined
            label="Campo de teste 3"
          ></v-text-field>
        </v-card-text>
        <DialogAction @submit="submitForm()" @cancel="handleCancel()" />
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    maxWidth: {
      type: Number,
      default: 650
    }
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    submit() {
      this.dialog = !this.dialog
      console.log('submit 2')
    },
    cancel() {
      this.dialog = !this.dialog
      console.log('cancel 2')
    }
  }
}
</script>