<template>
  <v-sheet class="py-4 px-5" color="shape lighten-1" rounded>
    <v-row>
      <v-col xl="3" lg="3" class="d-flex justify-center align-center">
        <v-avatar size="100" color="cyan darken-3">
          <h1 class="text-h2 dark">{{ firstLetter }}</h1>
        </v-avatar>
      </v-col>
      <v-col xl="7" lg="7">
        <h6
          class="mb-3"
          v-tooltip="{
            content: `
                         <div class='v-btn-tooltip'>
                            ${info.name}
                         </div>
                         `,
            placement: 'bottom-center'
          }"
        >
          {{ info.name | truncate(16) }}
        </h6>
        <p v-if="info.identifier" class="mb-1">
          <b>CNPJ:</b>
          <span class="stroke--text">{{
            info.identifier | VMask(this.mask_cnpj)
          }}</span>
        </p>
        <p v-if="info.identifier" class="mb-1">
          <b>Site:</b>
          <span class="stroke--text">{{ info.website }}</span>
        </p>
        <div class="d-flex align-center mt-2">
          <v-combobox
            dense
            solo
            :items="listPhone"
            label="Consulte o telefone"
          >
            <template v-slot:item="{ item }">
              {{ item | VMask(item.length > 10 ? '(##) #####-####' : '(##) ####-####') }}
            </template>
          </v-combobox>
        </div>
      </v-col>
      <v-col xl="2" lg="2" class="d-flex justify-end">
        <slot></slot>
      </v-col>
    </v-row>
  </v-sheet>
</template>

<script>
export default {
  props: {
    info: {
      type: Object,
      default() {
        return {
          name: ' ',
          identifier: '',
          state: '',
          website: ''
        }
      }
    },
    companyPage: Boolean
  },
  data: () => ({
    firstLetter: '',
    phone: '',
    listPhone: [],
    clearedListPhone: [],
    editMode: false,
  }),
  mounted() {
    this.firstLetter = this.info.name[0]
    if(this.companyPage) {
      if (this.info.medias.length > 0){
        for(const item of this.info.medias){
          if(item.type_id != 1){
            console.log(item)
            this.listPhone.push(item.value.replace(/[^A-Z0-9]/ig, ''))
          }
        }
      }
    }else{
      if(this.info.medias.length > 0){
        console.log(this.info.medias)
        for(const item of this.info.medias){
          if(item.type_id != 1) {
            this.listPhone.push(item.value.replace(/[^A-Z0-9]/ig, ''))
          }
        }
      }
    }
  }
}
</script>

<style scoped>
.control-margin {
  margin-top: -30px;
}
.phone-number {
    cursor: pointer !important;
  }
</style>
