<template>
  <v-row>
    <v-col
      :class="
        !fillWidth
          ? 'col-lg-7 col-md-7 col-sm-12 col-12'
          : 'col-lg-2 col-md-2 col-sm-12 col-12'
      "
      class="pl-4"
    >
      <RouterBreadCrump
        :has-title="!!pageName"
        :page-name="pageName"
        :page-group="pageGroup"
        :enable-copy="enableCopy"
      />

      <span v-if="!showBreadCrumb">
        <p class="mb-0">{{ pageGroup }}</p>
        <h6>{{ pageName }}</h6>
      </span>
    </v-col>

    <v-col
      :class="
        !fillWidth
          ? 'd-flex justify-end align-center'
          : 'col-lg-10 col-md-10 col-sm-12 col-12 d-flex align-end'
      "
    >
      <slot></slot>
    </v-col>
  </v-row>
</template>

<script>
export default {
  props: {
    pageName: {
      type: String,
    },
    pageGroup: {
      type: String,
    },
    fillWidth: {
      type: Boolean,
    },
    showBreadCrumb: { 
      type: Boolean,
      default: true
    },
    enableCopy: {
      type: Boolean,
      default: false
    },
  },
}
</script>
