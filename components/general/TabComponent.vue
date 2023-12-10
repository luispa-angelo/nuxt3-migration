<template>
	<div>
		<v-tabs active-class="active-tab" v-model="tab" :background-color="color">
			<v-tab v-for="item in tabItems" :data-test="`tabOpportunity${item.value}`" :key="item.value" :disabled="item.disabled">
				{{ item.name }}
			</v-tab>
      <slot name="tab-append" />
		</v-tabs>
		<v-tabs-items v-model="tab">
			<v-tab-item v-for="item in tabItems" :key="item.value" :eager="true" class="h-100 px-1" :class="`${color} ${tabItemCustomClass}`">
				<slot :name="item.value" />
			</v-tab-item>
		</v-tabs-items>
	</div>
</template>

<script>
export default {
  inheritAttrs: false,
  props: {
    tabItems: Array,
    tabReset: Boolean,
    tabValue: Number,
    color: {
      type: String,
      default: ''
    },
    tabItemCustomClass: {
      type: String,
      default: 'py-5'
    },
  },
  data() {
    return {
      tab: 0
    }
  },
  watch: {
    tabReset() {
      this.tab = 0
    },
    tabValue(newValue) {
      this.tab = newValue
    },
    tab(newValue) {
      this.$emit('onTabChange', newValue)
    }
  },
  methods: {
    changeToTab(tabValue) {
      this.tab = tabValue
    }
  }
}
</script>
<style lang="scss" scoped>
.active-tab {
  color: var(--v-primary-base);
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
}
</style>