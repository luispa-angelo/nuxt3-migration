<template>
  <v-list dense height="100%">
    <v-list-item-group>
      <v-list-item
        v-for="(new_item, i) in news"
        :key="i"
        style="align-items: center"
        @click="handleSelectNews(new_item.uuid)"
        class="py-2"
      >
        <v-img
          height="74"
          max-width="74"
          :src="findItemOnArray('image', new_item.content)"
          style="border-radius: 4px"
        />

        <v-list-item-content style="padding: 0 0.6rem">
          <v-list-item-title>
            <span v-html="findItemOnArray('title', new_item.content)"> </span>
          </v-list-item-title>

          <v-list-item-subtitle>
            <span v-html="findItemOnArray('content', new_item.content, true)">
            </span>
          </v-list-item-subtitle>

          <small class="date"
            >{{ $moment(new_item.timestamp).format('L') }}
          </small>
        </v-list-item-content>

        <v-list-item-action>
          <i class="icon-presets material-symbols-rounded">arrow_forward</i>
        </v-list-item-action>
      </v-list-item>
    </v-list-item-group>

    <v-divider />

    <slot name="help-center" />
  </v-list>
</template>

<script>
export default {
  props: {
    news: Array,
  },
  data: () => ({}),
  methods: {
    handleSelectNews(id) {
      this.$emit('selectedNews', id)
    },
  },
}
</script>
