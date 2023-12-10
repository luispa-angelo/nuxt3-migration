<template>
  <v-card min-width="360px">
    <v-card-text class="d-flex justify-space-between pa-0">
      <p class="px-2 pt-6">{{ index }}.</p>
      <v-form
        ref="form"
        class="d-flex flex-column py-4 gap-2"
      >
        <v-text-field
          label="Nome da Fase"
          v-model="formData.name"
          :error="$v.formData.name.$error"
          :error-messages="
            $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
          "
          class="pb-4"
          dense
          outlined
          required
          hide-details="auto"
          @change="$emit('updateParent', { ...formData, name: $event })"
        />
        <div class="selects">
          <v-select
            attach
            label="Peso"
            v-model="formData.triggers_state"
            :error="$v.formData.triggers_state.$error"
            :error-messages="
              $v.formData.triggers_state.$error ? 'Esse campo é obrigatório' : ''
            "
            :items="stateList"
            item-value="value"
            item-text="name"
            dense
            outlined
            required
            hide-details="auto"
            @change="$emit('updateParent', { ...formData, triggers_state: $event })"
          />
          <v-select
            attach
            label="Temp."
            v-model="formData.triggers_temperature"
            :items="temperatureList"
            item-value="value"
            item-text="name"
            dense
            outlined
            hide-details="auto"
            v-tooltip="{ content: `<div class='v-btn-tooltip'>Temperatura</div>` }"
            @change="$emit('updateParent', { ...formData, triggers_temperature: $event })"
          />
        </div>
      </v-form>
      <DeleteModal
        v-if="hasFilledData"
        iconDelete
        :item-id="formData.id"
        :disabled="disabled"
        :endpoint="endpointStages"
        @update-parent="$emit('remove')"
      >
        <template v-slot:title>Excluir a Fase</template>
        <template v-slot:sub-title-1>Esta ação é irreversível, você tem certeza que <br> deseja excluir essa fase do Pipeline?</template>
      </DeleteModal>
      <v-btn v-else text icon :disabled="disabled" @click="$emit('remove')">
        <v-icon dense>mdi-trash-can-outline</v-icon>
      </v-btn>
    </v-card-text>
  </v-card>
</template>
<script>
import { required } from 'vuelidate/lib/validators'
export default {
  data: () => ({
    stateList: [
      { name: '0%', value: 0 },
      { name: '10%', value: 1 },
      { name: '20%', value: 2 },
      { name: '30%', value: 3 },
      { name: '40%', value: 4 },
      { name: '50%', value: 5 },
      { name: '60%', value: 6 },
      { name: '70%', value: 7 },
      { name: '80%', value: 8 },
      { name: '90%', value: 9 },
      { name: '100%', value: 10 },
    ],
    temperatureList: [
      { name: '0°', value: 0 },
      { name: '10°', value: 10 },
      { name: '20°', value: 20 },
      { name: '30°', value: 30 },
      { name: '40°', value: 40 },
      { name: '50°', value: 50 },
      { name: '60°', value: 60 },
      { name: '70°', value: 70 },
      { name: '80°', value: 80 },
      { name: '90°', value: 90 },
      { name: '100°', value: 100 },
    ],
    endpointStages: '/cash/stage',
  }),
  props: {
    index: Number,
    stage: Object,
    disabled: Boolean
  },
  computed: {
    formData() {
      return {
        id: this.stage.id || null,
        name: this.stage.name || '',
        triggers_state: this.stage.triggers_state || null,
        triggers_temperature: this.stage.triggers_temperature || null
      }
    },
    hasFilledData() {
      return (!this.$v.formData.name.$invalid || !this.$v.formData.triggers_state.$invalid) && !!this.stage.id
    }
  },
  validations: {
    formData: {
      name: { required },
      triggers_state: { required },
    }
  }
}
</script>
<style lang="scss" scoped>
.selects {
  display: flex;
  gap: 16px;
}
</style>