interface UserState {
  userInfo: any;
  userTeams: any[];
  userTeam: any | null;
  coworkers: any[];
  userBusiness: any[];
}

const coworkersUrl = '/ecosystem/my-coworkers';

export const useUserStore = defineStore('userStore', {
  state: (): UserState => ({
    userInfo: {},
    userTeams: [],
    userTeam: null,
    coworkers: [],
    userBusiness: [],
  }),
  getters: {
    getUserInfo: (state: UserState) => state.userInfo,
    getUserTeams: (state: UserState) => state.userTeams,
    getUserTeam: (state: UserState) => state.userTeam,
    getCoworkers: (state: UserState) => state.coworkers,
    getUserBusiness: (state: UserState) => state.userBusiness,
    getBusinessCategories: (state: UserState) => {
      const categories: any[] = state.userBusiness.flatMap(
        (business: any) => business.categories
      );
      return categories;
    },
    getBusinessItems: (state: UserState) => {
      const items: any[] = state.userBusiness.flatMap((business: any) =>
        business.categories.flatMap((category: any) => category.items)
      );
      return items;
    },
  },
  actions: {
    async setUser(userInfo: any) {
      if (userInfo) {
        const user = JSON.parse(userInfo);
        const { capabilities, business } = user;
        const userTeams = capabilities.map(
          (capability: any) => capability.team_id
        );
        const [userTeam] = userTeams;

        this.userInfo = user;
        this.userTeams = userTeams;
        this.userTeam = userTeam;
        this.userBusiness = business;
      }
    },
    async fetchCoworkers(query: string) {
      const { data }: any = await getList(coworkersUrl, query);
      this.coworkers = data;
    },
  },
});
