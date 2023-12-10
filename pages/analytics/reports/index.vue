<template>
  <div>
    <AnalyticsHeader />
    <v-divider class="my-5"></v-divider>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <ReportForm class="mt-1" ref="myForm" />
      </v-col>
    </v-row>
    <v-row class="fill-height">
      <v-col xl="12" lg="12" md="12" sm="12"  class="fill-height">
        <v-card class="shape lighten-1">
          <v-card-text style="padding: 0;">
            <ReportList :search="search" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>

export default {
  data: () => ({
    focus: '',
    search: '',
    events: [],
    amount: 0,
  }),
  methods: {
   
  },
}
</script>

<style scoped>
</style>
