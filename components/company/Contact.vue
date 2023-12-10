<template>
  <v-expansion-panel>    
    <v-expansion-panel-header disable-icon-rotate expand-icon="">
      <template v-slot:default>
        <div class="w-100 d-flex justify-start align-center">
          <v-icon color="primary" class="mr-2">mdi-chevron-down</v-icon>
          <p class="mb-0">Contatos</p>
        </div>
      </template>
      <template v-slot:actions>
        <Sheet
          v-if="hasCompanyId"
          isXsmall
          title="Criar contato"
          :isEditing="false"
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
        >
          <template v-slot="{ sheet, closed }">
            <ContactForm
              :sheet="sheet"
              @closeForm="closed"
              ref="myForm"
              :associatedCompanyId="companyId"
            />
          </template>
        </Sheet>
      </template>
    </v-expansion-panel-header>
    <v-expansion-panel-content>
      <GenericTable
        :headers="headers"
        :items="list"
        delete-action="Contact/deleteContact"
        @removeItem="updateData"
        action-options
        v-slot:default="slotProps"
      >
        <Sheet
          isEditing
          title="Editar contato"
          @submit="$refs.myForm.submitForm()"
          @cancel="$refs.myForm.handleCancel()"
        >
          <template v-slot="{ sheet, closed }">
            <ContactForm
              isEditing
              ref="myForm"
              :sheet="sheet"
              :item-id="slotProps.itemId"
              :associatedCompanyId="companyId"
              @updateData="updateData"
              @closeForm="closed"
            />
          </template>
        </Sheet>
      </GenericTable>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
export default {
  props: {
    hasCompanyId: {
      type: Boolean,
    },
    companyId: {
      type: Number,
    },
    contacts: {
      type: Array,
    },
  },
  data: () => ({
    headers: [
      { text: 'ID', value: 'id' },
      { text: 'Telefone / Celular', value: 'media' },
      { text: 'Nome', value: 'name' },
      { text: 'Origem', value: 'origin' },
      { text: 'Cargo', value: 'position' },
      { text: 'Status', value: 'active' },
    ],    
    phoneMediaTypes: ['celular', 'telefone fixo', 'mobile', 'landline']    
  }),
  computed: {
    list: function () {
      var list = []
      if (this.contacts) {
        this.contacts.forEach((contact) => {
          
          list.push({
            id: contact.id,
            name: contact.name,
            media: contact?.contact_medias?.find(media => this.phoneMediaTypes.includes(media?.media_type?.base.toLowerCase()))?.value,
            origin: contact.origin,
            position: contact.position,
            active: contact.active ? 'Ativo' : 'Inativo',
          })
        })
      }
      return list
    },
  },  
  methods: {
    updateData() {
      this.$emit('updateData')
    },
  },
}
</script>
