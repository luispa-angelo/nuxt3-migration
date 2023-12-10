<template>
  <v-row>
    <v-col>
      <v-slide-y-transition>
        <v-card v-if="active" class="mb-3">
          <v-card-title>Mais filtros</v-card-title>
          <v-card-text>
            <slot></slot>
          </v-card-text>
        </v-card>
      </v-slide-y-transition>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>