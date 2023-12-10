<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Nome"
        placeholder="Digite aqui..."
        outlined
        dense
        v-model="formData.name"
        :error="$v.formData.name.$error"
        :error-messages="
          $v.formData.name.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-text-field>
      <v-select
        attach
        label="Base"
        placeholder="Digite aqui..."
        outlined
        dense
        item-text="name"
        item-value="value"
        v-model="formData.base"
        :items="meta.mediaBase"
        :error="$v.formData.base.$error"
        :error-messages="
          $v.formData.base.$error ? 'Esse campo é obrigatório' : ''
        "
      ></v-select>
      <v-checkbox
        label="Whatsapp"
        v-model="isWhats"
        :disabled="formData.base != 'mobile'"
        class="my-0 py-0"
      ></v-checkbox>
      <v-checkbox
        label="Exibir em canais de contato?"
        v-model="displayContact"
        class="my-0 py-0"
      ></v-checkbox>
    </v-form>
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
    endpoint: '/ecosystem/media-type',
    formData: {
      name: '',
      base: '',
      extra: null
    },
    displayContact: false,
    isWhats: false
  }),
  validations: {
    formData: {
      name: { required },
      base: { required }
    }
  },
  mounted() {
    this.loadForm(this.itemId)
  },
  computed: mapGetters(['meta']),
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm(this.itemId)
      }
    },
    displayContact() {
      this.onchangeinput()
    },
    isWhats() {
      this.onchangeinput()
    }
  },
  methods: {
    onchangeinput() {
      this.formData.extra = JSON.stringify({displayContact: this.displayContact, isWhats: this.isWhats})
    },
    loadForm(id) {
      if (this.isEditing) {
        this.getContent(id)
      }
    },
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return

      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.updateData(this.endpoint, this.formData)
      } else {
        await this.createItem(this.endpoint, this.formData)
      }
      this.$emit('formSubmitted')
      this.handleCancel()
    },
    async getContent(itemId) {
      const { id, name, base, extra } = await this.getItem(this.endpoint, `id=${itemId}`)
      if (extra) {
        const { isWhats, displayContact } = JSON.parse(extra)
        if (isWhats) {
          this.isWhats = isWhats
        }
        if (displayContact) {
          this.displayContact = displayContact
        }
      }
      this.formData = { id, name, base, extra }
    },
    handleCancel() {
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
