<template>
	<div class="d-flex justify-space-between align-center">
		<div>
			<p
				class="subtitle-2 font-weight-bold mb-0"
				v-tooltip="{
					content: `
                       <div class='v-btn-tooltip'>
                          Oportunidade: ${opportunity.id}
                       </div>
                       `,
					placement: 'bottom-center'
				}"
			>
				{{ `Oportunidade: ${opportunity.id}` | truncate(30) }}
			</p>
			<p class="font-body-medium mb-0">{{ opportunity.team.name }}</p>
		</div>
		<div>
			<NuxtLink :to="redirectPage(opportunity.id)" class="link-item">
				<v-chip color="primary" link>
					{{ opportunity.stage.name }}
				</v-chip>
				<v-icon large>mdi-chevron-right</v-icon>
			</NuxtLink>
		</div>
	</div>
</template>

<script>
export default {
  props: ['opportunity', 'isRelated'],
  data: () => ({
    redirectTo: 'business-opportunity-item-id',
  }),
  computed: {
    routeComplement: function () {
      if (this.isRelated) {
        return 'Oportunidade Relacionada'
      }
      return 'Oportunidade'
    }
  },
  methods: {
    redirectPage(id) {
      const { params, query } = this.$route
      return { name: `${this.redirectTo}`, params: { ...params, id }, query: { ...query, complement: this.routeComplement } }
    }
  }
}
</script>

<style scoped>
.link-item {
	text-decoration: none;
}
</style>
