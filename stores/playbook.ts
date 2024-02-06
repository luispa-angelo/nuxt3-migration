import type { IPagination } from '../types/pagination';

interface PlaybookState {
  playbooks: any[];
  playbookDetails: IPagination;
}

const url = '/playbook/playbook';

export const usePlaybookStore = defineStore('playbook', {
  state: (): PlaybookState => ({
    playbooks: [],
    playbookDetails: {
      page: 0,
      hasNext: false,
      total: 0,
    },
  }),
  getters: {
    playbooks: (state: PlaybookState) => state.playbooks,
    playbookDetails: (state: PlaybookState) => state.playbookDetails,
  },
  actions: {
    async fetchPlaybooks(query: string) {
      const { data, hasNext, total }: any = await getList(url, query);
      this.playbooks = data;
      this.playbookDetails = { hasNext, total };
    },
  },
});
