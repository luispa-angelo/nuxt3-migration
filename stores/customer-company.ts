import type { IPagination } from '../types/pagination';
import type { ISideView } from '../types/sideView';

interface CompanyState {
  companies: any[];
  company: object;
  companies_api: IPagination;
  sideView: ISideView;
}

const companyUrl = '/customer/company';
const myCompanyUrl = '/ecosystem/my-companies';
const companyDetailsUrl = '/customer/company-with-details';

export const useCompanyStore = defineStore('customerCompany', {
  state: (): CompanyState => ({
    companies: [],
    company: {},
    companies_api: {
      page: 0,
      hasNext: false,
      total: 0,
      dataUpdate: false,
    },
    sideView: {
      drawer: false,
      selectedData: {},
    },
  }),
  getters: {
    companies: (state: CompanyState) => state.companies,
    company: (state: CompanyState) => state.company,
    companies_api: (state: CompanyState) => state.companies_api,
    sideView: (state: CompanyState) => state.sideView,
  },
  actions: {
    async fetchCompanies(query: string, myCompanies = false) {
      const url = myCompanies ? myCompanyUrl : companyUrl;
      const { data, hasNext, total }: any = await getList(url, query);
      this.companies = [...this.companies, ...data];
      this.companies_api = { ...this.companies_api, hasNext, total };
    },
    async fetchCompany(query: string) {
      const { data }: any = await getList(companyUrl, query);
      this.company = data;
    },
    async addCompany(payload: any) {
      await createItem(companyDetailsUrl, payload);
      this.companies_api = { ...this.companies_api, dataUpdate: true };
    },
    async updCompany(payload: any) {
      await updateData(companyDetailsUrl, payload);
      this.companies_api = { ...this.companies_api, dataUpdate: true };
    },
    async deleteCompany(id: number) {
      await removeItem(companyUrl, id);
      this.companies = this.companies.filter((company) => company.id != id);
    },
    async resetCompanies() {
      this.companies = [];
      this.companies_api = {
        page: 0,
        hasNext: false,
        total: 0,
      };
    },
    setCompanySideViewDrawer(drawer: any) {
      this.sideView.drawer = drawer;
    },
    setCompanySideViewSelectedData(selectedData: any) {
      this.sideView.selectedData = selectedData;
    },
  },
});
