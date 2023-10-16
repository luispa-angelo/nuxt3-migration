<template>
  <v-app v-if="maintenance">
    <div
      class="maintenance text-center"
      style="color: #eb6734; margin-top: 40vh"
    >
      <div>O CROmie está</div>
      <div class="text-h1">
        <v-icon class="text-h1" style="color: #eb6734">mdi-traffic-cone</v-icon>
        Em manutenção
      </div>
      <div>Cheio de melhorias pra você. Voltamos em minutos!</div>
    </div>
  </v-app>
  <v-app v-else>
    <Menu />
    <v-main class="shape mt-3 pl-1 pr-1 pt-10">
      <v-container fluid class="pb-10">
        <slot />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Menu from '~/components/navigation/Menu';

export default {
  data() {
    return {
      maintenance: false,
    };
  },
  components: {
    Menu,
  },
};
</script>

<style lang="scss">
main {
  background: rgb(var(--v-theme-shape-lighten2));
}
</style>
