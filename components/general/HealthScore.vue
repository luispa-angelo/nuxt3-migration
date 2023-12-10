<template>
	<v-sheet class="pt-5 pb-4 px-4" color="shape lighten-1" rounded>
		<v-row>
			<v-col xl="8" lg="8" class="ml-xl-6 ml-lg-2">
				<p class="mb-1">
					<b>Status do cliente:</b>
					<span class="stroke--text">{{ customerState }}</span>
				</p>
				<p class="mb-1">
					<b>Primeiro contato:</b>
					<span class="stroke--text">{{ createdDate }}</span>
				</p>
				<p class="mb-0">
					<b>Atualizado em:</b>
					<span class="stroke--text">{{ updatedDate }}</span>
				</p>
			</v-col>
			<v-col class="text-center">
				<h1 class="title-score yellow--text mb-0">{{ info.health_score }}</h1>
				<p class="stroke--text mb-0">Health Score</p>
			</v-col>
		</v-row>
	</v-sheet>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {
          health_score: 0,
          state: '',
          created_at: '',
          updated_at: ''
        }
      }
    }
  },
  data: () => ({
    customerState: '',
    createdDate: '',
    updatedDate: ''
  }),
  computed: mapGetters(['meta']),
  async mounted() {
    const { state, created_at, updated_at } = this.info
    this.customerState = await this.getEnum(state, this.meta.customerState)
    this.createdDate = this.formatDate(created_at)
    this.updatedDate = this.formatDate(updated_at)
  },
  watch: {
    async info(newValue) {
      const { state, created_at, updated_at } = this.info
      this.customerState = await this.getEnum(state, this.meta.customerState)
      this.createdDate = this.formatDate(created_at)
      this.updatedDate = this.formatDate(updated_at)
    }
  },
}
</script>
