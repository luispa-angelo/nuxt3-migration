interface CustomFieldState {
  customFields: any[];
}

const url = '/cash/custom-field';

export const useCustomFieldStore = defineStore('cashCustomField', {
  state: (): CustomFieldState => ({ customFields: [] }),
  getters: {
    customFields: (state: CustomFieldState) => state.customFields,
  },
  actions: {
    async fetchCustomFields() {
      const { data }: any = await getList(url);
      this.customFields = data;
    },
    async fetchCustomFieldsQuery(query: string) {
      const { data }: any = await getList(url, query);
      this.customFields = data;
    },
    async addCustomField(customField: any) {
      await createItem(url, customField);
      const { data }: any = await getList(url);
      this.customFields = data;
    },
    async updCustomField(customField: any) {
      await updateData(url, customField);
      const { data }: any = await getList(url);
      this.customFields = data;
    },
    async deleteCustomField(id: number) {
      await removeItem(url, id);
      this.customFields = this.customFields.filter(
        (customField) => customField.id != id
      );
    },
  },
});
