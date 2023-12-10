<template>
	<div class="d-flex justify-space-between align-center mb-4">
		<div>
			<h3>{{ customer.name }}</h3>
			<p class="stroke--text mb-0">{{ customer.identifier | VMask(this.mask_cnpj) }}</p>
		</div>
		<div>
			<a :href="`/company/${customer.id}`" class="link-item">
        <v-chip color="primary" link>
					{{ getEnum(customer.state, meta.customerState)}}
				</v-chip>
				<v-icon large>mdi-chevron-right</v-icon>
			</a>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['customer'],
  computed: mapGetters(['meta']),

}
</script>
