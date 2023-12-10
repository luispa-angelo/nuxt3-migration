<template>
  <v-menu v-model="dialog" top :offset-x="true">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        fab
        icon
        v-bind="attrs"
        v-on="on"
        :disabled="disabled || !taskType"
      >
        <v-icon small class="material-icons-outlined">text_snippet</v-icon>
      </v-btn>
    </template>
    <v-card width="250">
      <!-- <v-card-title class="pb-0">
        <v-text-field
          label="Pesquisar templates"
          dense
          append-icon="mdi-magnify"
          class="v-field-no-border"
          disabled
        ></v-text-field>
      </v-card-title> -->
      <v-card-text class="v-menu-card-text px-0">
        <v-list dense two-line>
          <v-list-item
            v-for="template in templates"
            :key="template.id"
            @click="addTemplateContent(template)"
          >
            <v-list-item-content>
              <v-list-item-title class="font-body-medium d-flex align-start">
                {{template.name}}
              </v-list-item-title>
              <v-list-item-subtitle class="font-body-medium" :inner-html.prop="template.content | truncate(60)"></v-list-item-subtitle>
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
    taskType: Object,
    disabled: Boolean,
  },
  data: () => ({
    dialog: false,
    displayTemplate: false,
    templateContent: null,
    template: null,
    templates: null,
  }),
  watch: {
    async dialog(newValue) {
      if(newValue) {
        const { data } = await this.getList('/cash/template', `&media_type_id=${this.taskType.media_type_id}`)
        this.templates = data
      }
    },
  },
  methods: {
    addTemplateContent(template) {
      this.$emit('selectedTemplate', template)
    },
  }
}
</script>

<style scoped>
  * {
    scrollbar-width: auto;
    scrollbar-color: #9e9e9e #c2c2c2;
  }
  *::-webkit-scrollbar {
    width: 5px;
  }
  *::-webkit-scrollbar-track {
    background: #c2c2c2;
    border-radius: 6px;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
    border-radius: 6px;
    border: 3px solid #9e9e9e;
  }
  .template-sheet {
    position: relative;
    overflow-y: scroll;
  }
  .template-title {
    position: absolute;
    top: 46%;
    -ms-transform: translateY(-46%);
    transform: translateY(-46%);
  }
  .editor-action-bar {
    height: 50px;
    margin-top: -52px;
  }
</style>