<template>
  <div class="drag-n-drop-zone" v-cloak @drop.prevent="addDropFile" @dragover.prevent>
    <v-file-input
      outlined
      dense
      hide-details
      chips
      placeholder="Selecione os arquivos ou arraste aqui (.xlsx)"
      prepend-inner-icon="mdi-login"
      accept=".xlsx"
      v-model="file"
      :prepend-icon="null"
      @click:clear="$emit('onFileRead', [])"
    ></v-file-input>
  </div>
</template>

<script>
import XLSX from 'xlsx'
export default {
  data: () => ({
    file: null
  }),
  watch: {
    file() {
      this.upload()
    }
  },
  methods: {
    readData(data) {
      let w = XLSX.read(data, { type: 'binary' })
      console.log(w)
      let sheet = w.SheetNames[0]
      let parsed = XLSX.utils.sheet_to_json(w.Sheets[sheet])
      return parsed
    },
    upload() {
      const reader = new FileReader()
      const self = this
      reader.onloadend = function() {
        const data = reader.result
        const parsedData = self.readData(data)
        self.$emit('onFileRead', parsedData)
      }
      this.file && reader.readAsBinaryString(this.file)
    },
    addDropFile(event) {
      this.file = event.dataTransfer.files[0]
    }
  }
}
</script>

<style scoped>

</style>
