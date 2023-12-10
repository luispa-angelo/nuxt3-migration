<template>
	<v-form ref="form">
		<v-dialog v-model="dialog" persistent max-width="650px" tabindex="1">
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					v-if="!isEditing"
					color="primary"
					fab
					class="mx-2"
					v-bind="attrs"
					v-on="on"
				>
					<v-icon>mdi-plus</v-icon>
				</v-btn>
				<v-btn
					v-else
					v-bind="attrs"
					v-on="on"
					color="blue-grey lighten-4"
					fab
					x-small
					elevation="1"
				>
					<v-icon color="stroke darken-1">mdi-pencil</v-icon>
				</v-btn>
			</template>
			<v-card>
				<v-toolbar color="secondary" class="mb-8" flat>
					{{ title }}
				</v-toolbar>
				<v-card-text>
						<v-text-field
							label="Peso"
							placeholder="Digite aqui..."
							outlined
							v-model="formData.weigth"
						></v-text-field>
						<v-select
							attach
							label="Ecossistema"
							v-model="formData.ecosystem_id"
							:items="ecosystems"
							item-value="id"
							item-text="name"
							required
							outlined
							dense
						></v-select>
				</v-card-text>
				<v-card-actions class="px-6">
					<v-spacer></v-spacer>
					<v-btn text large @click="closeDialog">
						Cancelar
					</v-btn>
					<v-btn color="secondary" large @click="submitForm()">
						Salvar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</v-form>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String,
    sorterId: Number
  },
  data: () => ({
    ecosystems: [],
    dialog: false,
    formData: {
      weigth: '',
      sorter_id: null,
      ecosystem_id: null
    }
  }),
  async mounted() {
    const {
      data: { data }
    } = await this.$axios.get('ecosystem/channel')
    this.ecosystems = data
  },
  computed: mapGetters(['sorterMembers']),
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.formData.sorter_id = this.sorterId
        this.getMember(this.itemId)
      }
    }
  },
  methods: {
    async submitForm() {
      console.log(this.formData.content)
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updSorterMember', this.formData)
      } else {
        this.formData.sorter_id = this.sorterId
        await this.$store.dispatch('addSorterMember', this.formData)
      }

      this.$refs.form.reset()
      this.dialog = false
      await this.$store.dispatch('fetchSorterMembers')
    },
    async getMember(id) {
      const {
        data: {
          data: [response]
        }
      } = await this.$axios.get(`/cash/sorter-member?id=${id}`)
      this.formData = response
    },
    closeDialog() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>
