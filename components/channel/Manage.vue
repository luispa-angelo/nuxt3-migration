<template>
	<div>
			<v-dialog v-model="dialog" persistent max-width="600px">
				<template v-slot:activator="{ on, attrs }">
					<v-btn
						v-if="!isEditing"
						color="primary"
						v-bind="attrs"
						v-on="on"
						class="mt-4 mb-3"
					>
						{{ title }}
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
						<v-form ref="form">
							<v-text-field
								label="Nome do canal"
								placeholder="Digite aqui..."
								outlined
								v-model="formData.name"
							></v-text-field>
						</v-form>
						<div v-if="isEditing">
							<Dialog
										:isEditing="false"
										@submit="$refs.myForm.submitForm()"
										@cancel="$refs.myForm.handleCancel()"
										title="Adicionar time"
								>
									<template v-slot="{ dialog }">
										<TeamConfigForm
											:dialog="dialog"
											:isEditing="false"
											title="Adicionar Time"
											:parent-id="itemId"
											class="mx-1 my-1"
											ref="myForm"
										/>
									</template>
							</Dialog>
							<GenericTable
								:items="teamList"
								:headers="headers"
								delete-action="deleteTeam"
								action-options
								v-slot:default="slotProps"
							>
								<Dialog
										isEditing
										@submit="$refs.myForm.submitForm()"
										@cancel="$refs.myForm.handleCancel()"
										title="Editar time"
								>
									<template v-slot="{ dialog }">
										<TeamConfigForm
											:dialog="dialog"
											isEditing
											title="Editar Time"
											:item-name="slotProps.itemName"
											:item-id="slotProps.itemId"
											:parent-id="itemId"
											ref="myForm"
										/>
									</template>
								</Dialog>
							</GenericTable>
						</div>
				</v-card-text>
				<v-card-actions class="px-6">
					<v-spacer></v-spacer>
					<v-btn text large @click="closeDialog">
						Cancelar
					</v-btn>
					<v-btn color="primary" large @click="submitForm()">
						Salvar
					</v-btn>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: {
    title: String,
    isEditing: Boolean,
    itemId: Number,
    areaId: Number,
    itemName: String
  },
  data: () => ({
    dialog: false,
    teamList: [],
    formData: {
      name: '',
      parent_id: null,
    },
    // ecosystemPolicy: [
    //   { name: 'Compartilhada', value: 'share' },
    //   { name: 'Exclusiva', value: 'hold' }
    // ],
    // isActive: [
    //   { name: 'Verdadeiro', value: true },
    //   { name: 'Falso', value: false }
    // ],
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' }
    ]
  }),
  computed: mapGetters(['channels', 'teams']),
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.formData.parent_id = this.areaId
        if (this.isEditing) {
          this.teamList = []
          this.getChannel(this.itemId)
          this.getTeams(this.itemId)
        }
      }
    },
    teams(newValue) {
      this.teamList = newValue
    }
  },
  methods: {
    async submitForm() {
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updChannel', this.formData)
      } else {
        await this.$store.dispatch('addChannel', this.formData)
      }

      this.$refs.form.reset()
      this.dialog = false
      await this.$store.dispatch(
        'fetchChannels',
        `parent_id=${this.areaId}`
      )
    },
    async getChannel(itemId) {
      await this.$store.dispatch(
        'fetchChannels',
        `parent_id=${this.areaId}`
      )
      const { created_at, updated_at, ...content } = this.channels.find(
        channel => channel.id == itemId
      )
      this.formData = { ...content, id: itemId }
    },
    async getTeams(itemId) {
      await this.$store.dispatch('fetchTeams', `parent_id=${itemId}`)
    },
    closeDialog() {
      this.$refs.form.reset()
      this.dialog = false
    }
  }
}
</script>
