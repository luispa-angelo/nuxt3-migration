<template>
	<div class="d-flex justify-space-between align-center">
		<div>
			<p
				class="subtitle-2 font-weight-bold mb-0"
				v-tooltip="{
					content: `
                       <div class='v-btn-tooltip'>
                          ${association.name}
                       </div>
                       `,
					placement: 'bottom-center'
				}"
			>
				{{ association.name | truncate(30) }}
			</p>
			<p class="font-body-medium mb-0">{{ association.identifier | VMask(this.mask_cnpj) }}</p>
		</div>
		<div>
			<NuxtLink :to="redirectPage(association.identifier)" class="link-item">
        <v-chip color="primary" link>
					{{ type.name }}
				</v-chip>
				<v-icon large>mdi-chevron-right</v-icon>
			</NuxtLink>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['association', 'type', 'redirectTo'],
  computed: mapGetters(['meta']),
  methods: {
    redirectPage(identifier) {
      const { params, query, name } = this.$route
      return { name, params: { ...params, identifier }, query: { ...query, complement: 'Empresa Relacionada' } }
    }
  }
}
</script>

