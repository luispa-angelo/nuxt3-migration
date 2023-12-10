<template>
	<v-row>
		<v-col lg="1" class="text-center">
			<v-avatar size="40" class="avatar-outlined">
				<v-icon small color="orange lighten-1">mdi-logout</v-icon>
			</v-avatar>
		</v-col>
		<v-col lg="11">
			<h2 class="primary--text mb-2">Segmento Financeiro</h2>
			<p class="text-justify mb-0">
				{{ info.observations }}
			</p>
		</v-col>
	</v-row>
</template>

<script>
export default {
  props: {
    isOpportunity: Boolean,
    info: {
      type: Object,
      default() {
        return {
          name: '',
          cnpj: '',
          state: '',
          observations: '',
          health_score: 0
        }
      }
    },
    contact: String
  },
  data: () => ({
    infos: [
      {
        label: 'Health Score',
        value: '90'
      },
      {
        label: 'Primeiro contato',
        value: '11/11/1111'
      },
      {
        label: 'Status cliente',
        value: 'ATIVO'
      },
      {
        label: 'Atualizado em',
        value: '11/11/1111'
      }
    ]
  }),
}
</script>

<style scoped>
.avatar-outlined {
	border: 1px solid #ff601f;
}
</style>
