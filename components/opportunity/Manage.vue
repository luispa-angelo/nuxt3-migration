<template>
  <v-form ref="form">
    <v-dialog v-model="dialog" persistent max-width="600px">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          fab
          class="mx-2"
          v-bind="attrs"
          v-on="on"
          v-if="!isEditing"
        >
          <v-icon>mdi-plus</v-icon>
        </v-btn>
        <v-btn v-else v-bind="attrs" v-on="on" text> Editar </v-btn>
      </template>
      <v-card>
        <v-toolbar color="secondary" dark flat>{{ title }}</v-toolbar>
        <v-card-text class="mt-8">
          <h2>{{ itemName }}</h2>
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
          <v-select
            attach
            label="Cliente"
            outlined
            dense
            :items="companies"
            item-text="name"
            item-value="id"
            v-model="formData.customer_id"
          ></v-select>
          <v-select
            attach
            label="Parceiro"
            outlined
            dense
            :items="companies"
            item-text="name"
            item-value="id"
            v-model="formData.partner_id"
          ></v-select>
          <v-select
            attach
            label="Contato"
            outlined
            dense
            :items="contacts"
            item-text="name"
            item-value="id"
            v-model="formData.contact_id"
          ></v-select>
          <v-select
            attach
            label="Produto"
            outlined
            dense
            :items="products"
            item-text="name"
            item-value="id"
            v-model="formData.product_id"
          ></v-select>
          <v-select
            attach
            label="estagio inicial"
            outlined
            dense
            :items="stages"
            item-text="name"
            item-value="id"
            v-model="formData.stage_id"
          ></v-select>
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
          <v-text-field
            type="number"
            label="Valor"
            v-model="formData.value"
            required
            outlined
            dense
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text large @click="closeDialog"> Cancelar </v-btn>
          <v-btn color="primary" large @click="submitForm"> Salvar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-form>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    title: String,
    itemId: Number,
    itemName: String,
    isEditing: Boolean,
    customerId: { type: Number, default: null },
  },
  data: () => ({
    dialog: false,
    formData: {
      assigned_to_id: null,
      customer_id: null,
      partner_id: null,
      contact_id: null,
      product_id: null,
      stage_id: null,
      team_id: null,
      value: 0,
    },
  }),
  computed: mapGetters({
    stages: 'stages',
    opportunity: 'opportunity',
    users: 'User/users',
    companies: 'companies',
    contacts: 'Contact/contacts',
    products: 'products',
    teams: 'teams',
  }),
  watch: {
    dialog(newValue) {
      if (newValue) {
        this.getData()
        if (this.isEditing) {
          this.getOpportunity(this.itemId)
        }
      }
    },
  },
  methods: {
    async submitForm() {
      if (this.isEditing) {
        var textTitle = 'Os dados foram atualizados!'
        this.formData.id = this.itemId
        await this.$store.dispatch('updOpportunity', this.formData)
      } else {
        textTitle = 'Os dados foram salvos!'
        await this.$store.dispatch('addOpportunity', this.formData)
      }

      this.$refs.form.reset()
      this.dialog = false
      this.$swal({
        icon: 'success',
        title: textTitle,
      })

      if (this.customerId) {
        await this.$store.dispatch(
          'fetchOpportunitys',
          'includes=customer,partner,contact,product,assigned_to&customer_id=' +
            this.customerId
        )
      } else {
        await this.$store.dispatch(
          'fetchOpportunitys',
          'includes=customer,partner,contact,product,assigned_to'
        )
      }
    },
    async getData() {
      await this.$store.dispatch('fetchStages')
      await this.$store.dispatch('User/fetchUsers')
      await this.$store.dispatch('fetchCompanies')
      await this.$store.dispatch('Contact/fetchContacts')
      await this.$store.dispatch('fetchProducts')
      await this.$store.dispatch('fetchTeams')
    },
    async getOpportunity(itemId) {
      await this.$store.dispatch('fetchOpportunity', `id=${itemId}`)
      const { created_at, updated_at, ...content } = this.opportunity
      this.formData = { ...content, id: itemId }
    },
    closeDialog() {
      this.$refs.form.reset()
      this.dialog = false
    },
  },
  mounted() {
    if (this.customerId) {
      this.formData.customer_id = this.customerId
    }
  },
}
</script>
