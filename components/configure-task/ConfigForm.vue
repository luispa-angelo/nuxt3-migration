<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Titulo"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
      ></v-text-field>
      <v-text-field
        type="number"
        label="Duração da tarefa (min)"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.time"
      ></v-text-field>
      <Autocomplete
        label="Time"
        outlined
        clearable
        endpoint="/ecosystem/any-team"
        @valueSelected="(value) => {formData.team_id = value}"
      ></Autocomplete>
      <v-select
        attach
        label="Tipo de media"
        v-model="formData.media_type_id"
        :items="mediaTypes"
        item-value="id"
        item-text="name"
        required
        outlined
        dense
      ></v-select>
      <v-select
        attach
        clearable
        required
        outlined
        dense
        persistent-hint
        class="mb-2"
        label="Interface de atendimento"
        hint="Se a interface não for selecionada, a tarefa será aberta na interface padrão."
        item-value="value"
        item-text="name"
        v-model="selectedInterface"
        :items="modalTypes"
      ></v-select>
      <v-select
        attach
        clearable
        required
        outlined
        dense
        persistent-hint
        label="Definição sistêmica para ativação"
        hint="informação necessária para criação da tarefa pelo sistema"
        item-value="value"
        item-text="name"
        v-model="selectedActivationType"
        :items="activationTypes"
      ></v-select>
      <v-checkbox
        label="Tarefa interna"
        v-model="internalTask"
      ></v-checkbox>
    </v-form>
    <v-divider class="mt-5"></v-divider>
    <v-btn color="secondary" class="mt-4 mb-5" @click="addItem()">Adicionar saída</v-btn>
    <template v-for="output, i in outputs">
      <div class="d-flex" :key="output.id">
        <v-text-field dense outlined type="text" v-model="output.value"></v-text-field>
        <v-btn fab icon small color="" class="ml-5" @click="removeItem(i)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </div>
    </template>
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
    editor: 'ClassicEditor',
    outputs: [],
    selectedInterface: null,
    selectedActivationType: null,
    internalTask: false,
    mediaTypes: [],
    modalTypes: [
      {
        name: 'Telefonia',
        value: 'call'
      },
      {
        name: 'Chat',
        value: 'chat'
      },
      {
        name: 'E-mail',
        value: 'mail'
      },
      {
        name: 'Reunião',
        value: 'meeting'
      },

    ],
    activationTypes: [
      {
        name: 'Termo',
        value: 'document'
      },
      {
        name: 'Diagnóstico',
        value: 'diagnosis'
      },
    ],
    formData: {
      name: '',
      time: null,
      media_type_id: null,
      outputs: [],
      extra: null,
      team_id: null
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  computed: {
    ...mapGetters(['meta']),
    extra: function() {
      const extra = {}
      if (!this.selectedInterface && !this.selectedActivationType && !this.internalTask) {
        return null
      }
      this.selectedInterface && (extra.modal = this.selectedInterface)
      this.selectedActivationType && (extra.activationType = this.selectedActivationType)
      this.internalTask && (extra.internal = true)
      return extra
    }
  },
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.itemId)
      }
    },
    extra(newValue) {
      if (newValue) {
        this.formData.extra = JSON.stringify(newValue)
      } else {
        this.formData.extra = newValue
      }
    },
  },
  methods: {
    async loadForm(id) {
      const { data: { data } } = await this.$axios.get('ecosystem/media-type')
      this.mediaTypes = data
      this.isEditing && this.getTask(id)
    },
    async submitForm() {
      this.$v.formData.$touch()
      if(this.$v.formData.$error) return
      if (this.isEditing) {
        this.formData.id = this.itemId
        this.formData.outputs = JSON.stringify(this.outputs)
        await this.$store.dispatch('updTask', this.formData)
      } else {
        this.formData.outputs = JSON.stringify(this.outputs)
        await this.$store.dispatch('addTask', this.formData)
      }

      this.$emit('refresh')

      this.handleCancel()

    },
    async getTask(id) {
      const user = await this.$axios.get(`cash/task-type?id=${id}`)
      this.formData = user.data.data[0]
      this.outputs = JSON.parse(this.formData.outputs)
      
      if (this.formData.extra) {
        const { modal, activationType, internal } = JSON.parse(this.formData.extra)
        modal && (this.selectedInterface = modal)
        activationType && (this.selectedActivationType = activationType)
        internal && (this.internalTask = true)
      }
    },
    getContent(content) {
      this.formData.content = content
    },
    addItem() {
      this.outputs.push({id: this.uuidv4(), value:null})
    },
    removeItem(i) {
      this.outputs.splice(i,1)
    },
    uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      )
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
      this.formData.outputs = []
      this.outputs = []
      this.$root.$emit('close-dialog')
    }
  }
}
</script>