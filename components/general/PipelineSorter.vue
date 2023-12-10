<template>
  <v-menu v-model="sorterMenu" :offset-x="true" :offset-y="true">
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        text
        fab
        x-small
        data-test="btnPipelineSorterOpen"
        color="primary"
        v-bind="attrs"
        v-on="on"
        :disabled="isDisabled"
      >
        <template v-slot:default>
          <SortArrows :asc-color="ascSort" :desc-color="descSort" />
        </template>
      </v-btn>
    </template>
    <v-card width="250">
      <v-card-title class="pb-0 px-2">
        <span class="font-body-medium">Ordenar por</span>
        <v-btn
          fab
          text
          x-small
          data-test="btnPipelineSorterClose"
          class="ml-auto flex-grow-0 flex-shrink-1"
          @click="sorterMenu = false"
        >
          <v-icon>
            close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text class="pr-1 pl-2">
        <v-radio-group hide-details class="mt-0" v-model="selectedSorter" @change="handleSorter">
          <v-radio
            v-for="item in sorter"
            data-test="radioPipelineSorterSelect"
            :key="item.value"
            :label="item.label"
            :value="item"
          >
            <template v-slot:label>
              <div
                v-tooltip="
                item.type === 'asc'
                  ? { content: `<div class='v-btn-tooltip'>${item.date ? 'Mais recente' : 'Crescente'}</div>`, placement: 'top' }
                  : { content: `<div class='v-btn-tooltip'>${item.date ? 'Mais antiga' : 'Decrescente'}</div>`, placement: 'top' }
                "
              >
                <i class="material-symbols-rounded v-icon">{{item.icon}}</i>
                <span class="font-body-medium default-text--text">{{item.label}}</span>
                <v-icon
                  v-if="item.type === 'asc'" 
                  small 
                  class="material-icons-round"
                >
                  north
                </v-icon>
                <v-icon 
                  v-if="item.type === 'desc'" 
                  small 
                  class="material-icons-round"
                >
                  south
                </v-icon>
              </div>
            </template>
          </v-radio>
        </v-radio-group>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  props: {
    initialValue: { type:String, default: null},
    isDisabled: { type:Boolean, default: false},
    sorter: Array,
  },
  data: () => ({
    selectedSorter: null,
    sorterMenu: false,
  }),
  computed: {
    ascSort: function() {
      const sorterType = this.selectedSorter?.type
      if (sorterType === 'asc') {
        return 'primary'
      }
      return 'sub-text'
    },
    descSort: function() {
      const sorterType = this.selectedSorter?.type
      if (sorterType === 'desc') {
        return 'primary'
      }
      return 'sub-text'
    },
  },
  watch: {

  },
  async mounted() {
    this.selectedSorter = this.sorter.find((item) => item.value === this.initialValue)
  },
  methods: {
    handleSorter() {
      this.$emit('onSort', this.selectedSorter)
    }
  }
}
</script>
