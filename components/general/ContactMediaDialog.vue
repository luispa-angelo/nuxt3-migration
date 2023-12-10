<template>
  <v-dialog v-model="dialog" hide-overlay scrollable persistent max-width="450">
    <v-card>
      <DialogHeader :elevation="0" @onCancel="handleCancel" />
      <v-card-text class="pt-3">
        <v-form ref="form">
          <v-text-field
            outlined
            dense
            label="Mídia"
            v-model="value"
            v-mask="mediaTypeBase === 'mobile' ? maskPhone(value) : null"
            :rules="mediaFieldRules"
            :messages="mediaFieldMessages"
          />

          <v-select
            attach
            required
            outlined
            dense
            label="Tipo de mídia"
            item-value="id"
            item-text="name"
            v-model="mediaTypeId"
            :items="mediaTypes"
          />
        </v-form>
      </v-card-text>
      <DialogAction
        :loading-submit="isLoading"
        @cancel="handleCancel"
        @submit="handleSubmit"
      />
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    propDialog: Boolean,
    contactId: Number,
    companyContactId: Number,
    mediaValue: String,
    mediaBase: String,
  },
  data: () => ({
    dialog: false,
    mediaTypes: [],
    mediaTypeId: null,
    mediaTypeBase: null,
    value: null,
    isLoading: false,
  }),
  computed: {
    mediaFieldRules: function () {
      switch (this.mediaTypeBase) {
      case 'mobile':
        return this.phoneRules
      case 'mail':
        return this.emailRules
      default:
        return []
      }
    },
    mediaFieldMessages: function () {
      switch (this.mediaTypeBase) {
      case 'mobile':
        return this.phoneValidationMessages            
      default:
        return []
      }
    }
  },
  watch: {
    propDialog(newValue) {
      this.dialog = newValue
      if (newValue) {
        this.value = this.mediaValue
        this.getMediaTypes()
      }
    },
    mediaTypeId(newValue) {
      const mediaType = this.mediaTypes.find(
        (mediaType) => mediaType.id === newValue
      )
      if (mediaType) {
        this.mediaTypeBase = mediaType.base
      }
    },
  },
  methods: {
    async handleSubmit() {
      if (!this.$refs.form.validate()) return
      this.isLoading = true

      let mediaPayload
      let mediaResponse

      if (this.companyContactId > 0) {
        mediaPayload = {
          company_contact_id: this.companyContactId,
          type_id: this.mediaTypeId,
          value: this.value,
          origin: 'user',
        }

        mediaResponse = await this.createItem(
          '/customer/contact-company-media',
          mediaPayload
        )
      } else {
        mediaPayload = {
          contact_id: this.contactId,
          type_id: this.mediaTypeId,
          value: this.value,
          origin: 'user',
        }

        mediaResponse = await this.createItem(
          '/customer/contact-media',
          mediaPayload
        )
      }

      mediaPayload.id = mediaResponse?.id

      this.isLoading = false
      this.dialog = false
      this.mediaTypeId = null
      this.value = null
      this.$emit('onMediaCreated', mediaPayload)
    },
    async getMediaTypes() {
      const base = this.mediaBase !== 'other' ? this.mediaBase : null
      const baseQuery = base ? `base=${base}` : ''
      const { data } = await this.getList('/ecosystem/media-type', baseQuery)
      this.mediaTypes = data.filter((media) => {
        if (media.extra) {
          const { displayContact } = JSON.parse(media.extra)
          if (displayContact == true) {
            return true
          }
        }
        return false
      })
      if (this.mediaTypes.length > 0) {
        this.mediaTypeId = this.mediaTypes[0].id
      }
    },
    handleCancel() {
      this.dialog = false
      this.mediaTypeId = null
      this.value = null
      this.$emit('onMediaCreated', null)
    },
  },
}
</script>

<style></style>
