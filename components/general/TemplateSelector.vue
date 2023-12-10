<template>
  <v-menu top :offset-x="true">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        v-if="iconBtn"
        text
        fab
        v-bind="attrs"
        v-on="on"
        :disabled="isDisabled"
      >
        <v-icon small>mdi-file-document</v-icon>
      </v-btn>
      <v-btn
        v-else
        outlined
        color="primary"
        small
        v-bind="attrs"
        v-on="on"
        :disabled="isDisabled"
      >
        <v-icon small left>mdi-file-document</v-icon>
        Aplicar modelo
      </v-btn>
    </template>
    <v-card width="250">
      <v-card-title class="pb-0">
        <v-text-field
          label="Pesquisar modelo"
          dense
          append-icon="mdi-magnify"
          class="v-field-no-border"
          disabled
        ></v-text-field>
      </v-card-title>
      <v-card-text class="v-menu-card-text template-list-container px-0">
        <v-list dense two-line>
          <v-list-item
            v-for="template in arrayTemplateContents"
            :key="template.id"
            @click="handleTemplateChosen(template)"
          >
            <v-list-item-content>
              <v-list-item-title
                class="font-body-medium d-flex align-start"
              >
                {{ `${template.name}` }}
              </v-list-item-title>
              <v-list-item-subtitle
                class="font-body-medium"
              >
                {{template.contentPlainText}}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    mediaTypeId: Number,
    isDisabled: { type:Boolean, default: false},
    iconBtn: { type:Boolean, default: true},
  },
  data: () => ({
    arrayTemplateContents: []
  }),
  watch: {
    async mediaTypeId(newValue) {
      await this.getTemplates(newValue)
    }
  },
  async mounted() {
    if (this.mediaTypeId) {
      await this.getTemplates(this.mediaTypeId)
    }
  },
  methods: {
    handleTemplateChosen(template) {
      this.$emit('onTemplateChosen', template)
    },
    async getTemplates(mediaTypeId) {
      const templates = await this.getList('/cash/template',`media_type_id=${mediaTypeId}`)
      if (templates) {
        this.arrayTemplateContents = templates.data.map((template) => ({
          id: template.id,
          name: template.name,
          content: template.content,
          contentPlainText: this.templateToPlainText(template.content),
        }))
      }
    },
    templateToPlainText(content) {
      if (content) {
        const element = document.createElement('div')
        element.innerHTML = content
        return element.innerText
      } else {
        return null
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.template-list-container {
  max-height: 250px;
  overflow-y: auto;
  @include thin-scrollbar;
}
</style>