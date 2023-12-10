<template>
  <v-row>
    <v-col>
      <section class="pb-8">
        <VueEditor
          v-model="content"
          :editor-toolbar="customToolbar"
          style="height: 320px;"
          :disabled="disabled"
        />
      </section>
      <section class="editor-action-bar d-flex justify-space-between align-center px-5">
        <v-menu top :offset-x="true" :close-on-content-click="false">
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="secondary"
              fab
              v-bind="attrs"
              v-on="on"
              :disabled="disabled || !taskType"
            >
              <v-icon size="20">mdi-file-document</v-icon>
            </v-btn>
          </template>
          <v-card width="250">
            <v-card-title class="pb-0">
              <v-text-field
                label="Pesquisar templates"
                dense
                append-icon="mdi-magnify"
                class="v-field-no-border"
                disabled
              ></v-text-field>
            </v-card-title>
            <v-card-text class="v-menu-card-text px-0">
              <v-list dense two-line>
                <v-list-item
                  v-for="template in templates"
                  :key="template.id"
                  @click="addTemplateContent(template)"
                >
                  <v-list-item-content>
                    <v-list-item-title class="font-body-medium d-flex align-start">
                      {{ `${template.name}` }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="font-body-medium" :inner-html.prop="template.content | truncate(60)"></v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-menu>
      </section>
    </v-col>
  </v-row>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    dialog: Boolean,
    templateId: Number,
    taskType: Object,
    disabled: Boolean,
    body: String
  },
  data: () => ({
    displayTemplate: false,
    templateContent: null,
    template: null,
    content: null,
    customToolbar: [
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ 'align': ''},{ 'align': 'justify'}, { 'align': 'right' }],
      ['link', 'image'],
    ],
  }),
  computed: {
    ...mapGetters([
      'tasks',
      'templates'
    ]),
  },
  watch: {
    async dialog(newValue) {
      if(newValue) {
        console.log('dialog')
        await this.$store.dispatch('fetchTasks', 'fetchTemplates')
        this.content = null
        if(this.templateId) {
          this.getTemplate(this.templateId)
        }
      }
    },
    async content(newValue) {
      if(newValue) {
        this.$emit('updateContent', newValue)
      }else {
        this.$emit('updateContent', '')
      }
    },
    async taskType(newValue) {
      if (newValue) {
        const { media_type_id } = newValue
        media_type_id && await this.$store.dispatch('fetchTemplates', `includes=media_type&media_type_id=${media_type_id}`)
      }
    },
    async body(newValue) {
      if (newValue) {
        this.content = newValue
      }
    },
    templateId(newValue) {
      if(newValue) {
        console.log('templateId')
        this.getTemplate(this.templateId)
      }
    }
  },
  methods: {
    addTemplateContent(template) {
      this.content = null
      this.template = template.content
      this.content = this.template
      this.$emit('selectedTemplate', template)
    },
    phoneTasks(element) {
      if (!element.media_type) {
        return false
      }
    },
    async getTemplate(id) {
      await this.$store.dispatch('fetchTemplates')
      const { content } = this.templates.find(
        template => template.id == id
      )
      if (!this.body) {
        this.displayTemplate = true
        this.content = content
      }
    }
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