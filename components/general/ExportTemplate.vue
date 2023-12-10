<template>
	<v-btn
		fab
		color="primary"
		class="mx-2"
		@click="getEntityDefinition"
		:x-small="isXsmall"
		v-tooltip="{
			content: `
        <div class='v-btn-tooltip'>
          Baixar modelo
        </div>
      `,
			placement: 'bottom-center'
		}"
	>
		<v-icon>mdi-download</v-icon>
	</v-btn>
</template>

<script>
import XLSX from 'xlsx'
export default {
  props: ['entity', 'name', 'isXsmall'],
  methods: {
    getEntityDefinition() {
      this.$axios.get('/meta/entity-model?entity=' + this.entity).then(data => {
        if (data && 'fields' in data.data) {
          this.exportData([data.data.fields], this.name)
        }
      })
    },
    exportData(data, name) {
      const wb = XLSX.utils.book_new()
      wb.Props = {
        Title: 'Omie CRM Export'
      }
      const ws = XLSX.utils.aoa_to_sheet(data)
      XLSX.utils.book_append_sheet(wb, ws, name)
      XLSX.writeFile(wb, name + '_template.xlsx')
    }
  }
}
</script>

<style scoped>
.teste-tool {
	background-color: white;
	color: black;
	padding: 0.5emn;
}
</style>
