<template>
	<v-card class="w-100">
    <v-card-title class="pb-1">
      <p class="subtitle-1 text-center mb-0">
        {{ formatedValue ? formatedValue : '--' }}
      </p>
      <!-- <span v-if="hasDelta" class="green--text ml-3">+0,0%</span> -->
    </v-card-title>
    <v-card-text>
      <p class="mb-0">{{ title ? title : '--' }}</p>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  props: {
    title: String,
    value: Number,
    hasDelta: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    formatedValue: function() {
      if(this.value) {
        var format = this.commaSeparateNumber(this.value)
      }
      return format
    }
  }
}
</script>