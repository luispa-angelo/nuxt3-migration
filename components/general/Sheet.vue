<template>
  <div class="text-center">
    <v-bottom-sheet v-model="sheet" inset scrollable persistent>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
        v-if="!isEditing && !standardSecondary && !createContact && !isDropdown"
        color="primary"
          :disabled="isDisabled"
          :data-test="generateDataTest('btnSheetOpen', title)"
          :x-small="iconButton ? true : false"
          :fab="iconButton ? true : false"
          v-bind="attrs"
          v-on="on"
          v-tooltip="{
            content: `
                  <div class='v-btn-tooltip'>
                     ${title}
                  </div>
                  `,
            placement: 'bottom-center',
          }"
        >
          <v-icon color="primary" v-if="iconButton">
            {{ groupBtn ? 'mdi-account-group-outline' : 'mdi-plus' }}
          </v-icon>

          <span v-else style="font-weight: 600"> {{ title }}</span>
        </v-btn>

        <v-btn
          v-else-if="isCalendar"
          :data-test="generateDataTest('btnSheetOpen', title)"
          v-bind="attrs"
          v-on="on"
          color="secondary"
        >
          <v-icon>mdi-calendar-clock</v-icon>
        </v-btn>

        <v-btn
          v-else-if="standardSecondary || isDropdown"
          :data-test="generateDataTest('btnSheetOpen', title)"
          v-bind="attrs"
          v-on="on"
          text
          class="sub-text--text"
        >
          <v-icon class="material-symbols-outlined mr-1">
            domain
          </v-icon>
          Empresa
        </v-btn>

        <v-btn :data-test="generateDataTest('btnSheetOpen', title)" v-else-if="fromDetails" v-bind="attrs" v-on="on" x-small icon>
          <v-icon>mdi-arrow-expand</v-icon>
        </v-btn>

        <v-btn :data-test="generateDataTest('btnSheetOpen', title)" v-else-if="createContact" v-bind="attrs" v-on="on" color="secondary">
          Criar contato
        </v-btn>
        <v-btn v-else v-bind="attrs" v-on="on" text> Editar </v-btn>
      </template>

      <v-card height="90vh">
        <v-app-bar color="shape lighten-1" absolute>
          <v-row>
            <v-col class="d-flex align-center py-6 px-5">
              <h6 class="bordered-title pl-4">
                {{ title }}
              </h6>
            </v-col>
            <v-col class="d-flex justify-end align-center py-6 px-5">
              <v-btn
                v-if="!supressCheckButton"
                :data-test="generateDataTest('btnSheetSubmit', title)"
                fab
                color="primary"
                class="mx-2"
                @click="handleSubmit"
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>
              <v-btn :data-test="generateDataTest('btnSheetClose', title)" fab color="secondary" class="mx-2" @click="closeSheet">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-app-bar>

        <v-card-text class="fix-padding-bar">
          <slot
            :sheet="sheet"
            :closed="handleClose"
            :submitted="handleDataUpdate"
          ></slot>
        </v-card-text>
      </v-card>
    </v-bottom-sheet>
  </div>
</template>

<script>
export default {
  props: {
    isDropdown: {
      type: Boolean,
      default: false
    },
    groupBtn: Boolean,
    itemId: Number,
    itemName: String,
    isEditing: Boolean,
    isXsmall: Boolean,
    title: String,
    iconButton: Boolean,
    supressCheckButton: Boolean,
    standardSecondary: Boolean,
    createContact: Boolean,
    standardSecondaryButtonText: String,
    isDisabled: Boolean,
    isCalendar: Boolean,
    fromDetails: Boolean,
  },
  data: () => ({
    sheet: false,
  }),
  mounted() {
    this.$root.$on('close-sheet', () => {
      this.sheet = false
    })
  },
  methods: {
    handleClose(all) {
      if (all) {
        this.$root.$emit('close-sheet')
        this.$root.$emit('clear-field')
        this.sheet = false
      } else {
        this.sheet = false
      }
    },
    closeSheet() {
      this.$emit('cancel')
      this.sheet = false
    },
    handleSubmit() {
      this.$emit('submit')
    },
    handleDataUpdate() {
      this.$emit('dataUpdate')
    },
    generateDataTest(name, title) {
      if (title) {
        const formattedTitle = title.replace(/\s/g, '')
        return `${name}${formattedTitle}`
      }
      return name
    }
  },
}
</script>

<style scoped>
* {
  scrollbar-width: auto;
  scrollbar-color: #4f4f4f #0b0b0b;
}
*::-webkit-scrollbar {
  width: 10px;
}
*::-webkit-scrollbar-track {
  background: #0b0b0b;
}
*::-webkit-scrollbar-thumb {
  background-color: #4f4f4f;
  border-radius: 10px;
  border: 3px solid #0b0b0b;
}
.fix-padding-bar {
  margin-top: 4.6em !important;
  padding-top: 1.5em !important;
}
</style>
