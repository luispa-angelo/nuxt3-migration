<template>
  <div v-if="index === 0">
    <span v-if="inputIsActive">
      {{ item[fieldName] | truncate(stringTruncate * 0.50)}}
    </span>
    <span v-else>
      {{ item[fieldName] | truncate(stringTruncate)}}
    </span>
  </div>
  <div v-else>
    <span v-if="index === 1">
      {{ `, (+${counter - 1})` }}
    </span>
  </div>
</template>

<script>

export default {
  props: {
    item: Object,
    counter: Number,
    index: Number,
    parent: Object,
    maxLength: Number,
    fieldName: {
      type: String,
      default: 'name'
    }
  },
  computed: {
    stringTruncate: function() {
      const maxLength = this.maxLength ? this.maxLength : 30
      switch (this.$vuetify.breakpoint.name) {
      case 'xs':
        return maxLength  * 0.50
      case 'sm':
        return maxLength  * 0.50
      case 'md':
        return maxLength  * 0.50
      case 'lg':
        return maxLength * 0.75
      case 'xl':
        return maxLength
      default:
        return maxLength * 0.75
      }
    },
    applyTruncate: function() {
      return this.item.name.length > this.stringTruncate
    },
    inputIsActive: function() {
      return this.parent.isFocused
    }
  },
}
</script>

<style>

</style>