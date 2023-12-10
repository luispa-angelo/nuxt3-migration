<script>
import { Doughnut } from 'vue-chartjs'

export default {
  extends: Doughnut,
  props: ['chartData', 'options'],
  mounted() {
    setTimeout(() => {
      this.renderChart(this.chartData, this.options)
    }, 1000)
  }
}
</script>
