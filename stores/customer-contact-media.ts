interface ContactMediaState {
  contactsMedia: any[];
  companyContactsMedia: any[];
}

const contactMediaUrl = '/customer/contact-media';
const companyContactMediaUrl = '/customer/contact-company-media';

export const useContactMediaStore = defineStore('customerContactMedia', {
  state: (): ContactMediaState => ({
    contactsMedia: [],
    companyContactsMedia: [],
  }),
  getters: {
    contactsMedia: (state: ContactMediaState) => state.contactsMedia,
    companyContactsMedia: (state: ContactMediaState) =>
      state.companyContactsMedia,
  },
  actions: {
    // Contact media
    async fetchContactsMedia(query: string) {
      const { data }: any = await getList(contactMediaUrl, query);
      this.contactsMedia = data;
    },
    async deleteContactMedia(id: number) {
      await removeItem(contactMediaUrl, id);
      this.contactsMedia = this.contactsMedia.filter(
        (contact) => contact.id != id
      );
    },
    // Company contact media
    async fetchCompanyContactsMedia(query: string) {
      const { data }: any = await getList(companyContactMediaUrl, query);
      this.companyContactsMedia = data;
    },
    async deleteCompanyContactMedia(id: number) {
      await removeItem(companyContactMediaUrl, id);
      this.contactsMedia = this.contactsMedia.filter(
        (contact) => contact.id != id
      );
    },
  },
});
