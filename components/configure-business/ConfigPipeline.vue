<template>
  <main class="container pa-0">
    <section class="contentText">
      <header class="header">
        <v-btn
          v-if="isEditing"
          color="secondary"
          class="cancelBtn"
          dense
          :disabled="$v.formData.name.$invalid"
          @click="handleCancel"
        >
          Cancelar
        </v-btn>
        <h6 class="titleStep">
          {{ isEditing ? 'Editar Pipeline' : 'Pipeline' }}
        </h6>
        <div class="headerActions">
          <v-btn
            color="secondary"
            dense
            :disabled="$v.formData.name.$invalid"
            @click="duplicatePipeline"
          >
            <v-icon small class="mr-2">mdi-content-copy</v-icon>
            Duplicar Pipeline
          </v-btn>
          <v-btn
            color="primary"
            dense
            :disabled="$v.formData.name.$invalid"
            @click="submitForm"
          >
              {{ primaryButtonName }}
          </v-btn>
        </div>
      </header>
      <p>
        Crie ou edite as fases do(s) pipeline(s)
      </p>
    </section>
    <v-form ref="form" class="pipelineForm">
      <v-text-field
        v-model="formData.name"
        label="Nome do Pipeline"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
        outlined
        dense
        class="inputText"
      />
    </v-form>
    <section :class="stagesSectionClass">
      <BusinessStagesForm
        v-for="(stage, i) in stagesList"
        :key="i"
        :index="stagesIndex(i)"
        :stage="stage"
        :disabled="stagesList.length === 2"
        @updateParent="updateStagesList(i, $event)"
        @remove="removeStagesForm(i)"
        class="stagesCard"
      />
      <v-btn
        fab
        color="primary"
        width="40px"
        height="40px"
        @click="addStagesForm"
        v-tooltip="{ content: `<div class='v-btn-tooltip'>Adicionar Fase</div>` }"
      >
        <v-icon class="material-symbols-rounded">add</v-icon>
      </v-btn>
    </section>
    <v-divider class="mb-3"></v-divider>
    <GenericTable
      actionsIcons
      :isLoading="isLoading"
      :headers="pipelineListHeaders"
      :items="pipelineListItems"
      sortBy=""
      @pagination="handlePagination"
    >
      <template v-slot:actionsIconsSlot="slotProps">
        <div class="d-flex justify-end">
          <DeleteModal iconDelete :item-id="slotProps.item.id" :endpoint="endpointPipeline" @update-parent="getData">
            <template v-slot:title>Excluir o Pipeline</template>
            <template v-slot:sub-title-1>Esta ação é irreversível, você tem certeza que <br> deseja excluir esse Pipeline?</template>
          </DeleteModal>
          <v-btn
            text
            icon
            @click="editMode(slotProps.item.id)"
          >
            <v-icon dense>mdi-square-edit-outline</v-icon>
          </v-btn>
        </div>
      </template>
    </GenericTable>
  </main>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  data: () => ({
    formData: {
      name: ''
    },
    endpointPipeline: '/cash/pipeline',
    endpointStages: '/cash/bulk/stage',
    pipelineId: null,
    stagesList: [
      { name: '', triggers_state: '', triggers_temperature: '' },
      { name: '', triggers_state: '', triggers_temperature: '' },
    ],
    defaultQuery: 'includes=stages,business_item&order=id_desc',
    setDetailsMutation: 'SET_PIPELINES_DETAILS',
    fetchData: 'fetchPipelines',
    copies: {},
    isEditing: false,
    businessItems: [],
    isLoading: false,
  }),
  props: {
    tenantId: Number,
    stepData: {
      type: Object,
      default: () => ({})
    },
  },
  validations: {
    formData: {
      name: { required },
    }
  },
  computed: {
    ...mapGetters({
      list: 'pipelines',
      listDetails: 'pipelinesDetails',
    }),
    primaryButtonName() {
      return this.isEditing ? 'Salvar' : 'Criar Pipeline'
    },
    stagesSectionClass() {
      return this.stagesList.length > 2 ? 'stagesSection' : 'stagesSectionDefault'
    },
    pipelineListHeaders() {
      const headers = [
        { text: 'Pipeline', value: 'name' },
        { text: 'Itens associados', value: 'associatedItems', sortable: false }
      ]
      this.list?.forEach(pipeline => {
        pipeline.stages?.forEach((_, index) => {
          const header = {
            text: `Fase ${index + 1}`,
            value: `stage[${index}]`,
            sortable: false
          }

          if(!headers.find(h => h.value === header.value)) {
            headers.push(header)
          }
        })
      })

      return headers
    },
    pipelineListItems() {
      const items = []

      this.list.forEach(pipeline => {
        const item = {
          id: pipeline.id,
          name: pipeline.name,
          associatedItems: pipeline.business_item?.length === 0 
            ? 'Não associado' 
            : pipeline.business_item?.length === 1
              ? 'Associado' 
              : `Associado (${pipeline.business_item?.length})`,
          itemName: pipeline.business_item?.map(item => item.name)
        }
        pipeline.stages?.forEach((stage) => {
          item[`stage[${stage.index}]`] = stage.triggers_temperature 
            ? `${stage.name} - ${this.formatState(stage.triggers_state)} - ${this.formatTemperature(stage.triggers_temperature)}` 
            : `${stage.name} - ${this.formatState(stage.triggers_state)}` 
        })

        items.push(item)
      })

      return items
    },
    query() {
      if(this.listDetails.page > 0) {
        return `${this.defaultQuery}&tenant_id=${this.tenantId}&page=${this.listDetails.page}`
      }
      return `${this.defaultQuery}&tenant_id=${this.tenantId}`
    }
  },
  methods: {
    updateStagesList(index, value) {
      this.stagesList[index] = value
    },
    addStagesForm() {
      this.stagesList.push({ name: '', triggers_state: null, triggers_temperature: null })
    },
    removeStagesForm(index) {
      this.stagesList.splice(index, 1)
    },
    stagesIndex(index) {
      return index+=1
    },
    async submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return

      if(this.isEditing && this.pipelineId) {
        const payload = { ...this.formData, id: this.pipelineId }
        await this.updateData(this.endpointPipeline, payload)
      } else {
        const { id } = await this.createItem(this.endpointPipeline, { ...this.formData, tenant_id: this.tenantId })
        this.pipelineId = id
      }
      const stages = this.stagesList.map((stage, index) => ({
        ...stage,
        index: index,
        pipeline_id: this.pipelineId,
        tenant_id: this.tenantId
      }))

      await this.handleStages(stages)
      this.$emit('submitForm', {
        pipeline: { ...this.formData, id: this.pipelineId, tenant_id: this.tenantId },
        stages: { ...stages },
        isSubmitted: true
      })
      await this.getData(stages)
      this.handleCancel()
    },
    async handleStages(stages) {
      const existingItems = stages.filter((stage) => stage.id)
      const newItems = stages.filter((stage) => !stage.id)

      if(this.isEditing && existingItems.length > 0) {
        await this.updateData(this.endpointStages, existingItems)
      }
      if(newItems.length > 0) {
        await this.createItem(this.endpointStages, newItems)
      }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.stagesList = [
        { name: '', triggers_state: '', triggers_temperature: '' },
        { name: '', triggers_state: '', triggers_temperature: '' },
      ]
      this.isEditing = false
    },
    async duplicatePipeline() {
      await this.submitForm()
      const { name, stages } = await this.getItem(this.endpointPipeline, `includes=stages&id=${this.pipelineId}&tenant_id=${this.tenantId}`)

      let newName = name
      if(newName in this.copies) {
        const regex = /\[Cópia\](.*?)(?:\((\d+)\))?$/i
        const match = regex.exec(newName)
        if(match) {
          let copyNumber = 1
          if(match[2]) {
            copyNumber = Number(match[2]) + 1
          }
          newName = `[Cópia] ${match[1].trim()} (${copyNumber})`
        } else {
          newName = `${newName} (1)`
        }
      } else {
        newName = `[Cópia] ${newName}`
      }
      this.formData.name = newName

      this.stagesList = stages.map(({ name, triggers_state, triggers_temperature }) => ({
        name,
        triggers_state,
        triggers_temperature
      }))

      this.copies[newName] = true
    },
    async editMode(itemId) {
      this.isEditing = true
      const { id, name, stages } = await this.getItem(this.endpointPipeline, `includes=stages&id=${itemId}&tenant_id=${this.tenantId}`)
      this.formData.name = name
      this.pipelineId = id
      if(stages.length) this.stagesList = stages
    },
    async getData(stages) {
      this.isLoading = true
      await this.$store.dispatch(this.fetchData, this.query)
      this.$emit('submitForm', {
        pipeline: { ...this.formData, id: this.pipelineId, tenant_id: this.tenantId },
        stages: { ...stages },
        isSubmitted: true
      })
      this.isLoading = false
    },
    async handlePagination(pagination) {
      const { page, itemsPerPage, itemsLength } = pagination
      if(itemsLength > 0 && (page * itemsPerPage) >= itemsLength) {
        if(this.listDetails.hasNext) {
          const page = this.listDetails.page + 1
          this.$store.commit(this.setDetailsMutation, { page })
          await this.getData()
        }
      }
    },
    formatState(value) {
      const state = {
        0: '0%',
        1: '10%',
        2: '20%',
        3: '30%',
        4: '40%',
        5: '50%',
        6: '60%',
        7: '70%',
        8: '80%',
        9: '90%',
        10: '100%'
      }[value] || value
      return state
    },
    formatTemperature(value) {
      const temperature = {
        0: '0°',
        1: '10°',
        2: '20°',
        3: '30°',
        4: '40°',
        5: '50°',
        6: '60°',
        7: '70°',
        8: '80°',
        9: '90°',
        10: '100°'
      }[value] || value
      return temperature
    },
  },
  async mounted() {
    this.$store.commit(this.setDetailsMutation, { page: 0 })
    await this.getData()
  },
}
</script>
<style lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;

  .contentText {
    text-align: center;
    padding-bottom: 32px;
    width: 100%;

    .header {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      align-items: center;
      justify-items: center;

      .cancelBtn {
        justify-self: start;
      }

      .headerActions {
        display: flex;
        gap: 16px;
        justify-self: end;
        grid-column-start: 3;
      }

      .titleStep {
        padding-bottom: 8px;
        font-size: 20px;
        font-weight: 600;
        justify-self: center;
        grid-column-start: 2;
      }
    }
  }

  .pipelineForm {
    display: flex;
    width: 100%;
    justify-content: center;
    align-items: center;


    .inputText {
      max-width: 738px;
    }

  }

  .stagesSectionDefault {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 18px;
    padding: 0 0 88px 56px;
    width: 100%;
  }

  .stagesSection {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 0 0 88px 56px;
    width: 100%;
    overflow-x: scroll;
    white-space: nowrap;
    @include personalized-scrollbar()
  }

  .stagesCard {
    width: 360px;
  }

  .v-data-table__wrapper {
    width: 100%;
    @include personalized-scrollbar()
  }
}
</style>