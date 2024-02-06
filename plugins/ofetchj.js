import { ofetch } from 'ofetch';

export default defineNuxtPlugin(() => {
  const router = useRouter();
  const path = router.currentRoute.value.path;

  globalThis.$fetch = ofetch.create({
    onRequest({ options }) {
      try {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const token = userInfo?.access_token;

        options.headers = { Authorization: 'teste auth' };

        if (token) {
          if (!options.baseURL?.includes('https://vcx.utech.com.br')) {
            options.headers = { Authorization: token };
          } else {
            options.headers = { Authorization: 'Basic ' + btoa('2000:2000') };
          }
        } else if (path !== '/') {
          router.replace('/');
        }
      } catch (error) {
        console.log(`error`, error);
      }
    },
    onResponseError({ response }) {
      if (response === undefined) throw error;

      const { status } = response;

      if (status === 401 || error.toString()?.includes('401')) {
        localStorage.removeItem('userInfo');
        if (path !== '/') {
          router.replace('/');
          this.$swal({
            icon: 'error',
            title: 'Sessão expirada!',
          });
        }
      }
      throw response?._data?.message;
    },
  });
});
