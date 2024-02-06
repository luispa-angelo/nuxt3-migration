interface CadenceState {
  workflows: any[];
}

const url = '/cash/workflow';

export const useCadenceStore = defineStore('cashCadence', {
  state: (): CadenceState => ({ workflows: [] }),
  getters: {
    workflows: (state: CadenceState) => state.workflows,
  },
  actions: {
    async fetchWorkflows(query: string) {
      const { data }: any = await getList(url, query);
      this.workflows = data;
    },
    async addWorkflow(payload: any) {
      await createItem(url, payload);
    },
    async updWorkflow(payload: any) {
      await updateData(url, payload);
    },
    async deleteWorkflow(id: number) {
      await removeItem(url, id);
      const filteredData = this.workflows.filter(
        (workflow) => workflow.id != id
      );
      this.workflows = filteredData;
    },
  },
});
