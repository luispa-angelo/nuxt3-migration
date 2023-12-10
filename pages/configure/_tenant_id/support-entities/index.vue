<template>
  <div class="fix-padding-bar" style="overflow-y: scroll; height: 85vh">
    <SupportEntitiesMediaTypeComponent></SupportEntitiesMediaTypeComponent>
    <v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesRequestTypeComponent />
    <v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesAssociationTypeComponent></SupportEntitiesAssociationTypeComponent>
    <v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesCnaeComponent></SupportEntitiesCnaeComponent>
    <v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesCompetitorComponent></SupportEntitiesCompetitorComponent>
    <v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesOriginComponent></SupportEntitiesOriginComponent>
		<v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesWithdrawalComponent></SupportEntitiesWithdrawalComponent>
		<v-divider class="mx-3 mt-3 mb-8"></v-divider>
    <SupportEntitiesRoleSuggestionComponent></SupportEntitiesRoleSuggestionComponent>
  </div>
</template>

<script>

export default {
  layout: 'side-menu-configure',
  data: () => ({}),
}
</script>

<style scoped>
  * {
    scrollbar-width: auto;
    scrollbar-color: #9e9e9e #c2c2c2;
  }
  *::-webkit-scrollbar {
    width: 5px;
  }
  *::-webkit-scrollbar-track {
    background: #c2c2c2;
    border-radius: 6px;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #9e9e9e;
    border-radius: 6px;
    border: 3px solid #9e9e9e;
  }
  .fix-padding-bar {
    padding-top: 1.5em !important;
  }
</style>
