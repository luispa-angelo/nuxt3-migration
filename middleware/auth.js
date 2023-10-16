export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path !== '/') await checkCredentials();
});

const checkCredentials = async () => {
  try {
    await useAsyncData('ecosystemMyFigures', () =>
      $fetch('/ecosystem/my-figures')
    );
  } catch (err) {
    navigateTo('/');
    localStorage.removeItem('userInfo');
    this.$swal({
      icon: 'error',
      title: 'Sessão expirada!',
    });
  }
};
