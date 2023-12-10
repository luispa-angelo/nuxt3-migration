<template>
  <v-dialog v-model="dialog"  scrollable max-width="700" @click:outside="cancel">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        color="secondary"
        small
        fab
        icon
        v-bind="attrs"
        v-on="on"
        class="mt-1 ml-auto"
        v-tooltip="{
          content: `
            <div class='v-btn-tooltip'>
              Visualizar Histórico
            </div>
            `,
          placement: 'left-center'
        }"
      >
        <v-icon color="primary">mdi-clock-outline</v-icon>
      </v-btn>
    </template>
    <v-card :loading="isLoading">
      <DialogHeader title="Histórico" @onCancel="cancel" />
      <v-card-text v-if="listMeta.length" class="pt-5">
        <v-card v-for="(item, index) in list" :key="index + item.id" class="v-card--border-left mb-4">
          <v-card-title>
            <strong class="primary--text text-capitalize">
              {{ item.type }}
            </strong>
            <small class="mx-2">-</small>
            <small>{{ $moment(item.created_at).format('DD/MM/YYYY HH:mm:ss') }}</small>
          </v-card-title>
          <v-card-subtitle>
            <strong>Criado por:</strong> {{item.user.name}} <br>
            <strong>E-mail:</strong> {{item.user.email}}
          </v-card-subtitle>
          <v-card-text v-if="index > 0 && item.changes.length">
            <v-sheet class="mb-2 pa-1" v-for="(changeItem, index) in item.changes" :key="index">
              <p class="mb-0">
                <strong>Campo:</strong> 
                {{ changeItem.field ? getFieldName(changeItem.field) : '' }}
              </p>
              <p v-if="changeItem.from" class="mb-0">
                <strong>De:</strong> {{ changeItem.from }}
              </p>
              <p v-if="changeItem.to" class="mb-0">
                <strong>Para:</strong> {{ changeItem.to }}
              </p>
              <v-divider v-if="index != item.changes.length - 1" class="mt-3"></v-divider>
            </v-sheet>
          </v-card-text>
        </v-card>
      </v-card-text>
      <DialogAction hide-submit @cancel="cancel" cancel-text="Voltar" />
    </v-card>
  </v-dialog>
</template>

<script>
const initialState = () => {
  return {
    dialog: false,
    listMeta: [],
    history: [],
    isLoading: false,
  }
}
export default {
  props: ['opportunityId'],
  data () {
    return initialState()
  },
  computed: {
    list() {
      if(this.history) {
        var list = []
        this.history.forEach((item) => {
          if(item.changes.length) {
            var changes = JSON.parse(item.changes)
          }          
          list.push({
            ...item,
            created_at: this.$moment(new Date(`${item.created_at}Z`)),
            changes
          })
        })
        return list
      }
      return []
    }
  },
  watch: {
    async dialog(newValue) {
      if(newValue) {
        await this.loadData()
      }
    }
  },
  methods: {
    async loadData() {
      this.isLoading = true
      const data = await this.getList('/meta/entity-dictionary?entity=opportunity')
      this.listMeta = data[0].data
      const { data: history } = await this.getList(
        '/cash/opportunity',
        `&includes=history,history.user&id=${this.opportunityId}`
      )
      if (history) {
        this.history = history[0].history
      }
      this.isLoading = false
    },
    getFieldName(name) {
      const data = this.listMeta.find(meta => meta.field == name)
      if(data?.label) {
        return data?.label
      }else {
        return name
      }
    },
    cancel() {
      Object.assign(this.$data, initialState())
    }
  }
}
</script>

<style scoped>
  .v-sheet-bordered {
    border: dashed 1px #AEB4C2;
  }
</style>