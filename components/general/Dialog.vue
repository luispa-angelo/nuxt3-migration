<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="650px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="!isEditing && !userEditing"
          color="secondary"
          x-small
          fab
          v-bind="attrs"
          v-on="on"
        >
          <v-icon v-if="!defaultButton" color="primary">mdi-plus</v-icon>
          <span v-else>{{ title }}</span>
        </v-btn>
        <v-list-item
          v-else-if="isEditing && userEditing"
          v-bind="attrs"
          v-on="on"
        >
          <v-list-item-title>
            Configurações
          </v-list-item-title>
        </v-list-item>
        <v-btn v-else-if="isEditing" v-bind="attrs" v-on="on" text>
          Editar
        </v-btn>
      </template>
      <v-card>
        <v-toolbar color="secondary" class="mb-8" flat>
          {{ title }}
        </v-toolbar>
        <v-card-text>
          <slot :dialog="dialog" :submitted="handleDataUpdate"></slot>
        </v-card-text>
        <v-card-actions class="px-6">
          <v-spacer></v-spacer>
          <v-btn color="secondary" @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="handleSubmit">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  props: {
    defaultButton: Boolean,
    isEditing: Boolean,
    userEditing: Boolean,
    isSmall: Boolean,
    isXsmall: Boolean,
    title: String,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    dialog: false,
  }),
  methods: {
    closeDialog() {
      this.$emit('cancel')
      this.dialog = !this.dialog
    },
    handleSubmit() {
      this.$emit('submit')
      this.dialog = !this.dialog
    },
    handleDataUpdate() {
      this.$emit('dataUpdate')
      // this.dialog = !this.dialog
    }
  }
}
</script>