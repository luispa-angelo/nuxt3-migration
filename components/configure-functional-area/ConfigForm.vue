<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome da área"
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
      <ChannelManage
        :isEditing="false"
        title="Adicionar canal"
        :area-id="itemId"
        class="mx-1 my-1"
      />
      <GenericTable
        :items="channelList"
        :headers="headers"
        delete-action="deleteChannel"
        action-options
        v-slot:default="slotProps"
      >
        <ChannelManage
          isEditing
          title="Editar Canal"
          :item-name="slotProps.itemName"
          :item-id="slotProps.itemId"
          :area-id="itemId"
        />
      </GenericTable>
    </div>
  </div>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    title: String,
    isEditing: Boolean,
    itemId: Number,
    pipelineId: Number,
    itemName: String,
  },
  data: () => ({
    channelList: [],
    formData: {
      name: '',
    },
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Nome', value: 'name' },
    ],
  }),
  validations: {
    formData: {
      name: { required },
    },
  },
  computed: mapGetters(['functionalAreas', 'channels']),
  mounted() {
    if (this.isEditing) {
      this.loadForm(this.itemId)
    }
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.channelList = []
        this.loadForm(this.itemId)
      }
    },
    channels(newValue) {
      this.channelList = newValue
    }
  },
  methods: {
    loadForm(id) {
      this.getArea(id)
      this.getChannels(id)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updFunctionalArea', this.formData)
      } else {
        await this.$store.dispatch('addFunctionalArea', this.formData)
      }

      this.$emit('refresh')

      this.handleCancel()
    },
    async getArea(itemId) {
      await this.$store.dispatch('fetchFunctionalAreas')
      const { created_at, updated_at, ...content } = this.functionalAreas.find(
        (area) => area.id == itemId
      )
      this.formData = { ...content, id: itemId }
    },
    async getChannels(itemId) {
      await this.$store.dispatch(
        'fetchChannels',
        `parent_id=${itemId}`
      )
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.$root.$emit('close-dialog')
    },
  },
}
</script>