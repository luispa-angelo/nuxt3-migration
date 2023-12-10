<template>
  <div class="portal_wrapper">
    <v-list dense height="100%" v-if="firstAccess">
      <v-subheader>Selecione uma das opções:</v-subheader>

      <v-list-item-group v-for="link in links" :key="link.title">
        <v-list-item @click="handleAccessLink(link)">
          <v-list-item-icon :class="link.variant">
            <i class="v-icon material-symbols-rounded">
              {{ link.icon }}
            </i>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title v-text="link.text" />
          </v-list-item-content>

          <i class="icon-presets material-symbols-rounded">
            {{ link.external ? 'open_in_new' : 'arrow_forward' }}
          </i>
        </v-list-item>
      </v-list-item-group>

      <v-divider />

      <slot name="help-center" />
    </v-list>

    <iframe
      v-if="!firstAccess"
      allowfullscreen
      name="idea-widget-frame"
      title="Idea Collection Widget"
      style="
        border: none;
        width: 100%;
        min-height: 520px;
        max-height: 100%;
        box-shadow: 0px 3px 5px -1px rgba(0, 0, 0, 0.2),
          0px 5px 8px 0px rgba(0, 0, 0, 0.14),
          0px 1px 14px 0px rgba(0, 0, 0, 0.12);
        border-radius: 0px;
      "
      frameborder="0"
      src="https://idea-widget.ideanote.io?config=7e54e3673b"
    ></iframe>
  </div>
</template>

<script>
export default {
  data: () => ({
    firstAccess: true,
    links: [
      {
        text: 'Já sou cadastrado',
        icon: 'task_alt',
        variant: 'info',
      },
      {
        text: 'Primeiro acesso ao portal',
        icon: 'rocket',
        variant: 'primary',
        url: 'https://omiecrm.ideanote.io/login/link/c69992898365e9943ac4faff',
        external: true,
      },
    ],
  }),
  methods: {
    handleAccessLink(link) {
      if (link.external) window.open(link.url, '_blank').focus()
      else this.firstAccess = false
    },
  },
}
</script>

<style scoped lang="scss">
.v-list {
  overflow-y: hidden !important;
  .v-list-item {
    min-height: auto;

    .v-list-item__title {
      overflow: visible !important;
    }
  }
}
</style>
