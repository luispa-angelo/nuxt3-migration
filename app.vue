<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script>
import { mapActions } from 'pinia';
import { useUserStore } from '@/stores/user';

export default {
  data: () => ({}),
  async mounted() {
    // Remove auth middleware necessity
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    if (userInfo) this.setUserInfo(JSON.stringify(userInfo));
  },
  methods: {
    ...mapActions(useUserStore, {
      setUserInfo: 'setUser',
    }),
  },
};
</script>
