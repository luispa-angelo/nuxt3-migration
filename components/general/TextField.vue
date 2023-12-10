<template>
  <div>
    <v-text-field
      v-bind="$attrs"
      v-on="$listeners"   
    >
      <template v-if="isRequired" v-slot:label>
        {{ $attrs.label }}
        <span class="error--text"
          v-tooltip="{
            content: `
              <div class='v-btn-tooltip'>
                Obrigatório
              </div>
              `,
            placement: 'top-center',
          }"
        >*</span>
      </template>
    </v-text-field>
  </div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    isRequired: {
      type: Boolean,
      default: false
    }
  }
}
</script>
