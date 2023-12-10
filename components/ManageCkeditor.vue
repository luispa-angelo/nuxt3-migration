<template>
  <v-form ref="form">
    <v-dialog v-model="dialog" persistent max-width="700px" tabindex="1">
      <template v-slot:activator="{ on, attrs }">
        <v-btn :text="textButton" block v-bind="attrs" v-on="on">
          {{ title }}
        </v-btn>
      </template>
      <v-card>
        <v-toolbar color="secondary" class="mb-8" flat>
          Editando
        </v-toolbar>
        <v-card-text>
          <ckeditor
            id="content"
            name="content"
            :editor-url="editorUrl"
            v-model="content"
          ></ckeditor>
        </v-card-text>
        <v-card-actions class="px-6">
          <v-spacer></v-spacer>
          <v-btn text large @click="closeDialog">
            Cancelar
          </v-btn>
          <v-btn color="primary" large @click="emmitContent">
            Salvar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
export default {
  props: {
    isEditing: Boolean,
    textButton: Boolean,
    title: String,
    textContent: String,
  },
  data: () => ({
    dialog: false,
    editorUrl: 'https://cdn.ckeditor.com/4.16.2/standard/ckeditor.js',
    content: null
  }),
  methods: {
    emmitContent() {
      this.$emit('getContent', this.content)
      console.log(this.content)
      this.dialog = false
      this.$refs.form.reset()
      this.content = null
    },
    closeDialog() {
      this.$refs.form.reset()
      this.dialog = false
    }
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.content = this.textContent
      }
    }
  }
}
</script>
