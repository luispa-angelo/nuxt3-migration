<template>
	<div class="container-chart">
    <div class="container-total text-center">
      <h3>{{ monthlyTasks.length }}</h3>
      <p>Total</p>
    </div>
		<DoughnutChart :chart-data="chartData" :options="options" />
	</div>
</template>

<script>
export default {
  props: {
    monthlyTasks: Array
  },
  data: () => ({
    total: null,
    chartData: {
      labels: [
        'Concluídas',
        'Agendadas',
        'Atrasadas'
      ],
      datasets: []
    },
    options: {
      cutoutPercentage: 75,
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        align: 'center'
      },
      scales: {
        xAxes: [
          {
            display: false,
            ticks: {
              beginAtZero: true
            }
          }
        ],
        yAxes: [
          {
            id: 'yAxis',
            display: false,
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    }
  }),
  watch: {
    async monthlyTasks(newValue) {
      if(newValue) {
        await this.getData()
      }
    }
  },
  methods: {
    async getData() {
      const late = this.monthlyTasks.filter(function(task){
        return task.scheduling == 'Atrasada'
      }).length

      const scheduled = this.monthlyTasks.filter(function(task){
        return task.scheduling == 'Agendada'
      }).length

      const done = this.monthlyTasks.filter(function(task){
        return task.scheduling == 'Concluída'
      }).length

      this.chartData.datasets.push({
        data: [done,scheduled,late],
        backgroundColor: [
          '#A3CF2E',
          '#FD9900',
          '#E7364F'
        ]
      })
    }
  }
}
</script>

<style scoped>
  .container-total {
    position: absolute;
    top: 44%;
    left: 50%;
    transform: translateY(-45%);
    transform: translateX(-50%);
    cursor: default;
  }
  @media only screen and (min-width: 1366px) and (max-width: 1600px) {
    .container-total {
      top: 40%;
      left: 50%;
      transform: translateY(-40%);
      transform: translateX(-50%);
    }
  }
</style>