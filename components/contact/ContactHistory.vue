<template>
  <div class="contact_history_container">
    <h6 class="history_title">Histórico de Atividades</h6>

    <div class="history_wrapper">
      <div class="history_item" v-for="item in contactHistory" :key="item.id">
        <span class="icon">
          <i class="material-symbols-rounded v-icon">
            {{ handleIconType(item.action) }}
          </i>
        </span>

        <div class="history_content">
          <span class="description">
            <i class="material-symbols-rounded v-icon pr-1">
              {{ handleIconType(item.action) }}
            </i>

            <h6>
              {{
                item.description !== ''
                  ? item.description
                  : handleReason(item.action)
              }}
            </h6>
          </span>

          <span class="body-3">
            {{ $moment(`${item.datetime}Z`).format('DD/MM/yyyy [às] HH:mm') }}
          </span>

          <div class="body-3 item_wrapper" v-if="item.reason">
            <span>Motivo</span> <span>{{ item.reason }}</span>
          </div>
          <div class="body-3 item_wrapper">
            <span>Responsável</span> <span> {{ item.responsible }} </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data: () => ({
    history: [],
  }),
  async mounted() {
    const { id } = this.$route.params
    const response = await this.getItem(
      `/customer/contact?id=${id}&includes=companies.contact_positions.creator,creator`
    )

    if (response) this.formatHistoryData(response)
  },
  computed: {
    contactHistory() {
      const sortHistory = this.history
      return sortHistory.sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      )
    },
  },
  methods: {
    handleIconType(action) {
      switch (action) {
      case 'resignation':
        return 'delete'
      case 'inclusion':
        return 'person'
      default:
        return 'domain'
      }
    },
    handleReason(reason) {
      switch (reason) {
      case 'job_change':
        return 'Mudança de cargo'
      case 'department_change':
        return 'Mudança De Departamento'
      case 'sector_change':
        return 'Mudança De Área'
      case 'resignation':
        return 'Desligamento'
      case 'inclusion':
        return 'Inclusão'
      }
    },
    formatHistoryData(historyArray) {
      if (historyArray.companies) {
        historyArray.companies.forEach((company, company_index) => {
          if (
            company.contact_positions &&
            company.contact_positions.length >= 1
          ) {
            company.contact_positions.forEach((position, position_index) => {
              this.history.push({
                id: 'company-' + company_index + '-position-' + position_index,
                action: position.reason,
                responsible: position?.creator?.name,
                description: '',
                datetime: position.created_at,
              })
            })
          }
        })

        this.history.push({
          id: 0,
          action: 'add_contact',
          description: 'Contato criado',
          responsible:
            historyArray.origin === 'user'
              ? 'Inclusão Sistêmica '
              : 'Inclusão Externa',
          datetime: historyArray.created_at,
        })
      }
    },
  },
}
</script>

<style lang="scss">
.contact_history_container {
  padding: 1.4rem 0 0.2rem;

  .history_title {
    font-size: 1rem;
    color: var(--v-default-text-base);
    font-weight: 600;
    padding-bottom: 0.6rem;
  }

  .history_wrapper {
    max-height: 50vh;
    overflow-y: auto;
    padding: 0 2rem 0 1rem;

    @include thin-scrollbar;

    .history_item {
      display: flex;
      align-items: center;

      padding: 1rem 0;

      .icon {
        background: var(--v-primary-base);
        color: var(--v-shape-lighten1);
        width: 32px;
        height: 32px;
        border-radius: 100%;
        margin-right: 1rem;

        display: flex;
        align-items: center;
        justify-content: center;

        i {
          font-size: 1.4rem;
        }
      }

      .history_content {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: flex-start;

        width: 98%;
        padding: 0.4rem 0.6rem;
        color: var(--v-default-text-base);
        border: 1px solid var(--v-stroke-base);
        border-radius: 4px;

        .description,
        item_wrapper {
          display: flex;
          align-items: center;

          h6 {
            font-size: 1rem !important;
          }
        }

        span {
          padding-right: 1rem;
        }

        .item_wrapper {
          span:first-child {
            color: var(--v-sub-text-base);
            padding-right: 0.2rem;
          }
        }

        &::before {
          content: '';
          width: 0px;
          height: 0px;
          position: absolute;
          border-left: 15px solid transparent;
          border-right: 10px solid var(--v-stroke-base);
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;

          left: -23px;
          border-radius: 20px;
        }

        &::after {
          content: '';
          width: 0px;
          height: 0px;
          position: absolute;
          border-left: 10px solid transparent;
          border-right: 10px solid #fff;
          border-top: 10px solid transparent;
          border-bottom: 10px solid transparent;
          left: -17px;
        }
      }
    }
  }
}
</style>
