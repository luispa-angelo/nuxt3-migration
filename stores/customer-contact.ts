import type { IPagination } from '../types/pagination';

interface ContactState {
  contacts: any[];
  contact: object;
  contacts_api: IPagination;
  departments: any[];
  positions: any[];
  nationalities: any[];
}

const contactUrl = '/customer/contact';
const departmentsUrl = '/customer/department';
const positionsUrl = '/customer/position?limit=1000';
const nationalitiesUrl = '/customer/nationality?limit=1000';

export const useContactStore = defineStore('customerContact', {
  state: (): ContactState => ({
    contacts: [],
    contact: {},
    departments: [],
    positions: [],
    nationalities: [],
    contacts_api: {
      page: 0,
      hasNext: false,
      total: 0,
      dataUpdate: false,
    },
  }),
  getters: {
    contacts: (state: ContactState) => state.contacts,
    contact: (state: ContactState) => state.contact,
    departments: (state: ContactState) => state.departments,
    positions: (state: ContactState) => state.positions,
    nationalities: (state: ContactState) => state.nationalities,
  },
  actions: {
    async fetchDepartments(query: string) {
      const { data }: any = await getList(departmentsUrl, query);
      this.departments = data;
    },
    async fetchPositions(query: string) {
      const { data }: any = await getList(positionsUrl, query);
      this.positions = data;
    },
    async fetchNationalities(query: string) {
      const { data }: any = await getList(nationalitiesUrl, query);
      this.nationalities = data;
    },
    async fetchContacts(query: string) {
      const { data, hasNext, total }: any = await getList(contactUrl, query);
      this.contacts = { ...this.contacts, ...data };
      this.contacts_api = { ...this.contacts_api, hasNext, total };
    },
    async fetchContact(query: string) {
      const { data }: any = await getItem(contactUrl, query);
      this.contact = { data };
    },
    async addContact(payload: any) {
      await createItem(contactUrl, payload);
      this.contacts_api = { ...this.contacts_api, dataUpdate: true };
    },
    async updContact(payload: any) {
      const { data }: any = await updateData(contactUrl, payload);
      this.contact = data;
      this.contacts_api = { ...this.contacts_api, dataUpdate: true };
    },
    async deleteContact(id: number) {
      await removeItem(id);
      this.contacts = this.contacts.filter((contact) => contact.id != id);
    },
  },
});
