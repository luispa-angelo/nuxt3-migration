import { baseAlert } from '@/composables/alert';

export default defineNuxtRouteMiddleware(async () => {
  const globalStore = useGlobalStore();

  if (globalStore.pendingChanges === true) {
    const result = await baseAlert(
      'Salvamento não realizado',
      'O trabalho feito até aqui não foi salvo, volte e salve a edição ou clique em sair.',
      'Sair sem salvar',
      'Voltar para edição',
      'warning',
      'warning'
    );
    if (result) {
      return await globalStore.setPendingChanges(false);
    }
    return abortNavigation();
  }
});
