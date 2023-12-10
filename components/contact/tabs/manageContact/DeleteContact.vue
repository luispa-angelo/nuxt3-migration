<template>
  <div class="delete_contact_container">
    <v-row class="contact_info_wrapper">
      <v-col lg="6">
        <span class="title_wrapper">
          <i class="material-symbols-rounded"> person</i>
          Dados Pessoais
        </span>
        <div
          class="list_item"
          v-for="(item, item_index) in contactDetails.fields"
          :key="'field' + item_index"
        >
          <span v-if="item.text">{{ item.text }}</span>

          <span
            :class="
              !contact[`${item.value}`] || contact[`${item.value}`] === '0'
                ? 'empty'
                : ''
            "
          >
            {{ handleContactPersonalData(contact[`${item.value}`], item.text) }}
          </span>
        </div>
      </v-col>

      <v-col lg="6">
        <span class="title_wrapper">
          <i class="material-symbols-rounded"> domain</i>
          Empresas relacionadas ({{ contact.companies.length }})
        </span>

        <div class="list_item" v-for="item in contact.companies" :key="item.id">
          <span
            >{{ item.company.name }}
            {{ item.company.cnpj ? ' - ' + item.company.cnpj : '' }}</span
          >
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    contactDetails: {
      id: 0,
      tabName: 'Dados Pessoais',
      fields: [
        { text: 'Nome', label: 'Nome Completo', value: 'name' },
        { text: 'Nome Social', value: 'social_name' },
        { text: 'CPF', label: 'CPF', value: 'document_value' },
        { text: 'Nacionalidade', value: '' },
        { text: 'Gênero', value: 'gender' },
        { text: 'Data Nascimento', value: 'birthdate' },
        { text: 'Cor/Raça', value: 'color_race' },
        { text: 'Deficiência', value: 'deficiency' },
      ],
    },
    skinColorOptions: [
      { text: 'Indígena', value: 'indigenous' },
      { text: 'Branca', value: 'white' },
      { text: 'Preta', value: 'black' },
      { text: 'Amarela', value: 'yellow' },
      { text: 'Parda', value: 'dun' },
      { text: 'Não informado', value: 'na' },
    ],
    genderOptions: [
      { text: 'Homem', value: 'man' },
      { text: 'Mulher', value: 'women' },
      { text: 'Mulher Trans', value: 'trans_woman' },
      { text: 'Homem Trans', value: 'trans_man' },
      { text: 'Travesti', value: 'transvestite' },
      { text: 'Transexual', value: 'transsexual' },
      { text: 'Queer', value: 'queer' },
      { text: 'Não-binário', value: 'non_binary' },
      { text: 'Gênero fluído', value: 'fluid_genre' },
      { text: 'Transgênero', value: 'transgender' },
      { text: 'Prefiro não responder', value: 'rather_not_answer' },
      { text: 'Outro(s)', value: 'others' },
    ],
  }),
  computed: {
    ...mapGetters({
      contact: 'Contact/contact',
    }),
  },
  methods: {
    handleContactPersonalData(data, type) {
      if (!data || data === '0') return 'Não informado'
      else if (type === 'Data Nascimento')
        return this.$moment(data).format('DD/MM/yyyy')
      else if (type === 'Gênero') {
        return data
          ? this.genderOptions?.find((option) => option.value === data)?.text
          : 'Não informado'
      } else if (type === 'Cor/Raça')
        return data
          ? this.skinColorOptions?.find((option) => option.value === data)?.text
          : 'Não informado'
      return data
    },
  },
}
</script>

<style lang="scss" scoped>
.delete_contact_container {
  .contact_info_wrapper {
    max-height: 46vh;

    .title_wrapper {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 1rem;

      padding-bottom: 0.6rem;
    }
  }
}
</style>
