<template>
  <v-list dense height="100%">
    <span v-for="link in links" :key="link.title">
      <v-list-subheader>{{ link.title }}</v-list-subheader>

      <v-list-item-group>
        <v-list-item @click="handleAccessLink(link)">
          <span :class="link.variant">
            <i class="v-icon material-symbols-rounded">
              {{ link.icon }}
            </i>
          </span>

          <span>
            <v-list-item-title v-text="link.text" />
          </span>

          <i class="icon-presets material-symbols-rounded">
            {{ link.external ? 'open_in_new' : 'arrow_forward' }}
          </i>
        </v-list-item>
      </v-list-item-group>

      <v-divider />
    </span>

    <v-list-subheader>Novidades</v-list-subheader>
    <v-list-item-group v-if="news">
      <v-list-item
        v-for="(new_item, i) in news.slice(0, 3)"
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

        <span style="padding: 0 0.6rem">
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
        </span>

        <v-list-item-action>
          <i class="icon-presets material-symbols-rounded"> arrow_forward </i>
        </v-list-item-action>
      </v-list-item>
    </v-list-item-group>

    <span class="nav-link" @click="handleSelectNews(-1)">
      Ver todas as novidades</span
    >

    <v-divider />

    <slot name="help-center" />
  </v-list>
</template>

<script>
export default {
  props: {
    news: Array,
  },
  data: () => ({
    links: [
      {
        title: 'Link Externo',
        text: 'Abertura de chamados',
        icon: 'contact_support',
        url: 'https://omie.atlassian.net/servicedesk/customer/portal/6',
        variant: 'primary',
        external: true,
      },
      {
        title: 'Acesso Rápido',
        text: 'Portal de ideias',
        icon: 'tips_and_updates',
        variant: 'info',
        emitsEvent: 'showIdeasPortal',
      },
    ],
  }),
  methods: {
    handleSelectNews(id) {
      this.$emit('selectedNews', id)
    },
    handleAccessLink(link) {
      if (link?.url && link?.external) window.open(link.url, '_blank').focus()
      else if (link?.emitsEvent) this.$emit(link.emitsEvent)
    },
  },
}
</script>
