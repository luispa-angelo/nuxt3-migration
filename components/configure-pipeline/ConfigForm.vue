<template>
  <div>
    <v-form ref="form">
      <v-text-field
        :label="title"
        placeholder="Digite aqui..."
        outlined
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
    </v-form>
    <div v-if="isEditing">
      <TabComponent :tab-items="tabItems">
        <template v-slot:pipelineStages>
          <Dialog
            :isEditing="false"
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            :pipeline-id="itemId"
            title="Adicionar estágio"
            class="my-4"
          >
            <template v-slot="{ dialog }">
              <PipelineStageForm
                :isEditing="false"
                :dialog="dialog"
                :pipeline-id="itemId"
                ref="myForm"
              />
            </template>
          </Dialog>
          <GenericTable
            :search="search"
            :headers="stagesHeaders"
            :items="stageList"
            :sortable="true"
            :sort-desc="false"
            :sort-by="null"
            delete-action="deleteStage"
            action-options
            v-slot:default="slotProps"
            @sortItems="sortStages($event)"
          >
            <Dialog
              isEditing
              @submit="$refs.myForm.submitForm()"
              @cancel="$refs.myForm.handleCancel()"
              :item-id="slotProps.itemId"
              :item-name="slotProps.itemName"
              :pipeline-id="itemId"
              title="Editar estágio"
            >
              <template v-slot="{ dialog }">
                <PipelineStageForm
                  isEditing
                  :dialog="dialog"
                  :item-id="slotProps.itemId"
                  :item-name="slotProps.itemName"
                  :pipeline-id="itemId"
                  ref="myForm"
                />
              </template>
            </Dialog>
          </GenericTable>
        </template>
        <!-- <template v-slot:customFields>
          <Dialog
            :isEditing="false"
            @submit="$refs.myForm.submitForm()"
            @cancel="$refs.myForm.handleCancel()"
            :pipeline-id="itemId"
            title="Adicionar campo"
            class="my-4"
          >
            <template v-slot="{ dialog }">
              <PipelineCustomFieldForm
                :isEditing="false"
                :dialog="dialog"
                :pipeline-id="itemId"
                ref="myForm"
              />
            </template>
          </Dialog>
          <GenericTable
            :search="search"
            :headers="fieldsHeaders"
            :items="customFields"
            action-options
            v-slot:default="slotProps"
          >
            <Dialog
              isEditing
              @submit="$refs.myForm.submitForm()"
              @cancel="$refs.myForm.handleCancel()"
              :item-id="slotProps.itemId"
              :item-name="slotProps.itemName"
              :pipeline-id="itemId"
              title="Editar campo"
            >
              <template v-slot="{ dialog }">
                <PipelineCustomFieldForm
                  isEditing
                  :dialog="dialog"
                  :item-id="slotProps.itemId"
                  :item-name="slotProps.itemName"
                  :pipeline-id="itemId"
                  ref="myForm"
                />
              </template>
            </Dialog>
          </GenericTable>
        </template> -->
      </TabComponent>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'

export default {
  props: {
    dialog: Boolean,
    isEditing: Boolean,
    title: String,
    itemId: Number,
    itemName: String
  },
  data: () => ({
    search: '',
    stageList: [],
    sortableItems: [],
    stagesHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' }
    ],
    fieldsHeaders: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
      { text: 'Tipo', value: 'type' }
    ],
    tabItems: [
      { name: 'Estágios do pipeline', value: 'pipelineStages' },
      // { name: 'Campos personalizados', value: 'customFields' },
    ],
    formData: {
      name: ''
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  computed: mapGetters(['stages', 'customFields']),
  mounted() {
    this.loadForm()
  },
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.stageList = []
        this.membersList = []
        this.loadForm()
      }
    },
    stages(newValue) {
      this.stageList = newValue
    },
    sortableItems(newValue) {
      newValue.forEach(item => {
        const stage = this.stages.find(stage => stage.id === item.id)
        if (stage.index !== item.index) {
          this.$store.dispatch('updStage', item)
        }
      })
    }
  },
  methods: {
    loadForm() {
      if (this.isEditing) {
        this.getContent()
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updPipeline', this.formData)
      } else {
        await this.$store.dispatch('addPipeline', this.formData)
      }

      this.$emit('refresh')

      this.handleCancel()
    },
    async getContent() {
      this.formData.name = this.itemName
      await this.$store.dispatch(
        'fetchStages',
        `order=index&pipeline_id=${this.itemId}`
      )
      await this.$store.dispatch(
        'fetchCustomFieldsQuery',
        `pipeline_id=${this.itemId}`
      )
    },
    sortStages(items) {
      this.sortableItems = items
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    },
  }
}
</script>
