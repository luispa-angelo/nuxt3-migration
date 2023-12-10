<template>
  <v-row class="fill-height">
    <v-col class="fill-height-vh d-flex flex-column justify-center align-center">
      <div class="container-progress-circular d-flex justify-center align-center">
        <hr>
        <v-avatar size="60" color="secondary" class="mx-5">
          <v-icon color="primary">mdi-wrench</v-icon>
        </v-avatar> 
        <hr>
      </div>
      <h3 class="my-3">Página em construção!</h3>
      <p class="subtitle-2">Nós estamos trabalhando nesse recurso e logo ele será lançado<v-icon class="mt-1">mdi-dots-horizontal</v-icon></p>
    </v-col>
  </v-row>
</template>

<style scoped>
  .fill-height-vh {
    height: calc(100vh - 150px);
  }
  .container-progress-circular {
    width: 40%;
  }
  .v-progress-circular {
    margin: 1rem;
  }
  hr {
    width: 40%;
    border-top: 3px double #8c8b8b;
  }
</style>