<template>
  <CompanyDetailsPage
    :page-name="pageName"
    :page-group="pageGroup"
  />
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data: () => ({
    businessItemId: null,
    businessCategoryId: null,
    pageComplement: null
  }),
  computed: {
    ...mapGetters({
      businessCategories: 'businessCategories',
      businessItems: 'businessItems'
    }),
    pageGroup: function() {
      const category = this.businessCategories.find((category) => category.id == this.businessCategoryId)
      return category?.name
    },
    pageName: function() {
      const item = this.businessItems.find((item) => item.id == this.businessItemId)
      if (this.pageComplement) {
        return `${item?.name} / ${this.pageComplement}`
      }
      return item?.name
    }
  },
  created() {
    this.businessItemId = this.$route.params['item']
    this.businessCategoryId = this.$route.query['category']
    this.pageComplement = this.$route.query['complement']
  },
}
</script>