<template>
    <section ref="biContainer" :class="isMaximized ? 'maximized-container' : 'default-container'"/>
</template>

<script>
export default {
  props: {
    selectedBi: Number,
    isMaximized: Boolean
  },
  data: () => ({
    embedUrlBase: 'https://app.powerbi.com/reportEmbed?config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVdFU1QtRVVST1BFLXJlZGlyZWN0LmFuYWx5c2lzLndpbmRvd3MubmV0IiwiZW1iZWRGZWF0dXJlcyI6eyJtb2Rlcm5FbWJlZCI6dHJ1ZX19',
    powerbi: null,
    biContainer: null,
    settings: {
      panes: {
        filters: {
          visible: false
        },
        pageNavigation: {
          visible: false
        }
      }
    }
  }),
  mounted() {
    this.setPowerBiInstance()
  },
  watch: {
    selectedBi(newValue) {
      if (newValue) {
        this.dialog = true
        this.getReport()
      } else {
        this.resetReport()
      }
    },
  },
  methods: {
    setPowerBiInstance() {
      const { service, factories } = this.$pbi
      this.biContainer = this.$refs.biContainer
      this.powerbi = new service.Service(factories.hpmFactory, factories.wpmpFactory, factories.routerFactory)
    },
    async getReport() {
      this.resetReport()
      const { models } = this.$pbi
      this.powerbi.bootstrap(this.biContainer, { type: 'report' })

      let info = await this.getList(`/analytics/embed-token/${this.selectedBi}`)
      const { token, groupId, reportId } = info

      const url = info?.href || `${this.embedUrlBase}&reportId=${reportId}&groupId=${groupId}`

      const config = {
        type: 'report',
        tokenType: models.TokenType.Embed,
        accessToken: token,
        embedUrl: url,
        id: reportId,
        permissions: models.Permissions.All,
        settings: this.settings
      }
      this.powerbi.embed(this.biContainer, config)
    },
    resetReport() {
      this.powerbi.reset(this.biContainer)
    }
  }
}
</script>

<style scoped>
  .maximized-container {
    height: calc(100vh - 52px);
  }
  .default-container {
    height: calc(100vh - 290px);
    min-height: 800px;
  }
</style>
