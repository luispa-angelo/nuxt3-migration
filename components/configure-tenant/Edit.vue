<template>
  <main>
    <v-dialog v-model="dialog" max-width="550">
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          v-if="iconEdit"
          text
          icon
          v-bind="attrs"
          v-on="on"
          data-test="btnIconEditModalTenantOpen"
        >
          <v-icon dense>mdi-square-edit-outline</v-icon>
        </v-btn>
        <v-list-item v-else v-bind="attrs" v-on="on" data-test="listItemEditModalTenantOpen">
          <v-list-item-content>
            <v-list-item-title>
              Editar nome
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </template>
      <v-card height="288">
        <DialogHeader :elevation="0" @onCancel="handleCancel" data-test="btnEditModalTenantCancel"/>
        <v-card-text class="pt-3 pb-1 cardForm">
          <h6 class="text-center mb-8">Editar Nome</h6>
          <v-form @submit.prevent="submitForm" ref="form" data-test="btnEditModalTenantSubmit">
            <v-text-field
              label="Nome da organização"
              class="textField"
              dense
              outlined
              hide-details
              v-model="formData.name"
              :error="$v.formData.name.$error"
              :error-messages="$v.formData.name.$error ? 'Esse campo é obrigatório' : ''"
              data-test="inputEditModalTenantName"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <div class="cardForm">
          <DialogAction 
            actions-align="space-between"
            style="width: 362px"
            :show-divider="false"
            @submit="submitForm"
            @cancel="handleCancel"
            data-test="btnActionEditModalTenantCancel"
          />
        </div>
      </v-card>
    </v-dialog>
  </main>
</template>

<script>
import { required } from 'vuelidate/lib/validators'
export default {
  props: {
    itemId: {
      type: Number
    },
    itemName: {
      type: String
    },
    iconEdit: {
      type: Boolean,
      default: false
    }
  },
  data: () => ({
    endointTenant: '/ecosystem/tenant',
    dialog: false,
    formData: {
      id: null,
      name: null
    }
  }),
  validations: {
    formData: {
      name: { required }
    }
  },
  watch: {
    dialog(newValue) {
      if(newValue) {
        this.formData.id = this.itemId
        this.formData.name = this.itemName
      }
    }
  },
  methods: {
    async submitForm() {
      this.$v.formData.$touch()
      if (this.$v.formData.$error) return
      
      await this.updateData(this.endointTenant, this.formData)
      this.$emit('update-parent')
      this.handleCancel()
    },
    handleCancel() {
      this.dialog = false
      this.$refs.form.reset()
      this.$v.$reset()
    }
  }
}
</script>
<style lang="scss" scoped>
.cardForm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .textField {
    width: 362px;
  }
}
</style>