<template>
  <div class="form">
    <h1 class="text-h1">teste h1</h1>

    <!-- {{ userInfo }} -->
    <span>
      <v-form v-model="valid">
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="firstname"
                :rules="nameRules"
                :counter="10"
                label="First name"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="lastname"
                :rules="nameRules"
                :counter="10"
                label="Last name"
                required
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </span>

    <span class="button">
      <v-btn size="large"> Button </v-btn>
    </span>
  </div>
</template>

<script>
// import { mapState } from 'pinia';
// import { useUserStore } from '../../stores/user';

export default {
  data: () => ({
    valid: false,
    firstname: '',
    lastname: '',
    nameRules: [
      (value) => {
        if (value) return true;

        return 'Name is required.';
      },
      (value) => {
        if (value?.length <= 10) return true;

        return 'Name must be less than 10 characters.';
      },
    ],
    email: '',
    emailRules: [
      (value) => {
        if (value) return true;

        return 'E-mail is requred.';
      },
      (value) => {
        if (/.+@.+\..+/.test(value)) return true;

        return 'E-mail must be valid.';
      },
    ],
  }),
  // computed: {
  //   ...mapState(useUserStore, {
  //     userInfo: 'getUserInfo',
  //   }),
  // },
  async mounted() {
    await apiFetch('/callTestPage');
    // console.log('index');
    // const getResponse = await getList('https://api.npms.io/v2/search?q=vue');
    // console.log('get list', getResponse);
    // const getItemResponse = await getItem(
    //   'https://api.npms.io/v2/search?q=vue'
    // );
    // console.log('get item', getItemResponse);
    // const postResponse = await updateData('https://httpbin.org/anything', {
    //   teste: 'teste',
    // });
    // console.log('post', postResponse);
    // const putResponse = await createItem('https://httpbin.org/anything', {
    //   teste: 'teste',
    // });
    // console.log('put', putResponse);
  },
};
</script>

<style lang="scss" scoped>
.form {
  background: rgb(var(--v-theme-blue-base)) !important;
  display: block;

  .button {
    display: block;
  }
}
</style>
