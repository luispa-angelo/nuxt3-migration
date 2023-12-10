<template>
  <div>
    <div class="d-flex flex-row justify-space-between">
      <AnalyticsHeader />
    </div>
    <v-divider class="my-5"></v-divider>    
    <v-row>
      <v-col class="text-center">
        <v-card
          color="shape lighten-1"
          :class="isMaximized ? 'maximized-style' : 'default-style'"
        >
          <v-card-title v-if="selectedBi || firstLoaded && isMaximized" class="w-100 d-flex justify-end py-2">
            <v-btn v-if="selectedBi" icon small @click="home">
              <v-icon>mdi-home</v-icon>
            </v-btn>
            <v-btn icon small v-if="!isMaximized" @click="isMaximized = !isMaximized">
              <v-icon>mdi-arrow-expand</v-icon>
            </v-btn>
            <v-btn icon small v-else @click="isMaximized = !isMaximized">
              <v-icon>mdi-arrow-collapse</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text v-if="!selectedBi">
            <AnalyticsCover @select="selectBiFromCover" :profile="userProfile">
            </AnalyticsCover>
          </v-card-text>
          <v-card-text v-show="selectedBi">
            <AnalyticsPowerBiContainer
              :selected-bi="selectedBi"
              :is-maximized="isMaximized"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  data: () => ({
    isMaximized: false,
    selectedBi: null,
    firstLoaded: false,
    biList: [],
    userProfile: {}
  }),
  async mounted() {
    this.getList('/ecosystem/my-profile')
      .then(data => {
        this.userProfile = data.data || {}
      })
    const { data } = await this.getList('/analytics/bi')
    this.biList = data
  },
  methods: {
    selectBiFromCover(dashId) {
      let el = this.biList.find(el => el.report_id == dashId)
      console.log(el)
      if (el) {
        this.firstLoaded = true
        this.selectBi(el.id)
      }
    },
    selectBi(id) {
      this.selectedBi = id
    },
    home() {
      this.selectedBi = null
    }
  },
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.maximized-style {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
}
.default-style {
  height: calc(100vh - 238px);
  min-height: 800px;
}
.btn-filter {
  width: 34px;
  height: 34px;
  background-color: #0346F2 !important; 
  border-radius: 50%;
}
.icon {
  color: #fff !important;
}
</style>