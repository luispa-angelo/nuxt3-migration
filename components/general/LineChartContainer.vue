<template>
	<div class="container-chart">
		<LineChart :chart-data="chartData" :options="options" />
	</div>
</template>

<script>
export default {
  props: {
    chartLabel: String
  },
  data: () => ({
    chartData: {
      labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [
        {
          label: 'Data One',
          backgroundColor: 'orange',
          data: [0 , 74, 84, 85, 68, 42, 46, 56, 38, 23, 15, 8]
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // legend: {
      //   display: false
      // },
      // scales: {
      //   xAxes: [
      //     {
      //       display: true,
      //       ticks: {
      //         beginAtZero: true
      //       }
      //     }
      //   ],
      //   yAxes: [
      //     {
      //       id: 'yAxis',
      //       display: false,
      //       ticks: {
      //         beginAtZero: true
      //       }
      //     }
      //   ]
      // }
    }
  }),
  mounted() {
    this.chartData.datasets[0].label = this.chartLabel
  },
}
</script>

<style scoped>
.chartjs-render-monitor {
	height: 300px !important;
}
</style>
