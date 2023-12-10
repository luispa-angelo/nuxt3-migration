<template>
  <v-sheet class="custom-list">
    <v-btn 
      @click.prevent.stop="toggleDropdown(item.local_company_id)"
      fab
      icon
      style="margin-left: -15px"
    >
      <v-icon class="material-symbols-rounded v-icon">more_vert</v-icon>
    </v-btn>
    <v-sheet :id="'list_' + item.local_company_id" class="custom-list-content" :class="{ 'show-custom-list': menuControl[item.local_company_id] }">
      <slot name="custom-list-item"></slot>
    </v-sheet>
  </v-sheet>
</template>

<script>
export default {
  props: {
    item: {
      type: Object
    }
  },
  data: () => ({
    menuControl: {}
  }),
  mounted() {
    document.addEventListener('click', this.closeDropdowns)
  },
  beforeDestroy() {
    document.removeEventListener('click', this.closeDropdowns)
  },
  methods: {
    toggleDropdown(localCompanyId) {
      if(this.menuControl[localCompanyId]) {
        this.menuControl[localCompanyId] = false
      }else {
        for (const companyId in this.menuControl) {
          this.menuControl[companyId] = false
        }
        this.$set(this.menuControl, localCompanyId, true)
      }
    },
    closeDropdowns() {
      this.menuControl = {}
    }
  }
}
</script>

<style scoped>
.custom-list {
  position: relative;
  display: inline-block;
  color: var(--default-text-base);
  background-color: transparent;
}
.custom-list-content {
  display: none;
  position: absolute;
  padding: 8px 0;
  top: 0;
  left: -132px;
  background-color: var(--v-white-base);
  border-radius: 8px;
  min-width: 110px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  color: rgba(0, 0, 0, 0.87);
  z-index: 1;
}
.custom-list-item {
  align-items: center;
  display: flex;
  flex: 1 1 100%;
  letter-spacing: normal;
  min-height: 48px;
  outline: none;
  padding: 0 16px;
}
.show-custom-list {
  display: block;
}
</style>