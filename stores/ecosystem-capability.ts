interface CapabilityState {
  capabilities: any[];
}

const mediaTypeUrl = '/ecosystem/media-type';

export const useCapabilityStore = defineStore('ecosystemCapability', {
  state: (): CapabilityState => ({ capabilities: [] }),
  getters: {},
  actions: {
    async fetchCapabilities(query: string) {
      const { data }: any = await getList(mediaTypeUrl, query);
      this.capabilities = data;
    },
  },
});
