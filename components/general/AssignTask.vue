<template>
	<div>
		<v-dialog v-model="dialog" persistent max-width="650px">
			<template v-slot:activator="{ on, attrs }">
				<v-btn
					v-if="!byDetails"
					class="mx-2"
					color="secondary"
					icon
					v-bind="attrs"
					v-on="on"
				>
					<v-icon>mdi-magnify</v-icon>
				</v-btn>
				<v-btn v-if="byDetails" text v-bind="attrs" v-on="on"
					>Nova atividade</v-btn
				>
			</template>
			<v-card>
				<v-toolbar color="primary" class="mb-8" dark flat>
					Atribuir tarefa
				</v-toolbar>
				<v-card-text>
					<form ref="form">
						<v-combobox
							label="Atribua uma tarefa"
							outlined
							dense
							:items="selectTasks"
							v-model="formData.task"
							@input="addTask()"
						></v-combobox>
						<v-select
              attach
							label="Times"
							outlined
							dense
							:items="teams"
							item-text="name"
							item-value="id"
							v-model="formData.team_id"
						></v-select>
						<v-select
              attach
							label="Atribuído"
							outlined
							dense
							:items="users"
							item-text="name"
							item-value="id"
							v-model="formData.assigned_to_id"
						></v-select>
					</form>
					<transition name="fade">
						<div v-if="displayCard">
							<v-divider class="mb-5"></v-divider>
							<v-card class="mb-5">
								<form ref="task-form">
									<v-card-text v-html="renderTask(formData.task)" />
								</form>
							</v-card>
						</div>
					</transition>
					<div v-if="renderHistory">
						<div v-for="task in assignedTasks" :key="task.id">
							<v-card class="mb-5" color="shape lighten-1">
								<v-card-text>
									<p>Em: {{ task.updated_at }}</p>
									<p v-if="task.assigned_to">
										Atribuído a: {{ task.assigned_to.name }}
									</p>
									<p v-html="historyRender(task)"></p>
								</v-card-text>
							</v-card>
						</div>
					</div>
				</v-card-text>
				<v-card-actions class="px-6">
					<v-spacer></v-spacer>
					<v-btn text large @click="dialog = false">
						Cancelar
					</v-btn>
					<v-btn color="primary" dark large @click="submitForm()">
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
    opportunityId: Number,
    isEditing: Boolean,
    byDetails: Boolean
  },
  data: () => ({
    dialog: false,
    displayCard: false,
    renderHistory: false,
    selectTasks: [],
    formData: {
      task: '',
      assigned_to_id: 0,
      team_id: 0
    },
    selectedTask: {}
  }),
  computed: mapGetters({
    assignedTasks: 'assignedTasks',
    tasks: 'tasks',
    users: 'User/users',
    teams: 'teams'
  }),
  watch: {
    async dialog(newValue) {
      if (newValue) {
        await this.getData()
      } else {
        this.$refs['form'].reset()
        this.displayCard = false
        this.renderHistory = false
      }
    },
    tasks(newValue) {
      this.selectTasks = newValue.map(task => task.name)
    }
  },
  methods: {
    addTask() {
      this.displayCard = true
    },
    async getData() {
      await this.$store.dispatch('fetchTasks')
      await this.$store.dispatch('User/fetchUsers')
      await this.$store.dispatch('fetchTeams')
      if (!this.byDetails && this.opportunityId) {
        await this.$store.dispatch(
          'fetchAssignedTasksQuery',
          `includes=assigned_to&opportunity_id=${this.opportunityId}`
        )
        this.renderHistory
      }
    },
    renderTask(taskName) {
      this.selectedTask = this.tasks.find(task => task.name === taskName)
      if (this.selectedTask) {
        return this.selectedTask.content
      }
    },
    historyRender(history) {
      let ret = ''
      const fields = JSON.parse(history.content)
      if (fields) {
        const html = this.tasks.filter(el => el.id == history.type_id)[0]
        if (html) {
          let dom = document.createElement('div')
          dom.innerHTML = html.content
          for (let field in fields) {
            let dElement = dom.querySelector('[name=\'' + field + '\']')
            if (dElement) {
              dElement.setAttribute('value', fields[field])
            }
            let inputs = dom.querySelectorAll('input, select, textarea')
            for (let input of inputs) {
              input.readOnly = true
              input.setAttribute('readonly', 'readonly')
            }
          }
          ret = dom.innerHTML
        }
      }
      return ret
    },
    collect() {
      var taskData = {}
      var taskForm = new FormData(this.$refs['task-form'])
      taskForm.forEach((value, key) => (taskData[key] = value))
      return taskData
    },
    submitForm() {
      let formData = this.collect()
      console.log('formdata', formData)
      if (formData) {
        let data = {
          content: JSON.stringify(formData)
        }
        data['opportunity_id'] = this.opportunityId
        data['type_id'] = this.selectedTask.id
        data['assigned_to_id'] = this.formData.assigned_to_id
        data['team_id'] = this.formData.team_id

        if (this.isEditing) {
          this.formData.id = this.itemId
          var textTitle = 'Os dados foram atualizados!'
          this.$store.dispatch('updAssignedTask', data)
        } else {
          textTitle = 'Os dados foram salvos!'
          this.$store.dispatch('addAssignedTask', data)
        }
        this.$refs['task-form'].reset()
        this.dialog = false
        this.$swal({
          icon: 'success',
          title: textTitle
        })
      }
    }
  }
}
</script>
