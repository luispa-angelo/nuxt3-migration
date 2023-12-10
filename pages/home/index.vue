<template>
  <div class="home_container">
    <v-chip-group v-model="selectedView" mandatory>
      <v-chip
        class="borderless_ship"
        medium
        pill
        active-class="borderless_ship_active"
        v-for="option in viewOptions"
        :key="option.id"
      >
        <i class="material-symbols-rounded v-icon pr-3">
          {{ option.icon }}
        </i>
        {{ option.text }}
      </v-chip>
    </v-chip-group>

    <div class="home_wrapper">
      <span class="home_header">
        <div class="header_items">
          <v-autocomplete
            data-test="inputHomeAssignedTo"
            attach
            hide-details
            dense
            outlined
            :items="assignedToFilter"
            :menu-props="{ contentClass: 'team-list-select' }"
            item-value="id"
            v-model="selectedAssign"
            placeholder="Selecione a atribuição"
            @change="handleAssignedToChange()"
            @blur="handleInputEmptyValue()"
          >
            <!-- Change label for the selected item -->
            <template slot="selection" slot-scope="data">
              <span class="d-flex align-center">
                <i class="material-symbols-rounded v-icon pr-2"
                  >{{ data.item.icon }}
                </i>
                {{ data.item.text }}
              </span>
            </template>

            <!-- Change the selection menu -->
            <template slot="item" slot-scope="data">
              <div class="custom_select">
                <small
                  :class="
                    data.item.teamHeadline || data.item.userHeadline
                      ? 'my-2'
                      : ''
                  "
                >
                  {{
                    data.item.teamHeadline
                      ? 'Times'
                      : data.item.userHeadline
                      ? 'Usuário'
                      : ''
                  }}
                </small>
                <div class="d-flex">
                  <i class="material-symbols-rounded v-icon">
                    {{ data.item.icon }}
                  </i>
                  <span class="text_item">
                    <span>{{ data.item.text }}</span>
                    <small>{{ data.item.description }}</small>
                  </span>
                </div>
              </div>
            </template>
          </v-autocomplete>

          <v-select
            data-test="inputHomeDateRange"
            hide-details
            dense
            outlined
            item-text="name"
            item-value="value"
            v-model="customFilters.value"
            placeholder="Selecione o período"
            class="ml-3"
            :items="
              generateItemsList(
                dateRange,
                customFilters.customValue,
                customFilters.customValueItem
              )
            "
            @change="handleDateChange(false)"
            :style="`${
              isCustomDatePeriod ? 'max-width: 270px' : 'max-width: 220px'
            }  `"
          >
            <template slot="selection" slot-scope="data">
              <span class="d-flex align-center">
                <i class="material-symbols-rounded v-icon pr-2">
                  calendar_month
                </i>
                {{ data.item.name }}
              </span>
            </template>
            <template v-slot:prepend-item>
              <AutocompletePrependItemSlot
                ref="customFilterInput"
                v-bind:dateChip.sync="customFilters.customValue"
                :custom-value-item="customFilters.customValueItem"
                :returnOnlyDates="true"
                :maxDaysDiff="90"
                @onDateChosen="
                  (value) => {
                    customFilters.customValueItem = value
                  }
                "
                @onChipChange="handleChipChange"
              />
            </template>
          </v-select>
        </div>

        <div class="header_items">
          <span class="mr-3 mt-1 body-3 daterange">
            <span class="font-body-small" v-if="startDate && endDate">
              Intervalo de datas: ({{ dateInterval }})
            </span>
            <span class="font-body-small">
              Última atualização:
              {{ $moment(updateAt).format('DD/MM/YYYY [às] HH[h]mm') }}
            </span>
          </span>
          <v-switch
            data-test="inputHomeDynamicUpdate"
            class="update_switch"
            v-model="dynamicUpdate"
            title="Atualização automática"
            hide-details
            inset
            append-icon="mdi-sync"
            prepend-icon="mdi-sync-off"
            @change="handleSetHomePreferences()"
          >
          </v-switch>
        </div>
      </span>
      <div class="home_body">
        <!-- First line items -->
        <div class="mini w-100 d-flex align-center">
          <div
            class="box_item"
            v-for="item in firstLineItems"
            :key="
              item.id +
              'period-' +
              customFilters.value +
              'assign-' +
              selectedAssign +
              'dataCount-' +
              dataItemsCount
            "
          >
            <div class="box_header">
              <h6
                class="font-body-large"
                :class="
                  showHeaderTooltip && item.label.length > 14
                    ? 'header truncate_text'
                    : ''
                "
                v-tooltip="{
                  content: ` ${
                    showHeaderTooltip && item.label.length > 14
                      ? `<div class='v-btn-tooltip'>${item.label}</div>`
                      : ''
                  }
                 `,
                }"
              >
                {{ item.label }}
              </h6>
              <span class="datetime body-3">
                <i class="material-symbols-rounded v-icon"> calendar_month</i>
                {{ selectedDate }}
              </span>
            </div>
            <span
              class="tooltip_description font-body-small"
              v-tooltip="{
                content: `<div class='v-btn-tooltip'>${item.tooltipText}</div>`,
                placement: 'auto',
              }"
            >
              {{ item.tooltip }}
              <i class="material-symbols-rounded v-icon"> info </i>
            </span>

            <div
              class="box_content"
              :class="item.isRevenue ? 'align_revenue' : ''"
            >
              <!-- Charts -->
              <DoughnutChart
                class="chart"
                :chart-data="item.chartData"
                :options="
                  item.task ? taskChartOptions : opportunityChartOptions
                "
                v-if="item.isChart && chartLoaded"
              />
              <!-- Chart count -->
              <v-tooltip top attach offset-overflow v-if="item.isChart">
                <template v-slot:activator="{ on, attrs }">
                  <div v-bind="attrs" v-on="on" class="chart_total">
                    <span class="truncate_text">
                      {{
                        handleValueFormat(
                          item.task ? taskChartCount : opportunityChartCount
                        )
                      }}</span
                    >
                    <span>Total</span>
                  </div>
                </template>
                <span
                  >Total:
                  {{
                    handleValueFormat(
                      item.task ? taskChartCount : opportunityChartCount
                    )
                  }}</span
                >
              </v-tooltip>
              <!-- Revenues -->
              <template v-if="item.isRevenue">
                <div
                  class="item_wrapper"
                  v-for="revenue in item.revenueData"
                  :key="revenue.text"
                  :class="revenue.customClass"
                >
                  <i class="material-symbols-rounded v-icon icon">{{
                    revenue.icon
                  }}</i>
                  <div class="revenue">
                    <span
                      class="truncate_text revenue_value"
                      style="cursor: pointer"
                      v-tooltip="{
                        content: `
                  <div class='v-btn-tooltip'>${handleValueFormat(
                    revenue.value,
                    true
                  )}</div>`,
                      }"
                    >
                      {{ handleValueFormat(revenue.value, true) }}</span
                    >
                    <h6 class="font-body-large mr-5 d-flex align-center">
                      {{ revenue.text }}
                      <v-tooltip top>
                        <template v-slot:activator="{ on, attrs }">
                          <v-icon
                            dark
                            v-bind="attrs"
                            v-on="on"
                            size="16"
                            style="
                              color: var(--v-sub-text-base);
                              margin: 0 4px;
                              cursor: pointer;
                            "
                          >
                            mdi-information-outline
                          </v-icon>
                        </template>
                        <span>
                          {{ revenue.tooltip }}
                        </span>
                      </v-tooltip>
                    </h6>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <!-- Table items -->
        <div class="w-100 d-flex align-center">
          <!-- Tarefas - Próximos passos -->
          <div class="box_item task_wrapper">
            <div class="task_header">
              <span class="box_header">
                <h6 class="font-body-large">
                  Tarefas - Próximos passos ({{
                    sortedTasksNextSteps.length < 1
                      ? '0'
                      : sortedTasksNextSteps.total > 100
                      ? '99+'
                      : sortedTasksNextSteps.length > 9
                      ? sortedTasksNextSteps.length
                      : `0${sortedTasksNextSteps.length}`
                  }})
                </h6>

                <span class="datetime body-3">
                  <i class="material-symbols-rounded v-icon"> calendar_month</i>
                  {{ selectedDate }}
                </span>
              </span>
              <span
                class="tooltip_description font-body-small"
                v-tooltip="{
                  content: `<div class='v-btn-tooltip'>Tarefas não iniciadas,<br> com agendamento para o período.</div>`,
                  placement: 'auto',
                }"
              >
                por data de agendamento
                <i class="material-symbols-rounded v-icon"> info </i>
              </span>
            </div>
            <v-card
              ref="tasksTable"
              class="box_content"
              v-if="tasksNextSteps.total >= 1"
            >
              <div
                class="task_list"
                v-for="task in sortedTasksNextSteps"
                :key="task.id"
                @click="openTaskDialog(task.id, $event)"
              >
                <div class="list_wrapper pl-4 py-2" v-if="task">
                  <div
                    class="task_item task_title"
                    v-if="task.type && task.type.media_type"
                  >
                    <span
                      class="icon_wrapper"
                      :style="`
                        background: var(--v-${
                          tasksIcons[handleTaskType(task)].color
                        }-base);`"
                    >
                      <InternalTaskIcon
                        v-if="handleTaskType(task) === 'internal'"
                        width="19"
                        height="19"
                        class="ml-1"
                        :fill="tasksIcons[handleTaskType(task)].iconColor"
                      />
                      <MeetingTaskIcon
                        v-else-if="handleTaskType(task) === 'meeting'"
                        class="mr-1"
                        width="30"
                        height="16"
                        :fill="tasksIcons[handleTaskType(task)].iconColor"
                      />
                      <v-icon
                        v-else
                        class="material-icons-outlined"
                        :color="tasksIcons[handleTaskType(task)].iconColor"
                      >
                        {{ tasksIcons[handleTaskType(task)].icon }}
                      </v-icon>
                    </span>
                    <span class="ml-1">{{ task.type.name }}</span>
                  </div>
                  <div class="task_item">
                    <i class="material-symbols-rounded"> calendar_month </i>
                    <span> Agendado para:</span>
                    <span
                      class="scheduled_to"
                      :class="
                        $moment(`${task.scheduled_to}Z`) < new Date()
                          ? 'late'
                          : ''
                      "
                      v-tooltip="{
                        content: `${
                          $moment(`${task.scheduled_to}Z`) < new Date()
                            ? `<div class='v-btn-tooltip'>Tarefa atrasada</div>`
                            : ''
                        }
                 `,
                      }"
                    >
                      {{ handleTimeDiff(task.scheduled_to) }}
                    </span>
                    <span class="task_item">
                      <i class="material-symbols-rounded ml-4 mr-0">
                        exclamation
                      </i>
                      <span> Prioridade: </span>
                      <span class="priority" :class="task.priority">
                        {{ handlePriorities(task.priority) }}</span
                      >
                    </span>
                  </div>
                  <div class="task_item" v-if="task.opportunity">
                    <i class="material-symbols-rounded"> business_center </i>
                    <span> Oportunidade: </span>
                    <NuxtLink
                      class="link--hover"
                      :to="`business-opportunity/router/${task.opportunity.id}`"
                      target="_blank"
                      id="opportunity"
                    >
                      {{ task.opportunity.customer.name }}</NuxtLink
                    >
                  </div>
                  <div
                    class="task_item"
                    v-if="task.assigned_to && task.assigned_to.name"
                  >
                    <i class="material-symbols-rounded"> account_box </i>
                    <span>Atribuído(a) a:</span>
                    <span class="assigned_to">
                      {{ task.assigned_to.name }}
                    </span>
                  </div>
                </div>
                <v-divider class="divider" />
              </div>
            </v-card>
            <span class="box_content empty_box" v-else>
              Não há tarefas com próximos passos</span
            >
          </div>
          <!-- Sem tarefas futuras -->
          <div class="box_item task_wrapper">
            <div class="task_header">
              <span class="box_header">
                <h6 class="font-body-large">
                  Oportunidades - Sem tarefa futura ({{
                    sortedTasksWithoutFurtherActions.length < 1
                      ? '0'
                      : sortedTasksWithoutFurtherActions.total > 100
                      ? '99+'
                      : sortedTasksWithoutFurtherActions.length > 9
                      ? sortedTasksWithoutFurtherActions.length
                      : `0${sortedTasksWithoutFurtherActions.length}`
                  }})
                </h6>

                <span class="datetime body-3">
                  <i class="material-symbols-rounded v-icon"> calendar_month</i>
                  {{ selectedDate }}
                </span>
              </span>
              <span
                class="tooltip_description font-body-small"
                v-tooltip="{
                  content: `<div class='v-btn-tooltip'>Oportunidades criadas no período, sem tarefa agendada.</div>`,
                }"
              >
                por data de criação
                <i class="material-symbols-rounded v-icon"> info </i>
              </span>
            </div>
            <v-card
              ref="opportunityTable"
              class="box_content"
              v-if="tasksWithoutFurtherActions.total >= 1"
            >
              <div
                class="task_list"
                v-for="task in sortedTasksWithoutFurtherActions"
                :key="task.id"
              >
                <NuxtLink
                  class="list_wrapper pl-4 py-2"
                  :to="`/business-opportunity/router/${task.id}`"
                  target="_blank"
                >
                  <div class="task_item task_title">
                    <span
                      class="icon_wrapper"
                      style="background: var(--v-stroke-lighten5)"
                    >
                      <i class="material-symbols-rounded icon v-icon">
                        business_center
                      </i>
                    </span>
                    <span class="ml-1">
                      {{ task.company.name }}
                    </span>
                  </div>
                  <div class="task_item">
                    <i class="material-symbols-rounded"> calendar_month </i>
                    Última tarefa criada:
                    <span v-if="task.tasks.length >= 1" class="last_task">
                      {{ handleTimeDiff(task.tasks.at(-1).created_at, true) }}
                    </span>
                    <span v-else class="empty_task">não há tarefa</span>
                    <span class="task_item">
                      <i class="material-symbols-rounded ml-4"> straighten </i>
                      Etapa do funil:
                      <span class="stage">
                        {{ task.stage.name }}
                      </span>
                    </span>
                  </div>
                  <div class="task_item">
                    <i class="material-symbols-rounded"> domain </i>
                    <span> Empresa: </span>
                    <NuxtLink
                      class="link--hover"
                      :to="{
                        path: `/business-companies/router/${task.company.identifier}`,
                        query: { company_id: `${task.company.id}` },
                      }"
                      target="_blank"
                    >
                      {{ task.company.name }}</NuxtLink
                    >
                  </div>
                  <div class="task_item">
                    <i class="material-symbols-rounded"> account_box </i>
                    <span>Atribuído(a) a:</span>
                    <span
                      class="assigned_to"
                      v-if="task.assigned_to && task.assigned_to.name"
                    >
                      {{ task.assigned_to.name }}
                    </span>
                  </div>
                </NuxtLink>
                <v-divider class="divider" />
              </div>
            </v-card>
            <span class="box_content empty_box" v-else>
              Não há oportunidade sem tarefa agendada</span
            >
          </div>
        </div>
      </div>
    </div>
    <WhatsNewDialog />
    <TaskModal
      :item-id="taskID"
      :open-dialog="showTaskDialog"
      @closeDialog="
        () => {
          showTaskDialog = false
        }
      "
    />
  </div>
</template>

<script>
import vuetifyOptions from '@/vuetify.options'
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    selectedView: 0,
    showHeaderTooltip: false,
    viewOptions: [{ id: 0, text: 'Resumo', icon: 'monitoring' }],
    updateAt: new Date(),
    dynamicUpdate: false,
    selectedAssign: 0,
    filterText: '',
    startDate: '',
    endDate: '',
    interval: '',
    showTaskDialog: false,
    taskID: 0,
    assignedToFilter: [
      {
        id: 0,
        team_id: 0,
        userHeadline: true,
        text: 'Atribuído(a) a mim',
        description: 'Eu',
        icon: 'person',
      },
    ],
    taskChartCount: 0,
    opportunityChartCount: 0,
    tasksIcons: {
      call: {
        icon: 'phone',
        color: 'phone-icon-bg',
        iconColor: 'phone-icon-text',
      },
      default: {
        icon: 'pending',
        color: 'default-icon-bg',
        iconColor: 'default-icon-text',
      },
      mail: {
        icon: 'mail_outline',
        color: 'email-icon-bg',
        iconColor: 'email-icon-text',
      },
      mobile: {
        icon: 'call',
        color: 'phone-icon-bg',
        iconColor: 'phone-icon-text',
      },
      chat: {
        icon: 'mdi-whatsapp',
        color: 'chat-icon-bg',
        iconColor: 'chat-icon-text',
      },
      meeting: {
        icon: '',
        color: 'meeting-icon-bg',
        iconColor: 'meeting-icon-text',
      },
      internal: {
        icon: '',
        color: 'internal-icon-bg',
        iconColor: 'internal-icon-text',
      },
      other: {
        icon: 'pending',
        color: 'default-icon-bg',
        iconColor: 'default-icon-text',
      },
    },
    firstLineItems: [
      {
        id: 1,
        label: 'Tarefas',
        isChart: true,
        task: true,
        chartData: {
          labels: [
            'Agendadas',
            'Em execução',
            'Em espera',
            'Concluídas',
            'Atrasadas',
          ],
          datasets: [
            {
              data: [0, 0, 0, 0, 0],
              backgroundColor: [
                vuetifyOptions.theme.themes.light.blue.lighten3,
                vuetifyOptions.theme.themes.light.purple.lighten3,
                vuetifyOptions.theme.themes.light['warning-tag'].base,
                vuetifyOptions.theme.themes.light['success-tag'].base,
                vuetifyOptions.theme.themes.light['error-tag'].base,
              ],
            },
          ],
        },
        tooltip: 'por data de agendamento',
        tooltipText:
          'Acompanhamento dos status das <br> tarefas agendadas para o período.',
      },
      {
        id: 2,
        label: 'Oportunidades previstas',
        isChart: true,
        chartData: {
          labels: ['Ativas', 'Aguardando', 'Canceladas', 'Ganhas', 'Perdidas'],
          datasets: [
            {
              data: [0, 0, 0, 0, 0],
              backgroundColor: [
                vuetifyOptions.theme.themes.light.blue.lighten3,
                vuetifyOptions.theme.themes.light.purple.lighten3,
                vuetifyOptions.theme.themes.light['warning-tag'].base,
                vuetifyOptions.theme.themes.light['success-tag'].base,
                vuetifyOptions.theme.themes.light['error-tag'].base,
              ],
            },
          ],
        },
        tooltip: 'por data de previsão',
        tooltipText:
          'Acompanhamento dos status <br> das oportunidades previstas para o período.',
      },
      {
        id: 3,
        label: 'NMRR',
        isRevenue: true,
        revenueData: [
          {
            icon: 'hourglass_empty',
            text: 'Previsto',
            customClass: 'foreseen',
            value: 0,
            tooltip: 'Soma do valor das oportunidades previstas para o período',
          },
          {
            icon: 'paid',
            text: 'Ganho',
            customClass: 'wins',
            value: 0,
            tooltip:
              'Soma do valor das oportunidades que foram ganhas durante o período',
          },
          {
            icon: 'thumb_down',
            text: 'Perdido',
            customClass: 'lost',
            value: 0,
            tooltip:
              'Soma do valor das oportunidades que foram perdidas durante o período',
          },
        ],
        tooltip: 'por data de previsão, data de fechamento',
        tooltipText:
          'Comparação do resultado previsto com os ganhos <br> e perdas no período, considerando a soma <br> dos produtos Omie ERP no carrinho de oportunidades.',
      },
      {
        id: 4,
        label: 'Receita total',
        isRevenue: true,
        revenueData: [
          {
            icon: 'hourglass_empty',
            text: 'Previsto',
            customClass: 'foreseen',
            value: 0,
            tooltip: 'Soma do valor das oportunidades previstas para o período',
          },
          {
            icon: 'paid',
            text: 'Ganho',
            customClass: 'wins',
            value: 0,
            tooltip:
              ' Soma do valor das oportunidades que foram ganhas durante o período',
          },
          {
            icon: 'thumb_down',
            text: 'Perdido',
            customClass: 'lost',
            value: 0,
            tooltip:
              'Soma do valor das oportunidades que foram perdidas durante o período',
          },
        ],
        tooltip: 'por data de previsão, data de fechamento',
        tooltipText:
          'Comparação do resultado previsto com os ganhos <br> e perdas no período, considerando a soma de <br> todos os produtos no carrinho de oportunidades.',
      },
    ],
    baseChartOptions: {
      cutoutPercentage: 75,
      responsive: true,
      maintainAspectRatio: false,
      legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          useBorderRadius: true,
          borderRadius: 12,
        },
      },
      scales: {
        xAxes: [
          {
            display: false,
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        yAxes: [
          {
            id: 'yAxis',
            display: false,
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
    tasksNextSteps: { hasNext: false, data: [], total: 0 },
    tasksWithoutFurtherActions: { hasNext: false, data: [], total: 0 },
    chartLoaded: false,
    customFilters: {
      name: 'Data de agendamento',
      value: 'thisMonth',
      customValue: 0,
      customValueItem: null,
      field: 'scheduled_to',
      alternativeField: null,
      type: 'date',
      showChip: true,
    },
  }),
  computed: {
    ...mapGetters({
      userInfo: 'userInfo',
      preference: 'Profile/preference',
    }),
    sortedTasksNextSteps() {
      const sortedArray = this.tasksNextSteps?.data
      return sortedArray?.sort(
        (a, b) => new Date(a.scheduled_to) - new Date(b.scheduled_to)
      )
    },
    sortedTasksWithoutFurtherActions() {
      const sortedArray = this.tasksWithoutFurtherActions?.data
      return sortedArray?.sort(
        (a, b) =>
          (b.tasks?.length < 1) - (a.tasks?.length < 1) ||
          new Date(b.tasks?.at(-1)?.created_at) -
            new Date(a.tasks?.at(-1)?.created_at)
      )
    },
    selectedDate() {
      if (!this.isCustomDatePeriod)
        return this.dateRange.find(
          (date) => date.value === this.customFilters.value
        )?.name

      return this.dateInterval
    },
    taskChartOptions() {
      let taskOptions = structuredClone(this.baseChartOptions)
      taskOptions.legend.onHover = (e) => (e.target.style.cursor = 'pointer')
      taskOptions.scales.yAxes[0].afterUpdate = (scale) =>
        this.handleChartCount(scale, true)
      return taskOptions
    },
    opportunityChartOptions() {
      let opportunityOptions = structuredClone(this.baseChartOptions)
      opportunityOptions.legend.onHover = (e) =>
        (e.target.style.cursor = 'pointer')
      opportunityOptions.scales.yAxes[0].afterUpdate = (scale) =>
        this.handleChartCount(scale)
      return opportunityOptions
    },
    dataItemsCount() {
      if (this.startDate !== '' && this.endDate !== '') {
        const revenue = [
          this.firstLineItems[2]?.revenueData.map((el) => el.value),
          this.firstLineItems[3]?.revenueData.map((el) => el.value),
        ]

        return [
          ...this.firstLineItems[0].chartData.datasets[0].data,
          ...this.firstLineItems[1].chartData.datasets[0].data,
          ...revenue.flat(),
        ]?.reduce((acc, value) => acc + value, 0)
      }

      return 0
    },
    isCustomDatePeriod() {
      return !this.dateRange.some(
        (date) => date.value == this.customFilters.value
      )
    },
    dateInterval() {
      if (this.isCustomDatePeriod) {
        const dates = this.customFilters.value?.split(',')
        return `${this.$moment(dates?.at(0)).format(
          'DD/MM/YYYY'
        )} até ${this.$moment(dates?.at(1))
          .subtract(1, 'day')
          .format('DD/MM/YYYY')}`
      }

      const [auxStartDate, auxEndDate] = this.dateRangeList(
        this.customFilters.value
      )
      return `${this.$moment(auxStartDate).format(
        'DD/MM/YYYY'
      )} até ${this.$moment(auxEndDate).format('DD/MM/YYYY')}`
    },
  },
  watch: {
    dynamicUpdate() {
      if (this.dynamicUpdate)
        this.interval = setInterval(
          async function () {
            await this.$nextTick()
            await this.handleGetItems()
          }.bind(this),
          60 * 1000
        )
      else clearInterval(this.interval)
    },
  },
  async mounted() {
    await this.getHomePreferences()

    // Add resize event listener
    window.addEventListener('resize', this.onResize)
    this.onResize()

    await this.$nextTick()
    await this.getTeams()
    await this.handleAssignedToChange(true)
    await this.handleDateChange(true)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize)
    clearInterval(this.interval)
  },
  methods: {
    handleTaskType(task) {
      const { type } = task

      if (!type?.extra) return 'default'

      const { modal, internal } = JSON.parse(type?.extra)

      if (internal) return 'internal'

      const modalToType = {
        mail: 'mail',
        call: 'call',
        chat: 'chat',
        meeting: 'meeting',
      }
      return modalToType[modal] || 'default'
    },
    generateItemsList(items, chipValue, customItem) {
      if (chipValue) {
        if (customItem) {
          return [customItem]
        }
        return []
      }
      return items
    },
    onResize() {
      this.showHeaderTooltip = window.innerWidth <= 1400 ? true : false
    },
    async getHomePreferences() {
      const home_preferences = this.preference('home')

      if (home_preferences) {
        this.dynamicUpdate = home_preferences.dynamic_update ?? false
        this.selectedAssign = home_preferences.assignTo ?? 0
        this.customFilters =
          home_preferences.customFilters ?? this.customFilters
      }
    },
    async handleSetHomePreferences() {
      const payload = {
        uid: this.userInfo.id,
        preferences: {
          home: {
            dynamic_update: this.dynamicUpdate,
            assignTo: this.selectedAssign,
            customFilters: this.customFilters,
          },
        },
      }
      await this.updateData(
        '/ecosystem/set-user-profile-preferences',
        payload,
        { fireSuccessAlert: false }
      )
      await this.$getMyProfile()
    },
    handleChartCount(scale, task = false) {
      if (scale?.chart?.config?.data?.datasets?.length > 0) {
        const data = scale.chart.config.data.datasets.at(-1).data
        const datasets = Object.values(
          scale.chart.config.data.datasets.at(-1)._meta
        )
        const count = datasets.at(-1).data.reduce((acc, item, index) => {
          return !item.hidden ? acc + data[index] : acc + 0
        }, 0)
        if (task) this.taskChartCount = count
        else this.opportunityChartCount = count
      }
    },
    handleTimeDiff(date, timeDescription = false) {
      let currentDate = this.$moment(new Date()).format('YYYY-MM-DD')
      let compareDate = this.$moment(`${date}Z`).format('YYYY-MM-DD')
      const daysDiff = this.$moment(currentDate).diff(compareDate, 'days')

      if (!timeDescription) {
        let timeString = 'DD/MM/YYYY'
        if (daysDiff <= 1)
          switch (daysDiff) {
          case 0:
            timeString = 'Hoje'
            break
          case 1:
            timeString = 'Ontem'
            break
          case -1:
            timeString = 'Amanhã'
            break
          }
        return this.$moment(`${date}Z`).format(
          `${
            daysDiff <= 1 && daysDiff >= -1
              ? `[${timeString}]`
              : `${timeString}`
          } [às] HH[h]mm`
        )
      } else if (timeDescription) {
        if (daysDiff <= 0) {
          let hoursDiff = this.$moment(new Date()).diff(`${date}Z`, 'hours')
          if (hoursDiff >= 1 && hoursDiff <= 24)
            return `há ${hoursDiff} hora(s)`
          return `há ${this.$moment(new Date()).diff(
            `${date}Z`,
            'minutes'
          )} minuto(s)`
        }
        return `há ${daysDiff} dia(s)`
      }
    },
    handlePriorities(priority) {
      switch (priority) {
      case 'low':
        return 'Baixa'
      case 'medium':
        return 'Média'
      case 'high':
        return 'Alta'
      }
    },
    handleValueFormat(value, currency = false) {
      if (currency)
        return value?.toLocaleString('pt-br', {
          style: 'currency',
          currency: 'BRL',
        })
      return value?.toLocaleString('pt-br')
    },
    openTaskDialog(taskID, event) {
      if (event?.target?.id === 'opportunity') return

      this.taskID = taskID
      this.showTaskDialog = true
    },
    async handleDateChange(mounted = false) {
      let startDate = new Date()
      let endDate = new Date()

      if (this.isCustomDatePeriod) {
        const splitDates = this.customFilters.value?.split(',')

        startDate = splitDates?.at(0)
        endDate = splitDates?.at(1)
      } else {
        const [startOf, endOf] = this.setDateRangeList(
          this.customFilters.value,
          null,
          null,
          true
        )

        startDate = startOf
        endDate = endOf
      }
      this.startDate = this.$moment(startDate).format('YYYY-MM-DDTHH:mm:ss')
      this.endDate = this.$moment(endDate).format('YYYY-MM-DDTHH:mm:ss')

      await this.handleGetItems()

      if (!mounted) await this.handleSetHomePreferences()
    },
    async handleInputEmptyValue() {
      if (!this.selectedAssign) this.selectedAssign = 0
    },
    async handleAssignedToChange(updateFilterText = false) {
      const team_id = this.assignedToFilter?.find(
        (item) => item?.id === this.selectedAssign
      )?.team_id
      if (team_id) this.filterText = `team_id=${team_id}`
      else this.filterText = `assigned_to_id=${this.userInfo.id}`

      if (!updateFilterText) {
        await this.handleGetItems()
        await this.handleSetHomePreferences()
      }
    },
    async handleChipChange() {
      // Set initial date for customFilter input
      await this.$nextTick()

      if (this.customFilters.customValue === 0) {
        this.customFilters.value = 'thisMonth'
      } else if (this.customFilters.customValue === 1) {
        this.$refs.customFilterInput.initialDate = this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD')
        this.$refs.customFilterInput.finalDate = this.$moment()
          .endOf('month')
          .format('YYYY-MM-DD')

        this.customValueItem = this.$refs.customFilterInput.customDate
        this.customFilters.value = this.$refs.customFilterInput.customDate.value
      }

      await this.handleDateChange()
    },
    // teams list
    async getTeams() {
      const response = await this.getList(
        '/ecosystem/any-team?order=level,id&includes=parent.parent&load_only=name&strict=true&order=name&limit=1000'
      )
      if (response.success && response.data?.length >= 1) {
        const teams = response.data.map((item) => ({
          id: item.id,
          team_id: item.id,
          text: item.name,
          description: item.parent?.name ?? '',
          icon: 'groups',
        }))

        teams.at(0).teamHeadline = true
        this.assignedToFilter.push(...teams)
      }
    },
    // task donut chart
    async getTasks() {
      const { success, data } = await this.getList(
        `cash/task-report-data?${this.filterText}&date=between(${this.startDate},${this.endDate})`
      )
      if (success && data) {
        this.firstLineItems[0].chartData.datasets[0].data = Object.assign(
          [],
          [data.scheduled, data.progress, data.wait, data.completed, data.late]
        )
      }
    },
    // Opportunity donut chart
    async getOpportunity() {
      const { success, data } = await this.getList(
        `/cash/opportunity-report-data?${this.filterText}&date=between(${this.startDate},${this.endDate})`
      )
      if (success && data) {
        this.firstLineItems[1].chartData.datasets[0].data = Object.assign(
          [],
          [data.active, data.waiting, data.canceled, data.wins, data.lost]
        )
      }
    },
    async getNMR() {
      const { success, data } = await this.getList(
        `/cash/nmr-data?${this.filterText}&date=between(${this.startDate},${this.endDate})`
      )
      if (success) {
        this.firstLineItems[2].revenueData[0].value = data?.foreseen ?? 0
        this.firstLineItems[2].revenueData[1].value = data?.wins ?? 0
        this.firstLineItems[2].revenueData[2].value = data?.lost ?? 0
      }
    },
    async getGeneralRevenue() {
      const { success, data } = await this.getList(
        `/cash/general-revenue-data?${this.filterText}&date=between(${this.startDate},${this.endDate})`
      )
      if (success) {
        this.firstLineItems[3].revenueData[0].value = data?.foreseen ?? 0
        this.firstLineItems[3].revenueData[1].value = data?.wins ?? 0
        this.firstLineItems[3].revenueData[2].value = data?.lost ?? 0
      }
    },
    // task table
    async getTasksNextSteps() {
      const endpoint = '/cash/task'
      const params = new URLSearchParams()

      params.append('order', 'scheduled_to_desc')
      params.append(
        'includes',
        'type.media_type,contact,media,assigned_to,opportunity.customer'
      )
      params.append('state', 'in(created)')
      params.append(
        this.filterText.split('=')[0],
        this.filterText.split('=')[1]
      )
      params.append(
        'scheduled_to',
        `between(${this.startDate},${this.endDate})`
      )
      params.append('limit', '100')

      const { success, data, hasNext, total } = await this.getList(
        endpoint,
        params
      )

      if (success) {
        this.tasksNextSteps.data = new Set()
        const tableData = new Set([...data])
        this.tasksNextSteps = {
          hasNext,
          data: Array.from(tableData),
          total,
        }
      }
    },
    // opportunity table
    async getTasksWithoutFurtherActions() {
      const endpoint = 'cash/opportunity'
      const params = new URLSearchParams()

      params.append('status', 'active')
      params.append('includes', 'company,assigned_to,stats,tasks,stage')
      params.append(
        this.filterText.split('=')[0],
        this.filterText.split('=')[1]
      )
      params.append('created_at', `between(${this.startDate},${this.endDate})`)
      params.append(
        'or',
        `(stats.last_scheduled_task_at=lt(${this.$moment().format(
          'YYYY-MM-DDTHH:mm:ss'
        )}),stats.last_scheduled_task_at=null)`
      )
      params.append('limit', '100')

      const { success, data, hasNext, total } = await this.getList(
        endpoint,
        params
      )
      if (success) {
        this.tasksWithoutFurtherActions.data = new Set()
        const tableData = new Set([...data])
        this.tasksWithoutFurtherActions = {
          hasNext,
          data: Array.from(tableData),
          total,
        }
      }
    },
    async handleGetItems() {
      this.chartLoaded = false
      await this.getTasks()
      await this.getOpportunity()
      this.chartLoaded = true

      await this.getNMR()
      await this.getGeneralRevenue()
      await this.getTasksNextSteps()
      await this.getTasksWithoutFurtherActions()
      this.updateAt = new Date()
    },
  },
}
</script>

<style lang="scss" scoped>
.home_container {
  ::v-deep .v-chip-group {
    .v-slide-group__content {
      padding: 0 !important;
    }
    .v-chip {
      margin: 0 8px 0 0 !important;
      &.v-chip--active {
        opacity: 1 !important;
      }
      .v-chip__content {
        z-index: 20;
      }
      &.borderless_ship {
        position: relative;
        border-radius: 8px;
        border-bottom-left-radius: unset;
        border-bottom-right-radius: unset;
        .v-chip__content {
          color: var(--v-sub-text-base) !important;
          padding: 1rem;
        }
        &.borderless_ship_active {
          &::before {
            background-color: #fff !important;
            border: 1px solid var(--v-shape-base) !important;
            opacity: 1 !important;
            border-bottom: unset !important;
          }
          .v-chip__content {
            color: var(--v-primary-base) !important;
          }
        }
      }
    }
  }
  .home_wrapper {
    padding: 1rem;
    background: var(--v-shape-lighten1);
    border-radius: 8px;
    border-top-left-radius: unset;
    .home_header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      .header_items {
        display: flex;
        align-items: center;
        span {
          color: var(--v-sub-text-base);
        }

        .daterange {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        ::v-deep .v-input {
          max-width: 280px;
          color: var(--v-sub-text-base);
          &.update_switch {
            position: relative;
            margin-top: 0 !important;
            &.v-input--is-label-active .v-input--selection-controls__input {
              .v-input--switch__thumb,
              .v-input--selection-controls__ripple {
                transform: translate(36px, 0) !important;
              }
            }
            .v-input--selection-controls__input {
              margin: 0 !important;
            }
            .v-input__prepend-outer {
              position: absolute;
              left: -2px;
              i {
                font-size: 21px;
              }
            }
            .v-input__append-outer {
              position: absolute;
              right: 8px;
              i {
                font-size: 21px;
              }
            }
            .v-input__control
              .v-input__slot
              .v-input--selection-controls__input {
              width: 66px !important;
              z-index: 10;
              .v-input--switch__track {
                width: 66px !important;
                z-index: 10;
              }
              .v-input--switch__thumb {
                z-index: 10;
              }
            }
          }
          // select input
          .v-select__slot {
            cursor: pointer;
            .v-select__selections {
              color: var(--v-default-text-base);
              font-weight: 500 !important;
              font-size: 1rem;
              i {
                color: var(--v-sub-text-base);
              }

              input {
                color: var(--v-sub-text-base) !important;

                &::placeholder {
                  opacity: 0.8;
                }
              }
            }
          }
        }
      }
    }
  }
  .home_body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: column;
    width: 100%;
    height: 100%;
    .box_item {
      position: relative;
      width: 0;
      height: 300px;
      color: var(--v-default-text-base);
      border: 1px solid var(--v-stroke-base);
      border-radius: 8px;
      margin: 1rem 0.4rem 0;
      padding: 0.6rem;
      flex: 1 1 0;
      &:first-child {
        margin-left: 0;
      }
      &:last-child {
        margin-right: 0;
      }
      &.task_wrapper {
        height: 100% !important;
        & .box_content {
          height: 44vh !important;
          min-height: 44vh;
          overflow-y: auto;
          overflow-x: hidden;
          margin-top: 0.4rem;
          display: block;
          @include thin-scrollbar;
          &.empty_box {
            text-align: center;
            color: var(--v-sub-text-base);
            font-size: 1rem;
            padding: 2rem;
          }
        }
      }
      .box_header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 30px;
        color: var(--v-default-text-base);
        h6 {
          cursor: default;
        }
        .datetime {
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 400;
          color: var(--v-sub-text-base);
          i {
            font-size: 20px;
            padding-right: 0.2rem;
          }
        }
      }

      .task_header {
        padding-bottom: 0.4rem;
        border-bottom: 1px solid var(--v-stroke-base);
        width: 100%;
      }

      .tooltip_description {
        display: flex;
        align-items: center;

        position: relative;
        width: fit-content;
        top: -2px;
        z-index: 5;
        color: var(--v-sub-text-base);
        cursor: pointer;

        i {
          font-size: 1.3rem;
          margin-left: 0.3rem;
        }
      }
      .box_content {
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        box-shadow: unset !important;
        &.align_revenue {
          position: absolute;
          top: 15px;
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          .revenue {
            display: flex;
            flex-direction: column;
            width: 100%;
            padding-left: 1rem;
          }
        }
        .task_list {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;

          cursor: pointer;

          &:hover {
            background: var(--v-shape-lighten2);
          }

          .list_wrapper {
            width: 100%;
            text-decoration: none;
          }
          .task_item {
            display: flex;
            align-items: center;
            color: var(--v-sub-text-base);
            font-size: 12px;
            font-weight: 400;
            padding-bottom: 2px;
            & .empty_task,
            & .last_task {
              border-radius: 4px;
              padding: 2px 8px;
              font-weight: 600;
              margin-left: 6px;
            }
            & .empty_task {
              color: var(--v-error-base);
              background: var(--v-email-icon-bg-base);
            }
            & .last_task {
              color: var(--v-orange-lighten1);
              background: var(--v-internal-icon-bg-base);
            }
            & .stage {
              border: 1px solid var(--v-stroke-base);
              border-radius: 8px;
              padding: 2px 8px;
              margin-left: 6px;
              font-weight: 600;
            }
            & .low {
              color: var(--v-blue-base);
              text-align: center;
              &.priority {
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid var(--v-blue-base);
                font-weight: 600;
              }
            }
            & .medium {
              color: var(--v-warning-tag-base);
              text-align: center;
              &.priority {
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid var(--v-warning-tag-base);
                font-weight: 600;
              }
            }
            & .high {
              color: var(--v-error-base);
              text-align: center;
              &.priority {
                padding: 2px 8px;
                border-radius: 4px;
                border: 1px solid var(--v-error-base);
                font-weight: 600;
              }
            }
            & .scheduled_to {
              border-radius: 4px;
              padding: 2px 8px;
              font-weight: 600;
              color: var(--v-blue-base);
              background: var(--v-phone-status-active-base);
              &.late {
                color: var(--v-error-base);
                background: var(--v-email-icon-bg-base);
              }
            }
            span {
              padding-right: 6px;
              border-radius: $border-radius-root;
              &.assigned_to {
                color: var(--v-default-text-base);
              }
            }
            a {
              text-decoration: none;
            }
            &.task_title {
              font-size: 1rem;
              color: var(--v-default-text-base) !important;
              .icon {
                color: var(--v-grey-base);
              }
            }
            .icon_wrapper {
              display: flex;
              align-content: center;
              justify-content: center;

              width: 34px;
              height: 34px;
              padding: 6px !important;
              margin-right: 6px;
            }
            i {
              color: var(--v-sub-text-base);
              font-size: 22px;
            }
          }
          .divider {
            width: 100%;
            color: var(--v-stroke-base);
            margin-top: 0.6rem;
          }
        }
        .item_wrapper {
          display: flex;
          justify-content: flex-start;
          align-items: flex-start;
          padding: 0.2rem 0;
          width: 100%;
          h6 {
            width: 90px;
            color: var(--v-sub-text-base);
            font-size: 1rem !important;
          }
          span {
            font-size: 1.5rem;
            font-weight: 400;
          }
          i {
            line-height: 1.5;
          }
          .icon {
            width: 46px;
            height: 46px;
            padding: 0.3rem;
            margin-top: 0.3rem;
            border-radius: 8px;
          }
          &.foreseen .icon {
            color: var(--v-primary-base);
            background: var(--v-blue-lighten5);
          }
          &.wins .icon {
            color: var(--v-phone-icon-text-base);
            background: var(--v-chat-icon-bg-base);
          }
          &.lost .icon {
            color: var(--v-error-base);
            background: var(--v-email-icon-bg-base);
          }
        }
        .chart {
          width: 100%;
          max-height: 88% !important;
          padding: 0.6rem 0;
        }
        .chart_total {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          position: absolute;
          z-index: 1;
          top: -24%;
          right: 0;
          bottom: 0;
          left: 0;
          height: fit-content;
          margin: auto;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--v-default-text-base);
          cursor: pointer;
          span:last-child {
            font-weight: 400;
            font-size: 1rem;
            padding-top: 0.2rem;
          }
        }

        @media (min-width: 1400px) {
          & .chart {
            max-width: 94% !important;
          }

          & .chart_total {
            left: -6% !important;
          }
        }
      }
    }
  }
  .truncate_text {
    white-space: nowrap;
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    &.header {
      max-width: 54%;
      cursor: pointer !important;
    }
    &.revenue_value {
      max-width: 94%;
      width: fit-content;
    }
  }
}
</style>

<style lang="scss">
html {
  @include thin-scrollbar;
}
.v-menu__content.menuable__content__active.team-list-select {
  .v-list.v-select-list {
    .v-list-item {
      .custom_select {
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        padding: 0.3rem 0;
        i {
          padding-right: 0.625rem;
          color: var(--v-sub-text-base);
        }
        small {
          color: var(--v-sub-text-base);
          font-size: 0.9rem;
        }
        .text_item {
          display: flex;
          flex-direction: column;
          color: var(--v-default-text-base);
          font-weight: 500 !important;
          font-size: 1rem;
        }
      }
    }
  }
}
</style>
