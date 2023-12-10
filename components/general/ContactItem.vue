<template>
  <div class="d-flex justify-space-between align-center">
    <div>
      <p
        class="subtitle-2 font-weight-bold mb-0"
        v-tooltip="{
          content: `
                       <div class='v-btn-tooltip'>
                          ${contact.name}
                       </div>
                       `,
          placement: 'bottom-center',
        }"
      >
        {{ contact.name | truncate(30) }}
      </p>
      <p v-if="hasContactMedia" class="mb-0">
        {{ mediaValue | VMask(this.maskPhone(mediaValue)) }}
      </p>
    </div>
    <div>
      <v-menu v-if="contact.id" left :offset-x="true">
        <template v-slot:activator="{ on, attrs }">
          <v-btn icon v-bind="attrs" v-on="on" class="mb-2">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item>
            <v-list-item-title>
              <Sheet
                isEditing
                title="Criar contato"
                @submit="$refs.myForm.submitForm()"
                @cancel="$refs.myForm.handleCancel()"
              >
                <template v-slot="{ sheet, closed }">
                  <ContactForm
                    isEditing
                    ref="myForm"
                    :sheet="sheet"
                    :item-id="contact.id"
                    @closeForm="closed"
                  />
                </template>
              </Sheet>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <DeleteItem
                :item-id="contact.id"
                :item-name="contact.name"
                :delete-action="deleteAction"
                @hasDeleted="handleDeleteAction"
              />
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
  </div>
</template>

<script>
export default {
  props: ['contact'],
  data: () => ({
    mediaValue: '',
    url: '/customer/contact',
    deleteAction: 'Contact/deleteContact',
  }),
  computed: {
    hasContactMedia: function () {
      if (this.contact.medias?.length > 0) {
        return true
      }
      return false
    },
  },
  mounted() {
    if (this.hasContactMedia) {
      const media = this.contact.medias.find((media) => media.type_id != 1)
      media && (this.mediaValue = media.value)
    }
  },
  methods: {
    handleDeleteAction() {
      this.$store.commit('Contact/CONTACTS_API', { dataUpdate: true })
    },
  },
}
</script>
