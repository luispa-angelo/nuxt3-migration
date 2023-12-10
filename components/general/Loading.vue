<template>
  <div class="text-center">
    <v-overlay :value="isLoading">
      <v-progress-circular indeterminate size="64" />
    </v-overlay>
  </div>
</template>

<script>
export default {
  props: {
    isLoading: Boolean,
  },
}
</script>
