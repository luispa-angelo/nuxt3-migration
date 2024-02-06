export default defineNuxtRouteMiddleware(async (to) => {
  await checkCredentials(to.path);
});

const checkCredentials = async (path) => {
  const userStore = useUserStore();

  const url = `${useRuntimeConfig().public.baseURL}/ecosystem/my-figures`;
  try {
    await useAsyncData('ecosystem-my-figures', () => $fetch(url));
  } catch (err) {
    if (err.status == 401) {
      if (path !== '/') navigateTo('/');

      localStorage.removeItem('userInfo');
      userStore.setUser(null);

      this.$swal({
        icon: 'error',
        title: 'Sessão expirada!',
      });
    }
  }
};
