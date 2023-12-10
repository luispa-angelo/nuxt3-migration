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
				<v-btn v-else v-bind="attrs" v-on="on" text>
					Editar
				</v-btn>
			</template>
			<v-card>
				<v-toolbar color="secondary" class="mb-8" flat>
					{{ title }}
				</v-toolbar>
				<v-card-text>
					<v-text-field
						label="Título"
						placeholder="Digite aqui..."
						outlined
						v-model="formData.name"
					></v-text-field>
					<div v-if="isEditing">
						<SorterMemberManage
							:isEditing="false"
							title="Adicionar Membro"
							:sorter-id="itemId"
							class="mx-1 my-1"
						/>
						<GenericTable
							:search="search"
							:items="sorterMembers"
							delete-action="deleteSorterMember"
							action-options
							v-slot:default="slotProps"
						>
							<SorterMemberManage
								isEditing
								title="Editar Membro"
								:item-name="slotProps.itemName"
								:item-id="slotProps.itemId"
								:sorter-id="itemId"
							/>
						</GenericTable>
					</div>
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
    itemName: String
  },
  data: () => ({
    mediaTypes: [],
    dialog: false,
    formData: {
      name: ''
    }
  }),
  async mounted() {
    const {
      data: { data }
    } = await this.$axios.get('ecosystem/media-type')
    this.mediaTypes = data
  },
  computed: mapGetters(['sorters', 'sorterMembers']),
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.getSorter(this.itemId)
      }
    }
  },
  methods: {
    async submitForm() {
      console.log(this.formData.content)
      if (this.isEditing) {
        var textTitle = 'Os dados foram atualizados!'
        this.formData.id = this.itemId
        await this.$store.dispatch('updSorter', this.formData)
      } else {
        textTitle = 'Os dados foram salvos!'
        await this.$store.dispatch('addSorter', this.formData)
      }

      this.$refs.form.reset()
      this.dialog = false
      await this.$store.dispatch('fetchSorters')

      this.$swal({
        icon: 'success',
        title: textTitle
      })
    },
    async getSorter(id) {
      const {
        data: {
          data: [response]
        }
      } = await this.$axios.get(`/cash/sorter?id=${id}`)
      await this.$store.dispatch('fetchSorterMembers')
      this.formData = response
    },
    closeDialog() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>
