<template>
  <v-data-table
    v-bind="$attrs"
    v-on="$listeners"
    :headers="headers"
    :items="items"
  ></v-data-table>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    headers: {
      type: Array,
      default: null,
    },
    items: {
      type: Array,
      default: null,
    }
  },
  data: () => ({

  })
}
</script>
