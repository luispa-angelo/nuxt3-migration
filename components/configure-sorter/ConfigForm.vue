<template>
  <div>
    <v-form ref="form">
      <v-text-field
        label="Título"
        placeholder="Digite aqui..."
        outlined
        v-model="formData.name"
      ></v-text-field>
    </v-form>
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
  </div>
</template>

<script>
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
    mediaTypes: [],
    formData: {
      name: ''
    }
  }),
  async mounted() {
    const {
      data: { data }
    } = await this.$axios.get('ecosystem/media-type')
    this.mediaTypes = data
    this.isEditing && this.loadForm()
  },
  computed: mapGetters(['sorters', 'sorterMembers']),
  watch: {
    dialog(newValue) {
      if (this.isEditing && newValue) {
        this.loadForm()
      }
    }
  },
  methods: {
    loadForm() {
      this.getSorter(this.itemId)
    },
    async submitForm() {
      console.log(this.formData.content)
      if (this.isEditing) {
        this.formData.id = this.itemId
        await this.$store.dispatch('updSorter', this.formData)
      } else {
        await this.$store.dispatch('addSorter', this.formData)
      }

      await this.$store.dispatch('fetchSorters')

      this.handleCancel()
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
    handleCancel() {
      this.$refs.form.reset()
    }
  }
}
</script>
