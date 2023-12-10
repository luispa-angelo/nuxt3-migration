<template>
  <div>
    <PageHeadline page-name="Analytics"/>
    <v-row>
      <v-col class="d-flex justify-space-between align-center">
        <div>
          <v-btn
            active-class="button-active"
            class="mx-2"
            to="/analytics"
            exact
            >Dashboard</v-btn
          >
          <v-btn
            v-if="!isProductionEnv"
            active-class="button-active"
            class="mx-2"
            to="/analytics/selfservicebi"
            >Self-Service BI</v-btn
          >
          <v-btn
            v-if="!isProductionEnv"
            active-class="button-active"
            class="mx-2"
            to="/analytics/insights"
            >Insights</v-btn
          >
          <v-btn
            active-class="button-active"
            class="mx-2"
            to="/analytics/reports"
            >Relatórios</v-btn
          >
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    route: null,
    isProductionEnv: false,
  }),
  async mounted() {
    this.isProductionEnv = document.URL.split('//')[1].split('.')[0] == 'app'
    if ((this.$route.name).includes('-')) {
      let route1 = this.$route.name
      if (route1.includes('-')) {
        let index = route1.indexOf('-')
        let lastChar = index.length
        route1 = route1.slice(index+1, lastChar)
        // this.route = this.capitalizeFirstLetter(this.$route.name)
        this.route = this.capitalizeFirstLetter(route1)
      }
    } else {
      this.route = this.capitalizeFirstLetter(this.$route.name)
    }
    
  },
  methods: {
    capitalizeFirstLetter(string) {
      return string[0].toUpperCase() + string.slice(1)
    }
  },
}
</script>

<style scoped>
* {
  text-transform: none !important;
}
.default-style {
  height: calc(100vh - 238px);
}
.button-active {
  color: #fff !important;
  background-color: #0346F2 !important;
  font-weight: bold;
}
.painel {
  color: #252F40;
}
.painelRoute {
  color: #0346F2 !important;
}
.divider {
  color: #0346F2 !important;
}
</style>