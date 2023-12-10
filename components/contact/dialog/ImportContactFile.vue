<template>
  <v-dialog
    v-model="showDialog"
    content-class="importContact"
    scrollable
    max-width="72vw"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        v-on="on"
        color="secondary"
        v-tooltip="{
          content: `
                <div class='v-btn-tooltip'>
                    Importar contato
                </div>
              `,
          placement: 'bottom-center',
        }"
      >
        Importar Contatos
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span>
          <i class="material-symbols-rounded v-icon pr-2">group</i>Importar
          Contatos
        </span>

        <i
          class="material-symbols-rounded v-icon"
          style="color: var(--v-primary-base); cursor: pointer"
          @click="handleCloseModal()"
        >
          close
        </i>
      </v-card-title>

      <v-card-text>
        <div class="import_files_tab_wrapper">
          <span
            class="tab_item"
            v-for="tab in tabs"
            :key="tab.id"
            @click="handleTabChange(tab.id)"
            :class="
              (files && activeTab === tab.id) ||
              (activeTab >= 1 && activeTab === tab.id)
                ? 'active'
                : ''
            "
          >
            <i class="material-symbols-rounded tab_icon">{{ tab.icon }}</i>
            {{ tab.text }}
          </span>
        </div>

        <div
          class="tab_content_wrapper"
          :class="
            invalidTableData && files ? 'empty_data' : files ? 'active' : ''
          "
          @dragover="dragover"
          @drop="drop"
          v-if="activeTab === 0"
        >
          <input
            ref="file"
            type="file"
            multiple
            name="file"
            id="fileInput"
            @change="onChange"
            accept=".csv,.xlsx"
            style="display: none"
          />

          <span class="title_wrapper">
            <h6>Escolher um arquivo para importar</h6>
          </span>

          <label for="fileInput" class="body_wrapper">
            <i class="material-symbols-rounded tab_icon">
              {{ files ? 'description' : 'download' }}
            </i>

            <small v-if="files && files[0]">
              {{ Math.round(files[0].size / Math.pow(1024, 1)) }}
              KB
            </small>

            <span v-if="this.activeTab < 1 && !invalidTableData">
              {{
                files && files[0]
                  ? `Arquivo ${files[0].name} carregado.`
                  : 'Arraste e solte ou escolha um arquivo para criar contatos'
              }}
            </span>

            <span v-if="invalidTableData"
              >Foi encontrado um erro de formatação no arquivo "{{
                `${files[0].name}`
              }}". Sugerimos que baixe um modelo para refazer o processo</span
            >

            <div class="action_buttons">
              <v-btn
                color="secondary"
                @click="handleFileTemplate()"
                class="mr-5 px-5"
                v-if="!files || invalidTableData"
              >
                Baixe um modelo
              </v-btn>

              <v-btn
                for="fileInput"
                :color="invalidTableData ? 'primary' : 'secondary'"
                class="px-5"
                @click="handleFileUpload"
              >
                {{ files ? 'Trocar arquivo' : 'Escolha um arquivo' }}
              </v-btn>
            </div>
          </label>
        </div>

        <div class="tab_content_wrapper" v-if="activeTab !== 0">
          <span class="title_wrapper">
            <h6>Tudo pronto!</h6>
            <small> Revise os dados e conclua o upload.</small>
          </span>

          <div class="table_wrapper">
            <v-row class="table">
              <GenericTable
                class="data-table"
                :items="tableData"
                :headers="tableHeaders"
                :hasMenu="false"
                :sortable="true"
                :sort-desc="false"
                sort-by="Nome"
                tableItemMaxWidth="22vw"
                no-data-text="Não há dados para mostrar"
                action-options
                v-slot:default="slotProps"
                v-if="tableData"
              >
                <i
                  class="material-symbols-rounded"
                  @click="deleteItem(slotProps.item.id)"
                  >delete</i
                >
              </GenericTable>
            </v-row>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="d-flex justify-end">
        <v-btn
          color="secondary"
          @click="handleCloseModal(activeTab === 1 && invalidTableData)"
          class="mr-3 px-5"
        >
          {{ activeTab === 1 && invalidTableData ? 'Voltar' : 'Cancelar' }}
        </v-btn>

        <v-btn
          color="primary"
          class="px-5"
          :disabled="
            (activeTab < 1 && (!files || tableData.length < 1)) ||
            invalidTableData
          "
          @click="activeTab < 1 && files ? handleTabChange(1) : handleSubmit()"
        >
          {{ activeTab === 1 ? 'Concluir' : 'Próximo' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import XLSX from 'xlsx'

export default {
  data: () => ({
    showDialog: false,
    activeTab: 0,
    tabs: [
      { id: 0, icon: 'download', text: 'Upload' },
      { id: 1, icon: 'check_circle', text: 'Confirmação' },
    ],
    files: null,
    tableData: [],
    tableHeaders: [
      {
        text: 'Nome Completo',
        value: 'name',
      },
      {
        text: 'Nome Social',
        value: 'social_name',
      },
      {
        text: 'CPF',
        value: 'document_value',
      },
      {
        text: 'Ações',
        value: 'actions',
        sortable: false,
      },
    ],
    templateHeaders: [],
    templateData: [],
    loading: false,
  }),
  computed: {
    invalidTableData() {
      if (
        (this.tableData?.length >= 1 &&
          this.tableData?.find((data) => data?.name == '')) ||
        (!this.loading && this.files && this.tableData.length < 1)
      )
        return true

      return false
    },
  },
  async mounted() {
    const { templateData } = await this.getList(
      '/customer/template-for-contact-import'
    )

    let header = {}
    templateData?.map((item) => (header[`${item.headerField}`] = ''))

    this.templateData = templateData
    this.templateHeaders.push(header)
  },
  methods: {
    handleTabChange(id) {
      if (!this.files && id >= 1) return
      this.activeTab = id
    },
    handleCloseModal(prevPage) {
      if (prevPage) {
        return (this.activeTab = 0)
      }

      this.showDialog = false
      this.files = null
      this.activeTab = 0
      this.tableData = []
    },
    handleFileUpload() {
      this.$refs.file.click()
    },
    onChange() {
      this.files = [...this.$refs.file.files]
      this.fileReader()
    },
    dragover(e) {
      e.preventDefault()
    },
    drop(e) {
      e.preventDefault()
      this.$refs.file.files = e.dataTransfer.files
      this.onChange()
    },
    deleteItem(id) {
      const item = this.tableData?.findIndex((item) => item.id === id)

      if (item !== -1) this.tableData?.splice(item, 1)
    },
    handleFileTemplate() {
      const ws = XLSX.utils.json_to_sheet(this.templateHeaders)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Contatos')
      XLSX.writeFile(wb, 'template.xlsx')
    },
    async fileReader() {
      this.loading = true

      var file = this.files[0]
      var reader = new FileReader()
      const _this = this

      reader.onload = function (e) {
        const data = e.target.result
        const wb = XLSX.read(data, { type: 'binary' })
        const ws = wb.Sheets[wb.SheetNames[0]]

        const result = XLSX.utils.sheet_to_json(ws)

        if (result.length >= 1) {
          // Get header fields text
          const document_value_header = _this.templateData?.find(
            (item) => item.translateField === 'document_value'
          ).headerField
          const name_header = _this.templateData?.find(
            (item) => item.translateField === 'name'
          ).headerField
          const social_name_header = _this.templateData?.find(
            (item) => item.translateField === 'social_name'
          ).headerField

          // Map translate fields
          _this.tableData = result.map((data, index) => ({
            id: index + 1,
            name: data[`${name_header}`] ?? '',
            social_name: data[`${social_name_header}`] ?? '',
            document_value:
              data[`${document_value_header}`] &&
              _this.onlyNumbers(data[`${document_value_header}`])
                ? _this.onlyNumbers(data[`${document_value_header}`])
                : '',
          }))

          _this.loading = false
        }
      }

      reader.readAsArrayBuffer(file)
    },
    async handleSubmit() {
      if (this.tableData.length >= 1) {
        let contact = Object.assign([], this.tableData)

        contact.map((data) => {
          data.document_type = 'cpf'
          delete data.id

          return data
        })

        if (contact?.length >= 1) {
          const { success } = await this.createItem(
            '/customer/bulk/contact',
            this.tableData
          )

          if (success) {
            this.handleCloseModal()
            this.$emit('addContact')
          }
        }
      }
    },
  },
}
</script>

<style lang="scss">
.importContact {
  .v-card {
    .v-card__title {
      display: flex;
      align-items: center;
      justify-content: space-between;

      font-size: 1.125rem !important;
      color: var(--v-default-text-base);
    }

    .v-card__text {
      padding-top: 1rem;
      color: var(--v-default-text-base);

      @include thin-scrollbar;

      .import_files_tab_wrapper {
        display: flex;
        justify-content: center;

        .tab_item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          position: relative;

          color: var(--v-sub-text-base);
          margin: 0 4rem;
          cursor: pointer;

          &.active {
            color: var(--v-primary-base);
            font-weight: 600;
            i {
              color: var(--v-primary-base);
              border-color: var(--v-primary-base);
            }
          }

          &:first-child::after {
            content: '';
            width: 16rem;
            border-top: 2px solid var(--v-sub-text-base);
            position: absolute;
            top: 30%;
            left: 0;
            opacity: 0.3;
          }

          i {
            background: var(--v-shape-lighten1);
            overflow: hidden;
            border: 2px solid var(--v-sub-text-base);
            border-radius: 100%;
            height: 60px;
            width: 60px;
            margin-bottom: 1rem;
            font-size: 2.4rem;

            position: relative;
            z-index: 20;

            display: flex;
            justify-content: center;
            align-items: center;
          }
        }
      }

      .tab_content_wrapper {
        padding: 2rem 0;
        text-align: center;

        &.active {
          i {
            color: var(--v-primary-base);
          }

          .body_wrapper {
            border: 2px solid var(--v-primary-base);
          }
        }

        &.empty_data {
          .body_wrapper {
            position: relative;
            border: 2px solid var(--v-error-tag-base);
            z-index: 10;

            i,
            small,
            span,
            .action_buttons {
              position: relative;
              z-index: 20;
            }

            i {
              color: var(--v-error-base);
            }

            &::before {
              content: '';
              position: absolute;
              background: var(--v-error-tag-base);
              inset: 0;
              width: 100%;
              height: 100%;
              opacity: 0.3;
              z-index: 1;
            }
          }
        }

        .tab_icon {
          font-size: 5rem;
          color: var(--v-sub-text-base);
        }

        .title_wrapper {
          h6 {
            margin: 0.4rem 0;
          }

          small {
            color: var(--v-sub-text-base);
            font-size: 1rem;
          }
        }

        .table_wrapper {
          margin-top: 2rem;
          text-align: left;

          .table {
            .data-table {
              width: 100%;
            }
          }
        }

        .body_wrapper {
          width: 40vw;
          padding: 3rem 0;
          margin: 1rem auto 0;
          background: var(--v-shape-lighten2);
          border-radius: 8px;

          display: flex;
          flex-direction: column;

          cursor: pointer;

          span {
            padding: 1rem;
          }

          small {
            opacity: 0.8;
          }

          .action_buttons {
            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }
}
</style>
