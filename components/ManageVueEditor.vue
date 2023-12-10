<template>
  <v-form ref="form">
    <v-dialog v-model="dialog" persistent max-width="800px" tabindex="1">
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
          <VueEditor id="content" v-model="content" :useCustomImageHandler="true" :editorToolbar="customToolbar" @image-added="handleImageAdded"/>
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
    content: null,
		customToolbar: [
			[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
			[{'font': []}],
			['bold', 'italic', 'underline', 'strike'],
			[{'align': []}],
			['blockquote', 'code-block'],
			[{'list': 'ordered'}, {'list': 'bullet'}, {'list': 'check'}],
			[{'color': []}, {'background': []}],
			['link', 'image'],
			[{ 'script': 'sub'}, { 'script': 'super' }],
			['clean'],
		],
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
    },
		handleImageAdded: async function (file, Editor, cursorLocation, resetUploader) {
			// An example of using FormData
			// NOTE: Your key could be different such as:
			// formData.append('file', file)
			const maxSize = 2e6

			if (file && file.size > maxSize) {
				this.$swal({
					icon: 'error',
					title: 'O tamanho da imagem não pode ser maior que 2mb',
					showConfirmButton: true,
					timer: 3000
				});
				resetUploader();
			} else {
				Editor.insertEmbed(
					cursorLocation,
					"image",
					"data:" + file.type + ";base64," + Buffer.from(await file.arrayBuffer()).toString('base64'));
				resetUploader();
			}
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
