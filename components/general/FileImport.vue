<template>
  <div>
    <v-dialog v-model="dialog" persistent max-width="650px" tabindex="1">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="leadsImport"
          color="secondary"
          class="mx-2"
          v-bind="attrs"
          v-on="on"
        >
          Importar Leads
        </v-btn>

        <v-btn
          v-else
          :x-small="isXsmall"
          :fab="iconButton ? true : false"
          color="secondary"
          class="mx-2"
          v-bind="attrs"
          v-on="on"
          v-tooltip="{
            content: `
              <div class='v-btn-tooltip'>
                Importar <br>
                Arquivo
              </div>
            `,
            placement: 'bottom-center',
          }"
        >
          <v-icon v-if="iconButton">mdi-import</v-icon>
          <span v-else style="font-weight: 600">Importar Contatos</span>
        </v-btn>
        <v-tooltip bottom>
          <span>Importar Contatos</span>
        </v-tooltip>
      </template>

      <v-card>
        <v-toolbar color="secondary" class="mb-8" flat>
          Importar arquivos
        </v-toolbar>
        <v-card-text>
          <v-file-input
            v-model="file"
            accept=".xlsx"
            label="File input"
          ></v-file-input>
        </v-card-text>
        <v-card-actions class="px-6">
          <v-spacer></v-spacer>
          <v-btn text large @click="dialog = false"> Cancelar </v-btn>
          <v-btn color="primary" large @click="upload"> Salvar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import XLSX from 'xlsx'
export default {
  props: {
    path: String,
    isXsmall: Boolean,
    leadsImport: Boolean,
    iconButton: Boolean,
  },
  data: () => ({
    dialog: false,
    file: '',
  }),
  methods: {
    readData(data) {
      let w = XLSX.read(data, { type: 'binary' })
      console.log(w)
      let sheet = w.SheetNames[0]
      let parsed = XLSX.utils.sheet_to_json(w.Sheets[sheet])
      return parsed
    },
    getBulkInsertRoute() {
      let splittedPath = this.path.split('/')
      let lastPath = splittedPath[splittedPath.length - 1]
      let bulkPath = ''
      for (let i = 0; i < splittedPath.length - 1; i++) {
        bulkPath += splittedPath[i] + '/'
      }
      bulkPath += 'bulk/' + lastPath
      return bulkPath
    },
    upload() {
      const reader = new FileReader()
      const self = this
      reader.onloadend = async function () {
        const data = reader.result
        const parsedData = self.readData(data)

        if (self.leadsImport) {
          self.$emit('onLeadsImport', parsedData)
        } else {
          const bulkPath = self.getBulkInsertRoute()
          try {
            await self.$axios.put(bulkPath, parsedData)
            self.onSuccess(201, 'Solicitação processada com sucesso!')
          } catch (error) {
            self.onError(null, 'Erro ao fazer upload')
          }
        }
      }
      reader.readAsBinaryString(this.file)
      this.dialog = false
      this.file = ''
    },
  },
}
</script>
