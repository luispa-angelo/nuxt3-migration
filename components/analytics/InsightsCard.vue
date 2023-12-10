<template>
  <v-card class="my-3">
    <v-icon small class="icon">mdi-open-in-new</v-icon>
    <div class="chart">
      <img :src="imgSrc" />
    </div>
    <div class="d-flex flex-row align-center justify-start w-100 ml-2">
      <p class="mb-2 ml-2 font-body-medium">{{ title }}</p>
      <v-icon :color="iconColor" small class="ml-2 mb-3">{{ icon }}</v-icon>
    </div>
    <p class="mb-2 ml-4 d-flex align-start descricao">{{ description }}</p>
  </v-card>
</template>

<script>
export default {
  props: {
    title: String,
    icon: String,
    description: String,
    iconColor: String,
    imgSrc: String,
    href: String
  },
}
</script>

<style scoped>
p {
  margin-bottom: 0px !important;
  font-weight: 600 !important;
}
.descricao {
  font-size: 10px;
  font-weight: 400;
  font-style: normal;
}
.chart {
  width: 263px;
  height: 181px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.chart img {
  width: 80%;
}
.icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: "#0346F2" !important; 
  cursor: pointer;
}
</style>