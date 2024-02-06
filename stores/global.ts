interface GlobalState {
  pendingChanges: boolean;
  mediaTypes: any[];
}

const mediaTypeUrl = '/ecosystem/media-type';

export const useGlobalStore = defineStore('global', {
  state: (): GlobalState => ({ pendingChanges: false, mediaTypes: [] }),
  getters: {
    pendingChanges: (state: GlobalState) => state.pendingChanges,
    mediaTypes: (state: GlobalState) => state.mediaTypes,
  },
  actions: {
    setPendingChanges(pendingState: boolean) {
      this.pendingChanges = pendingState;
    },
    async fetchMediaTypes(query: string) {
      const { data }: any = await getList(mediaTypeUrl, query);
      this.mediaTypes = data;
    },
  },
});
